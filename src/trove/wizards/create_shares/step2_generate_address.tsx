import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { mount } from "redom";
import { WizardStepBody } from "../../../platform/components/wizard";
import {
  IS_DEBUG,
  WINDOW_CRYPTO,
  walletNameFromAddress,
} from "../../trove_constants";
import { showJsxInModal } from "../../../platform/util/modals";
import { SettingsState } from "./create_shares_wizard";
import { crypto as bitcoinCrypto } from "bitcoinjs-lib";
import { AddressViewSingle } from "../../components/address_view_single";
import { AddressViewMultiplePrinted } from "../../components/address_view_multiple_printed";
import { AddressViewMultipleRandom } from "../../components/address_view_multiple_random";
import { baseTemplate } from "../../../platform/util/duplication";
import { sha256 } from "../../../platform/util/checksum";
import { PublicAddressMulti } from "../../components/public_address_multi";
import { ViewAdditionalDetails } from "../../components/view_additional_details";
import { ViewAdditionalDetailsMulti } from "../../components/view_additional_details_multi";
import { DeriveAddresses } from "../../components/derive_addresses";
import { AccessBitcoinFastForward } from "../access_bitcoin/access_bitcoin_wizard";
import { Home } from "../../screens/home";
import { showOrHideElements } from "../../../platform/util/extended_html_element";
import { htmlRef } from "../../../platform/util/html_ref";
import { TroveImages } from "../../images/trove_images";
import { networkFromString } from "../../util/network";
import { AddressStrategy } from "../../types/address_strategy";
import { MasterSeed } from "../../types/master_seed";
import { SecretShareEnvelope } from "../../types/secret_share_envelope";
import { PlatformImages } from "../../../platform/images/platform_images";
import { SecretSplitter } from "../../util/secret_splitter";
import { randomInt } from "../../util/random";

declare var localize: (enText: string) => string;

export class Step2_GenerateAddress extends WizardStepBody {
  private masterSeed: MasterSeed = undefined;
  private envelopes: SecretShareEnvelope[];
  private registeredEvent = undefined;

  private globalSuccessMessage = htmlRef();
  private diceOptionSelected = htmlRef();
  private coinOptionSelected = htmlRef();
  private debugViewAddresses = htmlRef();
  private debugAdditionalDetails = htmlRef();
  private debugDeriveAddresses = htmlRef();
  private debugSkipToActions = htmlRef();
  private entropyStringSpan = htmlRef();
  private showAddress = htmlRef();
  private addressViewContainer = htmlRef();
  private debugButtons = htmlRef();
  private diceImages = htmlRef();
  private coinImages = htmlRef();

  constructor() {
    super(localize("Generate address"));
  }

