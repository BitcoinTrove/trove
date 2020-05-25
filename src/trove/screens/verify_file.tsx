import { Screen } from "../../platform/components/screen";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import {
  IS_DEV,
  getSignatureFromText,
  DocumentData,
  IS_DEBUG,
  getDocumentDataFromText,
} from "../trove_constants";
import { readText, download } from "../util/files";
import {
  removeDocumentDataFromText,
  replaceDocumentData,
} from "../../platform/util/duplication";
import * as bitcoinMessage from "bitcoinjs-message";
import { SIGNING_ADDRESS, DONATION_NETWORK } from "../util/donation";
import { showJsxInModal } from "../../platform/util/modals";
import { ECPair } from "bitcoinjs-lib";
import { getAddress } from "../util/address";
import { FILENAME } from "../../shared/constants";
import { Bulma } from "../../platform/util/bulma";
import { htmlRef } from "../../platform/util/html_ref";

declare var localize: (enText: string) => string;

// This is currently not used, in favor of PGP signing
export class VerifyFile extends Screen {
  constructor() {
    const screen = (
      <div class="screen">
        <div style="margin: 20px auto; max-width: 700px;">
          <table style="margin: auto;">
            <tbody>
              {IS_DEV && IS_DEBUG ? (
                <tr>
                  <td>
                    <button
                      class="button is-info is-outlined"
                      style="width: 100%; margin: 4px;"
                      onClick={(e) => {
                        readText(".html", (text) => {
                          const signature = getSignatureFromText(text);
                          if (signature) {
                            showJsxInModal(
                              localize("Signing failed"),
                              Bulma.message(
                                localize("This file already has a signature.")
                              ).danger(),
                              false
                            );
                            return;
                          }
                          const textToSign = removeDocumentDataFromText(text);

                          const wif = htmlRef();
                          const message = htmlRef();
                          const modal = (
                            <div>
                              <div class="field">
                                <label class="label">
                                  {"Enter the WIF for the signing address (" +
                                    SIGNING_ADDRESS +
                                    ")"}
                                </label>
                                <div class="control">
                                  <input
                                    ref={wif}
                                    class="input"
                                    placeholder={"WIF for signing address"}
                                    onInput={(e) => {
                                      let isValidWif = false;
                                      let errorMessage = null;
                                      try {
                                        const ecPair = ECPair.fromWIF(
                                          wif.getValueString(),
                                          DONATION_NETWORK
                                        );
                                        const signingAddress = getAddress(
                                          ecPair,
                                          DONATION_NETWORK
                                        );
                                        if (
                                          signingAddress === SIGNING_ADDRESS
                                        ) {
                                          isValidWif = true;
                                        }
                                      } catch (error) {
                                        errorMessage = error;
                                      }
                                      signButton.setDisabled(!isValidWif);

                                      const bulmaMessage = message
                                        .show()
                                        .bulma();
                                      if (isValidWif) {
                                        bulmaMessage
                                          .success()
                                          .setText(
                                            localize("This is the correct WIF.")
                                          );
                                      } else if (errorMessage) {
                                        bulmaMessage
                                          .danger()
                                          .setText(errorMessage);
                                      } else {
                                        bulmaMessage
                                          .danger()
                                          .setText(
                                            localize(
                                              "This is not the WIF for the signing address."
                                            )
                                          );
                                      }
                                    }}
                                  ></input>
                                </div>
                                <p
                                  ref={message}
                                  class="help"
                                  style="display: none;"
                                ></p>
                              </div>
                            </div>
                          );
                          const signButton = htmlRef();
                          const buttons = (
                            <div>
                              <button
                                class="button"
                                onClick={(e) => {
                                  hideModal();
                                }}
                              >
                                {localize("Cancel")}
                              </button>
                              <button
                                ref={signButton}
                                class="button is-success"
                                disabled={true}
                                onClick={(e) => {
                                  const ecPair = ECPair.fromWIF(
                                    wif.getValueString(),
                                    DONATION_NETWORK
                                  );
                                  const signature = bitcoinMessage
                                    .sign(
                                      textToSign,
                                      ecPair.privateKey,
                                      ecPair.compressed,
                                      { segwitType: "p2wpkh" }
                                    )
                                    .toString("base64");
                                  const newDocumentData: DocumentData = {
                                    signature: signature,
                                  };
                                  const signedFile = replaceDocumentData(
                                    text,
                                    newDocumentData
                                  );
                                  download(signedFile, FILENAME);
                                  hideModal();
                                }}
                              >
                                {localize("Sign")}
                              </button>
                            </div>
                          );

                          const hideModal = showJsxInModal(
                            "Enter the private key to sign with",
                            modal,
                            false,
                            buttons
                          );
                        });
                      }}
                    >
                      Sign a file
                    </button>
                  </td>
                </tr>
              ) : null}
              <tr>
                <td>
                  <button
                    class="button is-info is-outlined"
                    style="width: 100%; margin: 4px;"
                    onClick={(e) => {
                      readText(".html", (text) => {
                        const documentData = getDocumentDataFromText(text);
                        if (!documentData.signature) {
                          showJsxInModal(
                            localize("Verification failed"),
                            Bulma.message(
                              localize("The loaded file is not signed.")
                            ).danger(),
                            false
                          );
                          return;
                        }
                        const textToVerify = removeDocumentDataFromText(text);

                        let isValid = false;
                        try {
                          isValid = bitcoinMessage.verify(
                            textToVerify,
                            SIGNING_ADDRESS,
                            documentData.signature
                          );
                        } catch {
                          // nothing
                        }
                        if (isValid) {
                          showJsxInModal(
                            localize("Success"),
                            Bulma.message(
                              localize("The loaded file has a valid signature.")
                            ).success(),
                            false
                          );
                        } else {
                          showJsxInModal(
                            localize("Verification failed"),
                            Bulma.message(
                              localize(
                                "The signature on the loaded file is invalid"
                              )
                            ).danger(),
                            false
                          );
                        }
                      });
                    }}
                  >
                    Verify a file
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );

    super("VerifyFile", "Verify a file");
    this.setContent(screen);
  }
}
