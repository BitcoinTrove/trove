import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { WizardStepBody } from "../../../platform/components/wizard";
import { RadioGroup } from "../../../platform/components/radio_group";
import { IS_DEBUG, SHOW_RANDOM_ADDRESS_STRATEGY } from "../../trove_constants";
import { ImageAndText } from "../../../platform/components/image_and_text";
import { showTextInModal } from "../../../platform/util/modals";
import { SettingsState, EntropySource } from "./create_shares_wizard";
import { replaceAll } from "../../../shared/constants";
import {
  ExtendedHtmlElement,
  extendHtmlElement,
  BULMA_STD_CLASSES,
} from "../../../platform/util/extended_html_element";
import { htmlRef, mutableHtmlRef } from "../../../platform/util/html_ref";
import { getCreationDate } from "../../util/date";
import { AddressStrategy } from "../../types/address_strategy";
import { TroveImages } from "../../images/trove_images";
import { randomInt } from "../../util/random";

declare var localize: (enText: string) => string;

const DEFAULT_OWNER_SHARE_MESSAGE: string = `The data in this document/file belongs to {owner}. This document/file is being kept in their custody.
In the event of {owner} passing away, or otherwise being unable to use this data, {requiredShares} of the custodians may use their shares to access the bitcoin.
The list of custodians is not included here, for security reasons.`;

const DEFAULT_SHARE_MESSAGE: string = `The data in this document/file belongs to {owner}.
This document/file is being kept in the custody of {custodian}.
Upon request, {custodian} should hand over this document/file to {owner}.
In the event of {owner} passing away, or otherwise being unable to use this data, {requiredShares} of the custodians may use their shares to access the bitcoin.
The list of custodians is not included here, for security reasons.`;

const DEFAULT_MESSAGE_AFTER_REVEAL: string = `The owner of this bitcoin private key is {owner}, In the event that they have passed away or are otherwise unable to access the bitcoin:
It is their wish for the bitcoin to become part of their estate and handled accordingly.`;

export class Step1_Settings extends WizardStepBody {
  private referenceName = htmlRef();
  private referenceNameHelp = htmlRef();
  private custodians = htmlRef();
  private requiredShares = htmlRef();
  private requiredSharesHelp = htmlRef();
  private messageOnOwnerShare = htmlRef();
  private messageOnEachShare = htmlRef();
  private messageAfterRevealing = htmlRef();
  private creationDate = htmlRef();
  private ownerName = htmlRef();

  private selectedNetworkRadio = mutableHtmlRef();
  private selectedAddressStrategyRadio = mutableHtmlRef();
  private selectedEntropyRadio = mutableHtmlRef();
  private selectedPasswordRadio = mutableHtmlRef();
  private customSlip39Password = htmlRef();
  private slipPasswordError = htmlRef();

  constructor() {
    super(localize("Settings"));
  }