  getBody() {
    return (
      <div style="text-align: center;">
        <div style="border: 1px dashed #209cee;border-radius: 5px;padding: 8px; color: #209cee;">
          <span>{localize("Entropy string:")} </span>
          <span
            ref={this.entropyStringSpan}
            style="line-break: anywhere;"
          ></span>
        </div>

        <div ref={this.diceOptionSelected}>
          <div style="text-align: center; font-size: 24px; padding: 24px 0;">
            <progress
              class="progress is-info"
              value="0"
              max="99"
              style="width: 60%; margin: auto;"
            ></progress>
            <span>
              <span class="remainingCount">99</span>{" "}
              {localize("rolls required")}
            </span>
          </div>
          <table ref={this.diceImages} style="max-width: 300px; margin: auto;">
            <tr>
              <td>
                <img
                  class="diceImage blueHoverEffect"
                  src={TroveImages.Dice1.src}
                ></img>
              </td>
              <td>
                <img
                  class="diceImage blueHoverEffect"
                  src={TroveImages.Dice2.src}
                ></img>
              </td>
              <td>
                <img
                  class="diceImage blueHoverEffect"
                  src={TroveImages.Dice3.src}
                ></img>
              </td>
            </tr>
            <tr>
              <td>
                <img
                  class="diceImage blueHoverEffect"
                  src={TroveImages.Dice4.src}
                ></img>
              </td>
              <td>
                <img
                  class="diceImage blueHoverEffect"
                  src={TroveImages.Dice5.src}
                ></img>
              </td>
              <td>
                <img
                  class="diceImage blueHoverEffect"
                  src={TroveImages.Dice6.src}
                ></img>
              </td>
            </tr>
          </table>

          <article class="message is-info">
            <div class="message-body">
              <p>
                You can click the number rolled or press the number on the
                keyboard.
              </p>
            </div>
          </article>

          <button
            class="button is-info is-outlined debugSkip"
            style="border-style: dashed;"
          >
            {localize("Use pseudo-randomness")}
          </button>
          <button
            class="button is-info is-outlined debugHardcoded"
            style="border-style: dashed;"
          >
            {localize("Use hardcoded sequence")}
          </button>
        </div>

        <div ref={this.coinOptionSelected}>
          <div style="text-align: center; font-size: 24px; padding: 24px 0">
            <progress
              class="progress is-info"
              value="0"
              max="256"
              style="width: 60%; margin: auto;"
            ></progress>
            <span>
              <span class="remainingCount">256</span>{" "}
              {localize("flips required")}
            </span>
          </div>
          <table ref={this.coinImages} style="max-width: 300px; margin: auto;">
            <tr>
              <td>
                <img
                  class="coinImage blueHoverEffect"
                  src={TroveImages.CoinH.src}
                ></img>
              </td>
              <td>
                <img
                  class="coinImage blueHoverEffect"
                  src={TroveImages.CoinT.src}
                ></img>
              </td>
            </tr>
          </table>

          <article class="message is-info">
            <div class="message-body">
              <p>
                You can use the mouse or keyboard to select heads and tails.
              </p>
              <div style="display: flex;">
                <div style="text-align: left; margin: auto;">
                  <ul style="list-style: disc;">
                    <li>
                      <strong>left-arrow</strong> or the "<strong>h</strong>"
                      key will select <strong>heads</strong>.
                    </li>
                    <li>
                      <strong>right-arrow</strong> or the "<strong>t</strong>"
                      key will select <strong>tails</strong>.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </article>

          <button
            class="button is-info is-outlined debugSkip"
            style="border-style: dashed;"
          >
            {localize("Use pseudo-randomness")}
          </button>
        </div>

        <article
          ref={this.globalSuccessMessage}
          class="globalSuccessMessage message is-success"
          style="display: none; margin: 0 20%;"
        >
          <div class="message-body">
            <img
              class="tick"
              style="background-color: #23d160; width: 45px; float: left; margin-right: 16px;"
              src={PlatformImages.Check500x500.src}
            ></img>
            <p>{localize("Your address has been generated.")}</p>
            <div style="text-align: center; padding-top: 16px;">
              <button
                ref={this.showAddress}
                class="button is-success is-outlined"
              >
                {localize("Show address")}
              </button>
            </div>
          </div>
        </article>

        <div ref={this.addressViewContainer}></div>
        <div ref={this.debugButtons}>
          <button
            ref={this.debugViewAddresses}
            class="button is-info is-outlined"
            style="border-style: dashed;"
          ></button>
          <button
            ref={this.debugAdditionalDetails}
            class="button is-info is-outlined"
            style="border-style: dashed;"
          >
            {localize("View additional details")}
          </button>
          <button
            ref={this.debugDeriveAddresses}
            class="button is-info is-outlined"
            style="border-style: dashed;"
          >
            {localize("Derive addresses")}
          </button>
          <button
            ref={this.debugSkipToActions}
            class="button is-info is-outlined"
            style="border-style: dashed;"
          >
            {localize("Show actions as if joined")}
          </button>
        </div>
      </div>
    );
  }

  dependentStateProperties() {
    return ["settings"];
  }

