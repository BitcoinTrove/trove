import * as classify from "bitcoinjs-lib/src/classify";

import { payments, Psbt } from "bitcoinjs-lib";

// See https://github.com/bitcoinjs/bitcoinjs-lib/issues/669
// Looks like this is now meant to be done through classify
// I don't think this code is being used. Just keeping it here for when I want to process a psbt
const guessSendingAddress = (
  scriptSig: Buffer,
  witnessStack: Buffer[]
): string | undefined => {
  let ssType = classify.input(scriptSig, true);
  let wsType = classify.witness(witnessStack, true);
  if (ssType === classify.types.NONSTANDARD) ssType = undefined;
  if (wsType === classify.types.NONSTANDARD) wsType = undefined;
  const type = ssType || wsType;
  switch (type) {
    case classify.types.P2WPKH: {
      return payments.p2wpkh({
        witness: witnessStack
      }).address;
    }
    case classify.types.P2PKH: {
      return payments.p2pkh({
        input: scriptSig
      }).address;
    }
    case classify.types.P2PK: {
      return payments.p2pk({ input: scriptSig }).address;
    }
    case classify.types.P2SH: {
      return payments.p2sh({
        input: scriptSig,
        witness: witnessStack
      }).address;
    }
    case classify.types.P2WSH: {
      return payments.p2wsh({
        input: scriptSig,
        witness: witnessStack
      }).address;
    }
  }

  return undefined;
};

// I don't think this code is being used. Just keeping it here for when I want to process a psbt
const something = (psbt: Psbt) => {
  const t = psbt.extractTransaction();
  // This is getting dodgy
  t.ins.forEach((input, i) => {
    const address =
      guessSendingAddress(input.script, input.witness) || "unknown";
    const amount = psbt.data.inputs[i].witnessUtxo
      ? psbt.data.inputs[i].witnessUtxo.value
      : "unknown";
  });
};
