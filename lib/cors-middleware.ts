import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

export const cors = Cors({
  methods: ["POST", "GET", "OPTIONS", "HEAD"],
  origin: ["*"],
});

export function runCorsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  return new Promise((resolve, reject) => {
    cors(req, res, (err: unknown) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}
