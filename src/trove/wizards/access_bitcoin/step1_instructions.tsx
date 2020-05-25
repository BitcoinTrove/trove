import { WizardStepBody } from "../../../platform/components/wizard";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { htmlRef } from "../../../platform/util/html_ref";
import { SecretShareEnvelope } from "../../types/secret_share_envelope";

declare var localize: (enText: string) => string;

export class Step1_Instructions extends WizardStepBody {
  private shareInstructionMessage = htmlRef();

  constructor() {
    super(localize("Instructions"));
  }

  dependentStateProperties() {
    return [];
  }

  getBody() {
    const element = (
      <div>
        <article class="message is-info">
          <div class="message-body">
            <div class="messageBodyHeading">
              <span>~ {localize("Please note")} ~</span>
            </div>
            <p>
              {localize(
                "Trove reveals the bitcoin keys, but it does not know if the address contains any bitcoin. It is possible that no bitcoin was sent to the address, or the bitcoin has already moved to a new address."
              )}
            </p>
          </div>
        </article>

        <article class="message">
          <div class="message-body">
            <div class="messageBodyHeading">
              <span>~ {localize("Instructions")} ~</span>
            </div>
            <div>
              <pre
                ref={this.shareInstructionMessage}
                style="white-space: pre-wrap; padding: 10px;"
              ></pre>
            </div>
          </div>
        </article>
      </div>
    );

    return element;
  }

  loadState(wizardState: object) {
    const baseEnvelope = wizardState["baseEnvelope"] as SecretShareEnvelope;
    this.shareInstructionMessage.setText(
      baseEnvelope ? baseEnvelope.message : "<Not available>"
    );
  }

  saveState(wizardState: object) {}

  enableNextButton(): boolean {
    return true;
  }
  onGoBack(wizardState: object, yes: () => void, no: () => void): void {
    yes();
  }
}
