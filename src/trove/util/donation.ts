import { fromBase58 } from "bip32";
import { networks } from "bitcoinjs-lib";
import { getAddress } from "./address";
import { randomInt } from "./random";

export const DONATE_XPUB =
  "xpub6FPfe9HBYSkDWNjTrDxFeFiZvvYnhKpKwUiTSB26eyCeJEs4sHEMujRBD193b3vZRCoHXgupeBqv2ty1WnjRUqNWUS9tS5fWd2wbCCW14Fc";
export const DONATION_NETWORK = networks.bitcoin;

const derivationIndex = randomInt(100000);
export const DONATE_ADDRESS = getAddress(
  fromBase58(DONATE_XPUB, DONATION_NETWORK).derive(derivationIndex),
  DONATION_NETWORK
);
export const SIGNING_ADDRESS = getAddress(
  fromBase58(DONATE_XPUB, DONATION_NETWORK).derive(0),
  DONATION_NETWORK
);