  getBody() {
    const timeWarning = htmlRef();
    const messageOnOwnerSharePreview = htmlRef();
    const messageOnEachSharePreview = htmlRef();
    const addRowButton = htmlRef();
    const afterRevealPreview = htmlRef();

    const element = (
      <div>
        <article ref={timeWarning} class="message is-warning">
          <div class="message-body" style="text-align: center;">
            <div class="messageBodyHeading">
              <span>~ {localize("Note")} ~</span>
            </div>
            <p>
              Completing this wizard will take about an hour. The parts which
              will take the most time are:
            </p>
            <div style="display: flex;">
              <ul style="list-style: decimal; margin: 0px auto 18px auto; text-align: left;">
                <li>
                  Generating entropy through 256 coin flips or 99 dice rolls.
                </li>
                <li>Writing down 33 Slip39 words per share.</li>
              </ul>
            </div>
            <button
              class="button is-outlined"
              onClick={(e) => {
                timeWarning.hide();
              }}
            >
              Okay
            </button>
          </div>
        </article>

        <div class="field">
          <label class="label">
            {localize("Which network would you like to use?")}
          </label>
          <div class="control">
            <RadioGroup
              selectedIndex={0}
              selectedRadioRef={this.selectedNetworkRadio}
              options={[
                {
                  displayText: localize("Testnet"),
                  value: "testnet",
                  details: (
                    <p>
                      {localize(
                        "The testnet is an alternative Bitcoin block chain, to be used for testing. Testnet coins are separate and distinct from actual bitcoins, and do not have any value."
                      )}
                    </p>
                  ),
                },
                {
                  displayText: localize("Bitcoin"),
                  showIf: IS_DEBUG,
                  value: "bitcoin",
                  className: "is-danger",
                  details: (
                    <span>
                      {localize(
                        "This is the bitcoin mainnet. Use with caution as you may lose funds."
                      )}
                    </span>
                  ),
                },
              ]}
            ></RadioGroup>
          </div>
        </div>

        <div class="field">
          <label class="label">
            {localize("Enter a reference name for the storage")}
          </label>
          <div class="control">
            <input
              ref={this.referenceName}
              class="input"
              type="text"
              placeholder={localize("Enter a name to identify this storage")}
              value="alices_bitcoin"
              onInput={(e) => {
                const value = this.referenceName.getValueString();
                let valid = true;
                for (let i = 0; i < value.length; ++i) {
                  const c = value[i];
                  const check1 = "a" <= c && c <= "z";
                  const check2 = "0" <= c && c <= "9";
                  const check3 = "_" <= c && c <= "_";
                  if (!(check1 || check2 || check3)) {
                    valid = false;
                    break;
                  }
                }
                if (!valid) {
                  this.referenceNameHelp.setText(
                    localize(
                      "Reference name can only contain letters a-z, numbers 0-9, and _."
                    )
                  );
                  this.referenceNameHelp.show();
                } else {
                  this.referenceNameHelp.hide();
                }
                this.callChangeHandler();
              }}
            ></input>
          </div>
          <p
            ref={this.referenceNameHelp}
            class="help is-danger"
            style="display: none;"
          ></p>
        </div>

        <div class="field">
          <label class="label">{localize("Creation Date")}</label>
          <div class="control">
            <input
              ref={this.creationDate}
              class="input"
              type="text"
              placeholder={localize("Date that this address was created")}
              value={getCreationDate()}
            ></input>
          </div>
        </div>

        <div class="field">
          <label class="label">
            {localize("Who is the owner of the bitcoin being stored?")}
          </label>
          <div class="control">
            <input
              ref={this.ownerName}
              class="input"
              type="text"
              placeholder={localize("Enter name or suitable alias")}
              value="Alice"
            ></input>
          </div>
        </div>

        <div class="field">
          <label class="label">
            {localize("Who are the trusted custodians of the share files?")}
          </label>
          <div class="control">
            <table class="table is-bordered is-striped">
              <tbody ref={this.custodians}>
                <tr>
                  <th>{localize("Share #")}</th>
                  <th>{localize("Name of custodian")}</th>
                  <th></th>
                </tr>
                <tr>
                  <td colSpan={3} style="text-align: center">
                    <button
                      ref={addRowButton}
                      class="button is-info is-outlined"
                    >
                      {localize("Add custodian")}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="field">
          <label class="label">
            {localize("Number of shares required to access bitcoin")}
          </label>
          <div class="control">
            <input
              ref={this.requiredShares}
              class="input"
              type="number"
              min="1"
              value="2"
              onInput={() => {
                this.callChangeHandler();
              }}
            ></input>
          </div>
          <p
            ref={this.requiredSharesHelp}
            class="help is-danger"
            style="display: none;"
          ></p>
        </div>

        <div class="field">
          <label class="label">{localize("Message on owner share")}</label>
          <div class="control">
            <textarea ref={this.messageOnOwnerShare} class="textarea">
              {DEFAULT_OWNER_SHARE_MESSAGE}
            </textarea>
            <div
              class="tags"
              style="display: inline-block; text-align: center;"
            >
              <span>{localize("Preview:")}</span>
              <span
                ref={messageOnOwnerSharePreview}
                class="tagContainer"
              ></span>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">{localize("Message on non-owner shares")}</label>
          <div class="control">
            <textarea ref={this.messageOnEachShare} class="textarea">
              {DEFAULT_SHARE_MESSAGE}
            </textarea>
            <div
              class="tags"
              style="display: inline-block; text-align: center;"
            >
              <span>{localize("Preview:")}</span>
              <span ref={messageOnEachSharePreview} class="tagContainer"></span>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">{localize("Message after revealing")}</label>
          <div class="control">
            <textarea ref={this.messageAfterRevealing} class="textarea">
              {DEFAULT_MESSAGE_AFTER_REVEAL}
            </textarea>
            <div>
              <span ref={afterRevealPreview} class="link">
                {localize("Preview")}
              </span>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">{localize("Address strategy")}</label>
          <div class="control">
            <RadioGroup
              selectedIndex={0}
              selectedRadioRef={this.selectedAddressStrategyRadio}
              options={[
                {
                  displayText: localize("Single address"),
                  value: "single",
                  details: (
                    <ImageAndText
                      image={TroveImages.QrSingle}
                      body={
                        <div>
                          <p>
                            Creates a <strong>single address</strong> which you
                            can send bitcoin to. The address can be saved as a
                            QR code or as text.
                          </p>
                          <p>
                            Incoming transactions can be linked together. If
                            someone learns your address, they know all of your
                            incoming and outgoing transactions. They also know
                            the current balance in the address. Single address
                            should only be used, if you are the only person
                            sending bitcoin to this address.
                          </p>
                        </div>
                      }
                    />
                  ),
                },
                {
                  displayText: localize("Multiple addresses"),
                  value: "multiplePrinted",
                  details: (
                    <ImageAndText
                      image={TroveImages.QrMultiple}
                      body={
                        <div>
                          <p>
                            Creates <strong>20 single-use addresses</strong>.
                            They must be printed on paper and cut out. When you
                            use an address, by receiving to it, the address must
                            be torn up and thrown away.
                          </p>
                          <p>
                            Using multiple addresses improves your privacy.
                            Bitcoin transactions which send to the same address
                            can be linked using chain analysis software. It is
                            also recommended to use a wallet which allows for
                            "coin selection".
                          </p>
                        </div>
                      }
                    />
                  ),
                },
                {
                  displayText: localize("Address generator"),
                  showIf: SHOW_RANDOM_ADDRESS_STRATEGY,
                  value: "multipleRandom",
                  details: (
                    <span>This is still WIP and might be deprecated</span>
                  ),
                },
              ]}
            ></RadioGroup>
          </div>
        </div>

        <div class="field">
          <label class="label">{localize("Source of entropy")}</label>
          <div class="control">
            <RadioGroup
              selectedIndex={IS_DEBUG ? 2 : 0}
              selectedRadioRef={this.selectedEntropyRadio}
              options={[
                {
                  displayText: localize("Dice rolls"),
                  value: "dice",
                  details: (
                    <ImageAndText
                      image={TroveImages.Dice}
                      body={
                        <div>
                          <p>
                            {localize(
                              "Entropy is generated by rolling a 6 sided die."
                            )}
                          </p>
                          <p
                            innerHTML={localize(
                              "It is important that you actually roll a physical die. Do not manually select numbers at random. If you are not going to roll an actual die, it is better to use the <strong>Browser</strong> option."
                            )}
                          ></p>
                        </div>
                      }
                    />
                  ),
                },
                {
                  displayText: localize("Coin flips"),
                  value: "coin",
                  details: (
                    <ImageAndText
                      image={TroveImages.Coin}
                      body={
                        <div>
                          <p>
                            {localize(
                              "Entropy is generated by flipping a coin."
                            )}
                          </p>
                          <p
                            innerHTML={localize(
                              "It is important that you actually flip a coin. Do not manually select heads and tails. If you are not going to flip a coin, it is better to use the <strong>Browser</strong> option."
                            )}
                          ></p>
                        </div>
                      }
                    />
                  ),
                },
                {
                  displayText: localize("Browser"),
                  value: "browser",
                  details: (
                    <ImageAndText
                      image={TroveImages.Browser}
                      body={
                        <div>
                          <p>
                            {localize(
                              "Entropy is generated using the crypto library in your browser."
                            )}
                          </p>
                          <p>
                            {localize(
                              "This is less secure than rolling a die or flipping a coin, but is a lot faster."
                            )}
                          </p>
                          <p
                            innerHTML={localize(
                              "This option is <strong>not recommended</strong> if you are storing bitcoin. It is provided for users who are skimming through Trove to see what it does."
                            )}
                          ></p>
                        </div>
                      }
                    />
                  ),
                },
              ]}
            ></RadioGroup>
          </div>
        </div>

        <div class="field">
          <label class="label">{localize("Password encryption")}</label>
          <div class="control">
            <RadioGroup
              selectedIndex={0}
              selectedRadioRef={this.selectedPasswordRadio}
              onValueChanged={() => {
                this.callChangeHandler();
              }}
              options={[
                {
                  displayText: localize("Generate password"),
                  value: "generate",
                  details: (
                    <div>
                      <ul>
                        <li>
                          A secure password will be generated for your shares.
                        </li>
                        <li>
                          The password will be written on the papers shares. At
                          least one paper share is needed to access the bitcoin.
                        </li>
                      </ul>
                    </div>
                  ),
                },
                {
                  displayText: localize("No password"),
                  value: "none",
                  details: (
                    <div>
                      <ul>
                        <li>The shares will not be password protected.</li>
                        <li>
                          It will be possible to access the bitcoin using only
                          digital shares.
                        </li>
                      </ul>
                    </div>
                  ),
                },
                {
                  displayText: localize("Custom password"),
                  value: "custom",
                  details: (
                    <div>
                      <ul>
                        <li>
                          The shares will be protected with your custom
                          password.
                        </li>
                        <li>
                          The password will be written on the papers shares. At
                          least one paper share is needed to access the bitcoin.
                        </li>
                      </ul>
                      <br></br>
                      <span>Enter custom password</span>
                      <input
                        ref={this.customSlip39Password}
                        onInput={() => {
                          this.slipPasswordError.showOrHide(
                            !this.customSlip39Password.getValueString()
                          );
                          this.customSlip39Password.switchClass(
                            !!this.customSlip39Password.getValueString(),
                            "is-info",
                            "is-danger"
                          );
                          this.callChangeHandler();
                        }}
                        class="input is-info"
                        type="text"
                        style="width: 200px; margin-left: 20px;"
                        placeholder={localize("Enter password")}
                      ></input>
                      <p
                        ref={this.slipPasswordError}
                        class="help is-danger"
                        style="display: none;"
                        innerHTML={localize(
                          "Password should not be empty. Use <strong>No password</strong> if you do not want a password."
                        )}
                      />
                    </div>
                  ),
                },
              ]}
            ></RadioGroup>
          </div>
        </div>
      </div>
    );

    const updatePreviews = () => {
      messageOnOwnerSharePreview.empty();
      messageOnEachSharePreview.empty();
      this.custodians
        .findAll("input")
        .map((input: ExtendedHtmlElement, index: number) => {
          const target =
            index === 0
              ? messageOnOwnerSharePreview
              : messageOnEachSharePreview;
          target.appendChild(
            <span>
              <span
                class="link"
                onClick={(e) => {
                  const messageOnOwnerShare = this.messageOnOwnerShare.getValueString();
                  const messageOnEachShare = this.messageOnEachShare.getValueString();
                  showTextInModal(
                    localize("Message for share ") + (index + 1),
                    this.populateTemplate(
                      index === 0 ? messageOnOwnerShare : messageOnEachShare,
                      index
                    )
                  );
                }}
              >
                share {index + 1}
              </span>
            </span>
          );
        });
    };

    afterRevealPreview.events().onclick = () => {
      showTextInModal(
        "Reveal message",
        this.populateTemplate(this.messageAfterRevealing.getValueString())
      );
    };

    this.ownerName.events().oninput = (e) => {
      this.custodians
        .findAll("input")[0]
        .setValue(this.ownerName.getValueString());
    };

    const addRow = (custodian: string) => {
      const tr = extendHtmlElement(
        <tr>
          <td>share {this.custodians.getChildCount() - 1}</td>
          <td>
            <input
              class="input"
              type="text"
              placeholder={localize("Name or suitable alias")}
              value={custodian}
              disabled={this.custodians.getChildCount() === 2}
            ></input>
          </td>
          <td>
            {this.custodians.getChildCount() != 2 ? (
              <button class="delete"></button>
            ) : (
              <span></span>
            )}
          </td>
        </tr>
      );
      this.custodians.insertBefore(tr, this.custodians.getLastChild());
      const del = tr.find(".delete");
      if (del) {
        del.events().onclick = () => {
          tr.remove();
          for (let i = 1; i < this.custodians.getChildCount() - 1; ++i) {
            this.custodians
              .getChild(i)
              .getFirstChild()
              .setText(localize("share ") + i);
          }
          updatePreviews();
          this.callChangeHandler();
        };
      }
      updatePreviews();
      this.callChangeHandler();
    };
    addRow("Alice");
    addRow("Bob");
    addRow("Charlie");
    addRowButton.events().onclick = () => {
      addRow("");
    };

    return element;
  }

