import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { MiniWizard } from "../../platform/components/mini_wizard";
import { Psbt } from "bitcoinjs-lib";
import { MasterSeed } from "../types/master_seed";
import { AddressStrategy } from "../types/address_strategy";
import { isValidAddress } from "../util/address";
import { htmlRefs, htmlRef } from "../../platform/util/html_ref";
import { download } from "../util/files";

declare var localize: (enText: string) => string;

export const BitcoinCoreMoveAllCreatePsbt = ({
  masterSeed,
  walletName,
  importScriptFilename,
  addressStrategy,
}: {
  masterSeed: MasterSeed;
  walletName: string;
  importScriptFilename: string;
  addressStrategy: AddressStrategy;
}) => {
  const step1 = (
    <div>
      <article class="message is-info">
        <div class="message-body">
          <p>
            {localize(
              "Your node needs to have pruning turned off to ensure that all funds are discovered. These instructions serve only as an example."
            )}
          </p>
          <br></br>
          <div style="display: flex;">
            <button
              class="button is-info is-outlined"
              style="margin: auto;"
              onClick={(e) => {
                wizard.nextStep();
              }}
            >
              {localize("Continue")}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
  let cancelImportScript: () => void = null;

  // TODO - Can this be made simpler
  const [
    step2Continue,
    amountEntered,
    amountEnteredHelp,
    addressEnteredHelp,
    addressEntered,
    ackBCPSBTInstructions,
    importKeysFormat,
    importScriptProgress,
    cancelImportButton,
    saveImportScriptButton,
  ] = htmlRefs(10);

  const step2 = (
    <div>
      <h1>{localize("1. Create a new wallet")}</h1>
      <code>bitcoin-core.cli createwallet "{walletName}" true</code>
      {addressStrategy.isSingle() ? (
        <div>
          <h1>{localize("2. Import the public key")}</h1>
          <code>
            bitcoin-core.cli -rpcwallet={walletName} importpubkey{" "}
            {masterSeed.getEcPair().publicKey.toString("hex")} "" false
          </code>
        </div>
      ) : null}
      {addressStrategy.isMultiple() ? (
        <div>
          <h1>{localize("2. Save script to import addresses")}</h1>
          <div style="display: flex;">
            <progress
              ref={importScriptProgress}
              class="progress is-info"
              style="display: none;"
            ></progress>
            <input
              ref={importKeysFormat}
              class="input is-info"
              type="text"
              value='bitcoin-core.cli -rpcwallet={walletname} importpubkey {publickey} "" false'
            ></input>
            <button
              ref={saveImportScriptButton}
              class="button is-info is-outlined"
              onClick={(e) => {
                importScriptProgress.show();
                cancelImportButton.show();
                importKeysFormat.hide();
                saveImportScriptButton.hide();

                cancelImportScript = masterSeed.deriveBulkFormatted(
                  importKeysFormat.getValueString(),
                  0,
                  addressStrategy.getAddressCount(),
                  walletName,
                  {
                    update: (done: number, totalNumber: number) => {
                      importScriptProgress.setProgress(done, totalNumber);
                    },
                    cancelled: () => {
                      importScriptProgress.hide();
                      cancelImportButton.hide();
                      importKeysFormat.show();
                      saveImportScriptButton.show();
                    },
                    finished: (fullText: string) => {
                      importScriptProgress.hide();
                      cancelImportButton.hide();
                      importKeysFormat.show();
                      saveImportScriptButton.show();
                      const split = fullText.split("\n").filter((x) => !!x);
                      if (addressStrategy.getAddressCount() > 1000) {
                        const stepSize = split.length / 100;
                        for (let i = 100; i >= 0; --i) {
                          split.splice(i * stepSize, 0, 'echo "' + i + '%"');
                        }
                      }
                      download(split.join("\n"), importScriptFilename);
                    },
                  }
                );
              }}
            >
              Create import script
            </button>
            <button
              ref={cancelImportButton}
              class="button is-danger is-outlined"
              style="display: none;"
              onClick={(e) => {
                cancelImportScript();
              }}
            >
              Cancel
            </button>
          </div>
          <code>chmod +x {importScriptFilename}</code>
          <br></br>
          <code>./{importScriptFilename}</code>
        </div>
      ) : null}
      <h1>{localize("3. Rescan blocks to find incoming transactions")}</h1>
      <code>bitcoin-core.cli -rpcwallet={walletName} rescanblockchain</code>
      <h1>{localize("4. Calculate the balance in the address")}</h1>
      <code>
        bitcoin-core.cli -rpcwallet={walletName} getbalance "*" 0 true
      </code>
      <div style="width: 100%; border-top: 1px solid gray; margin: 10px 0;"></div>
      <div class="field">
        <label class="label">
          {localize("Amount of bitcoin in this address")}
        </label>
        <div class="control">
          <input
            ref={amountEntered}
            class="input is-info"
            type="number"
            placeholder={localize("Amount of bitcoin")}
            step="0.00000001"
            onInput={(e) => {
              amountEnteredHelp.showOrHide(!amountEntered.getValueString());
              amount.setText(amountEntered.getValueString());
              step2Continue.setDisabled(
                !amountEntered.getValueString() ||
                  !addressEntered.getValueString() ||
                  !ackBCPSBTInstructions.isChecked()
              );
            }}
          ></input>
        </div>
        <p
          ref={amountEnteredHelp}
          class="help is-danger"
          style="display: none;"
        >
          {localize("Invalid amount")}
        </p>
      </div>
      <div class="field">
        <label class="label">
          {localize("Bitcoin address you are sending to")}
        </label>
        <div class="control">
          <input
            class="input is-info"
            type="text"
            ref={addressEntered}
            placeholder={localize("Bitcoin address")}
            onInput={(e) => {
              const isValid = isValidAddress(
                addressEntered.getValueString(),
                masterSeed.getNetwork()
              );
              if (isValid) {
                addressEnteredHelp
                  .bulma()
                  .success()
                  .setText("This address is valid");
              } else {
                addressEnteredHelp
                  .bulma()
                  .danger()
                  .setText(
                    localize(
                      "This address does not seem valid. It may be an address type that Trove does not yet know about. Proceed with caution."
                    )
                  );
              }

              step2Continue.setDisabled(
                !amountEntered.getValueString() ||
                  !addressEntered.getValueString() ||
                  !ackBCPSBTInstructions.isChecked()
              );
              sendToAddress.setText(addressEntered.getValueString());
            }}
          ></input>
        </div>
        <p ref={addressEnteredHelp} class="help"></p>
      </div>
      <div style="padding-top: 10px;">
        <input
          class="is-checkradio is-info"
          id="ackBCPSBTInstructions"
          type="checkbox"
          ref={ackBCPSBTInstructions}
          onInput={(e) => {
            step2Continue.setDisabled(
              !amountEntered.getValueString() ||
                !addressEntered.getValueString() ||
                !ackBCPSBTInstructions.isChecked()
            );
          }}
        ></input>
        <label htmlFor="ackBCPSBTInstructions">
          {localize(
            "I am 100% sure that the values above are correct. I understand that getting them wrong could result in the loss of funds."
          )}
        </label>
      </div>
      <br></br>
      <div style="display: flex">
        <button
          ref={step2Continue}
          style="margin-left: auto;"
          class="button is-info is-outlined"
          disabled={true}
          onClick={(e) => {
            wizard.nextStep();
          }}
        >
          {localize("Continue")}
        </button>
      </div>
    </div>
  );
  const [
    sendToAddress,
    amount,
    step3Continue,
    unsignedPsbtEnteredValue,
    unsignedPsbtHelp,
    signingProgress,
    unsignedInputContainer,
  ] = htmlRefs(7);
  const step3 = (
    <div>
      <h1>{localize("5. Create the PSBT")}</h1>
      <code>
        bitcoin-core.cli -rpcwallet={walletName} walletcreatefundedpsbt '[]' '[
        {"{"} "<span ref={sendToAddress}></span>": <span ref={amount}></span>{" "}
        {"}"}]' 0 '{"{"}
        "includeWatching": true, "changeAddress": "{masterSeed.getAddress()}",
        "subtractFeeFromOutputs": [0]
        {"}"}' true
      </code>
      <div style="width: 100%; border-top: 1px solid gray; margin: 10px 0;"></div>
      <progress
        ref={signingProgress}
        class="progress is-info"
        style="display: none;"
      ></progress>
      <div ref={unsignedInputContainer} class="field">
        <label class="label">
          {localize("Unsigned PSBT (base64 encoded)")}
        </label>
        <div class="control">
          <input
            ref={unsignedPsbtEnteredValue}
            class="input is-info"
            type="text"
            placeholder={localize("PSBT (base64 encoded)")}
            onInput={(e) => {
              signingProgress.show();
              unsignedInputContainer.hide();
              let psbt: Psbt;
              try {
                psbt = Psbt.fromBase64(
                  unsignedPsbtEnteredValue.getValueString()
                );

                masterSeed.signPsbtWithNPrivateKeys(
                  psbt,
                  addressStrategy.getAddressCount(),
                  {
                    finished: () => {
                      try {
                        // The PSBT can be finalized because we know we are the only signer
                        psbt.finalizeAllInputs();
                      } catch (error) {
                        signingProgress.hide();
                        unsignedInputContainer.show();
                        step3Continue.setDisabled(true);
                        unsignedPsbtHelp
                          .bulma()
                          .danger()
                          .setText(error.message);
                        return;
                      }

                      signedTransactionHex.setText(
                        psbt.extractTransaction().toHex()
                      );
                      step3Continue.setDisabled(false);
                      unsignedPsbtHelp
                        .bulma()
                        .success()
                        .setText(localize("Successfully signed"));
                      signingProgress.hide();
                      unsignedInputContainer.show();
                    },
                    update: (completed: number, total: number) => {
                      signingProgress.setProgress(completed, total);
                    },
                  }
                );
              } catch (error) {
                signingProgress.hide();
                unsignedInputContainer.show();
                step3Continue.setDisabled(true);
                unsignedPsbtHelp.bulma().danger().setText(error.message);
              }
            }}
          ></input>
        </div>
        <p ref={unsignedPsbtHelp} class="help"></p>
      </div>
      <br></br>
      <div style="display: flex">
        <button
          ref={step3Continue}
          style="margin-left: auto;"
          class="button is-info is-outlined"
          disabled={true}
          onClick={(e) => {
            wizard.nextStep();
          }}
        >
          {localize("Continue")}
        </button>
      </div>
    </div>
  );

  const signedTransactionHex = htmlRef();
  const step4 = (
    <div>
      <h1>{localize("6. Send the transaction to the network")}</h1>
      <code>
        bitcoin-core.cli sendrawtransaction{" "}
        <span ref={signedTransactionHex}></span>
      </code>
    </div>
  );

  const wizard = new MiniWizard(step1, step2, step3, step4);
  return wizard.getContainer();
};
