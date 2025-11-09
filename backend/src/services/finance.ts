// backend/src/services/finance.ts

interface FinanceCalculationParams {
    vehiclePrice: number;
    creditScore: number;
    downPayment: number;
    loanTermMonths: number;
    tradeInValue?: number;
    salesTaxRate?: number; // decimal format: 0.08 for 8%
  }
  
  type AlternativeType = "base" | "longer-term" | "higher-down" | "shorter-term";
  
  interface AlternativeOption {
    description: string;
    monthlyPayment: number;
    loanTermMonths?: number;
    downPayment?: number;
    savings?: number;
    totalCostChange?: number;
    type?: AlternativeType;
  }
  
  interface FinanceCalculationResult {
    monthlyPayment: number;
    apr: number;
    totalInterest: number;
    totalCost: number;
    amountFinanced: number;
    recommendation: string;
    alternatives: AlternativeOption[];
  }
  
  // Credit score tiers to APR mapping
  function getAPRFromCreditScore(creditScore: number): number {
    if (creditScore >= 750) {
      return 5.0; // Excellent
    } else if (creditScore >= 700) {
      return 6.2; // Good
    } else if (creditScore >= 650) {
      return 9.0; // Fair
    } else if (creditScore >= 600) {
      return 13.5; // Poor
    } else {
      return 17.0; // Bad
    }
  }
  
  // Calculate monthly payment using loan payment formula
  // M = P * [r(1+r)^n] / [(1+r)^n - 1]
  function calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    months: number
  ): number {
    const monthlyRate = annualRate / 100 / 12;
    
    if (monthlyRate === 0) {
      return principal / months;
    }
    
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
      
    return Math.round(payment * 100) / 100; // Round to 2 decimals
  }
  
  // Calculate amount financed helper
  function calculateAmountFinanced(
    vehiclePrice: number,
    downPayment: number,
    tradeInValue: number,
    salesTaxRate: number
  ): number {
    const priceAfterDownAndTrade = vehiclePrice - downPayment - tradeInValue;
    const salesTax = priceAfterDownAndTrade * salesTaxRate;
    const fees = 800; // Typical doc/registration fees
    return priceAfterDownAndTrade + salesTax + fees;
  }
  
  // Generate alternatives based on user's situation
  function generateAlternatives(
    params: FinanceCalculationParams,
    currentMonthlyPayment: number,
    apr: number
  ): AlternativeOption[] {
    const {
      vehiclePrice,
      downPayment,
      loanTermMonths,
      tradeInValue = 0,
      salesTaxRate = 0.08,
    } = params;
  
    const alternatives: AlternativeOption[] = [];
  const baseAmountFinanced = calculateAmountFinanced(
    vehiclePrice,
    downPayment,
    tradeInValue,
    salesTaxRate
  );
    const baseTotalCost = currentMonthlyPayment * loanTermMonths;
  const roundCurrency = (value: number): number => Math.round(value);
  
    // Alternative 1: Longer loan term (if not already at 72 months)
    if (loanTermMonths < 72) {
      const longerTerm = loanTermMonths === 36 ? 48 : loanTermMonths === 48 ? 60 : 72;
    const longerTermPayment = calculateMonthlyPayment(baseAmountFinanced, apr, longerTerm);
      const savings = currentMonthlyPayment - longerTermPayment;
      
      const totalCost = longerTermPayment * longerTerm;
      alternatives.push({
        description: `${longerTerm}-month plan`,
        monthlyPayment: roundCurrency(longerTermPayment),
        loanTermMonths: longerTerm,
        savings: roundCurrency(savings),
        totalCostChange: Math.round(totalCost - baseTotalCost),
        type: "longer-term",
      });
    }
  
    // Alternative 2: Higher down payment
  if (vehiclePrice > 0) {
    const currentDownPercent = downPayment / vehiclePrice;
    let targetDownPercent: number | null = null;

    if (currentDownPercent < 0.1) {
      targetDownPercent = 0.1;
    } else if (currentDownPercent < 0.2) {
      targetDownPercent = 0.2;
    }

    if (targetDownPercent !== null) {
      let suggestedDownPayment = vehiclePrice * targetDownPercent;
      suggestedDownPayment = Math.min(suggestedDownPayment, vehiclePrice * 0.5);
      suggestedDownPayment = Math.max(suggestedDownPayment, downPayment + 500);
      suggestedDownPayment = Math.round(suggestedDownPayment / 100) * 100;

      const additionalDown = suggestedDownPayment - downPayment;

      if (additionalDown >= 500) {
        const amountFinancedHigherDown = calculateAmountFinanced(
          vehiclePrice,
          suggestedDownPayment,
          tradeInValue,
          salesTaxRate
        );
        const higherDownPayment = calculateMonthlyPayment(
          amountFinancedHigherDown,
          apr,
          loanTermMonths
        );
        const savings = currentMonthlyPayment - higherDownPayment;
        const totalCost = higherDownPayment * loanTermMonths;

        const isShorterTermBase = loanTermMonths <= 36;

        if (higherDownPayment < currentMonthlyPayment || isShorterTermBase) {
          alternatives.push({
            description: `${loanTermMonths}-month plan with $${suggestedDownPayment.toLocaleString()} down (+$${additionalDown.toLocaleString()})`,
            monthlyPayment: roundCurrency(higherDownPayment),
            downPayment: suggestedDownPayment,
            savings: roundCurrency(savings),
            totalCostChange: Math.round(totalCost - baseTotalCost),
            type: "higher-down",
          });
        }
      }
    }
  }
  
    // Alternative 3: Shorter loan term with current payment range (if not already at 36 months)
    if (loanTermMonths > 36) {
      const shorterTerm = loanTermMonths === 72 ? 60 : loanTermMonths === 60 ? 48 : 36;
    const shorterTermPayment = calculateMonthlyPayment(baseAmountFinanced, apr, shorterTerm);
    const difference = shorterTermPayment - currentMonthlyPayment;
      
      // Only show if the increase is reasonable (less than $150/month more)
      if (difference < 150) {
        const totalCost = shorterTermPayment * shorterTerm;
        alternatives.push({
          description: `${shorterTerm}-month plan (pay off faster)`,
          monthlyPayment: roundCurrency(shorterTermPayment),
          loanTermMonths: shorterTerm,
          savings: -roundCurrency(difference), // negative savings = paying more per month
          totalCostChange: Math.round(totalCost - baseTotalCost),
          type: "shorter-term",
        });
      }
    }
  
    return alternatives.slice(0, 3); // Return max 3 alternatives
  }
  
  // Generate recommendation with alternatives
