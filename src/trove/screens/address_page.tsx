import { Screen } from "../../platform/components/screen";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { DOCUMENT_DATA, AddressGenerator } from "../trove_constants";
import { fromBase58 } from "bip32";
import { copyTextToClipboard } from "../../platform/util/clipboard";
import { htmlRef } from "../../platform/util/html_ref";
import { networkFromString } from "../util/network";
import { getAddress, xpubIndexAsCanvas } from "../util/address";
import { randomInt } from "../util/random";

declare var localize: (enText: string) => string;

export class AddressPage extends Screen {
  private addressGenerator: AddressGenerator;

  private newAddress = htmlRef();
  private copyToClipboard = htmlRef();
  private addressHtmlContainer = htmlRef();

  constructor(addressGenerator: AddressGenerator) {
    super("AddressGenerator", localize("Address generator"));
    this.setContent(
      <div class="screen">
        <div style="max-width: 700px; margin: 30px auto;">
          <div>
            <span style="font-size: 32px;">
              {localize("Address generator")}
            </span>
          </div>

          <div style="border: 1px solid grey; border-radius: 12px; text-align: center; padding: 20px;">
            <div ref={this.addressHtmlContainer}></div>
            <button ref={this.newAddress} class="button is-outlined">
              {localize("New address")}
            </button>
            <button ref={this.copyToClipboard} class="button is-outlined">
              {localize("Copy to clipboard")}
            </button>
          </div>
        </div>
      </div>
    );
    this.addressGenerator = addressGenerator;
  }

  onmount() {
    const network = networkFromString(DOCUMENT_DATA.addressGenerator.network);
    this.newAddress.events().onclick = (e) => {
      const derivationIndex = randomInt(this.addressGenerator.maxIndex);
      const address = getAddress(
        fromBase58(DOCUMENT_DATA.addressGenerator.xpub, network).derive(
          derivationIndex
        ),
        network
      );

      xpubIndexAsCanvas(
        DOCUMENT_DATA.addressGenerator.xpub,
        derivationIndex,
        address,
        (e, canvas) => {
          this.addressHtmlContainer
            .empty()
            .appendChild(<div name="addressHtml">{canvas}</div>);
        }
      );

      this.copyToClipboard.events().onclick = (e) => {
        copyTextToClipboard(address, this.copyToClipboard);
      };
    };
    this.newAddress.click();
  }
}
