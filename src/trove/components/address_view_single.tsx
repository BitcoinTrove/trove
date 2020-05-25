import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { copyTextToClipboard } from "../../platform/util/clipboard";
import { MasterSeed } from "../types/master_seed";
import { htmlRef } from "../../platform/util/html_ref";
import { downloadCanvasAsImage, download } from "../util/files";
import { addressAsCanvas } from "../util/address";

declare var localize: (enText: string) => string;

export const AddressViewSingle = ({
  masterSeed,
  referenceName,
}: {
  masterSeed: MasterSeed;
  referenceName: string;
}) => {
  const qrContainer = htmlRef();
  const copyAddress = htmlRef();

  const container = (
    <div>
      <article class="message is-info">
        <div class="message-body">
          <div class="messageBodyHeading">
            <span>{localize("~ Security Notes ~")}</span>
          </div>
          <div style="margin: auto; max-width: 85%;">
            <ul style="list-style: decimal; margin: 5px 20px; text-align: left;">
              <li>
                {localize(
                  "If someone sees this address, they will be able to lookup the amount of bitcoin it holds."
                )}
              </li>
              <li>
                {localize(
                  "If someone is able to swap this address with their own, you could be tricked into sending your bitcoin to them."
                )}
              </li>
              <li>
                {localize(
                  "If you search for this address on a website or block explorer, the address could be linked to your IP address."
                )}
              </li>
            </ul>
          </div>
        </div>
      </article>

      <article class="message is-info">
        <div class="message-body">
          <p
            style="text-align: left;"
            innerHTML={localize(
              "The address is not stored with the individual shares. The address is only revealed when the shares are joined. You will likely need this address <strong>before</strong> the shares are joined. It is recommended that you <strong>save this address now</strong>."
            )}
          ></p>
        </div>
      </article>

      <div ref={qrContainer}></div>

      <div>
        <button
          class="button is-success is-outlined"
          style="margin: 4px;"
          onClick={(e) => {
            const canvas = qrContainer.find("canvas");
            downloadCanvasAsImage(canvas, referenceName + "_address.png");
          }}
        >
          {localize("Save QR Code (image)")}
        </button>
        <button
          class="button is-success is-outlined"
          style="margin: 4px;"
          onClick={(e) => {
            download(masterSeed.getAddress(), referenceName + "_address.text");
          }}
        >
          {localize("Save address (text)")}
        </button>
        <button
          ref={copyAddress}
          class="button is-success is-outlined"
          style="margin: 4px;"
          onClick={(e) => {
            copyTextToClipboard(masterSeed.getAddress(), copyAddress);
          }}
        >
          {localize("Copy address to clipboard")}
        </button>
      </div>
    </div>
  );

  addressAsCanvas(
    masterSeed.getAddress(),
    (error: any, canvas: HTMLCanvasElement) => {
      canvas.style.maxWidth = "100%";
      canvas.style.border = "1px solid #bbb";
      canvas.style.borderRadius = "18px";
      qrContainer.empty().appendChild(canvas);
    }
  );

  return container;
};
