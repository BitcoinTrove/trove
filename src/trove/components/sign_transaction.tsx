import * as React from "jsx-dom"; // Fake React for JSX->DOM support

import { htmlRef } from "../../platform/util/html_ref";
import {
  showJsxInSimpleModal,
  showJsxInModal,
} from "../../platform/util/modals";
import { BitcoinCoreMoveAllCreatePsbt } from "./bitcoin_core_psbt_instructions";
import { walletNameFromEnvelope, DEBUG_DISPLAY } from "../trove_constants";
import { Psbt } from "bitcoinjs-lib";
import { lockInputs } from "../../platform/util/extended_html_element";
import { readBase64, downloadBase64 } from "../util/files";
import { copyTextToClipboard } from "../../platform/util/clipboard";
import { SecurityConfig } from "../types/security_config";
import { ValueRef } from "../../platform/util/value_ref";

declare var localize: (enText: string) => string;

export const SignTransaction = ({
  securityConfig,
}: {
  securityConfig: ValueRef<SecurityConfig>;
}) => {
  const introContainer = htmlRef();
  const psbtSignMultipleText = htmlRef();
  const signPsbtContinue = htmlRef();

  const unsignedTransactionContainer = htmlRef();
  const transactionToSign = htmlRef();
  const signPsbtProgress = htmlRef();
  const signPsbtBack = htmlRef();
  const loadFromFile = htmlRef();
  const invalidPsbt = htmlRef();
  const downloadUnsigned = htmlRef();
  const signTransaction = htmlRef();

  const signedTransactionContainer = htmlRef();
  const signedTransaction = htmlRef();
  const psbtClipboard = htmlRef();
  const rawTransactionError = htmlRef();
  const rawTransactionContainer = htmlRef();
  const rawTransaction = htmlRef();
  const rawTxClipboard = htmlRef();

  let baseEnvelope = null;
  let addressStrategy = null;
  let masterSeed = null;

  securityConfig.onChange((fullConfig) => {
    baseEnvelope = fullConfig.baseEnvelope;
    masterSeed = fullConfig.masterSeed;
    addressStrategy = fullConfig.addressStrategy;
    psbtSignMultipleText.showOrHide(addressStrategy.isMultiple());
  });

  const handleError = (error) => {
    signTransaction.setDisabled(true);
    downloadUnsigned.setDisabled(true);
    invalidPsbt.show();
    invalidPsbt.events().onclick = (e) => {
      showJsxInSimpleModal(
        <article class="message is-danger">
          <div class="message-body">{error.message}</div>
        </article>
      );
    };
    transactionToSign.classList().add("is-danger");
    signTransaction.classList().add("is-danger");
  };

  return (
    <div>
      <article ref={introContainer} class="message is-info">
        <div class="message-body">
          <p
            innerHTML={localize(
              "Trove can sign transactions which are in the PSBT format. Use your wallet software to generate an <strong>unsigned PSBT</strong> and load it into the tool to create the <strong>signed PSBT</strong>. The wallet software can then be used to transmit the signed transaction to the network."
            )}
          ></p>
          <p ref={psbtSignMultipleText}>
            {localize("The PSBT will be signed with all of the private keys.")}
          </p>
          <div style="display: flex;">
            <div style="margin: auto;">
              <span>
                <strong>
                  {localize(
                    "Guided instructions for specific wallets and use cases:"
                  )}
                </strong>
              </span>
              <ul style="list-style-type: disc; margin-left: 10px;">
                <li>
                  <span
                    class="link"
                    onClick={(e) => {
                      const importScriptFilename = baseEnvelope
                        ? baseEnvelope.referenceName + "_import_public_keys.sh"
                        : "import_public_keys.sh";
                      showJsxInModal(
                        localize("Bitcoin Core 0.19.0 - Move all bitcoin"),
                        <BitcoinCoreMoveAllCreatePsbt
                          masterSeed={masterSeed}
                          walletName={walletNameFromEnvelope(baseEnvelope)}
                          importScriptFilename={importScriptFilename}
                          addressStrategy={addressStrategy}
                        />,
                        true
                      );
                    }}
                  >
                    {localize("Bitcoin Core 0.19.0 - Move all bitcoin")}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div style="text-align: right;">
            <button
              ref={signPsbtContinue}
              class="button is-info is-outlined"
              onClick={() => {
                introContainer.hide();
                unsignedTransactionContainer.show();
              }}
            >
              {localize("Sign a PSBT")}
            </button>
          </div>
        </div>
      </article>
      <div ref={unsignedTransactionContainer} style="display: none;">
        <span>
          {localize(
            "Copy and paste the transaction (base64 encoded) below to sign it."
          )}
        </span>
        <textarea
          ref={transactionToSign}
          class="textarea"
          placeholder={localize("Transaction (base64 encoded)")}
          style="margin: 10px 0;"
          onInput={(e) => {
            let psbt: Psbt;
            try {
              psbt = Psbt.fromBase64(transactionToSign.getValueString());

              const unlockInputs = lockInputs(
                transactionToSign,
                loadFromFile,
                signPsbtBack
              );
              signPsbtProgress.show();
              invalidPsbt.hide();
              rawTransactionError.empty();
              transactionToSign.classList().remove("is-danger");
              signTransaction.classList().remove("is-danger");

              masterSeed.signPsbtWithNPrivateKeys(
                psbt,
                addressStrategy.getAddressCount(),
                {
                  finished: () => {
                    unlockInputs();
                    signPsbtProgress.hide();
                    signTransaction.setDisabled(false);
                    downloadUnsigned.setDisabled(false);
                    signedTransaction.setValue(psbt.toBase64());

                    // hanndle finalization
                    try {
                      rawTransaction.setValue(
                        psbt.finalizeAllInputs().extractTransaction().toHex()
                      );
                      rawTransactionContainer.show();
                    } catch (error) {
                      rawTransactionContainer.hide();
                      rawTransactionError
                        .appendChild(
                          <div>
                            {localize(
                              "Note: The PSBT could not be finalized to extract the raw transaction."
                            )}
                          </div>
                        )
                        .appendChild(<div>{error}</div>)
                        .show();
                    }
                  },
                  update: (completed: number, total: number) => {
                    signPsbtProgress.setProgress(completed, total);
                  },
                }
              );
            } catch (error) {
              // Not sure about this error handling.
              // The try-catch around the whole thing looks dodgy.
              handleError(error);
            }
          }}
        ></textarea>
        <progress
          ref={signPsbtProgress}
          class="progress is-info"
          style="display: none;"
        ></progress>
        <div style="display: flex;">
          <button
            ref={signPsbtBack}
            class="button is-info is-outlined"
            onClick={(e) => {
              unsignedTransactionContainer.hide();
              introContainer.show();
            }}
          >
            {localize("Go back")}
          </button>
          <button
            ref={loadFromFile}
            class="button is-info is-outlined"
            style="margin-right: auto;"
            onClick={(e) => {
              readBase64(".psbt", (data: Uint8Array) => {
                transactionToSign.setValue(
                  Buffer.from(data).toString("base64")
                );
                transactionToSign.dispatchEvent(new Event("input"));
              });
            }}
          >
            {localize("Load unsigned PSBT from file")}
          </button>
          <span
            ref={invalidPsbt}
            style="color: #ff3860; margin: 6px 16px; display: none; text-decoration: underline; cursor: pointer;"
          >
            {localize("Invalid PSBT")}
          </span>
          <button
            ref={downloadUnsigned}
            class="button is-info is-outlined"
            disabled={true}
            style={{
              "border-style": "dashed",
              display: DEBUG_DISPLAY,
            }}
            onClick={(e) => {
              downloadBase64(
                transactionToSign.getValueString(),
                "unsignedtx.psbt"
              );
            }}
          >
            {localize("Download unsigned PSBT")}
          </button>
          <button
            ref={signTransaction}
            class="button is-success is-outlined"
            disabled={true}
            onClick={(e) => {
              unsignedTransactionContainer.hide();
              signedTransactionContainer.show();
            }}
          >
            {localize("View signed PSBT")}
          </button>
        </div>
      </div>
      <div ref={signedTransactionContainer} style="display: none;">
        <article class="message is-success">
          <div class="message-body">
            <div class="messageBodyHeading">
              <span>~ {localize("Signed PSBT (base64 encoded)")} ~</span>
            </div>
            <div>
              <textarea
                ref={signedTransaction}
                class="textarea is-success"
                readOnly={true}
              ></textarea>{" "}
              <div style="display: flex;">
                <button
                  style="margin-left: auto;"
                  class="button is-success is-outlined"
                  onClick={(e) => {
                    downloadBase64(
                      signedTransaction.getValueString(),
                      "signedtx.psbt"
                    );
                  }}
                >
                  {localize("Download signed PSBT")}
                </button>
                <button
                  ref={psbtClipboard}
                  class="button is-success is-outlined"
                  onClick={(e) => {
                    copyTextToClipboard(
                      signedTransaction.getValueString(),
                      psbtClipboard
                    );
                  }}
                >
                  {localize("Copy to clipboard")}
                </button>
              </div>
              <br></br>
              <div ref={rawTransactionError} style="text-align: center;"></div>
              <div ref={rawTransactionContainer}>
                <div class="messageBodyHeading">
                  <span>~ {localize("Raw Transaction (hex encoded)")} ~</span>
                </div>
                <div>
                  <textarea
                    ref={rawTransaction}
                    class="textarea is-success"
                    readOnly={true}
                  ></textarea>{" "}
                  <div style="display: flex;">
                    <button
                      ref={rawTxClipboard}
                      class="button is-success is-outlined"
                      style="margin-left: auto;"
                      onClick={(e) => {
                        copyTextToClipboard(
                          rawTransaction.getValueString(),
                          rawTxClipboard
                        );
                      }}
                    >
                      {localize("Copy to clipboard")}
                    </button>
                  </div>
                </div>
              </div>
              <button
                class="button is-info is-outlined"
                onClick={() => {
                  unsignedTransactionContainer.show();
                  signedTransactionContainer.hide();
                }}
              >
                {localize("Go back")}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