  dependentStateProperties() {
    return [];
  }

  loadState(wizardState: object) {}

  saveState(wizardState: object) {
    let network = this.selectedNetworkRadio.getValueString();
    const custodianNames = this.custodians
      .findAll("input")
      .map((el) => el.getValueString());
    const messageOnOwnerShareTemplate = this.messageOnOwnerShare.getValueString();
    const messageOnEachShareTemplate = this.messageOnEachShare.getValueString();
    const messageAfterRevealingTemplate = this.messageAfterRevealing.getValueString();

    const addressStrategyValue = this.selectedAddressStrategyRadio.getValueString();
    const addressStrategy = AddressStrategy.fromStrategyName(
      addressStrategyValue
    );
    const settings: SettingsState = {
      network: network,
      referenceName: this.referenceName.getValueString(),
      creationDate: this.creationDate.getValueString(),
      ownerName: this.ownerName.getValueString(),
      custodianNames: custodianNames,
      requiredShares: parseInt(this.requiredShares.getValueString()),
      messageOnEachShare: custodianNames.map((c, i) => {
        const template =
          i === 0 ? messageOnOwnerShareTemplate : messageOnEachShareTemplate;
        return this.populateTemplate(template, i);
      }),
      messageAfterRevealing: this.populateTemplate(
        messageAfterRevealingTemplate
      ),
      addressStrategy: addressStrategy,
      entropySource: this.selectedEntropyRadio.getValueString() as EntropySource,
      slip39Password: this.getSlip39Password(),
    };
    wizardState["settings"] = settings;
  }

