import { removeAnyModals } from "../../platform/util/modals";
import { IS_DEBUG, DEBUG_DISPLAY } from "../trove_constants";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import Slip39 from "slip39/src/slip39";
import { MiniWizard } from "../../platform/components/mini_wizard";
import { extendHtmlElement } from "../../platform/util/extended_html_element";
import { HtmlRef, htmlRefs, htmlRef } from "../../platform/util/html_ref";
import { SecretShareEnvelope } from "../types/secret_share_envelope";
import { Slip39WordInput, Slip39WordInputRef } from "./slip39_word_input";
import { compRef } from "../../platform/util/component_references";
import { randomOrder } from "../util/random";
import { newArray } from "../../platform/util/array";
import { getParameterByName } from "../../platform/util/query_params";

const FORCE_IN_ORDER =
  IS_DEBUG && getParameterByName("forceInOrder") === "true";
const SHARE_DATA_LENGTH = 33; // Number of Slip39 words

interface Slip39WordBoxItemRef {
  setWord: (word: string) => void;
  getWord: () => string;
}
export const Slip39WordBoxItem = ({
  slip39WordBoxItem,
  index,
  onSelect,
}: {
  slip39WordBoxItem: Slip39WordBoxItemRef;
  index: number;
  onSelect: (index: number, word: string) => void;
}) => {
  let word = "";
  slip39WordBoxItem.setWord = (newWord: string) => {
    word = newWord;
    item.setText(index + 1 + ". " + word);
  };
  slip39WordBoxItem.getWord = () => {
    return word;
  };
  const item = extendHtmlElement(
    <span
      class="tag is-light is-medium"
      onClick={(e) => {
        onSelect(index, word);
      }}
    ></span>
  );
  slip39WordBoxItem.setWord("");
  return item.asHtmlElement();
};

interface ProgressValues {
  value: number;
  max: number;
}

interface Slip39WordBoxRef {
  setWord: (word: string) => ProgressValues;
  getIndex: () => number;
  getWord: () => string;
  show: () => void;
  hide: () => void;
}

export const Slip39WordBox = ({
  slip39WordBox,
  onWordSelected,
  onAllWordsEntered,
}: {
  slip39WordBox: Slip39WordBoxRef;
  onWordSelected: (index: number, word: string) => void;
  onAllWordsEntered: (isValid: boolean, words: string) => void;
}) => {
  const container = htmlRef();
  const itemRefs = newArray(SHARE_DATA_LENGTH).map((e, i) => {
    return compRef<Slip39WordBoxItemRef>();
  });
  const order = FORCE_IN_ORDER
    ? newArray(SHARE_DATA_LENGTH)
    : randomOrder(SHARE_DATA_LENGTH);
  let index = order.shift();
  slip39WordBox.setWord = (word: string) => {
    const overwrite = !!itemRefs[index].getWord();
    itemRefs[index].setWord(word);
    if (!overwrite && order.length > 0) {
      index = order.shift();
    }
    const enteredWords = itemRefs
      .filter((itemRef) => !!itemRef.getWord())
      .map((itemRef) => itemRef.getWord());
    if (enteredWords.length === SHARE_DATA_LENGTH) {
      const enteredWordsString = enteredWords.join(" ");
      const isValid = Slip39.validateMnemonic(enteredWordsString);
      onAllWordsEntered(isValid, enteredWordsString);
    }
    return {
      value: enteredWords.length,
      max: SHARE_DATA_LENGTH,
    } as ProgressValues;
  };
  slip39WordBox.getIndex = () => {
    return index;
  };
  slip39WordBox.getWord = () => {
    return itemRefs[index].getWord();
  };
  slip39WordBox.show = () => {
    return container.show();
  };
  slip39WordBox.hide = () => {
    return container.hide();
  };
  return (
    <div
      ref={container}
      class="tags"
      style="margin: 16px; background-color: lightgrey; padding: 10px; border-radius: 5px; display: none;"
    >
      {itemRefs.map((itemRef, i) => {
        return (
          <Slip39WordBoxItem
            slip39WordBoxItem={itemRef}
            index={i}
            onSelect={(newIndex, word) => {
              index = newIndex;
              onWordSelected(newIndex, word);
            }}
          ></Slip39WordBoxItem>
        );
      })}
    </div>
  );
};

