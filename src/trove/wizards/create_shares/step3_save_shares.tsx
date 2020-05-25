import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { WizardStepBody } from "../../../platform/components/wizard";
import { IS_DEBUG, IS_DEV, DEBUG_DISPLAY } from "../../trove_constants";
import { showJsxInModal } from "../../../platform/util/modals";
import {
  DIGITAL_SHARE,
  PAPER_SHARE,
} from "../../components/share_type_details";
import { SettingsState } from "./create_shares_wizard";
import { htmlRef } from "../../../platform/util/html_ref";
import { createHtmlFromEnvelope } from "../../util/envelope";
import { SecretShareEnvelope } from "../../types/secret_share_envelope";

declare var localize: (enText: string) => string;

export class Step3_SaveShares extends WizardStepBody {
  private allDownloaded: boolean;

  private downloadTable = htmlRef();
  private passwordMessage = htmlRef();

  constructor() {
    super(localize("Save shares"));
    this.allDownloaded = false;
  }

  dependentStateProperties() {
    return ["masterSeed"];
  }

  getBody() {
    const table = (
      <div>
        <article class="message is-info">
          <div class="message-body">
            <span>{localize("For each custodian, you need to:")}</span>
            <ul>
              <li
                class="item"
                innerHTML={localize(
                  "Save the <strong>digital share</strong> file."
                )}
              ></li>
              <li
                class="item"
                innerHTML={localize("Create the <strong>paper share</strong>.")}
              ></li>
            </ul>
            <br></br>
            <p>
              {localize(
                "They contain the same data and exist for redundancy. The digital share is easier to use and the paper share is resilient to hardware failure. They must be stored together by each custodian."
              )}
            </p>
            <p ref={this.passwordMessage}>
              {localize(
                "The shares will be encrypted with a password. This password will be written on the paper shares. At least one paper share will be needed to access the bitcoin keys."
              )}
            </p>
          </div>
        </article>

        {IS_DEV ? (
          <article class="message is-danger">
            <div class="message-body">
              <div class="messageBodyHeading">
                <span>~ {localize("Dev Warning")} ~</span>
              </div>
              <p>
                <span
                  innerHTML={localize(
                    "*You are in <strong>development mode</strong>. These digital share files <strong>will not work</strong>."
                  )}
                ></span>
              </p>
            </div>
          </article>
        ) : null}

        <table
          ref={this.downloadTable}
          style="margin: auto;"
          class="table is-bordered is-striped downloadTable"
        >
          <tbody>
            <tr>
              <th>{localize("Share #")}</th>
              <th>{localize("Custodian")}</th>
              <th>{localize("Progress")}</th>
              <th style={{ display: DEBUG_DISPLAY }}>{localize("Debug")}</th>
              <th
                style="text-decoration: underline; cursor: pointer;"
                onClick={(e) => {
                  showJsxInModal(
                    localize("Digital share"),
                    DIGITAL_SHARE,
                    true
                  );
                }}
              >
                {localize("Digital share")}
              </th>
              <th
                style="text-decoration: underline; cursor: pointer;"
                onClick={(e) => {
                  showJsxInModal(localize("Paper share"), PAPER_SHARE, true);
                }}
              >
                {localize("Paper share")}
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    );

    return table;
  }

  loadState(wizardState: object) {
    this.allDownloaded = false;
    const tableBody = this.downloadTable.getFirstChild();
    while (tableBody.getChildCount() > 1) {
      tableBody.removeChild(tableBody.getChild(1));
    }

    const downloaded: Set<string> = new Set();
    const paperBackup: Set<string> = new Set();
    const envelopes: SecretShareEnvelope[] = wizardState["envelopes"];
    envelopes.forEach((shareEnvelope) => {
      downloaded.add(shareEnvelope.shareNames[shareEnvelope.thisSharesIndex]);
      paperBackup.add(shareEnvelope.shareNames[shareEnvelope.thisSharesIndex]);
    });
    const slip39Password = (wizardState["settings"] as SettingsState)
      .slip39Password;
    this.passwordMessage.showOrHide(!!slip39Password);
    const that = this;
    envelopes.forEach((shareEnvelope) => {
      const tableRow = createHtmlFromEnvelope(
        shareEnvelope,
        slip39Password,
        (filename: string) => {
          downloaded.delete(filename);
          if (downloaded.size + paperBackup.size === 0) {
            that.allDownloaded = true;
            that.changeHandler();
          }
        },
        (filename: string) => {
          paperBackup.delete(filename);
          if (downloaded.size + paperBackup.size === 0) {
            that.allDownloaded = true;
            that.changeHandler();
          }
        }
      );
      tableBody.appendChild(tableRow);
    });

    if (IS_DEBUG) {
      tableBody.appendChild(
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td colSpan={2} style="text-align: center;">
            <button
              class="button is-info is-outlined"
              style="border-style: dashed;"
              onClick={(e) => {
                downloaded.clear();
                paperBackup.clear();
                that.allDownloaded = true;
                that.changeHandler();
              }}
            >
              {localize("Enable Next step")}
            </button>
          </td>
        </tr>
      );
    }
  }

  saveState(wizardState: object) {}

  enableNextButton(): boolean {
    return this.allDownloaded;
  }

  onGoBack(wizardState: object, yes: () => void, no: () => void): void {
    yes();
  }
}
