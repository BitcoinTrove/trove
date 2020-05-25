import { crypto as bitcoinCrypto } from "bitcoinjs-lib";
import { ModeOfOperation, utils } from "aes-js";
import { randomInt } from "./random";

const getKey = (
  masterSeed: Buffer,
  address: string,
  shareChecksum: string
): Buffer => {
  shareChecksum = "";
  return bitcoinCrypto.hash256(
    Buffer.concat([
      masterSeed,
      Buffer.from(address, "utf8"),
      Buffer.from(shareChecksum, "utf8"),
    ])
  );
};

const PADDING_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const createPadding = (length: number) => {
  let padding = "";
  for (var i = 0; i < length; ++i) {
    // This needs some security review.
    padding += PADDING_CHARS[randomInt(PADDING_CHARS.length)];
  }
  return padding;
};

export const aesEncrypt = (
  message: string,
  masterSeed: Buffer,
  address: string,
  shareChecksum: string
): string => {
  const symetricKey = getKey(masterSeed, address, shareChecksum);
  const paddedMessage = {
    message: message,
    padding: createPadding(
      Math.max(1000 - message.length, 100) + randomInt(100)
    ),
  };
  const textBytes = utils.utf8.toBytes(JSON.stringify(paddedMessage));
  const aesCtr = new ModeOfOperation.ctr(symetricKey);
  const encryptedBytes = aesCtr.encrypt(textBytes);
  return utils.hex.fromBytes(encryptedBytes);
};

export const aesDecrypt = (
  encryptedMessage: string,
  masterSeed: Buffer,
  address: string,
  shareChecksum: string
): string => {
  const symetricKey = getKey(masterSeed, address, shareChecksum);
  const aesCtr = new ModeOfOperation.ctr(symetricKey);
  const encryptedBytes = utils.hex.toBytes(encryptedMessage);
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);
  const paddedMessage = utils.utf8.fromBytes(decryptedBytes);
  return JSON.parse(paddedMessage).message;
};