  loadState(wizardState: object) {
    const settings: SettingsState = wizardState["settings"];
    const entropyType = settings.entropySource;
    const network = networkFromString(settings.network);

    this.debugViewAddresses.setText(
      settings.addressStrategy.isSingle()
        ? localize("View address")
        : localize("View addresses")
    );

    this.addressViewContainer.empty();
    this.debugButtons.hide();
    const views = {
      single: () => {
        return (
          <AddressViewSingle
            masterSeed={this.masterSeed}
            referenceName={this.envelopes[0].referenceName}
          ></AddressViewSingle>
        );
      },
      multiplePrinted: () => {
        return (
          <AddressViewMultiplePrinted
            masterSeed={this.masterSeed}
            referenceName={this.envelopes[0].referenceName}
            indexStart={0}
            indexEnd={settings.addressStrategy.getAddressCount()}
          ></AddressViewMultiplePrinted>
        );
      },
      multipleRandom: () => {
        return (
          <AddressViewMultipleRandom
            masterSeed={this.masterSeed}
            referenceName={this.envelopes[0].referenceName}
            maxIndex={settings.addressStrategy.getAddressCount()}
          ></AddressViewMultipleRandom>
        );
      },
    };

    this.showAddress.events().onclick = (e) => {
      this.globalSuccessMessage.hide();
      this.addressViewContainer
        .empty()
        .appendChild(views[settings.addressStrategy.getStrategyName()]());
      this.debugButtons.show();
      this.callChangeHandler();
    };

    this.diceOptionSelected.showOrHide(entropyType === "dice");
    this.coinOptionSelected.showOrHide(entropyType === "coin");

    this.entropyStringSpan.setText("");

    showOrHideElements(
      IS_DEBUG,
      this.entropyStringSpan.parent(),
      this.debugViewAddresses,
      this.debugAdditionalDetails,
      this.debugDeriveAddresses,
      this.debugSkipToActions
    );

    const onEntropyDone = async () => {
      const secrets: SecretSplitter = new SecretSplitter()
        .withTags({ type: "slip39_1" })
        .formatName("{referenceName}_{index}.html");

      const codeVersion = sha256(baseTemplate());
      this.envelopes = secrets.splitIntoEnvelopesSlip39(
        this.masterSeed,
        settings,
        codeVersion
      );

      this.addressViewContainer
        .empty()
        .appendChild(views[settings.addressStrategy.getStrategyName()]());
      this.debugButtons.show();
    };

    const checkIfDone = () => {
      if (entropyType === "dice") {
        this.diceOptionSelected
          .find("progress")
          .setAttribute("value", this.entropyStringSpan.getText().length + "");
        this.diceOptionSelected
          .find(".remainingCount")
          .setText("" + (99 - this.entropyStringSpan.getText().length));
      }
      if (entropyType === "coin") {
        this.coinOptionSelected
          .find("progress")
          .setAttribute("value", this.entropyStringSpan.getText().length + "");
        this.coinOptionSelected
          .find(".remainingCount")
          .setText("" + (256 - this.entropyStringSpan.getText().length));
      }
      let done = false;
      if (
        (entropyType === "dice" &&
          this.entropyStringSpan.getText().length === 99) ||
        (entropyType === "coin" &&
          this.entropyStringSpan.getText().length === 256)
      ) {
        this.masterSeed = MasterSeed.fromByteArray(
          bitcoinCrypto.hash256(
            Buffer.from(this.entropyStringSpan.getText(), "utf8")
          ),
          network
        );
        this.diceOptionSelected.hide();
        this.coinOptionSelected.hide();
        this.callChangeHandler();
        done = true;
      }
      if (entropyType === "browser") {
        var array = new Uint8Array(32);
        WINDOW_CRYPTO.getRandomValues(array);
        this.masterSeed = MasterSeed.fromByteArray(
          new Buffer(array.buffer),
          network
        );
        this.callChangeHandler();
        done = true;
      }

      if (done) {
        this.globalSuccessMessage.show();
        this.entropyStringSpan.parent().hide();
        onEntropyDone();
        // forcing this click here to speed up the flow.
        this.showAddress.click();
      }

      return done;
    };
    checkIfDone();

    const dice = this.diceImages.findAll(".diceImage");
    dice.forEach((die, index) => {
      die.events().onclick = (e) => {
        if (this.masterSeed || die.style().opacity == "0") {
          return;
        }
        this.entropyStringSpan.setText(
          this.entropyStringSpan.getText() + (index + 1)
        );
        die.style().transition = "";
        die.style().opacity = "0";
        window.setTimeout(() => {
          die.style().transition = "opacity 0.3s";
          die.style().opacity = "1";
        }, 200);

        checkIfDone();
      };
    });
    const diceDebugSkip = this.diceOptionSelected.find(".debugSkip");
    diceDebugSkip.showOrHide(
      wizardState["settings"].network === "testnet" && IS_DEBUG
    );
    diceDebugSkip.events().onclick = (e) => {
      diceDebugSkip.hide();
      const doClicks = () => {
        dice[randomInt(6)].click();
        setTimeout(() => {
          if (this.entropyStringSpan.getText().length < 97) {
            doClicks();
          }
        }, 100);
      };
      doClicks();
    };

    const diceDebugHardcoded = this.diceOptionSelected.find(".debugHardcoded");
    diceDebugHardcoded.showOrHide(
      wizardState["settings"].network === "testnet" && IS_DEBUG
    );
    diceDebugHardcoded.events().onclick = (e) => {
      diceDebugHardcoded.hide();
      let count = 0;
      const doClicks = () => {
        dice[count % 6].click();
        count += 1;
        setTimeout(() => {
          if (this.entropyStringSpan.getText().length < 99) {
            doClicks();
          }
        }, 100);
      };
      doClicks();
    };

    const coins = this.coinImages.findAll(".coinImage");
    coins.forEach((coin, index) => {
      coin.events().onclick = (e) => {
        if (this.masterSeed || coin.style().opacity == "0") {
          return;
        }
        this.entropyStringSpan.setText(
          this.entropyStringSpan.getText() + (index === 0 ? "h" : "t")
        );

        coin.style().transition = "";
        coin.style().opacity = "0";
        window.setTimeout(() => {
          coin.style().transition = "opacity 0.3s";
          coin.style().opacity = "1";
        }, 200);

        checkIfDone();
      };
    });
    const coinDebugSkip = this.coinOptionSelected.find(".debugSkip");
    coinDebugSkip.showOrHide(
      wizardState["settings"].network === "testnet" && IS_DEBUG
    );
    coinDebugSkip.events().onclick = (e) => {
      coinDebugSkip.hide();
      const doClicks = () => {
        coins[randomInt(2)].click();
        setTimeout(() => {
          if (this.entropyStringSpan.getText().length < 254) {
            doClicks();
          }
        }, 100);
      };
      doClicks();
    };

    this.debugViewAddresses.events().onclick = (e) => {
      showJsxInModal(
        settings.addressStrategy.isSingle()
          ? localize("View address")
          : localize("View addresses"),
        <PublicAddressMulti
          masterSeed={this.masterSeed}
          indexStart={0}
          indexEnd={settings.addressStrategy.getAddressCount()}
        />,
        true
      );
    };

    this.debugAdditionalDetails.events().onclick = (e) => {
      showJsxInModal(
        localize("Debug - Additional Details"),
        (settings.addressStrategy.isSingle() && (
          <ViewAdditionalDetails
            masterSeed={this.masterSeed}
            addressStrategy={settings.addressStrategy.getStrategyName()}
            creationDate={settings.creationDate}
          />
        )) || (
          <ViewAdditionalDetailsMulti
            masterSeed={this.masterSeed}
            addressStrategy={settings.addressStrategy.getStrategyName()}
            creationDate={settings.creationDate}
            startIndex={0}
            endIndex={settings.addressStrategy.getAddressCount()}
          />
        ),
        true
      );
    };

    this.debugDeriveAddresses.events().onclick = (e) => {
      showJsxInModal(
        localize("Debug - Derive Addresses"),
        <DeriveAddresses
          masterSeed={this.masterSeed}
          walletName={walletNameFromAddress(wizardState["referenceName"])}
        />,
        true
      );
    };

    this.debugSkipToActions.events().onclick = (e) => {
      wizardState["masterSeed"] = this.masterSeed;
      wizardState["address"] = this.masterSeed.getAddress();
      wizardState["envelopes"] = this.envelopes;
      wizardState["baseEnvelope"] = this.envelopes[0];
      //I hate that I am writing state here
      // This is only a debug option though, and seems to work good enough
      const wizard = new AccessBitcoinFastForward(new Home(), wizardState);
      mount(document.body, wizard);
      wizard.show();
    };

    if (this.registeredEvent) {
      document.body.removeEventListener("keydown", this.registeredEvent);
    }
    // TODO - Make sure this isn't added multiple times
    // It's only added once, but it's never removed.. so this is listening when it shouldn't be.
    // It isn't causing any issues at the moment, as far as I know. Hard to see how it could.
    this.registeredEvent = (e) => {
      if (
        entropyType === "dice" &&
        (e.key === "1" ||
          e.key === "2" ||
          e.key === "3" ||
          e.key === "4" ||
          e.key === "5" ||
          e.key === "6")
      ) {
        dice[parseInt(e.key) - 1].click();
      } else if (entropyType === "coin") {
        if (e.key === "h" || e.key === "ArrowLeft") {
          coins[0].click();
        }
        if (e.key === "t" || e.key === "ArrowRight") {
          coins[1].click();
        }
      }
    };

    document.body.addEventListener("keydown", this.registeredEvent);
  }

