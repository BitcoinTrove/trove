import { removeAnyModals } from "../../platform/util/modals";
import { IS_DEBUG } from "../trove_constants";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import Slip39 from "slip39/src/slip39";
import { MiniWizard } from "../../platform/components/mini_wizard";
import {
  ExtendedHtmlElement,
  extendHtmlElement,
} from "../../platform/util/extended_html_element";
import { SLIP39_WORDS } from "../util/slip39_wrapper";
import { HtmlRef, htmlRefs, htmlRef } from "../../platform/util/html_ref";
import { SecretShareEnvelope } from "../types/secret_share_envelope";

const MAX_SHARE_DATA_LENGTH = 33;

export const RecoverFromSlip39WordsModal = ({
  envelopes_not_found,
  envelopes_found,
  baseEnvelope,
  shareDataLength,
  success,
  shareId,
  wordsInput,
}: {
  envelopes_not_found?: Set<string>;
  envelopes_found?: Set<string>;
  baseEnvelope?: SecretShareEnvelope;
  shareDataLength?: number;
  success: (envelope: SecretShareEnvelope) => void;
  shareId?: HtmlRef;
  wordsInput?: HtmlRef;
}) => {
  removeAnyModals();

  const [
    step1Container,
    shareIdError,
    shareIdErrorText,
    continueButton,
  ] = htmlRefs(4);
  shareId = shareId || htmlRef();

  const step1 = (
    <div ref={step1Container}>
      <article class="message">
        <div class="message-body">
          <p>Enter the share ID below.</p>
        </div>
      </article>
      {IS_DEBUG ? (
        <p style="color: #209cee; border: 1px dashed #209cee; display: inline-block; padding: 6px; margin: 10px;">
          Debug: Looking for one of{" "}
          {envelopes_not_found
            ? Array.from(envelopes_not_found).join(", ")
            : "unknown"}
        </p>
      ) : null}
      <div class="control" style="width: 300px; margin: auto;">
        <input
          ref={shareId}
          class="input is-medium is-info"
          type="text"
          placeholder="Enter the share ID"
          onInput={(e) => {
            const value = shareId.getValueString();
            continueButton.setDisabled(!envelopes_not_found.has(value));
            if (baseEnvelope.shareId === value) {
              shareIdErrorText.setText(
                "This is the share ID of this digital share. It's data has already been loaded."
              );
              shareIdError.show();
            } else if (envelopes_found.has(value)) {
              shareIdErrorText.setText("This share has already been loaded.");
              shareIdError.show();
            } else if (!continueButton.isDisabled()) {
              shareIdError.hide();
            } else if (value.length >= baseEnvelope.shareId.length) {
              shareIdErrorText.setText("The entered share ID is unexpected");
              shareIdError.show();
            } else {
              shareIdError.hide();
            }
          }}
          onKeyPress={(e) => {
            if (step1Container.isShown() && e.keyCode === 13 /* Enter key */) {
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
      <div style="text-align: right;">
        <button
          ref={continueButton}
          class="button is-info is-outlined"
          disabled={true}
          onClick={(e) => {
            wizard.nextStep();
            wordsInput.focus();
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const [
    bodyContainer,
    preText,
    progress,
    tagContainer,
    successMessage,
    errorMessage,
  ] = htmlRefs(6);
  wordsInput = wordsInput || htmlRef();

  const step2 = (
    <div>
      <div ref={bodyContainer}>
        <article class="message">
          <div class="message-body">
            <p>Enter the Slip39 words which are written on the paper share.</p>
          </div>
        </article>

        <div class="control has-icons-left" style="width: 300px; margin: auto;">
          <input
            ref={wordsInput}
            class="input is-medium"
            type="text"
            placeholder=""
          />
          <span ref={preText} class="icon is-left"></span>
        </div>
        <progress
          ref={progress}
          class="progress is-success"
          style="width: 80%; margin: 16px auto; display: none;"
          value="0"
          max={shareDataLength}
        ></progress>
        <div
          ref={tagContainer}
          class="tags"
          style="display: none; margin: 16px; background-color: lightgrey; padding: 10px; border-radius: 5px;"
        ></div>
      </div>

      <article
        ref={successMessage}
        class="message is-success"
        style="display: none;"
      >
        <div class="message-body">
          <div class="messageBodyHeading">
            <span>~ Success ~</span>
          </div>
          <p>Slip39 words successfully entered.</p>
        </div>
      </article>
      <article
        ref={errorMessage}
        class="message is-danger"
        style="display: none;"
      >
        <div class="message-body">
          <p>These slip39 words are invalid.</p>
        </div>
      </article>
    </div>
  );
  const wizard = baseEnvelope
    ? new MiniWizard(step1, step2)
    : new MiniWizard(step2);

  const [doneButton, closeButton, cancelButton, resetButton] = htmlRefs(4);
  const modal = (
    <div name="modal" class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-card" style="width: 90%; max-width: 900px;">
        <header class="modal-card-head">
          <p class="modal-card-title">Load paper share using Slip39 words</p>
          <button ref={closeButton} class="delete" aria-label="close"></button>
        </header>
        <section class="modal-card-body">
          <div>{wizard.getContainer()}</div>
        </section>

        <footer class="modal-card-foot" style="justify-content: flex-end;">
          <button ref={resetButton} class="button">
            Reset
          </button>
          <button ref={cancelButton} class="button">
            Cancel
          </button>
          <button ref={doneButton} class="button is-success" disabled={true}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );

  closeButton.events().onclick = () => {
    removeAnyModals();
  };

  cancelButton.events().onclick = () => {
    removeAnyModals();
  };

  resetButton.events().onclick = () => {
    shareId.setValue("");
    continueButton.setDisabled(true);
    errorMessage.hide();
    wordsInput.setValue("");
    progress.setValue(0).hide();
    doneButton.setDisabled(true);
    bodyContainer.show();
    successMessage.hide();
    tagContainer.empty().hide();
    addTag();
    wizard.resetToFirstStep();
  };
  let selectedTag: ExtendedHtmlElement | undefined = undefined;

  const finished = () => {
    doneButton.setDisabled(false);
    bodyContainer.hide();
    errorMessage.hide();
    successMessage.show();
  };

  const error = () => {
    errorMessage.show();
  };

  const wordsArray = (): string[] => {
    const tags = tagContainer.findAll(".tag");
    const array = Array.from(tags)
      .map((element) => element.getAttribute("data"))
      .filter((element) => element && element.trim());
    return array;
  };

  const wordsString2 = (): string => {
    return wordsArray().join(" ");
  };

  const countValidWords = (): number => {
    let valid = 0;
    wordsArray().forEach((word) => {
      valid += SLIP39_WORDS.has(word) ? 1 : 0;
    });
    return valid;
  };

  const evaluateWords = () => {
    if (!shareDataLength || countValidWords() === shareDataLength) {
      const isValid = Slip39.validateMnemonic(wordsString2());
      if (isValid) {
        finished();
      } else if (shareDataLength) {
        error();
      } // else we don't know when the user is done
    }
  };

  const updateInput = (i: number) => {
    wordsInput.setPlaceHolder("Enter word #" + i);
    preText.setText(i + ".");
    const areTags = tagContainer.getChildCount() > 1;
    tagContainer.showOrHide(areTags);
    progress.showOrHide(shareDataLength && areTags);
  };
  updateInput(1);

  const selectTag = (tag: ExtendedHtmlElement) => {
    if (selectedTag) {
      selectedTag.classList().remove("selectedTag");
    }
    selectedTag = tag;
    selectedTag.classList().add("selectedTag");
    updateInput(selectedTag.indexInParent() + 1);
    wordsInput.setValue(selectedTag.getAttribute("data"));
    wordsInput.focus();
  };

  const addTag = (): void => {
    wordsInput.setValue("");
    const selectedTag = tagContainer.find(".selectedTag");
    if (selectedTag) {
      selectedTag.classList().remove("selectedTag");
    }
    const tag = extendHtmlElement(
      <span class="tag is-light is-medium">
        {tagContainer.getChildCount() + 1 + ". "}
      </span>
    );
    tagContainer.appendChild(tag);

    tag.events().onclick = () => {
      selectTag(tag);
    };
    selectTag(tag);
  };
  addTag();

  wordsInput.events().oninput = () => {
    let selectedIndex = selectedTag.indexInParent();
    const value = wordsInput.getValueString().trim();
    selectedTag
      .setText(selectedIndex + 1 + ". " + value)
      .setAttribute("data", value);

    const allWords = value.split(" ");

    if (
      allWords.length > 0 &&
      !SLIP39_WORDS.has(allWords[0]) &&
      !tagContainer.getLastChild().equals(selectedTag)
    ) {
      selectedTag.replaceClass("is-light", "is-warning");
    }

    while (allWords.length > 0 && SLIP39_WORDS.has(allWords[0])) {
      selectedIndex = selectedTag.indexInParent();
      selectedTag.replaceClass("is-warning", "is-light");
      selectedTag.setText(selectedIndex + 1 + ". " + allWords[0]);
      selectedTag.setAttribute("data", allWords[0]);
      let emptyTagAdded = false;
      if (tagContainer.getLastChild().equals(selectedTag)) {
        if (
          tagContainer.getChildCount() <
          (shareDataLength || MAX_SHARE_DATA_LENGTH)
        ) {
          addTag();
          emptyTagAdded = true;
        }
      } else {
        selectTag(tagContainer.getChild(selectedIndex + 1));
      }

      allWords.shift();
      updateInput(tagContainer.getChildCount());
      if (!emptyTagAdded) {
        evaluateWords();
      }
    }

    progress.setValue(countValidWords());
  };

  doneButton.events().onclick = () => {
    removeAnyModals();
    const wordsString = wordsString2();

    const fakeEnvelope: SecretShareEnvelope = { ...baseEnvelope };
    fakeEnvelope.shareData = wordsString;
    fakeEnvelope.shareId = shareId.getValueString();
    for (let i = 0; i < baseEnvelope?.shareIds?.length || 0; ++i) {
      if (baseEnvelope.shareIds[i] === fakeEnvelope.shareId) {
        fakeEnvelope.thisSharesIndex = i;
        break;
      }
    }
    success(fakeEnvelope);
  };

  return modal;
};
