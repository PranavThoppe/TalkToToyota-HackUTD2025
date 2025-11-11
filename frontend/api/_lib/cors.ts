import type { VercelRequest, VercelResponse } from "@vercel/node";

const DEFAULT_ALLOWED_METHODS = "GET,POST,OPTIONS";
const DEFAULT_ALLOWED_HEADERS = "Content-Type, Authorization";

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = process.env.CORS_ORIGIN || "*";

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS);
  res.setHeader("Access-Control-Allow-Headers", DEFAULT_ALLOWED_HEADERS);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }

  return false;
}

