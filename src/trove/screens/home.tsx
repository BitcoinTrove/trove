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
  DOCUMENT_DATA,
  getDocumentDataFromText,
  SOFTWARE_VERSION,
} from "../trove_constants";
import { showJsxInModal } from "../../platform/util/modals";
import { addressAsCanvasSimple } from "../util/address";
import { sha256 } from "../../platform/util/checksum";
import { baseTemplate } from "../../platform/util/duplication";
import { download, readText } from "../util/files";
import { copyTextToClipboard } from "../../platform/util/clipboard";
import { LicensePage } from "./license_page";
import { DONATE_ADDRESS, isFileSignatureValid } from "../util/donation";
import { Slip39Wizard } from "../wizards/paper_only/slip39_wizard";
import { FILENAME, UNSIGNED_FILENAME } from "../../shared/constants";
import { TodoApp } from "../../platform/examples/component_reference_example";
import { htmlRef } from "../../platform/util/html_ref";

declare var localize: (enText: string) => string;

export class Home extends Screen {
  createSharesWizard?: CreateSharesWizard = null;
  slip39Wizard?: Slip39Wizard = null;
  aboutPage?: AboutPage = null;
  licensePage?: LicensePage = null;

  createSharesButton = htmlRef();
  about = htmlRef();
  verifyButton = htmlRef();
  downloadButton = htmlRef();
  donateButton = htmlRef();
  licenseButton = htmlRef();

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

          {/* Disabled in favour of PGP signing
          DOCUMENT_DATA.signature ? null : (
            <article class="message is-danger">
              <div class="message-body" style="text-align: center;">
                <span>This file is not signed.</span>
              </div>
            </article>
          )*/}
          {/* Disabled in favour of PGP signing
          DOCUMENT_DATA.signature != null && !isFileSignatureValid() ? (
            <article class="message is-danger">
              <div class="message-body" style="text-align: center;">
                <span>This file is signed with an invalid signature.</span>
              </div>
            </article>
          ) : null*/}

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
                    '<a href="https://wikipedia.org/wiki/Tails_(operating_system)" target="_blank">Tails Linux</a> ensures that no state of the environment is left behind when you are done.'
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
              {IS_DEBUG ? (
                <tr>
                  <td>
                    <button
                      class="button is-outlined is-success"
                      style="border-style: dashed;"
                      onClick={(e) => {
                        if (this.slip39Wizard) {
                          unmount(document.body, this.slip39Wizard);
                        }
                        this.slip39Wizard = new Slip39Wizard(this);
                        mount(document.body, this.slip39Wizard);
                        this.slip39Wizard.show();
                      }}
                    >
                      {localize("Slip39 Recovery")}
                    </button>
                  </td>
                </tr>
              ) : null}
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
                          const checksumValue: string = sha256(
                            baseTemplate(DOCUMENT_DATA)
                          );
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
                                      <li>
                                        {SOFTWARE_VERSION} ({checksumValue})
                                      </li>
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
                                    baseTemplate(documentData),
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
                    ref={this.verifyButton}
                    class="button is-info is-outlined"
                  >
                    {localize("Verify this file")}
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    ref={this.downloadButton}
                    class="button is-info is-outlined"
                  >
                    {localize("Copy Trove")}
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    ref={this.donateButton}
                    class="button is-info is-outlined"
                  >
                    {localize("Donate")}
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    ref={this.licenseButton}
                    class="button is-info is-outlined"
                  >
                    {localize("Licenses")}
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

    this.verifyButton.events().onclick = () => {
      const checksum = sha256(baseTemplate(DOCUMENT_DATA));
      const modalContent = (
        <div>
          <p>
            {localize("This file claims to have a sha256 checksum of")}{" "}
            <strong>{checksum}</strong>
          </p>
          <br></br>
          <span
            innerHTML={localize(
              "You need to do <strong>both</strong> of these steps to verify the file:"
            )}
          />
          <ol style="padding-left: 32px;">
            <li
              innerHTML={localize(
                "Use <code>sha256sum trove.html</code> to verify that this is the correct checksum."
              )}
            ></li>
            <li
              innerHTML={localize(
                "Get confirmation, from <strong>a source you trust</strong>, that this is the correct checksum for Trove."
              )}
            ></li>
          </ol>
        </div>
      );
      showJsxInModal(localize("Verify"), modalContent, false);
    };

    this.downloadButton.events().onclick = () => {
      download(
        baseTemplate(DOCUMENT_DATA),
        DOCUMENT_DATA.signature ? FILENAME : UNSIGNED_FILENAME
      );
    };

    this.donateButton.events().onclick = () => {
      addressAsCanvasSimple(DONATE_ADDRESS, (e, canvas) => {
        const copyToClipboard = htmlRef();
        const modal = (
          <div class="donationModal">
            {canvas}
            <div>
              <span>
                <strong>{DONATE_ADDRESS}</strong>
              </span>
            </div>
            <br></br>
            <button
              ref={copyToClipboard}
              class="button is-outlined"
              onClick={(e) => {
                copyTextToClipboard(DONATE_ADDRESS, copyToClipboard);
              }}
            >
              {localize("Copy to clipboard")}
            </button>
          </div>
        );
        showJsxInModal(localize("Donate"), modal, false);
      });
    };

    this.licenseButton.events().onclick = (e) => {
      if (this.licensePage) {
        unmount(document.body, this.licensePage);
      }
      this.licensePage = new LicensePage(this);
      mount(document.body, this.licensePage);
      this.licensePage.show();
    };
  }
}
