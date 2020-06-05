import { Slip39Helper } from "./slip39_wrapper";
import { aesEncrypt } from "../util/aes";
import { crypto as bitcoinCrypto, Network } from "bitcoinjs-lib";
import { utils } from "aes-js";
import { WINDOW_CRYPTO, serializeEnvelope } from "../trove_constants";
import { SettingsState } from "../wizards/create_shares/create_shares_wizard";
import { replaceAll } from "../../shared/constants";
import { sha256 } from "../../platform/util/checksum";
import { MasterSeed } from "../types/master_seed";
import { SecretShareEnvelope } from "../types/secret_share_envelope";
import { TROVE_VERSION } from "./version";

const randomShareId = () => {
  var array = new Uint8Array(8);
  WINDOW_CRYPTO.getRandomValues(array);
  return utils.hex.fromBytes(array).substring(0, 8);
};

export class SecretSplitter {
  shareNameFormat?: string;
  tags: object;

  done: boolean = false;

  constructor() {}

  formatName(shareNameFormat: string) {
    this.shareNameFormat = shareNameFormat;
    return this;
  }

  withTags(tags: object) {
    this.tags = tags;
    return this;
  }

  splitIntoEnvelopesSlip39(masterSeed: MasterSeed, settings: SettingsState) {
    if (this.done) {
      throw "SecretSplitter instances can only be used once";
    }

    const finalNumberOfShares = settings.custodianNames.length;
    const finalNumberOfRequiredShares = settings.requiredShares;
    if (!finalNumberOfShares || !finalNumberOfRequiredShares) {
      throw "error1";
    }

    if (!this.shareNameFormat) {
      throw "error2";
    }

    const shareIdsSet = new Set<string>();
    for (let i = 0; i < finalNumberOfShares; ++i) {
      while (true) {
        const possibleShareId = randomShareId();
        if (!shareIdsSet.has(possibleShareId)) {
          shareIdsSet.add(possibleShareId);
          break;
        }
      }
    }
    const shareIds: string[] = Array.from(shareIdsSet);

    const filenames: string[] = [];
    for (let i = 0; i < finalNumberOfShares; ++i) {
      let filename = this.shareNameFormat;
      filename = replaceAll(filename, "{index}", "" + (i + 1));
      filename = replaceAll(
        filename,
        "{referenceName}",
        settings.referenceName
      );
      filename = replaceAll(filename, "{shareid}", shareIds[i]);
      filenames.push(filename);
    }

    const words: string[] = Slip39Helper.split(
      masterSeed.toBuffer(),
      finalNumberOfRequiredShares,
      finalNumberOfShares,
      settings.slip39Password
    );

    const shareDataLengths = words.map((w) => w.split(" ").length);

    let envelopes: SecretShareEnvelope[] = words.map(
      (words: string, index: number) => {
        return {
          version: 0.1,
          codeVersion: TROVE_VERSION,
          numberOfShares: finalNumberOfShares,
          numberOfRequiredShares: finalNumberOfRequiredShares,
          shareNames: filenames,
          shareDataLengths: shareDataLengths,
          thisSharesIndex: index,
          referenceName: settings.referenceName,
          addressStrategy: settings.addressStrategy.getStrategyName(),
          creationDate: settings.creationDate,
          shareId: shareIds[index],
          shareIds: shareIds,
          shareData: words,
          tags: this.tags,
          network: settings.network,
          custodian: settings.custodianNames[index],
          message: settings.messageOnEachShare[index],
          messageAfterRevealing: aesEncrypt(
            settings.messageAfterRevealing,
            masterSeed.toBuffer(),
            masterSeed.getAddress(),
            shareIds[index]
          ),
          slip39PasswordHash: settings.slip39Password
            ? sha256(settings.slip39Password + "_" + shareIds[index])
            : null,
        };
      }
    );
    const shareEnvelopeChecksums = envelopes.map((e) => {
      return bitcoinCrypto
        .hash256(Buffer.from(serializeEnvelope(e), "utf8"))
        .toString("hex");
    });
    envelopes.forEach((e) => {
      e.shareEnvelopeChecksums = shareEnvelopeChecksums;
    });
    this.done = true;
    return envelopes;
  }

  public static joinSlip39ToMasterSeed(
    envelopes: SecretShareEnvelope[],
    network: Network,
    password: string
  ) {
    const bytes = Slip39Helper.join(
      envelopes.map((envelope) => envelope.shareData),
      password
    );
    return MasterSeed.fromByteArray(bytes, network);
  }
}
