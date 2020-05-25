import { removeAnyModals } from "../../platform/util/modals";
import { IS_DEBUG } from "../trove_constants";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { MiniWizard } from "../../platform/components/mini_wizard";
import { SecretShareEnvelope } from "../types/secret_share_envelope";
import { PaperTemplate } from "./paper_template";
import { print } from "../../platform/util/print_helper";
import { extendHtmlElement } from "../../platform/util/extended_html_element";
import { htmlRefs, htmlRef } from "../../platform/util/html_ref";

declare var localize: (enText: string) => string;

export const CreatePaperTemplate = ({
  envelope,
  checksumValue,
  slip39Password,
  onFinished,
}: {
  envelope: SecretShareEnvelope;
  checksumValue: string;
  slip39Password: string;
  onFinished: () => void;
}) => {
  removeAnyModals();

  const filename: string = envelope.shareNames[envelope.thisSharesIndex];
  const paperTemplate = (
    <PaperTemplate
      envelope={envelope}
      checksumValue={checksumValue}
    ></PaperTemplate>
  );

  const step1 = (
    <div style="border-top: 1px solid lightgrey; padding-top: 20px">
      <div>
        <div style="text-align: center;">
          <button
            class="button is-info is-outlined"
            style="margin: 4px;"
            onClick={(e) => {
              print(paperTemplate, false);
              wizard.nextStep();
            }}
          >
            {localize("Print template")}
          </button>
          <button
            class="button is-info is-outlined"
            style="margin: 4px;"
            onClick={(e) => {
              wizard.nextStep();
            }}
          >
            {localize("I have a printed template")}
          </button>
          {IS_DEBUG && (
            <button
              class="button is-info is-outlined"
              style="margin: 4px; border-style: dashed;"
              onClick={(e) => print(paperTemplate, true)}
            >
              {localize("Preview template")}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const [
    step2Container,
    shareId,
    shareIdError,
    shareIdErrorText,
    continueButton,
  ] = htmlRefs(5);

  const step2 = (
    <div
      ref={step2Container}
      style="border-top: 1px solid lightgrey; padding-top: 20px"
    >
      <div style="text-align: center;">
        <p>
          {localize("Enter the share ID that appears on the printed template.")}
        </p>
        {IS_DEBUG ? (
          <p style="color: #209cee; border: 1px dashed #209cee; display: inline-block; padding: 6px; margin: 10px;">
            {localize("Debug: Looking for")} {envelope.shareId}
          </p>
        ) : null}
        <br></br>
        <div class="control" style="width: 300px; margin: auto;">
          <input
            ref={shareId}
            class="input is-medium"
            type="text"
            placeholder={localize("Enter the share ID")}
            onInput={(e) => {
              const value = shareId.getValueString();
              continueButton.setDisabled(envelope.shareId != value);
              if (
                value.length >= envelope.shareId.length &&
                envelope.shareId != value
              ) {
                shareIdErrorText.setText(
                  localize(
                    "The entered share ID does not match what should be on the template. You can go back to print the template if needed."
                  )
                );
                shareIdError.show();
              } else {
                shareIdError.hide();
              }
            }}
            onKeyPress={(e) => {
              if (
                step2Container.isShown() &&
                e.keyCode === 13 /* Enter key */
              ) {
                continueButton.click();
              }
            }}
          />
        </div>
        <article
          ref={shareIdError}
          class="message is-danger"
          style="display: none;"
        >
          <div class="message-body">
            <p ref={shareIdErrorText}></p>
          </div>
        </article>

        <div style="display: flex;">
          <button
            class="button is-info is-outlined"
            style="margin: 4px; margin-right: auto;"
            onClick={(e) => {
              wizard.previousStep();
            }}
          >
            {localize("Back")}
          </button>
          <button
            ref={continueButton}
            class="button is-info is-outlined"
            style="margin: 4px; margin-left: auto;"
            disabled={true}
            onClick={(e) => {
              wizard.nextStep();
            }}
          >
            {localize("Continue")}
          </button>
          {IS_DEBUG && (
            <button
              class="button is-info is-outlined"
              style="margin: 4px; border-style: dashed;"
              onClick={(e) => {
                wizard.nextStep();
              }}
            >
              {localize("Skip")}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const step2bContainer = htmlRef();
  const step2b = (
    <div
      ref={step2bContainer}
      style="border-top: 1px solid lightgrey; padding-top: 20px"
    >
      <div style="text-align: center;">
        <p>{localize("Write your Slip39 password on the printed template.")}</p>
        <div style="display: flex; text-align: left; padding-top: 4px;">
          <ul style="margin: auto;">
            <li style="list-style: decimal;">
              <strong>{localize("Use an ink pen")}</strong>
            </li>
            <li style="list-style: decimal;">
              <strong>{localize("Write legibly")}</strong>
            </li>
          </ul>
        </div>
        <br></br>
        <div>
          <span style="line-height: 40px; font-size: 20px; margin-right: 8px;">
            Your Slip39 password:
          </span>
          <input
            class="input is-info is-medium"
            type="text"
            readOnly={true}
            style="width: unset;"
            value={slip39Password}
          ></input>
        </div>
      </div>
      <div style="display: flex;">
        <button
          class="button is-info is-outlined"
          style="margin: 4px; margin-right: auto;"
          onClick={(e) => {
            wizard.previousStep();
          }}
        >
          {localize("Back")}
        </button>
        <button
          class="button is-info is-outlined"
          style="margin: 4px; margin-left: auto;"
          onClick={(e) => {
            wizard.nextStep();
          }}
        >
          {localize("Continue")}
        </button>
      </div>
    </div>
  );

  let currentIndex = 0;

  const words = envelope.shareData.split(" ");
  const progress = (
    <progress
      class="progress is-info"
      value="0"
      max={words.length}
      style="width: 80%; margin: 20px auto;"
    ></progress>
  ) as HTMLProgressElement;

  const wordContainer = (
    <span style="margin: 6px; border: 1px solid grey; background: white; border-radius: 4px; padding: 6px;">
      1. {words[0]}
    </span>
  );
  const previousButton = (
    <button
      class="button is-info is-outlined"
      style="margin: 4px;"
      disabled={true}
      onClick={(e) => {
        currentIndex -= 1;
        wordContainer.innerText = currentIndex + 1 + ". " + words[currentIndex];
        nextButton.setDisabled(currentIndex === words.length - 1);
        previousButton.disabled = currentIndex === 0;
      }}
    >
      {localize("Previous")}
    </button>
  ) as HTMLButtonElement;
  const nextButton = extendHtmlElement(
    <button
      class="button is-info is-outlined"
      style="margin: 4px;"
      onClick={(e) => {
        currentIndex += 1;
        wordContainer.innerText = currentIndex + 1 + ". " + words[currentIndex];
        nextButton.setDisabled(currentIndex === words.length - 1);
        previousButton.disabled = currentIndex === 0;
        doneButton.setDisabled(!nextButton.isDisabled());
        progress.value = Math.max(progress.value, currentIndex + 1);
      }}
    >
      {localize("Next word")}
    </button>
  );

  console.log("nextButton");
  console.log(nextButton);

  const step3 = (
    <div style="border-top: 1px solid lightgrey; padding-top: 20px">
      <div style="text-align: center;">
        <p>{localize("Write your Slip39 words on the printed template.")}</p>
        <div style="display: flex; text-align: left; padding-top: 4px;">
          <ul style="margin: auto;">
            <li style="list-style: decimal;">
              <strong>{localize("Use an ink pen")}</strong>
            </li>
            <li style="list-style: decimal;">
              <strong>{localize("Write legibly")}</strong>
            </li>
          </ul>
        </div>
        <div>
          {progress}
          <div style="margin: 20px; font-size: 18px;">
            <span>{localize("Write word:")}</span>
            {wordContainer}
          </div>
          <div>
            {previousButton}
            {nextButton.asHtmlElement()}
            {IS_DEBUG && (
              <button
                class="button is-info is-outlined"
                style="margin: 4px; border-style: dashed;"
                onClick={(e) => {
                  const advance = () => {
                    if (currentIndex < words.length - 1) {
                      nextButton.click();
                      setTimeout(advance, 100);
                    }
                  };
                  advance();
                }}
              >
                {localize("Skip to end")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const wizard = envelope.slip39PasswordHash
    ? new MiniWizard(step1, step2, step2b, step3)
    : new MiniWizard(step1, step2, step3);
  const headings = ["Print template", "Enter share ID", "Write words"];
  if (envelope.slip39PasswordHash) {
    headings.splice(2, 0, "Write password");
  }
  wizard.addHeaders(...headings);

  const doneButton = htmlRef();
  const modal = (
    <div class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-card" style="width: 90%; max-width: 900px;">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {localize("Slip39 words for")} {filename}
          </p>
          <button
            class="delete"
            aria-label="close"
            onClick={(e) => {
              removeAnyModals();
            }}
          ></button>
        </header>
        <section class="modal-card-body">
          <article class="message is-info">
            <div class="message-body">
              <div>{wizard.getContainer()}</div>
            </div>
          </article>
        </section>

        <footer class="modal-card-foot" style="justify-content: flex-end;">
          <button
            class="button"
            onClick={(e) => {
              // TODO - Does this need cleaning up? Can the copy-paste be simplified
              // Mostly copy-pasted from above
              currentIndex = 0;
              wordContainer.innerText =
                currentIndex + 1 + ". " + words[currentIndex];
              nextButton.setDisabled(false);
              previousButton.disabled = true;
              doneButton.setDisabled(!nextButton.isDisabled());
              progress.value = 0;
              // not copy pasted
              wizard.resetToFirstStep();
            }}
          >
            {localize("Reset")}
          </button>
          <button
            class="button"
            onClick={(e) => {
              removeAnyModals();
            }}
          >
            {localize("Cancel")}
          </button>
          <button
            ref={doneButton}
            class="button is-success"
            disabled={true}
            onClick={(e) => {
              onFinished();
            }}
          >
            {localize("Finished")}
          </button>
        </footer>
      </div>
    </div>
  );

  return modal;
};
