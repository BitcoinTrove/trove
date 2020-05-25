import { fromSeed, BIP32Interface } from "bip32";
import { getAddress } from "../util/address";
import { ECPair, ECPairInterface, Network, Psbt } from "bitcoinjs-lib";
import { utils } from "aes-js";
import { networkAsString } from "../util/network";
import { replaceAll } from "../../shared/constants";

export const DEFAULT_FORMAT =
  "{index} {address} {publickey} {wif} {privatekey} {walletname}";
const MAX_CHUNK_SIZE = 50;
const MINIMUM_STEPS = 10;
const MIN_CHUNK_SIZE = 1;
const getChunkSize = (totalToFetch: number): number[] => {
  let chunkSizes: number[] = [];

  const chunkSize =
    totalToFetch > MAX_CHUNK_SIZE * MINIMUM_STEPS
      ? MAX_CHUNK_SIZE
      : Math.max(MIN_CHUNK_SIZE, Math.floor(totalToFetch / MINIMUM_STEPS));

  while (totalToFetch > chunkSize) {
    chunkSizes.push(chunkSize);
    totalToFetch -= chunkSize;
  }
  if (totalToFetch > 0) {
    chunkSizes.push(totalToFetch);
  }

  return chunkSizes;
};

export class MasterSeed {
  private byteArray: Uint8Array;
  private bip32Root: BIP32Interface;
  private bip44Account0: BIP32Interface;
  private ecPair: ECPairInterface;
  private network: Network;
  private address: string;
  // These are just caches for addresses which have been searched for and found and or not found
  private validDerivedAddress = new Map<string, Map<string, BIP32Interface>>();
  private invalidAddressUpToIndex = new Map<string, number>();

  private constructor(byteArray: Uint8Array, network: Network) {
    this.byteArray = byteArray;
    this.bip32Root = fromSeed(new Buffer(this.byteArray), network);
    this.bip44Account0 = this.bip32Root
      .deriveHardened(44)
      .deriveHardened(0) // TODO - should this be 1 for testnet?
      .deriveHardened(0)
      .derive(0);
    const bip44Account0Index0 = this.bip44Account0.derive(0);
    this.ecPair = ECPair.fromWIF(bip44Account0Index0.toWIF(), network);
    this.network = network;
    this.address = getAddress(this.ecPair, this.network);
  }

  static fromByteArray = (byteArray: Uint8Array, network: Network) => {
    // TODO - Check the byte array size
    return new MasterSeed(byteArray, network);
  };

  static fromHex = (hex: string, network: Network) => {
    if (!hex || hex.length !== 64) {
      return null;
    }
    for (let i = 0; i < hex.length; ++i) {
      if (
        (hex[i] >= "0" && hex[i] <= "9") ||
        (hex[i] >= "a" && hex[i] <= "f")
      ) {
      } else {
        return null;
      }
    }
    return new MasterSeed(utils.hex.toBytes(hex), network);
  };

  toHex = () => {
    return utils.hex.fromBytes(this.byteArray);
  };

  toBuffer = () => {
    return new Buffer(this.byteArray);
  };

  getBip32Root = () => {
    return this.bip32Root;
  };

  getEcPair = () => {
    return this.ecPair;
  };

  getAddress = () => {
    return this.address;
  };

  getNetwork = () => {
    return this.network;
  };

  getNetworkAsString = () => {
    return networkAsString(this.network);
  };

  getbip44Account0 = () => {
    return this.bip44Account0;
  };

  getbip44Account0Index = (index: number) => {
    return this.getbip44Account0().derive(index);
  };

  getBip44Account0Xpub = () => {
    return this.bip44Account0.neutered().toBase58();
  };

  getBip44Account0Xpriv = () => {
    return this.bip44Account0.toBase58();
  };

  signPsbtWithNPrivateKeys = (
    psbt: Psbt,
    derivationCount: number,
    callback: {
      finished: () => void;
      update: (completed: number, total: number) => void;
    }
  ) => {
    let index = 0;
    const chunks = getChunkSize(derivationCount);

    const sign = (chunks: number[]) => {
      callback.update(index, derivationCount);
      const n = chunks.shift();
      for (let i = 0; i < n; ++i) {
        const node = this.getbip44Account0Index(index);
        const ecPair = ECPair.fromWIF(node.toWIF(), this.getNetwork());
        try {
          psbt.signAllInputs(ecPair);
        } catch (error) {
          // Nothing
        }
        index += 1;
      }
      if (chunks.length > 0) {
        window.setTimeout(() => {
          sign(chunks);
        }, 10);
      } else {
        callback.finished();
      }
    };

    sign(chunks);
  };

