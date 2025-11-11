import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../../_lib/cors.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const creditScoreParam = req.query.creditScore;
  const creditScore = Array.isArray(creditScoreParam)
    ? Number(creditScoreParam[0])
    : Number(creditScoreParam);

  if (Number.isNaN(creditScore)) {
    res.status(400).json({ error: "Credit score must be a number" });
    return;
  }

  if (creditScore < 300 || creditScore > 850) {
    res.status(400).json({ error: "Credit score must be between 300 and 850" });
    return;
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

  res.status(200).json({ creditScore, apr, tier });
}

