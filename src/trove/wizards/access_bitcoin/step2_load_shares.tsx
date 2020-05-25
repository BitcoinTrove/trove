import { WizardStepBody } from "../../../platform/components/wizard";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import {
  getDocumentDataFromText,
  isRelatedEnvelope,
} from "../../trove_constants";
import { RecoverFromSlip39WordsModal } from "../../components/recover_from_slip39_words";
import { showJsxModal } from "../../../platform/util/modals";
import { sha256 } from "../../../platform/util/checksum";
import { htmlRef } from "../../../platform/util/html_ref";
import { networkFromString } from "../../util/network";
import { readText } from "../../util/files";
import { SecretShareEnvelope } from "../../types/secret_share_envelope";
import { MasterSeed } from "../../types/master_seed";
import { SecretSplitter } from "../../util/secret_splitter";

declare var localize: (enText: string) => string;

const GREEN = "#23d160";
const ALMOST_GREEN = "#76c291";

export class Step2_LoadShares extends WizardStepBody {
  private masterSeed: MasterSeed;

  private notification = htmlRef();
  private verifyTable = htmlRef();
  private showListOfShares = htmlRef();
  private hideListOfShares = htmlRef();
  private loadDigitalShareButton = htmlRef();
  private loadPaperShareButton = htmlRef();
  private remainingMessage = htmlRef();
  private successMessage = htmlRef();
  private progress = htmlRef();
  private errorMessage = htmlRef();
  private loadSharesContainer = htmlRef();
  private slip39PasswordContainer = htmlRef();
  private slip39Password = htmlRef();
  private slip39PasswordHelp = htmlRef();

  constructor() {
    super(localize("Load shares"));
  }

  dependentStateProperties() {
    return ["masterSeed"];
  }

  getBody() {
    const body = (
      <div style="text-align: center;">
        <article ref={this.slip39PasswordContainer} class="message is-warning">
          <div class="message-body">
            <div class="messageBodyHeading">
              <span>~ {localize("The shares are password protected")} ~</span>
            </div>
            <div>
              <p>
                Enter the Slip39 password which appears on the paper shares.
              </p>
              <input
                ref={this.slip39Password}
                class="input is-warning is-medium"
                style="width: 250px;"
                type="text"
              ></input>
              <p ref={this.slip39PasswordHelp} class="help"></p>
            </div>
          </div>
        </article>

        <div ref={this.loadSharesContainer}>
          <span
            ref={this.showListOfShares}
            class="link"
            onClick={(e) => {
              this.verifyTable.show();
              this.showListOfShares.hide();
              this.hideListOfShares.show();
            }}
          >
            {localize("Show list of shares")}
          </span>
          <span
            ref={this.hideListOfShares}
            style="display: none;"
            class="link"
            onClick={(e) => {
              this.verifyTable.hide();
              this.hideListOfShares.hide();
              this.showListOfShares.show();
            }}
          >
            {localize("Hide list of shares")}
          </span>
          <table
            ref={this.verifyTable}
            style="margin: auto; display: none;"
            class="table is-bordered is-striped verifyTable"
          >
            <tbody>
              <tr>
                <th>{localize("Share #")}</th>
                <th>{localize("Share ID")}</th>
                <th>{localize("Filename")}</th>
                <th>{localize("Status")}</th>
              </tr>
            </tbody>
          </table>
          <progress
            ref={this.progress}
            class="progress is-success"
            style="width: 80%; margin: 16px auto"
            value="0"
            max="0"
          ></progress>
          <div ref={this.remainingMessage}>
            <span
              innerHTML={localize(
                'Load <strong class="remainingFilesCount"></strong> more share file(s) to reveal the secret.'
              )}
            ></span>
          </div>
          <div style="text-align: center">
            <button
              ref={this.loadDigitalShareButton}
              class="button is-info is-outlined"
              style="margin: 10px;"
            >
              {localize("Load a digital share")}
            </button>
            <button
              ref={this.loadPaperShareButton}
              class="button is-info is-outlined"
              style="margin: 10px;"
            >
              {localize("Load a paper share")}
            </button>
          </div>

          <div
            ref={this.notification}
            class="notification is-danger"
            style="display: none;"
          >
            <button
              class="delete"
              onClick={(e) => {
                this.notification.hide();
              }}
            ></button>
            <p ref={this.errorMessage}></p>
          </div>
        </div>
        <article
          ref={this.successMessage}
          class="message is-success"
          style="display: none;"
        >
          <div class="message-body">
            <p>
              {localize(
                "The shares have been successfully loaded. Continue to reveal the keys."
              )}
            </p>
          </div>
        </article>
      </div>
    );
    return body;
  }