export const RecoverFromSlip39WordsModal = ({
  envelopes_not_found,
  envelopes_found,
  baseEnvelope,
  success,
  shareId,
  wordsInput,
}: {
  envelopes_not_found?: Set<string>;
  envelopes_found?: Set<string>;
  baseEnvelope?: SecretShareEnvelope;
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
            ? Array.from(envelopes_not_found).map((id) => (
                <span
                  class="link"
                  style="color: #209cee;"
                  onClick={(e) => {
                    shareId.setValue(id);
                    shareId.dispatchEvent(new Event("input"));
                  }}
                >
                  {id}
                </span>
              ))
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
            slip39WordInput.focusAndSelect();
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const [
    bodyContainer,
    instructions,
    progressElement,
    correctErrorsMessage,
    successMessage,
    errorMessage,
  ] = htmlRefs(6);
  wordsInput = wordsInput || htmlRef();
  const slip39WordInput = compRef<Slip39WordInputRef>();
  const slip39WordBox = compRef<Slip39WordBoxRef>();

  const step2 = (
    <div>
      <div ref={bodyContainer}>
        <article class="message" ref={instructions}>
          <div class="message-body">
            <p>
              Enter the Slip39 words which are written on the paper share. The
              words are requested in a random order. If you make a mistake,
              carry on. You will have an opportunity to fix any mistakes at the
              end.
            </p>
            <div
              style={{
                display: DEBUG_DISPLAY,
                color: "#209cee",
                border: "1px dashed #209cee",
              }}
            >
              <p>
                Debug: words are asked
                {FORCE_IN_ORDER
                  ? " in order (forceInOrder=true)"
                  : " in random order (default)"}
              </p>
              <p style={{ display: FORCE_IN_ORDER ? "none" : "" }}>
                You can enable in order using forceInOrder=true with debug mode.
              </p>
            </div>
          </div>
        </article>
        <div style="width: 300px; margin: auto;">
          <Slip39WordInput
            slip39WordInput={slip39WordInput}
            onWord={(word) => {
              const progress = slip39WordBox.setWord(word);
              slip39WordInput.setValue(
                slip39WordBox.getIndex(),
                slip39WordBox.getWord(),
                false
              );
              slip39WordInput.focusAndSelect();
              progressElement.setProgress(progress.value, progress.max);
            }}
          />
        </div>
        <progress
          ref={progressElement}
          class="progress is-success"
          style="width: 80%; margin: 16px auto;"
          value="0"
          max={SHARE_DATA_LENGTH}
        ></progress>
        <Slip39WordBox
          slip39WordBox={slip39WordBox}
          onWordSelected={(index, word) => {
            slip39WordInput.setValue(index, word, false);
            slip39WordInput.focusAndSelect();
          }}
          onAllWordsEntered={(isValid, wordsString) => {
            instructions.hide();
            progressElement.hide();
            if (!isValid) {
              doneButton.setDisabled(true);
              correctErrorsMessage.show();
              slip39WordBox.show();
            } else {
              slip39WordInput.hide();
              correctErrorsMessage.hide();
              slip39WordBox.hide();
              successMessage.show();
              doneButton.setDisabled(false);
              doneButton.events().onclick = () => {
                removeAnyModals();
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
            }
          }}
        ></Slip39WordBox>
        <article
          ref={correctErrorsMessage}
          class="message is-danger"
          style="display: none;"
        >
          <div class="message-body">
            <p>
              The entered words are invalid. Please check the words and correct
              any errors.
            </p>
          </div>
        </article>
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
  slip39WordInput.setValue(slip39WordBox.getIndex(), "");

  const wizard = baseEnvelope
    ? new MiniWizard(step1, step2)
    : new MiniWizard(step2);

  const [doneButton, closeButton, cancelButton] = htmlRefs(3);
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

  return modal;
};
