import * as React from "jsx-dom"; // Fake React for JSX->DOM support

import { WizardStepBody } from "../../../platform/components/wizard";
import { showJsxModal, showTextInModal } from "../../../platform/util/modals";
import { RecoverFromSlip39WordsModal } from "../../components/recover_from_slip39_words";
import { ExtendedHtmlElement } from "../../../platform/util/extended_html_element";
import { htmlRef } from "../../../platform/util/html_ref";
import { Slip39Helper } from "../../util/slip39_wrapper";
import { networkFromString } from "../../util/network";
import { MasterSeed } from "../../types/master_seed";

declare var localize: (enText: string) => string;

export class Step2_LoadWords extends WizardStepBody {
  private masterSeedBytes: Uint8Array | undefined = null;

  private table = htmlRef();
  private loadShare = htmlRef();
  private success = htmlRef();

  private passwordOverride = null;

  constructor() {
    super(localize("Load shares"));
  }

  dependentStateProperties() {
    // TODO - I don't know if masterSeed should be here
    // TODO - Why isn't the address strategy here. seems strange. Could we use SecurityConfig? Should the password be added to the SecurityConfig?
    return ["masterSeed", "passwordOverride", "networkOverride"];
  }

  getBody() {
    return (
      <div style="text-align: center;">
        <article class="message is-info">
          <div class="message-body">
            {localize(
              "Load your paper shares below. When enough shares are loaded, the privake keys can be accessed."
            )}
          </div>
        </article>
        <table
          ref={this.table}
          class="table is-bordered is-striped"
          style="display: none; margin: 16px auto;"
        >
          <tbody>
            <tr>
              <th>Share #</th>
              <th>Slip39 Words</th>
              <th>Delete</th>
            </tr>
          </tbody>
        </table>
        <button
          ref={this.loadShare}
          class="button is-info is-outlined"
          onClick={(e) => {
            const wordsInput = htmlRef();
            const modal = (
              <RecoverFromSlip39WordsModal
                wordsInput={wordsInput}
                success={(envelope) => {
                  const tr = (
                    <tr data={envelope.shareData}>
                      <td style="text-align: center;">
                        {this.table.getChildCount()}
                      </td>
                      <td style="text-align: center;">
                        <span
                          class="link"
                          onClick={(e) => {
                            showTextInModal("Slip39 Words", envelope.shareData);
                          }}
                        >
                          View
                        </span>
                      </td>
                      <td style="text-align: center;">
                        <button
                          class="delete"
                          onClick={(e) => {
                            tr.remove();
                            this.envelopesChanged(
                              this.table,
                              this.loadShare,
                              this.success
                            );
                          }}
                        ></button>
                      </td>
                    </tr>
                  );
                  this.table.appendChild(tr);
                  this.envelopesChanged(
                    this.table,
                    this.loadShare,
                    this.success
                  );
                }}
              ></RecoverFromSlip39WordsModal>
            );
            showJsxModal(modal, () => {
              wordsInput.focus();
            });
          }}
        >
          Load a paper share
        </button>

        <article
          ref={this.success}
          class="message is-success"
          style="display: none;"
        >
          <div class="message-body">
            {localize("The shares have been successfully joined.")}
          </div>
        </article>
      </div>
    );
  }

  envelopesChanged(
    table: ExtendedHtmlElement,
    loadShare: ExtendedHtmlElement,
    success: ExtendedHtmlElement
  ) {
    const rows = table.findAll("tr").slice(1);
    rows.forEach((row, i) => {
      row.find("td").setText("" + (i + 1));
    });

    table.showOrHide(rows.length > 0);
    const words = rows.map((tr) => tr.getAttribute("data"));

    this.masterSeedBytes = Slip39Helper.join(words, this.passwordOverride);
    if (this.masterSeedBytes) {
      success.show();
      loadShare.hide();
    } else {
      success.hide();
      loadShare.show();
    }
    this.callChangeHandler();
  }

  loadState(wizardState: object) {
    this.passwordOverride = wizardState["passwordOverride"];

    // Reset UI
    this.table
      .findAll("tr")
      .slice(1)
      .forEach((row) => row.remove());
    this.success.hide();
    this.loadShare.show();
  }

  saveState(wizardState: object) {
    if (!this.masterSeedBytes) {
      return;
    }
    const network = networkFromString(wizardState["networkOverride"]);
    wizardState["masterSeed"] = MasterSeed.fromByteArray(
      this.masterSeedBytes,
      network
    );
  }

  enableNextButton(): boolean {
    return !!this.masterSeedBytes;
  }
  onGoBack(wizardState: object, yes: () => void, no: () => void): void {
    yes();
  }
}
