import type { VercelRequest } from "@vercel/node";

export async function readJsonBody<T>(req: VercelRequest): Promise<T> {
  if (req.body && typeof req.body === "object") {
    return req.body as T;
  }

  const rawBody = await readRawBody(req);

  if (!rawBody) {
    return {} as T;
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch (error) {
    throw new Error("Invalid JSON payload");
  }
}

async function readRawBody(req: VercelRequest): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    let data = "";

    req.setEncoding("utf8");

    req.on("data", chunk => {
      data += chunk;
    });

    req.on("end", () => {
      resolve(data);
    });

    req.on("error", err => {
      reject(err);
    });
  });
}