  loadState(wizardState: object) {
    const table = this.verifyTable.getFirstChild();
    table.removeChildrenAfterIndex(1);

    const baseEnvelope = wizardState["baseEnvelope"] as SecretShareEnvelope;
    const network = networkFromString(baseEnvelope.network);

    if (baseEnvelope.slip39PasswordHash) {
      this.loadSharesContainer.hide();
    } else {
      this.slip39PasswordContainer.hide();
    }
    this.slip39Password.events().oninput = (e) => {
      const isValid =
        sha256(
          this.slip39Password.getValueString() + "_" + baseEnvelope.shareId
        ) === baseEnvelope.slip39PasswordHash;
      if (isValid) {
        this.slip39PasswordContainer.bulma().success();
        this.slip39Password.bulma().success().setReadOnly(true);
        this.slip39PasswordHelp
          .bulma()
          .success()
          .setText(localize("The password is correct."));
        this.loadSharesContainer.show();
      } else {
        this.slip39Password.bulma().danger();
        this.slip39PasswordHelp
          .bulma()
          .danger()
          .setText(localize("Incorrect password."));
      }
    };

    const envelopes_not_found: Set<string> = new Set<string>();
    baseEnvelope.shareIds.forEach((id) => {
      envelopes_not_found.add(id);
    });
    const envelopes_found: Set<string> = new Set<string>();
    envelopes_found.add(baseEnvelope.shareId);
    envelopes_not_found.delete(baseEnvelope.shareId);
    const envelopes = [baseEnvelope];
    const that = this;

    baseEnvelope.shareNames.forEach((shareName, index) => {
      const shareId: string = baseEnvelope.shareIds[index];
      const shareDataLength: number = baseEnvelope.shareDataLengths[index];
      const isThisFile = baseEnvelope.shareId === shareId;

      table.appendChild(
        <tr
          class={"shareRow" + shareId}
          style={isThisFile ? "background-color: " + GREEN + ";" : ""}
        >
          <td>{1 + index}</td>
          <td>{shareId}</td>
          <td>{shareName}</td>
          <td>{isThisFile ? localize("This file") : ""}</td>
        </tr>
      );
    });

    const remainingFilesCount = this.remainingMessage.find(
      ".remainingFilesCount"
    );
    const updateRemainingCount = () => {
      remainingFilesCount.setText(
        baseEnvelope.numberOfRequiredShares - envelopes.length + ""
      );
      this.progress.setProgress(
        envelopes.length,
        baseEnvelope.numberOfRequiredShares
      );
    };
    updateRemainingCount();

    const checkIfComplete = () => {
      if (envelopes_found.size >= baseEnvelope.numberOfRequiredShares) {
        that.masterSeed = SecretSplitter.joinSlip39ToMasterSeed(
          envelopes,
          network,
          this.slip39Password.getValueString()
        );
        const shareRows = table.findAll("tr");
        shareRows.forEach((shareRow, i) => {
          if (i === 0) {
            return; // Ignore the first row, it is headers
          }
          if (shareRow.style().backgroundColor == "") {
            shareRow.style().backgroundColor = ALMOST_GREEN;
            const statusText = shareRow.findAll("td")[3];
            statusText.setText(localize("Not needed"));
            statusText.show();
          }
        });

        this.remainingMessage.hide();
        this.loadDigitalShareButton.hide();
        this.loadPaperShareButton.hide();
        this.progress.hide();
        this.successMessage.show();
      }

      that.changeHandler();
      updateRemainingCount();
    };
    checkIfComplete();

    const shareLoaded = (envelope: SecretShareEnvelope) => {
      if (!envelopes_found.has(envelope.shareId)) {
        envelopes.push(envelope);
        envelopes_found.add(envelope.shareId);
        envelopes_not_found.delete(envelope.shareId);
        const shareRow = table.find(".shareRow" + envelope.shareId);

        // timeout is so that the user sees the row turn green
        setTimeout((e) => {
          shareRow.findAll("td")[3].setText("Loaded");
          shareRow.style().backgroundColor = GREEN;

          // Check if complete overall
          checkIfComplete();
        }, 200);
      }
    };

    this.loadDigitalShareButton.events().onclick = () => {
      this.errorMessage.parent().hide();
      readText(".html", (text) => {
        const envelope = getDocumentDataFromText(text).envelope;
        if (!envelope) {
          this.errorMessage.setText(localize("Invalid share file."));
          this.errorMessage.parent().show();
          return;
        }

        if (
          envelopes_not_found.has(envelope.shareId) &&
          isRelatedEnvelope(envelope, baseEnvelope)
        ) {
          shareLoaded(envelope);
          this.loadDigitalShareButton.setText(
            localize("Load another digital share")
          );
        } else {
          if (envelopes_found.has(envelope.shareId)) {
            this.errorMessage.setText(
              localize("This share is already loaded.")
            );
          } else {
            this.errorMessage.setText(
              localize(
                "This selected share file is not related to this address."
              )
            );
          }
          this.errorMessage.parent().show();
        }
      });
    };

    // TODO - Need to check that the lengths are always the same.
    // If that is safe to assume, only have one length on the envelope.
    const shareDataLength = baseEnvelope.shareDataLengths[0];
    this.loadPaperShareButton.events().onclick = () => {
      this.errorMessage.parent().hide();
      const shareId = htmlRef();
      const modal = (
        <RecoverFromSlip39WordsModal
          envelopes_not_found={envelopes_not_found}
          envelopes_found={envelopes_found}
          baseEnvelope={baseEnvelope}
          shareDataLength={shareDataLength}
          success={(envelope) => {
            this.loadPaperShareButton.setText(
              localize("Load another paper share")
            );
            shareLoaded(envelope);
          }}
          shareId={shareId}
        ></RecoverFromSlip39WordsModal>
      );
      showJsxModal(modal, () => {
        shareId.focus();
      });
    };
  }

  saveState(wizardState: object) {
    wizardState["masterSeed"] = this.masterSeed;
  }

  enableNextButton(): boolean {
    return !!this.masterSeed;
  }
  onGoBack(wizardState: object, yes: () => void, no: () => void): void {
    yes();
  }
}
