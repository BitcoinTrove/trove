import { mount, unmount } from "redom";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { Screen } from "../../platform/components/screen";
import { TroveImages } from "../images/trove_images";
import { AboutPage } from "./about_page";
import { CreateSharesWizard } from "../wizards/create_shares/create_shares_wizard";
import {
  SAFETY_CHECKS,
  SafetyCheck,
  ALL_SAFETY_CHECKS_SUCCEEDED,
  BROWSER_IS_SUPPORTED,
} from "../util/safety_checks";
import {
  IS_ALPHA_BUILD,
  IS_DEBUG,
  DEV_AND_DEBUG_DISPLAY,
} from "../trove_constants";
import { showJsxInModal } from "../../platform/util/modals";
import { createTroveWithDataInBrowser } from "../../platform/util/duplication";
import { download, readText } from "../util/files";
import { PaperRecoveryWizard } from "../wizards/paper_only/paper_recovery_wizard";
import { TodoApp } from "../../platform/examples/component_reference_example";
import { htmlRef } from "../../platform/util/html_ref";
import { VersionInfoPage } from "./version_info_page";
import { getDocumentDataFromText } from "../types/document_data";
import { TROVE_VERSION_AND_HASH } from "../util/version";

declare var localize: (enText: string) => string;

export class Home extends Screen {
  createSharesWizard?: CreateSharesWizard = null;
  paperRecoveryWizard?: PaperRecoveryWizard = null;
  aboutPage?: AboutPage = null;
  versionInfoPage?: VersionInfoPage = null;

  createSharesButton = htmlRef();
  about = htmlRef();

