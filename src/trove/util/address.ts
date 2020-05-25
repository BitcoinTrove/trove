import QRCode from "qrcode";
import { payments, address, Network } from "bitcoinjs-lib";
import {
  addMargins,
  combineVertical,
  textAsCanvas,
  combineHorizontal,
} from "../../platform/util/canvas";
import { MasterSeed } from "../types/master_seed";

export type Callback = (error: any, canvas: HTMLCanvasElement) => void;

export const addressAsCanvasSimple = (text: string, callback: Callback) => {
  textAsCanvasSimple("bitcoin:" + text, callback);
};

export const textAsCanvasSimple = (text: string, callback: Callback) => {
  const options = { width: 200, margin: 0 };
  QRCode.toCanvas(text, options, function (error, canvas) {
    if (error) {
      return callback(error, undefined);
    }

    const finalCanvas = addMargins(canvas, 20, 20, 20, 20);

    callback(undefined, finalCanvas);
  });
};

export const addressBookletPageIncorrectWidth: (
  masterSeed: MasterSeed,
  index: number,
  maxIndex: number
) => Promise<HTMLCanvasElement> = async (
  masterSeed: MasterSeed,
  index: number,
  maxIndex: number
) => {
  const address = getAddress(
    masterSeed.getbip44Account0Index(index),
    masterSeed.getNetwork()
  );
  const qrcode = await textAsCanvasSimplePromise("bitcoin:" + address);
  const vertical = combineVertical(
    addMargins(
      textAsCanvas(
        "Address " + (index + 1) + " of " + maxIndex,
        "bold 16px monospace",
        16
      ),
      10,
      10,
      10,
      10
    ),
    qrcode,
    addMargins(textAsCanvas(address, "16px monospace", 16), 10, 10, 10, 10)
  );
  return addMargins(vertical, 30, 0, 0, 0);
};

export const addressAsCanvasSimplePromise: (
  text: string
) => Promise<HTMLCanvasElement> = (text: string) => {
  return textAsCanvasSimplePromise("bitcoin:" + text);
};

export const textAsCanvasSimplePromise: (
  text: string
) => Promise<HTMLCanvasElement> = (text: string) => {
  const options = { width: 200, margin: 0 };
  return new Promise((resolve, reject) => {
    QRCode.toCanvas(text, options, function (error, canvas) {
      if (error) {
        return reject();
      }
      return resolve(canvas);
    });
  });
};

export const addressAsCanvas = (text: string, callback: Callback) => {
  const font = "16px monospace";
  const boldFont = "bold 16px monospace";

  var addressCanvas = addMargins(
    combineVertical(
      textAsCanvas("Public Address", font, 16),
      textAsCanvas(text, font, 16)
    ),
    20,
    0,
    0,
    0
  );

  const options = { width: 200, margin: 0 };
  QRCode.toCanvas("bitcoin:" + text, options, function (error, canvas) {
    if (error) {
      return callback(error, undefined);
    }

    const finalCanvas = addMargins(
      combineHorizontal(canvas, addressCanvas),
      20,
      20,
      20,
      20
    );

    callback(undefined, finalCanvas);
  });
};

export const getAddress = (node, network: Network) => {
  return payments.p2wpkh({ pubkey: node.publicKey, network }).address;
};

export const isValidAddress = (a: string, network: Network) => {
  try {
    address.toOutputScript(a, network);
    return true;
  } catch (e) {
    return false;
  }
};

export const xpubAsCanvas = (xpub: string, callback: Callback) => {
  const options = { width: 200, margin: 0 };
  QRCode.toCanvas(xpub, options, function (error, xpubAsQrCanvas) {
    if (error) {
      return callback(error, undefined);
    }
    const font = "16px monospace";
    const xpubTextAsCanvas = addMargins(
      combineVertical(
        addMargins(textAsCanvas("Xpub", font, 16), 0, 0, 0, 5),
        textAsCanvas(xpub, font, 16, 400)
      ),
      10,
      0,
      0,
      0
    );
    const finalCanvas = addMargins(
      combineHorizontal(xpubAsQrCanvas, xpubTextAsCanvas),
      20,
      20,
      20,
      20
    );

    callback(undefined, finalCanvas);
  });
};

export const xpubAsCanvasSimple = (xpub: string, callback: Callback) => {
  const options = { width: 200, margin: 0 };
  QRCode.toCanvas(xpub, options, function (error, xpubAsQrCanvas) {
    if (error) {
      return callback(error, undefined);
    }
    /*const font = "16px monospace";
     const xpubTextAsCanvas = addMargins(
      combineVertical(
        addMargins(textAsCanvas("Xpub", font, 16), 0, 0, 0, 5),
        textAsCanvas(xpub, font, 16, 400)
      ),
      10,
      0,
      0,
      0
    );*/
    const finalCanvas = addMargins(xpubAsQrCanvas, 20, 20, 20, 20);

    callback(undefined, finalCanvas);
  });
};

export const xpubIndexAsCanvas = (
  xpub: string,
  index: number,
  address: string,
  callback: Callback
) => {
  const options = { width: 200, margin: 0 };
  QRCode.toCanvas("bitcoin:" + address, options, function (error, canvas) {
    if (error) {
      return callback(error, undefined);
    }
    const font = "16px monospace";
    const xpubAsCanvas = addMargins(
      textAsCanvas(xpub, font, 16, 600),
      0,
      0,
      0,
      10
    );
    const indexAsCanvas = textAsCanvas("Address #" + index, font, 16);
    const addressAsCanvas = addMargins(
      textAsCanvas(address, font, 16),
      0,
      0,
      10,
      0
    );
    const finalCanvas = addMargins(
      combineVertical(xpubAsCanvas, indexAsCanvas, canvas, addressAsCanvas),
      20,
      20,
      20,
      20
    );

    callback(undefined, finalCanvas);
  });
};
