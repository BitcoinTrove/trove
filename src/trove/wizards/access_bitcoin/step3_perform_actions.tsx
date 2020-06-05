import { WizardStepBody } from "../../../platform/components/wizard";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { PrivateKeyWif } from "../../components/private_key_wif";
import { PrivateKeyWifMulti } from "../../components/private_key_wif_multi";
import { showElements } from "../../../platform/util/extended_html_element";
import { htmlRef } from "../../../platform/util/html_ref";
import { textAsCanvasSimple } from "../../util/address";
import { aesDecrypt } from "../../util/aes";
import { SecretShareEnvelope } from "../../types/secret_share_envelope";
import { MasterSeed } from "../../types/master_seed";
import {
  RevealMessageRef,
  RevealMessage,
} from "../../components/reveal_message";
import {
  SecurityConfigControlsRef,
  SecurityConfigControls,
} from "../../components/security_config_controls";
import { PublicQrContainer } from "../../components/public_qr_container";
import { SignMessage } from "../../components/sign_message";
import { SignTransaction } from "../../components/sign_transaction";
import { Other } from "../../components/other";
import { SecurityConfig } from "../../types/security_config";
import { compRef } from "../../../platform/util/component_references";
import { valueRef } from "../../../platform/util/value_provider";

declare var localize: (enText: string) => string;

export class Step3_PerformActions extends WizardStepBody {
  private showSecurityConfigControls: boolean;
  private revealed: boolean = false;
  private baseEnvelope: SecretShareEnvelope | undefined = undefined;
  private masterSeed: MasterSeed | undefined = undefined;

  private securityConfigProvider = valueRef<SecurityConfig>();

  private postRevealContainer = htmlRef();

  private revealMessageRef = compRef<RevealMessageRef>();
  private debugControlsRef = compRef<SecurityConfigControlsRef>();
  private securityConfigDependencies = htmlRef();

  private sweepXpriv = htmlRef();
  private sweepXprivContent = htmlRef();
  private sweepKeysContent = htmlRef();

  constructor(showSecurityConfigControls: boolean) {
    super(localize("Perform actions"));
    this.showSecurityConfigControls = showSecurityConfigControls;
  }

  dependentStateProperties() {
    return ["masterSeed", "addressStrategyOverride"];
  }