  enableNextButton(): boolean {
    // TODO - The way this validation works is horrible
    // Some stuff happens here, and some stuff happens in the inputs
    // Need to come up with a better pattern for validation across a form

    const custodianNames = this.custodians.findAll("input");

    const isValid =
      custodianNames.length >= this.requiredShares.getValueNumber();
    if (!isValid) {
      this.requiredShares.classList().add("is-danger");
      this.requiredSharesHelp.setText(
        localize(
          "The number of required shares must be less than or equal to the number of custodians"
        )
      );
      this.requiredSharesHelp.show();
    } else {
      this.requiredShares.classList().remove("is-danger");
      this.requiredSharesHelp.hide();
    }

    const slip39PasswordValid =
      this.selectedPasswordRadio.getValueString() !== "custom" ||
      !!this.customSlip39Password.getValueString();
    return isValid && !this.referenceNameHelp.isShown() && slip39PasswordValid;
  }

  onGoBack(wizardState: object, yes: () => void, no: () => void): void {
    yes();
  }

  populateTemplate = (template: string, index?: number) => {
    const custodianList = this.custodians
      .findAll("input")
      .map((el) => el.getValueString())
      .join("\n\r");
    const owner = this.ownerName.getValueString();
    const custodian =
      index === undefined
        ? ""
        : this.custodians.findAll("input")[index].getValueString();
    const requiredSharesValue = this.requiredShares.getValueString();
    template = replaceAll(template, "{owner}", owner);
    template = replaceAll(template, "{custodian}", custodian);
    template = replaceAll(template, "{custodians}", custodianList);
    template = replaceAll(template, "{requiredShares}", requiredSharesValue);
    return template;
  };

  getSlip39Password = () => {
    const value = this.selectedPasswordRadio.getValueString();
    if (value === "none") {
      return null;
    } else if (value === "generate") {
      const passwordChars = "acdefhijkmnpqrtuvwxyzACDEFGHJKLMNPQRTUVWXYZ2347";
      let password = "";
      for (let i = 0; i < 16; ++i) {
        password += passwordChars[randomInt(passwordChars.length)];
      }
      return password;
    } else if (value === "custom") {
      return this.customSlip39Password.getValueString();
    }
    throw "Unknown slip39 password option";
  };
}
