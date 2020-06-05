import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { IS_DEV } from "../trove_constants";
import { copyTextToClipboard } from "../../platform/util/clipboard";
import { createTroveWithDataInBrowser } from "../../platform/util/duplication";
import { MasterSeed } from "../types/master_seed";
import { htmlRef } from "../../platform/util/html_ref";
import { download, downloadCanvasAsImage } from "../util/files";
import { xpubAsCanvas } from "../util/address";

declare var localize: (enText: string) => string;

// TODO - Should this be deprecated
export const AddressViewMultipleRandom = ({
  masterSeed,
  referenceName,
  maxIndex,
}: {
  masterSeed: MasterSeed;
  referenceName: string;
  maxIndex: number;
}) => {
  const qrContainer = htmlRef();
  const copyAddress = htmlRef();

  const container = (
    <div>
      <article class="message is-info">
        <div class="message-body">
          <p
            style="text-align: left;"
            innerHTML={localize(
              "An <strong>xpub</strong> is used to generate public addresses for your keys. The xpub is not stored with the individual shares. The xpub is only revealed when the shares are joined. You will likely need this xpub <strong>before</strong> the shares are joined. It is recommended that you <strong>save this xpub now</strong>."
            )}
          ></p>
        </div>
      </article>

      {IS_DEV ? (
        <article class="message is-danger devModeWarning">
          <div class="message-body">
            <div class="messageBodyHeading">
              <span>~ {localize("Warning")} ~</span>
            </div>
            <p>
              <span
                innerHTML={localize(
                  "You are in <strong>development mode</strong>. The <strong>address generator will not work</strong>."
                )}
              ></span>
            </p>
          </div>
        </article>
      ) : null}

      <div ref={qrContainer}></div>

      <div>
        <button
          class="button is-success is-outlined"
          onClick={(e) => {
            download(
              createTroveWithDataInBrowser({
                addressGenerator: {
                  xpub: masterSeed.getBip44Account0Xpub(),
                  maxIndex: maxIndex,
                  network: masterSeed.getNetworkAsString(),
                },
              }),
              "address_generator.html"
            );
          }}
        >
          {localize("Save address generator")}
        </button>
        <button
          class="button is-success is-outlined"
          onClick={(e) => {
            const canvas = qrContainer.find("canvas");
            downloadCanvasAsImage(canvas, referenceName + "_address.png");
          }}
        >
          {localize("Save QR Code (image)")}
        </button>
        <button
          class="button is-success is-outlined"
          onClick={(e) => {
            download(
              masterSeed.getBip44Account0Xpub(),
              referenceName + "_address.text"
            );
          }}
        >
          {localize("Save xpub (text)")}
        </button>
        <button
          ref={copyAddress}
          class="button is-success is-outlined"
          onClick={(e) => {
            copyTextToClipboard(masterSeed.getBip44Account0Xpub(), copyAddress);
          }}
        >
          {localize("Copy address to clipboard")}
        </button>
      </div>
    </div>
  );

  // TODO - I think this can be removed in favor of something in address.ts
  xpubAsCanvas(
    masterSeed.getBip44Account0Xpub(),
    (error: any, canvas: HTMLCanvasElement) => {
      canvas.style.maxWidth = "100%";
      canvas.style.border = "1px solid #bbb";
      canvas.style.borderRadius = "18px";
      qrContainer.empty().appendChild(canvas);
    }
  );

  return container;
};