  constructor() {
    super("Home", "");

    const safetyChecks = htmlRef();
    const environmentMessage = htmlRef();
    const safetyChecksMessage = htmlRef();
    const safetyChecksContinueButton = htmlRef();
    const buttonTable = htmlRef();

    this.setContent(
      <div class="screen">
        {/*<TodoApp></TodoApp>*/}
        <section class="section">
          <div class="container" style="text-align: center;">
            <img src={TroveImages.Logo200x200.src} width="200" height="200" />
            <h1 style="font-size: 28px;">
              {localize("A tool for securing bitcoin.")}
            </h1>
          </div>

          <article ref={environmentMessage} class="message is-info">
            <div class="message-body">
              <div class="messageBodyHeading">
                <span>~ {localize("Environment")} ~</span>
              </div>
              <p
                style="text-align: center;"
                innerHTML={localize(
                  'It is recommended to use Trove on <a href="https://wikipedia.org/wiki/Tails_(operating_system)" target="_blank">Tails Linux</a> in an <a href="https://wikipedia.org/wiki/Air_gap_(networking)" target="_blank">air-gapped</a> environment.'
                )}
              ></p>
              <ul style="list-style: square; margin: 14px 10%;">
                <li
                  innerHTML={localize(
                    'An <a href="https://wikipedia.org/wiki/Air_gap_(networking)" target="_blank">air-gapped</a> environment prevents malicious software from stealing your credentials.'
                  )}
                />
                <li
                  innerHTML={localize(
                    '<a href="https://wikipedia.org/wiki/Tails_(operating_system)" target="_blank">Tails Linux</a> ensures that the environment state is destroyed when you are done.'
                  )}
                />
              </ul>
            </div>
          </article>

          <article
            ref={safetyChecksMessage}
            class="message safetyChecksMessage"
          >
            <div class="message-body">
              <div class="messageBodyHeading">
                <span>~ {localize("Security Checks")} ~</span>
              </div>
              <ul ref={safetyChecks} style="padding: 16px 0;"></ul>
              <p style="display: none;">
                {localize(
                  "Security checks have failed. Only testnet is available in this alpha version, so you can continue."
                )}
              </p>
              <p style="display: none;">
                {localize(
                  "Security checks have failed. You can continue and use the testnet. If you want to use the mainnet, you will need to fix the security issues first."
                )}
              </p>
              <p style="display: none;">
                {localize(
                  "Your browser is not supported. Please try a different browser."
                )}
              </p>
              <p style="display: none;">{localize("All checks succeeded.")}</p>
              <div class="messageButtons">
                <button
                  ref={safetyChecksContinueButton}
                  class="button is-outlined"
                >
                  {localize("Continue")}
                </button>
              </div>
            </div>
          </article>

          <div class="container">
            <table ref={buttonTable} class="homeTable" style="display: none;">
              <tr style={{ display: DEV_AND_DEBUG_DISPLAY }}>
                <td>
                  <button
                    style="border-style: dashed;"
                    class="button is-info is-outlined"
                    onClick={(e) => {
                      window.location.assign(
                        "http://localhost:1234/?masterSeed"
                      );
                    }}
                  >
                    {localize("Actions Screen")}
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    ref={this.createSharesButton}
                    class="button is-success is-outlined createShares"
                  >
                    {localize("Create Shares")}
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    class="button is-outlined is-success"
                    onClick={(e) => {
                      if (this.paperRecoveryWizard) {
                        unmount(document.body, this.paperRecoveryWizard);
                      }
                      this.paperRecoveryWizard = new PaperRecoveryWizard(this);
                      mount(document.body, this.paperRecoveryWizard);
                      this.paperRecoveryWizard.show();
                    }}
                  >
                    {localize("Paper Recovery")}
                  </button>
                </td>
              </tr>
              {IS_DEBUG ? (
                <tr>
                  <td>
                    <button
                      class="button is-outlined is-danger"
                      style="border-style: dashed;"
                      onClick={(e) => {
                        readText(".html", async (text) => {
                          const documentData = getDocumentDataFromText(text);
                          if (!documentData.envelope) {
                            showJsxInModal(
                              localize("Error"),
                              <div>
                                {localize(
                                  "Could not read share data from the selected file."
                                )}
                              </div>,
                              false
                            );
                            return;
                          }

                          const hideDialog = showJsxInModal(
                            "Update share",
                            <article class="message is-danger">
                              <div class="message-body">
                                <span>
                                  This will create a new share file using:
                                </span>
                                <ul style="margin-left: 32px;">
                                  <li style="list-style: decimal;">
                                    The code from this file
                                    <ul style="margin-left: 32px; list-style: circle;">
                                      <li>{TROVE_VERSION_AND_HASH}</li>
                                    </ul>
                                  </li>
                                  <li style="list-style: decimal;">
                                    The share data from the selected share file
                                    <ul style="margin-left: 32px; list-style: circle;">
                                      <li>
                                        {documentData.envelope.codeVersion}
                                      </li>
                                    </ul>
                                  </li>
                                </ul>
                                <div style="text-align: center;">
                                  <span>
                                    <strong>
                                      This is for debugging only and may not
                                      work as expected.
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            </article>,
                            true,
                            <div>
                              <button
                                class="button"
                                onClick={(e) => {
                                  hideDialog();
                                }}
                              >
                                {localize("Cancel")}
                              </button>
                              <button
                                class="button is-danger"
                                onClick={(e) => {
                                  download(
                                    createTroveWithDataInBrowser(documentData),
                                    documentData.envelope.shareNames[
                                      documentData.envelope.thisSharesIndex
                                    ]
                                  );
                                  hideDialog();
                                }}
                              >
                                Download
                              </button>
                            </div>
                          );
                        });
                      }}
                    >
                      {localize("Update share")}
                    </button>
                  </td>
                </tr>
              ) : null}
              <tr>
                <td>
                  <button ref={this.about} class="button is-info is-outlined">
                    {localize("About")}
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    class="button is-info is-outlined"
                    onClick={(e) => {
                      if (this.versionInfoPage) {
                        unmount(document.body, this.versionInfoPage);
                      }
                      this.versionInfoPage = new VersionInfoPage(this);
                      mount(document.body, this.versionInfoPage);
                      this.versionInfoPage.show();
                    }}
                  >
                    {localize("Version Info")}
                  </button>
                </td>
              </tr>
            </table>
          </div>
        </section>
      </div>
    );

    SAFETY_CHECKS.forEach((safetyCheck: SafetyCheck) => {
      const li = (
        <li>
          {safetyCheck.isSuccess
            ? safetyCheck.successMessage
            : safetyCheck.failureMessage}
        </li>
      );
      if (!ALL_SAFETY_CHECKS_SUCCEEDED && safetyCheck.isSuccess) {
        li.style.color = "#4a4a4a";
      }
      safetyChecks.appendChild(li);
    });

    safetyChecksMessage.addClass(
      ALL_SAFETY_CHECKS_SUCCEEDED ? "is-success" : "is-danger"
    );
    const paragraphs = safetyChecksMessage.findAll("p");
    if (ALL_SAFETY_CHECKS_SUCCEEDED) {
      paragraphs[3].show();
    } else if (!BROWSER_IS_SUPPORTED) {
      paragraphs[2].show();
    } else {
      paragraphs[IS_ALPHA_BUILD ? 0 : 1].show();
    }

    safetyChecksContinueButton.setDisabled(!BROWSER_IS_SUPPORTED);

    safetyChecksContinueButton.addClass(
      ALL_SAFETY_CHECKS_SUCCEEDED ? "is-success" : "is-danger"
    );
    safetyChecksContinueButton.events().onclick = (e) => {
      safetyChecksMessage.hide();
      environmentMessage.hide();
      buttonTable.show();
    };

    this.createSharesButton.events().onclick = () => {
      if (this.createSharesWizard) {
        unmount(document.body, this.createSharesWizard);
      }
      this.createSharesWizard = new CreateSharesWizard(this);
      mount(document.body, this.createSharesWizard);
      this.createSharesWizard.show();
    };

    this.about.events().onclick = () => {
      if (this.aboutPage) {
        unmount(document.body, this.aboutPage);
      }
      this.aboutPage = new AboutPage(this);
      mount(document.body, this.aboutPage);
      this.aboutPage.show();
    };
  }
}