  getFormattedString = (format: string, index: number, walletName: string) => {
    const privateNode = this.getbip44Account0().derive(index);
    format = replaceAll(format, "{index}", index + "");
    format = replaceAll(
      format,
      "{address}",
      getAddress(privateNode, this.getNetwork())
    );
    format = replaceAll(
      format,
      "{publickey}",
      privateNode.publicKey.toString("hex")
    );
    format = replaceAll(
      format,
      "{privatekey}",
      privateNode.privateKey.toString("hex")
    );
    format = replaceAll(format, "{wif}", privateNode.toWIF());
    format = replaceAll(format, "{walletname}", walletName);
    return format;
  };

  deriveBulkFormatted = (
    format: string,
    fromNumber: number,
    toNumber: number,
    walletName: string,
    callbacks: {
      update: (done: number, totalNumber: number) => void;
      cancelled: () => void;
      finished: (fullText: string) => void;
    }
  ) => {
    let derivationCount = 0;
    const numberOfAddresses = toNumber - fromNumber;

    const chunks = getChunkSize(numberOfAddresses);
    let fullText = "";

    let derivationCancelled = false;
    const addAddress = (chunks: number[]) => {
      if (derivationCancelled) {
        callbacks.cancelled();
        return;
      }

      const n = chunks.shift();

      for (let i = 0; i < n; ++i) {
        const index = derivationCount + fromNumber;
        fullText += this.getFormattedString(format, index, walletName) + "\n";
        derivationCount += 1;
      }

      callbacks.update(derivationCount, numberOfAddresses);

      if (derivationCount < numberOfAddresses) {
        setTimeout(() => {
          addAddress(chunks);
        }, 10);
      } else {
        callbacks.finished(fullText);
      }
    };
    addAddress(chunks);

    return () => {
      derivationCancelled = true;
    };
  };

  findAddress(
    address: string,
    fromNumber: number,
    toNumber: number,
    callback: {
      found: (bip32Node: BIP32Interface) => void;
      cancelled: () => void;
      update: (searched: number, total: number) => void;
      nothingFound: (address: string) => void;
    }
  ) {
    let found = false;
    let masterSeedAddresses = this.validDerivedAddress.get(this.toHex());
    if (masterSeedAddresses) {
      const ecPair = masterSeedAddresses.get(address);
      if (ecPair) {
        callback.found(ecPair);
        return;
      }
    }
    const cachedFailure = this.invalidAddressUpToIndex.get(address);
    if (
      cachedFailure !== undefined &&
      fromNumber <= cachedFailure &&
      cachedFailure <= toNumber
    ) {
      callback.nothingFound(address);
      return;
    }

    let derivationCount = 0;
    const numberOfAddresses = toNumber - fromNumber;

    const chunks = getChunkSize(numberOfAddresses);

    let derivationCancelled = false;
    const checkAddress = (chunks: number[]) => {
      if (derivationCancelled) {
        callback.cancelled();
        return;
      }

      const n = chunks.shift();

      for (let i = 0; i < n; ++i) {
        const index = derivationCount + fromNumber;

        const node = this.getbip44Account0().derive(index);
        const ecPair = ECPair.fromWIF(node.toWIF(), this.getNetwork());
        const derivedAddress = getAddress(ecPair, this.getNetwork());

        if (derivedAddress === address) {
          if (!masterSeedAddresses) {
            this.validDerivedAddress.set(
              this.toHex(),
              new Map<string, BIP32Interface>()
            );
            masterSeedAddresses = this.validDerivedAddress.get(this.toHex());
          }
          masterSeedAddresses.set(address, node);
          callback.found(node);
          found = true;
          break;
        }

        derivationCount += 1;
      }

      if (!found) {
        callback.update(derivationCount, numberOfAddresses);
        if (derivationCount < numberOfAddresses) {
          setTimeout(() => {
            checkAddress(chunks);
          }, 10);
        } else {
          if (
            fromNumber === 0 ||
            fromNumber === this.invalidAddressUpToIndex.get(address)
          ) {
            this.invalidAddressUpToIndex.set(address, toNumber);
          }
          callback.nothingFound(address);
        }
      }
    };
    checkAddress(chunks);

    return () => {
      derivationCancelled = true;
    };
  }
}
