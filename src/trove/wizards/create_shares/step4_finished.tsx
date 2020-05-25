import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { WizardStepBody } from "../../../platform/components/wizard";
import { htmlRef } from "../../../platform/util/html_ref";
import { SecretShareEnvelope } from "../../types/secret_share_envelope";

declare var localize: (enText: string) => string;

export class Step4_Finished extends WizardStepBody {
  private custodianTable = htmlRef();

  constructor() {
    super(localize("Final steps"));
  }

  getBody() {
    return (
      <div>
        <article class="message is-success">
          <div class="message-body">
            <div class="messageBodyHeading">
              <span>~ {localize("Final steps")} ~</span>
            </div>
            <p>
              {localize(
                "You are nearly finished. There are some final things to do:"
              )}
              <ul>
                <li
                  class="item"
                  style="list-style: decimal;"
                  innerHTML={localize(
                    "<strong>Verify shares</strong> - Please verify that the shares can be used, in the way you expect, to reveal the bitcoin keys."
                  )}
                ></li>
                <li
                  class="item"
                  style="list-style: decimal;"
                  innerHTML={localize(
                    "<strong>Distribute the shares</strong> - Give the shares to the custodians for safe keeping. Explain the expectations you have of them."
                  )}
                ></li>
                <li
                  class="item"
                  style="list-style: decimal;"
                  innerHTML={localize(
                    "<strong>Store bitcoin</strong> - The generated address does not contain any bitcoin yet. Any bitcoin that is sent to the address is only accessible by using the shares to reveal the private key."
                  )}
                ></li>
              </ul>
            </p>
            <p>
              {localize(
                "Do not store the digital shares together on any system or service. If the system or service is compromized your credentials could be stolen."
              )}
            </p>
            <p style="text-align: center;">
              <span>{localize("You have finished.")}</span>
            </p>
            <br></br>
            <table
              ref={this.custodianTable}
              style="margin: auto;"
              class="table is-bordered is-striped"
            >
              <tbody>
                <tr>
                  <th>{localize("Custodian")}</th>
                  <th>{localize("Share ID")}</th>
                  <th>{localize("Filename")}</th>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    );
  }

  dependentStateProperties() {
    return ["envelopes"];
  }

  loadState(wizardState: object) {
    this.custodianTable.removeChildrenAfterIndex(1);
    const envelopes = wizardState["envelopes"] as SecretShareEnvelope[];
    envelopes.forEach((e, i) => {
      this.custodianTable.appendChild(
        <tr>
          <td>{e.custodian}</td>
          <td>{e.shareId}</td>
          <td>{e.shareNames[e.thisSharesIndex]}</td>
        </tr>
      );
    });
  }

  saveState(wizardState: object) {}

  enableNextButton(): boolean {
    return true;
  }

  onGoBack(wizardState: object, yes: () => void, no: () => void): void {
    yes();
  }
}
