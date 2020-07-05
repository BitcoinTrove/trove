import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { mount, unmount } from "redom";
import { Screen } from "../../platform/components/screen";
import { AccessBitcoin } from "../wizards/access_bitcoin/access_bitcoin_wizard";
import { TroveImages } from "../images/trove_images";
import {
  ALL_SAFETY_CHECKS_SUCCEEDED,
  SAFETY_CHECKS,
  SafetyCheck,
  BROWSER_IS_SUPPORTED,
} from "../util/safety_checks";
import {
  IS_DEBUG,
  serializeEnvelope,
  isTestnetShare,
  DEBUG_DISPLAY,
  IS_DEV,
} from "../trove_constants";
import { AboutPage } from "./about_page";
import { showJsxInModal } from "../../platform/util/modals";
import {
  hideElements,
  showElements,
} from "../../platform/util/extended_html_element";
import { SecretShareEnvelope } from "../types/secret_share_envelope";
import { htmlRef } from "../../platform/util/html_ref";
import { copyTextToClipboard } from "../../platform/util/clipboard";
import { VersionInfoPage } from "./version_info_page";
import { EnvelopeDataDebug } from "../components/envelope_data_debug";
import { hasParameter } from "../../platform/util/query_params";

declare var localize: (enText: string) => string;

export class JoinHomeScreen extends Screen {
  loadedWizardScreen?: Screen = null;
  about?: Screen = null;
  versionInfoPage?: VersionInfoPage = null;
  baseEnvelope: SecretShareEnvelope;

  private whatIsThis = htmlRef();
  private environmentMessage = htmlRef();
  private splashImage = htmlRef();
  private buttonTable = htmlRef();
  private safetyChecks = htmlRef();
  private safetyChecksMessage = htmlRef();
  private safetyChecksContinueButton = htmlRef();
  private paragraphContainer = htmlRef();
  private startJoinFlow = htmlRef();
  private aboutButton = htmlRef();
  private debugPeekButton = htmlRef();

