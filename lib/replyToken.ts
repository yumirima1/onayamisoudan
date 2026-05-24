import { createHash, randomBytes } from "crypto";

export function createReplyToken() {
  return randomBytes(32).toString("base64url");
}

export function hashReplyToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
