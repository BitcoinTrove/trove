import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { mount, unmount } from "redom";
import QRReader from "qrreader";
import { hideWhatsVisible } from "./effects";

export const QR_READER = new QRReader();

export const getQrCodeFromCamera = () => {
  const showItAgainF = hideWhatsVisible();

  return new Promise<string>((resolve, reject) => {
    const scan = () => {
      QR_READER.startCapture(document.getElementById("qrCodePreview"))
        .then((qrCode) => {
          QR_READER.stopCapture();
          unmount(document.body, html);
          showItAgainF();
          resolve(qrCode);
        })
        .catch(() => {
          QR_READER.stopCapture();
          unmount(document.body, html);
          showItAgainF();
          reject();
        });
    };

    const html = (
      <div style="text-align: center;">
        <span>Scanning for QR Code</span>
        <br></br>
        <video id="qrCodePreview"></video>
        <br></br>
        <button
          class="button"
          onClick={(e) => {
            QR_READER.stopCapture();
            unmount(document.body, html);
            showItAgainF();
            reject();
          }}
        >
          Cancel
        </button>
        <button
          class="button"
          onClick={(e) => {
            QR_READER.stopAndSwitchCamera();
            scan();
          }}
        >
          Switch cameras
        </button>
      </div>
    );
    mount(document.body, html);
    scan();
  });
};