  getBody() {
    const tabs = htmlRef();
    const tabContentContainer = htmlRef();
    const element = (
      <div>
        <RevealMessage
          revealMessage={this.revealMessageRef}
          onFinished={() => {
            showElements(this.postRevealContainer);
            this.revealed = true;
            this.changeHandler();
          }}
        />
        <div ref={this.postRevealContainer}>
          <SecurityConfigControls
            securityConfigControls={this.debugControlsRef}
            securityConfig={this.securityConfigProvider}
            visible={this.showSecurityConfigControls}
          />
          <div ref={this.securityConfigDependencies}>
            <PublicQrContainer
              securityConfig={this.securityConfigProvider}
            ></PublicQrContainer>
            <div class="field">
              <div class="control">
                <div class="tabs is-boxed">
                  <ul ref={tabs}>
                    <li class="is-active" data="signMessage">
                      <a>
                        <span>{localize("Sign a message")}</span>
                      </a>
                    </li>
                    <li data="signTransaction">
                      <a>
                        <span>{localize("Sign a transaction")}</span>
                      </a>
                    </li>
                    <li ref={this.sweepXpriv} data="sweepXpriv">
                      <a>
                        <span>{localize("Sweep Xpriv")}</span>
                      </a>
                    </li>
                    <li data="sweepKeys">
                      <a>
                        <span>{localize("Sweep keys")}</span>
                      </a>
                    </li>
                    <li data="moreTools">
                      <a>
                        <span>{localize("Other")}</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div ref={tabContentContainer}>
              <div class="tabContent signMessage" style="min-height: 300px;">
                <SignMessage
                  securityConfig={this.securityConfigProvider}
                ></SignMessage>
              </div>
              <div
                class="tabContent signTransaction"
                style="display: none; min-height: 300px;"
              >
                <SignTransaction
                  securityConfig={this.securityConfigProvider}
                ></SignTransaction>
              </div>
              <div
                ref={this.sweepXprivContent}
                class="tabContent sweepXpriv"
                style="display: none; min-height: 300px;"
              ></div>
              <div
                ref={this.sweepKeysContent}
                class="tabContent sweepKeys"
                style="display: none; min-height: 300px;"
              ></div>
              <div
                class="tabContent moreTools"
                style="display: none; min-height: 300px;"
              >
                <Other securityConfig={this.securityConfigProvider}></Other>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    tabs.events().onclick = (e) => {
      const sourceElement = e.srcElement as HTMLElement;
      if (sourceElement.tagName.toLowerCase() === "ul") {
        return;
      }
      const previous = tabs.find("li.is-active");
      if (previous) {
        previous.removeClass("is-active");
      }

      let li = sourceElement;
      while (li.tagName.toLowerCase() !== "li") {
        li = li.parentElement;
      }
      li.classList.add("is-active");

      const previousBody = tabContentContainer.find(
        ".tabContent." + previous.getAttribute("data")
      );
      if (previousBody) {
        previousBody.hide();
      }

      const nextBody = tabContentContainer.find(
        ".tabContent." + li.getAttribute("data")
      );
      nextBody.show();
    };

    return element;
  }

  onSecurityConfigChanged = (config: SecurityConfig) => {
    this.securityConfigDependencies.showOrHide(!!config.masterSeed);
    this.sweepXpriv.showOrHide(config.addressStrategy.isMultiple());

    if (config.masterSeed) {
      this.sweepKeysContent
        .empty()
        .appendChild(
          config.addressStrategy.isSingle() ? (
            <PrivateKeyWif
              keyPair={config.masterSeed.getEcPair()}
            ></PrivateKeyWif>
          ) : (
            <PrivateKeyWifMulti
              masterSeed={config.masterSeed}
              indexStart={0}
              indexEnd={config.addressStrategy.getAddressCount()}
            />
          )
        );
      if (config.addressStrategy.isMultiple()) {
        textAsCanvasSimple(
          config.masterSeed.getBip44Account0Xpriv(),
          (error, canvas) => {
            canvas.style.border = "1px solid #12537e";
            canvas.style.borderRadius = "10px";

            this.sweepXprivContent.empty().appendChild(
              <article class="message is-success">
                <div class="message-body">
                  <p>
                    Not all wallets support sweeping/importing an Xpriv. If your
                    wallet does not support it, you can sweep/import the
                    individual private keys on the <strong>Sweep keys</strong>{" "}
                    tab.
                  </p>
                  <br></br>
                  <table style="margin: auto;">
                    <tr>
                      <td>{canvas}</td>
                      <td style="vertical-align: middle; padding-left: 16px; max-width: 360px;">
                        <span>
                          <strong>Xpriv (BIP 44, Account0)</strong>
                        </span>
                        <br></br>
                        <span style="line-break: anywhere;">
                          {config.masterSeed.getBip44Account0Xpriv()}
                        </span>
                        <br></br>
                        <br></br>
                        <span>
                          <strong>BIP32 derivation path</strong>
                        </span>
                        <br></br>
                        <span style="line-break: anywhere;">
                          m/44'/0'/0'/0/0 (BIP44 compatible)
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </article>
            );
          }
        );
      }
    }
  };

  loadState(wizardState: object) {
    this.postRevealContainer.hide();

    this.baseEnvelope = wizardState["baseEnvelope"];
    this.masterSeed = wizardState["masterSeed"] as MasterSeed;

    if (this.baseEnvelope && this.baseEnvelope.messageAfterRevealing) {
      this.revealMessageRef.setRevealMessage(
        aesDecrypt(
          this.baseEnvelope.messageAfterRevealing,
          this.masterSeed.toBuffer(),
          this.masterSeed.getAddress(),
          this.baseEnvelope.shareIds[this.baseEnvelope.thisSharesIndex]
        )
      );
    } else {
      this.postRevealContainer.show();
      this.revealMessageRef.hide();
    }

    this.debugControlsRef.setMasterSeed(this.masterSeed.toHex());
    this.debugControlsRef.setNetwork(this.masterSeed.getNetworkAsString());
    const initialValue =
      this.baseEnvelope?.addressStrategy ||
      wizardState["addressStrategyOverride"] ||
      "single";
    this.debugControlsRef.setAddressStrategy(initialValue);
    this.debugControlsRef.setBaseEnvelope(this.baseEnvelope);

    this.securityConfigProvider.onChange(this.onSecurityConfigChanged);
    this.securityConfigProvider.trigger();
  }

  saveState(wizardState: object) {}

  enableNextButton(): boolean {
    return this.revealed;
  }
  onGoBack(wizardState: object, yes: () => void, no: () => void): void {
    yes();
  }
}
