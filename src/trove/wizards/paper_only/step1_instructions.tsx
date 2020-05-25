import { WizardStepBody } from "../../../platform/components/wizard";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { htmlRef, mutableHtmlRef } from "../../../platform/util/html_ref";
import { RadioGroup } from "../../../platform/components/radio_group";

declare var localize: (enText: string) => string;

export class Step1_Instructions extends WizardStepBody {
  private network = htmlRef();
  private addressStrategy = htmlRef();
  private slip39PasswordRadio = mutableHtmlRef();
  private slip39Password = htmlRef();

  constructor() {
    super(localize("Instructions"));
  }

  dependentStateProperties() {
    return [];
  }

  getBody() {
    return (
      <div>
        <article class="message is-info">
          <div class="message-body">
            <p
              innerHTML={localize(
                "This wizard is for accessing the private keys if you <strong>only</strong> have the paper shares. If you have access to one of the digital shares, it is recommended that use that to access the keys."
              )}
            ></p>
            <p>
              {localize(
                "You will not be able to see the encrypted reveal message, if one exists. This wizard should only be used as a last resort."
              )}
            </p>
            <p>
              {localize(
                "Do not use Slip39 words created by other tools or wallets. The derivation path could be different and you may lose access to your bitcoin."
              )}
            </p>
            <p>
              {localize(
                "Trove cannot determine if the entered Slip39 password is correct. An incorrect password will produce addresses and keys which are unexpected."
              )}
            </p>
          </div>
        </article>
        <article class="message is-info">
          <div class="message-body">
            <p>
              {localize(
                "Select and enter the values which appear on the printed shares. Selecting incorrect values may result in the loss of bitcoin."
              )}
            </p>
            <table class="slip39ValuesTable">
              <tbody>
                <tr>
                  <th>{localize("Network")}</th>
                  <td>
                    <div class="select">
                      <select
                        ref={this.network}
                        onInput={(e) => {
                          this.callChangeHandler();
                        }}
                      >
                        <option value="">{"<none>"}</option>
                        <option value="testnet">{"testnet"}</option>
                        <option value="bitcoin">{"bitcoin"}</option>
                      </select>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>{localize("Address strategy")}</th>
                  <td>
                    <div class="select">
                      <select
                        ref={this.addressStrategy}
                        onInput={(e) => {
                          this.callChangeHandler();
                        }}
                      >
                        <option value="">{"<none>"}</option>
                        <option value="single">{"single"}</option>
                        <option value="multiplePrinted">
                          {"multiplePrinted"}
                        </option>
                        <option value="multipleRandom">
                          {"multipleRandom"}
                        </option>
                      </select>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>{localize("Password encrypted")}</th>
                  <td>
                    <RadioGroup
                      selectedRadioRef={this.slip39PasswordRadio}
                      onValueChanged={() => {
                        this.callChangeHandler();
                      }}
                      options={[
                        {
                          displayText: "No",
                          value: "noPassword",
                        },
                        {
                          displayText: "Yes",
                          value: "passwordEncrypted",
                          wrapDetailsInContainer: false,
                          details: (
                            <input
                              ref={this.slip39Password}
                              placeholder={localize("Slip39 password")}
                              class="input"
                              style="width: 250px;"
                              type="text"
                              onInput={(e) => {
                                this.callChangeHandler();
                              }}
                            ></input>
                          ),
                        },
                      ]}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    );
  }

  loadState(wizardState: object) {}

  saveState(wizardState: object) {
    wizardState["networkOverride"] = this.network.getValueString();
    wizardState[
      "addressStrategyOverride"
    ] = this.addressStrategy.getValueString();
    wizardState["passwordOverride"] =
      this.slip39PasswordRadio.getValueString() === "passwordEncrypted"
        ? this.slip39Password.getValueString()
        : null;
  }

  enableNextButton(): boolean {
    return (
      !!this.network.getValueString() &&
      !!this.addressStrategy.getValueString() &&
      (this.slip39PasswordRadio.getValueString() !== "passwordEncrypted" ||
        !!this.slip39Password.getValueString())
    );
  }

  onGoBack(wizardState: object, yes: () => void, no: () => void): void {
    yes();
  }
}