  constructor(baseEnvelope: SecretShareEnvelope) {
    super("JoinHome", "");
    this.setContent(
      <div class="screen">
        <section class="section">
          <article ref={this.whatIsThis} class="message">
            <div class="message-body">
              <div class="messageBodyHeading">
                <span>~ {localize("What is this?")} ~</span>
              </div>
              <p>
                This file is 1 of {baseEnvelope.numberOfShares} files. They
                exist to secure a bitcoin private key. Anyone who has{" "}
                {baseEnvelope.numberOfRequiredShares} of these files can use
                them to reveal the private key and access the bitcoin.
              </p>
              <br></br>
              <p>
                {localize(
                  "For each digital share file, there is also a paper share. If you are struggling to use one of the digital shares, you can use its corresponding paper share instead."
                )}
              </p>
              <br></br>
              <p>
                {localize(
                  "After the security checks, you can use the shares to access the bitcoin."
                )}
              </p>
            </div>
          </article>

          <article ref={this.environmentMessage} class="message is-info">
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
            ref={this.safetyChecksMessage}
            class="message safetyChecksMessage"
          >
            <div class="message-body">
              <div class="messageBodyHeading">
                <span>~ {localize("Security Checks")} ~</span>
              </div>
              <ul ref={this.safetyChecks} style="padding: 16px 0;"></ul>
              <div ref={this.paragraphContainer}>
                <p style="display: none;">
                  {localize(
                    "Security checks have failed. You will need to address them before being able to continue."
                  )}
                </p>
                <p style="display: none;">
                  {localize(
                    "Security checks have failed. This is a testnet share, so you can continue."
                  )}
                </p>
                <p style="display: none;">
                  {localize(
                    "Your browser is not supported. Please try a different browser."
                  )}
                </p>
                <p style="display: none;">
                  {localize("All checks succeeded.")}
                </p>
              </div>
              <div class="messageButtons">
                <button
                  ref={this.safetyChecksContinueButton}
                  class="button is-outlined"
                >
                  {localize("Continue")}
                </button>
              </div>
            </div>
          </article>

          <div
            ref={this.splashImage}
            style="text-align: center; display: none;"
          >
            <img src={TroveImages.Logo200x200.src} width="200" height="200" />
            <h1 style="font-size: 28px;">
              {localize("A tool for securing bitcoin.")}
            </h1>
          </div>

          <div class="container">
            <table
              ref={this.buttonTable}
              class="homeTable"
              style="display: none;"
            >
              {IS_DEBUG && IS_DEV && hasParameter("data") ? (
                <tr>
                  <td>
                    <a
                      class="button is-outlined is-info"
                      style="border-style: dashed;"
                      href="http://localhost:1234/"
                    >
                      {localize("Debug: Remove data")}
                    </a>
                  </td>
                </tr>
              ) : null}
              <tr>
                <td>
                  <button
                    ref={this.debugPeekButton}
                    class="button is-outlined is-info"
                    style={{ display: DEBUG_DISPLAY, "border-style": "dashed" }}
                    onClick={(e) => {
                      showJsxInModal(
                        localize("Envelope data"),
                        <EnvelopeDataDebug envelope={this.baseEnvelope} />,
                        true
                      );
                    }}
                  >
                    {localize("Debug: Show envelope data")}
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    ref={this.startJoinFlow}
                    class="button is-outlined is-success"
                  >
                    {localize("Access Bitcoin")}
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button
                    ref={this.aboutButton}
                    class="button is-info is-outlined"
                  >
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
    this.baseEnvelope = baseEnvelope;

    SAFETY_CHECKS.forEach((safetyCheck: SafetyCheck) => {
      const li = document.createElement("li");
      li.textContent = safetyCheck.isSuccess
        ? safetyCheck.successMessage
        : safetyCheck.failureMessage;
      if (!ALL_SAFETY_CHECKS_SUCCEEDED && safetyCheck.isSuccess) {
        li.style.color = "#4a4a4a";
      }
      this.safetyChecks.appendChild(li);
    });

    this.safetyChecksMessage
      .classList()
      .add(ALL_SAFETY_CHECKS_SUCCEEDED ? "is-success" : "is-danger");

    if (ALL_SAFETY_CHECKS_SUCCEEDED) {
      this.paragraphContainer.getChild(3).show();
    } else if (!BROWSER_IS_SUPPORTED) {
      this.paragraphContainer.getChild(2).show();
    } else {
      this.paragraphContainer
        .getChild(isTestnetShare(this.baseEnvelope) ? 1 : 0)
        .show();
    }
    this.safetyChecksContinueButton.setDisabled(
      (!ALL_SAFETY_CHECKS_SUCCEEDED && !isTestnetShare(this.baseEnvelope)) ||
        !BROWSER_IS_SUPPORTED
    );

    this.safetyChecksContinueButton
      .classList()
      .add(ALL_SAFETY_CHECKS_SUCCEEDED ? "is-success" : "is-danger");
    this.safetyChecksContinueButton.events().onclick = (e) => {
      hideElements(
        this.safetyChecksMessage,
        this.whatIsThis,
        this.environmentMessage
      );
      showElements(this.buttonTable, this.splashImage);
    };

    const loadWizardScreen = (newScreen: Screen) => {
      if (this.loadedWizardScreen) {
        unmount(document.body, this.loadedWizardScreen);
      }
      this.loadedWizardScreen = newScreen;
      mount(document.body, this.loadedWizardScreen);
      this.loadedWizardScreen.show();
    };

    this.startJoinFlow.events().onclick = (e) => {
      const shareType = this.baseEnvelope.tags["type"];
      if ("slip39_1" === shareType) {
        loadWizardScreen(new AccessBitcoin(this, this.baseEnvelope));
      }
    };
    this.aboutButton.events().onclick = () => {
      if (this.about) {
        unmount(document.body, this.about);
      }
      this.about = new AboutPage(this);
      mount(document.body, this.about);
      this.about.show();
    };
  }
}
