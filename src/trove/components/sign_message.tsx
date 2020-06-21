import * as React from "jsx-dom"; // Fake React for JSX->DOM support

import { MasterSeed } from "../types/master_seed";
import { AddressStrategy } from "../types/address_strategy";
import { htmlRef } from "../../platform/util/html_ref";
import { READONLY_COLOR } from "../trove_constants";
import { isValidAddress } from "../util/address";
import { BIP32Interface } from "bip32";
import { smoothFinish } from "../../platform/util/effects";
import { ECPair } from "bitcoinjs-lib";
import * as bitcoinMessage from "bitcoinjs-message";
import { SecurityConfig } from "../types/security_config";
import { ValueRef } from "../../platform/util/value_ref";

declare var localize: (enText: string) => string;

export const SignMessage = ({
  securityConfig,
}: {
  securityConfig: ValueRef<SecurityConfig>;
}) => {
  let masterSeed: MasterSeed = null;
  let addressStrategy: AddressStrategy = null;

  const signMessageLabel = htmlRef();
  const addressToSignWith = htmlRef();
  const addressToSignWithReset = htmlRef();
  const findAddressProgress = htmlRef();
  const findAddressMessage = htmlRef();
  const addressFoundContainer = htmlRef();
  const messageToSign = htmlRef();
  const messageSignature = htmlRef();

  securityConfig.onChange((fullConfig) => {
    if (!fullConfig.masterSeed) {
      // TODO - hide everything or show warning/error
      return;
    }
    masterSeed = fullConfig.masterSeed;
    addressStrategy = fullConfig.addressStrategy;

    signMessageLabel.setText(
      addressStrategy.isSingle()
        ? localize("Address which is being signed with")
        : localize("Enter an address to sign with")
    );
    addressToSignWith.setValue(
      addressStrategy.isSingle() ? masterSeed.getAddress() : ""
    );
    addressToSignWith.setReadOnly(addressStrategy.isSingle());
    addressToSignWith.style().backgroundColor = addressStrategy.isSingle()
      ? READONLY_COLOR
      : "";

    messageToSign.setValue("");
    messageSignature.setValue("");
    addressFoundContainer.showOrHide(addressStrategy.isSingle());
  });

  return (
    <div class="field">
      <label ref={signMessageLabel} class="label"></label>
      <div class="control" style="display: flex;">
        <input
          ref={addressToSignWith}
          class="input"
          placeholder={localize("Address to sign with")}
          onInput={(e) => {
            // This input (addressToSignWith) should be disabled when debugAddressStrategySelect is 'single'
            // This check is here in case some browser calls onInput if a value is set programmatically.
            if (addressStrategy.isSingle()) {
              return;
            }

            const isValid = isValidAddress(
              addressToSignWith.getValueString(),
              masterSeed.getNetwork()
            );

            if (!isValid) {
              findAddressMessage
                .setText(localize("Invalid address"))
                .replaceClass("is-success", "is-danger")
                .show();
            } else {
              findAddressMessage.hide();
              addressToSignWith.setReadOnly(true);
              addressToSignWith.style().backgroundColor = READONLY_COLOR;
              findAddressProgress.show();
              masterSeed.findAddress(
                addressToSignWith.getValueString(),
                0,
                addressStrategy.getAddressCount(),
                {
                  found: (bip32Node: BIP32Interface) => {
                    smoothFinish(findAddressProgress.asProgress(), () => {
                      const text =
                        localize("Address was found at index") +
                        " " +
                        bip32Node.index;
                      findAddressMessage.setText(text).bulma().success().show();
                      findAddressProgress.hide();
                      addressToSignWithReset.show();
                      addressFoundContainer.show();
                    });
                  },
                  cancelled: () => {
                    // No cancel button yet
                  },
                  update: (searched: number, total: number) => {
                    findAddressProgress.setProgress(searched, total);
                  },
                  nothingFound: (address: string) => {
                    findAddressProgress.hide();
                    findAddressMessage
                      .setText(localize("This address was not found"))
                      .replaceClass("is-success", "is-danger")
                      .show();
                    addressToSignWith.setReadOnly(false);
                    addressToSignWith.style().backgroundColor = "";
                  },
                }
              );
            }
          }}
        ></input>
        <button
          ref={addressToSignWithReset}
          class="button"
          style="display: none;"
          onClick={(e) => {
            addressToSignWith.setReadOnly(false);
            addressToSignWith.style().backgroundColor = "";
            addressToSignWith.setValue("");
            addressToSignWithReset.hide();
            messageToSign.setValue("");
            messageSignature.setValue("");
            addressFoundContainer.hide();
            findAddressMessage.hide();
          }}
        >
          {localize("Reset")}
        </button>
      </div>
      <p ref={findAddressMessage} class="help" style="display: none;"></p>
      <progress
        ref={findAddressProgress}
        class="progress is-info"
        style="display: none; margin-top: 10px;"
      ></progress>
      <div ref={addressFoundContainer} style="margin-top: 10px;">
        <label class="label">{localize("Enter the message to sign")}</label>
        <div class="control">
          <textarea
            ref={messageToSign}
            class="textarea"
            placeholder={localize("Message to sign")}
            style="margin: 10px 0;"
            onInput={() => {
              masterSeed.findAddress(
                addressToSignWith.getValueString(),
                0,
                addressStrategy.getAddressCount(),
                {
                  found: (bip32Node: BIP32Interface) => {
                    const ecPair = ECPair.fromWIF(
                      bip32Node.toWIF(),
                      masterSeed.getNetwork()
                    );
                    try {
                      messageSignature.setValue(
                        bitcoinMessage
                          .sign(
                            messageToSign.getValueString(),
                            ecPair.privateKey,
                            ecPair.compressed,
                            { segwitType: "p2wpkh" }
                          )
                          .toString("base64")
                      );
                    } catch (e) {
                      console.log("error: " + e);
                    }
                  },
                  /*
                       We assume that it will just succeed:
                        1. In the 'single' case, the value is entetered programmatically and should be the first address found
                        2. In the 'multiple' case, the value should already be cached inside findAddress and returned instantly
            
                       The input (addressToSignWith) has also been disabled, so the address will not change unless there is a full reset
                      */
                  cancelled: () => {},
                  update: (searched: number, total: number) => {},
                  nothingFound: (address: string) => {},
                }
              );
            }}
          ></textarea>
        </div>
        <label class="label">{localize("Signature (base64 encoded)")}</label>
        <div class="control">
          <textarea
            ref={messageSignature}
            class="textarea"
            placeholder={localize("Signature (base64 encoded)")}
            readOnly={true}
          ></textarea>
        </div>
      </div>
    </div>
  );
};
