import { getParameterByName } from "../platform/util/query_params";
import { crypto as bitcoinCrypto } from "bitcoinjs-lib";
import { utils } from "aes-js";
import { clone } from "../platform/util/object";
import { canonicalize } from "json-canonicalize";
import { SecretShareEnvelope } from "./types/secret_share_envelope";

const getCrypto = () => {
  const anyWindow = window as any;
  if (window.crypto) {
    return window.crypto;
  } else if (anyWindow.msCrypto) {
    return anyWindow.msCrypto;
  }
  return {
    cryptoNotDefined: true,
    getRandomValues: () => {},
  };
};
export const WINDOW_CRYPTO = getCrypto();

// TODO - Should this be moved into a function on SecretShareEnvelope?
export const serializeEnvelope = (envelope: SecretShareEnvelope): string => {
  return canonicalize(envelope);
};
// TODO - Should this be moved into a function on SecretShareEnvelope?
export const deserializeEnvelope = (
  envelopeString: string
): SecretShareEnvelope => {
  return JSON.parse(envelopeString);
};

export function isRelatedEnvelope(
  envelope1: SecretShareEnvelope,
  envelope2: SecretShareEnvelope
) {
  const envelope1Clone = clone(envelope1) as SecretShareEnvelope;
  const envelope2Clone = clone(envelope2) as SecretShareEnvelope;
  delete envelope1Clone.shareEnvelopeChecksums;
  delete envelope2Clone.shareEnvelopeChecksums;

  const hash1 = bitcoinCrypto
    .hash256(Buffer.from(serializeEnvelope(envelope1Clone), "utf8"))
    .toString("hex");
  const hash2 = bitcoinCrypto
    .hash256(Buffer.from(serializeEnvelope(envelope2Clone), "utf8"))
    .toString("hex");

  return (
    envelope1.shareEnvelopeChecksums.indexOf(hash2) != -1 &&
    envelope2.shareEnvelopeChecksums.indexOf(hash1) != -1
  );
}

export const isTestnetShare = (envelope: SecretShareEnvelope) => {
  return envelope && envelope.network === "testnet";
};

export const IS_ALPHA_BUILD = true;

export const IS_DEV = !window["isReleaseBuild"];

const determineDebug = (): boolean => {
  const debug = getParameterByName("debug");
  if (debug) {
    return debug.toLocaleLowerCase() === "true";
  }
  return IS_DEV;
};
export const IS_DEBUG = determineDebug();
export const DEBUG_DISPLAY = IS_DEBUG ? "" : "none";
export const DEV_AND_DEBUG_DISPLAY = IS_DEV && IS_DEBUG ? "" : "none";

export const READONLY_COLOR = "#eee";

const TEMP_REFERENCE_NAME = (() => {
  var array = new Uint8Array(8);
  WINDOW_CRYPTO.getRandomValues(array);
  return utils.hex.fromBytes(array).substring(0, 8);
})();

export const walletNameFromEnvelope = (baseEnvelope: SecretShareEnvelope) => {
  const referenceName = baseEnvelope?.referenceName || TEMP_REFERENCE_NAME;
  return walletNameFromAddress(referenceName);
};

export const walletNameFromAddress = (referenceName: string) => {
  return referenceName + "-watchonly";
};

export const SHOW_RANDOM_ADDRESS_STRATEGY = false;

export const UNIQUE_IDENTIFIER = {
  num: 0,
  get: () => {
    UNIQUE_IDENTIFIER.num += 1;
    return this.UNIQUE_IDENTIFIER.num + "";
  },
};

export const NO_OP = () => {};