  saveState(wizardState: object) {
    wizardState["masterSeed"] = this.masterSeed;
    wizardState["address"] = this.masterSeed
      ? this.masterSeed.getAddress()
      : undefined;
    wizardState["envelopes"] = this.envelopes;
  }

  enableNextButton(): boolean {
    return this.masterSeed && !this.globalSuccessMessage.isShown();
  }

  onGoBack(wizardState: object, yes: () => void, no: () => void): void {
    if (!this.masterSeed) {
      yes();
      return;
    }
    const addressStrategy: AddressStrategy =
      wizardState["settings"].addressStrategy;
    const headingText = addressStrategy.isSingle()
      ? localize("Generated address will be discarded")
      : localize("Generated addresses will be discarded");
    const bodyLine1 = addressStrategy.isSingle()
      ? localize("An address has already been generated") +
        " (" +
        this.masterSeed.getAddress() +
        ")."
      : localize("Addresses have already been generated.");
    const bodyLine2 = addressStrategy.isSingle()
      ? localize(
          "If you go back to the Settings step, this address will be discarded. You will not have access to this address or its private key."
        )
      : localize(
          "If you go back to the Settings step, these addresses will be discarded. You will not have access to them or their private keys."
        );
    const backText = addressStrategy.isSingle()
      ? localize("Delete address and go back")
      : localize("Delete addresses and go back");

    const hide = showJsxInModal(
      headingText,
      <article class="message is-warning">
        <div class="message-body">
          <p>
            {bodyLine1}
            <br></br>
            {bodyLine2}
          </p>
        </div>
      </article>,
      false,
      <div>
        <button
          class="button"
          onClick={(e) => {
            hide();
            no();
          }}
        >
          {localize("Cancel")}
        </button>
        <button
          class="button is-warning"
          onClick={(e) => {
            // I don't think this.masterSeed and this.envelopes need to be set to undefined
            // but just doing it in case.
            this.masterSeed = undefined;
            this.envelopes = undefined;
            delete wizardState["settings"];
            hide();
            yes();
          }}
        >
          {backText}
        </button>
      </div>
    );
  }
}
