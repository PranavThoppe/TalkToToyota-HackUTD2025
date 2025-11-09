// backend/src/routes/finance.ts

import { Router } from "express";
import { calculateFinancing } from "../services/finance.js";

const router = Router();

// Calculate financing options
router.post("/calculate", async (req, res) => {
  try {
    const {
      vehiclePrice,
      creditScore,
      downPayment,
      loanTermMonths,
      tradeInValue,
      salesTaxRate,
    } = req.body;

    // Validate required fields
    if (!vehiclePrice || !creditScore || downPayment === undefined || !loanTermMonths) {
      return res.status(400).json({
        error: "Missing required fields: vehiclePrice, creditScore, downPayment, loanTermMonths",
      });
    }

    // Calculate financing
    const result = calculateFinancing({
      vehiclePrice: Number(vehiclePrice),
      creditScore: Number(creditScore),
      downPayment: Number(downPayment),
      loanTermMonths: Number(loanTermMonths),
      tradeInValue: tradeInValue ? Number(tradeInValue) : undefined,
      salesTaxRate: salesTaxRate ? Number(salesTaxRate) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error("Finance calculation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to calculate financing";
    res.status(500).json({ error: errorMessage });
  }
});

// Get APR estimate based on credit score (quick lookup)
router.get("/apr-estimate/:creditScore", (req, res) => {
  try {
    const creditScore = Number(req.params.creditScore);
    
    if (creditScore < 300 || creditScore > 850) {
      return res.status(400).json({ error: "Credit score must be between 300 and 850" });
    }

    let apr: number;
    let tier: string;

    if (creditScore >= 750) {
      apr = 5.0;
      tier = "Excellent";
    } else if (creditScore >= 700) {
      apr = 6.2;
      tier = "Good";
    } else if (creditScore >= 650) {
      apr = 9.0;
      tier = "Fair";
    } else if (creditScore >= 600) {
      apr = 13.5;
      tier = "Poor";
    } else {
      apr = 17.0;
      tier = "Bad";
    }

    res.json({ creditScore, apr, tier });
  } catch (error) {
    console.error("APR estimate error:", error);
    res.status(500).json({ error: "Failed to estimate APR" });
  }
});

export default router;