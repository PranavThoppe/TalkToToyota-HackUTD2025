import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors.js";
import { readJsonBody } from "../_lib/request.js";
import { calculateFinancing } from "../../server/services/finance.js";

interface FinanceRequestBody {
  vehiclePrice?: number;
  creditScore?: number;
  downPayment?: number;
  loanTermMonths?: number;
  tradeInValue?: number;
  salesTaxRate?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJsonBody<FinanceRequestBody>(req);
    const {
      vehiclePrice,
      creditScore,
      downPayment,
      loanTermMonths,
      tradeInValue,
      salesTaxRate,
    } = body;

    if (!vehiclePrice || !creditScore || downPayment === undefined || !loanTermMonths) {
      res.status(400).json({
        error: "Missing required fields: vehiclePrice, creditScore, downPayment, loanTermMonths",
      });
      return;
    }

    const result = calculateFinancing({
      vehiclePrice: Number(vehiclePrice),
      creditScore: Number(creditScore),
      downPayment: Number(downPayment),
      loanTermMonths: Number(loanTermMonths),
      tradeInValue: tradeInValue !== undefined ? Number(tradeInValue) : undefined,
      salesTaxRate: salesTaxRate !== undefined ? Number(salesTaxRate) : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Finance calculation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to calculate financing";
    res.status(500).json({ error: errorMessage });
  }
}