function generateRecommendation(
    creditScore: number,
    alternatives: AlternativeOption[]
  ): string {
    let recommendation = "";
  
    // Base recommendation based on credit score
    if (creditScore >= 750) {
      recommendation = `Excellent credit! You've qualified for our best rate. `;
    } else if (creditScore >= 700) {
      recommendation = `Good credit score! You're getting a competitive rate. `;
    } else if (creditScore >= 650) {
      recommendation = `Fair credit - we can work with that! `;
    } else if (creditScore >= 600) {
      recommendation = `We can help you get financed! `;
    } else {
      recommendation = `Let's find a plan that works for you. `;
    }
  
    // Add alternatives with specific pricing
    if (alternatives.length > 0) {
      recommendation += `Here are your options:\n\n`;
      
      alternatives.forEach((alt, index) => {
        const monthlyText = (() => {
          if (alt.savings === undefined || alt.savings === 0) {
            return "";
          }
          return alt.savings > 0
            ? ` (saves $${alt.savings}/month`
            : ` (+$${Math.abs(alt.savings!)}/month`;
        })();

        const totalCostText = (() => {
          if (alt.totalCostChange === undefined || alt.totalCostChange === 0) {
            return "";
          }
          return alt.totalCostChange > 0
            ? `${monthlyText ? ", " : " ("}adds $${Math.abs(alt.totalCostChange)}/total`
            : `${monthlyText ? ", " : " ("}saves $${Math.abs(alt.totalCostChange)}/total`;
        })();

        const suffix =
          monthlyText || totalCostText
            ? `${monthlyText}${totalCostText})`
            : "";

        recommendation += `${index + 1}. ${alt.description}: $${alt.monthlyPayment}/month${suffix}\n`;
      });
    }
  
    return recommendation.trim();
  }
  
  export function calculateFinancing(
    params: FinanceCalculationParams
  ): FinanceCalculationResult {
    const {
      vehiclePrice,
      creditScore,
      downPayment,
      loanTermMonths,
      tradeInValue = 0,
      salesTaxRate = 0.08, // Default 8% sales tax
    } = params;
  
    // Validate inputs
    if (vehiclePrice <= 0) {
      throw new Error("Vehicle price must be greater than 0");
    }
    if (creditScore < 300 || creditScore > 850) {
      throw new Error("Credit score must be between 300 and 850");
    }
    if (downPayment < 0) {
      throw new Error("Down payment cannot be negative");
    }
    if (loanTermMonths <= 0) {
      throw new Error("Loan term must be greater than 0");
    }
  
    // Calculate APR based on credit score
    const apr = getAPRFromCreditScore(creditScore);
  
    // Calculate amount financed
    const amountFinanced = calculateAmountFinanced(
      vehiclePrice,
      downPayment,
      tradeInValue,
      salesTaxRate
    );
  
    // Check if amount financed is valid
    if (amountFinanced <= 0) {
      throw new Error("Down payment and trade-in exceed vehicle price");
    }
  
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(
      amountFinanced,
      apr,
      loanTermMonths
    );
  
    // Calculate total cost and interest
    const totalCost = monthlyPayment * loanTermMonths;
    const totalInterest = totalCost - amountFinanced;
  
    // Generate alternatives
    const baseAlternative: AlternativeOption = {
      description: `${loanTermMonths}-month plan (current selection)`,
      monthlyPayment: Math.round(monthlyPayment),
      loanTermMonths,
      downPayment,
      savings: 0,
      totalCostChange: 0,
      type: "base",
    };

    const generatedAlternatives = generateAlternatives(params, monthlyPayment, apr);
    const alternatives = [baseAlternative, ...generatedAlternatives];
  
    // Generate recommendation with alternatives
    const recommendation = generateRecommendation(
      creditScore,
      alternatives
    );
  
    return {
      monthlyPayment: Math.round(monthlyPayment),
      apr,
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalCost),
      amountFinanced: Math.round(amountFinanced),
      recommendation,
      alternatives,
    };
  }