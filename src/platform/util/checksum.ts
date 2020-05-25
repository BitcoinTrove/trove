import { crypto as bitcoinCrypto } from "bitcoinjs-lib";

export function sha256(message) {
  const msgBuffer = Buffer.from(message, "utf8");
  const hashBuffer = bitcoinCrypto.sha256(msgBuffer);
  return hashBuffer.toString("hex");
}
