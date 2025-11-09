// backend/src/services/finance.ts

interface FinanceCalculationParams {
    vehiclePrice: number;
    creditScore: number;
    downPayment: number;
    loanTermMonths: number;
    tradeInValue?: number;
    salesTaxRate?: number; // decimal format: 0.08 for 8%
  }
  
  interface AlternativeOption {
    description: string;
    monthlyPayment: number;
    loanTermMonths?: number;
    downPayment?: number;
    savings?: number;
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
  
    // Alternative 1: Longer loan term (if not already at 72 months)
    if (loanTermMonths < 72) {
      const longerTerm = loanTermMonths === 36 ? 48 : loanTermMonths === 48 ? 60 : 72;
      const amountFinanced = calculateAmountFinanced(
        vehiclePrice,
        downPayment,
        tradeInValue,
        salesTaxRate
      );
      const longerTermPayment = calculateMonthlyPayment(amountFinanced, apr, longerTerm);
      const savings = currentMonthlyPayment - longerTermPayment;
      
      alternatives.push({
        description: `${longerTerm}-month plan`,
        monthlyPayment: Math.round(longerTermPayment),
        loanTermMonths: longerTerm,
        savings: Math.round(savings),
      });
    }
  
    // Alternative 2: Higher down payment
    const additionalDown = downPayment < 5000 ? 5000 : 5000;
    const newDownPayment = downPayment + additionalDown;
    
    if (newDownPayment < vehiclePrice * 0.5) { // Don't suggest more than 50% down
      const amountFinancedHigherDown = calculateAmountFinanced(
        vehiclePrice,
        newDownPayment,
        tradeInValue,
        salesTaxRate
      );
      const higherDownPayment = calculateMonthlyPayment(
        amountFinancedHigherDown,
        apr,
        loanTermMonths
      );
      const savings = currentMonthlyPayment - higherDownPayment;
      
      alternatives.push({
        description: `${newDownPayment.toLocaleString()} down payment (+$${additionalDown.toLocaleString()})`,
        monthlyPayment: Math.round(higherDownPayment),
        downPayment: newDownPayment,
        savings: Math.round(savings),
      });
    }
  
    // Alternative 3: Shorter loan term with current payment range (if not already at 36 months)
    if (loanTermMonths > 36) {
      const shorterTerm = loanTermMonths === 72 ? 60 : loanTermMonths === 60 ? 48 : 36;
      const amountFinanced = calculateAmountFinanced(
        vehiclePrice,
        downPayment,
        tradeInValue,
        salesTaxRate
      );
      const shorterTermPayment = calculateMonthlyPayment(amountFinanced, apr, shorterTerm);
      const difference = shorterTermPayment - currentMonthlyPayment;
      
      // Only show if the increase is reasonable (less than $150/month more)
      if (difference < 150) {
        alternatives.push({
          description: `${shorterTerm}-month plan (pay off faster)`,
          monthlyPayment: Math.round(shorterTermPayment),
          loanTermMonths: shorterTerm,
          savings: -Math.round(difference), // negative savings = paying more per month
        });
      }
    }
  
    return alternatives.slice(0, 3); // Return max 3 alternatives
  }
  
  // Generate recommendation with alternatives
  function generateRecommendation(
    creditScore: number,
    currentMonthlyPayment: number,
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
        const savingsText = alt.savings && alt.savings > 0 
          ? ` (saves $${alt.savings}/month)` 
          : alt.savings && alt.savings < 0
          ? ` (+$${Math.abs(alt.savings)}/month)`
          : '';
        
        recommendation += `${index + 1}. ${alt.description}: $${alt.monthlyPayment}/month${savingsText}\n`;
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
    const alternatives = generateAlternatives(params, monthlyPayment, apr);
  
    // Generate recommendation with alternatives
    const recommendation = generateRecommendation(
      creditScore,
      monthlyPayment,
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