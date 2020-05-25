import * as React from "jsx-dom"; // Fake React for JSX->DOM support

import { htmlRef } from "../../platform/util/html_ref";
import {
  showElements,
  hideElements,
} from "../../platform/util/extended_html_element";

declare var localize: (enText: string) => string;

export type RevealMessageRef = {
  setRevealMessage: (revealMessage: string) => void;
  hide: () => void;
};
export const RevealMessage = ({
  revealMessage,
  onFinished,
}: {
  revealMessage: RevealMessageRef;
  onFinished: () => void;
}) => {
  const container = htmlRef();
  const revealMessageBlurb = htmlRef();
  const showMessageButton = htmlRef();
  const revealMessagePre = htmlRef();
  const messageReadCheckbox = htmlRef();
  const showCredentialsButton = htmlRef();

  revealMessage.setRevealMessage = (text: string) => {
    revealMessagePre.setText(text);
  };
  revealMessage.hide = () => {
    container.hide();
  };

  return (
    <article ref={container} class="message">
      <div class="message-body">
        <div class="messageBodyHeading">
          <span>~ {localize("Reveal message")} ~</span>
        </div>
        <div ref={revealMessageBlurb}>
          <p
            innerHTML={localize(
              "The <strong>reveal message</strong> is decrypted at the same time that the private key is accessed. Please take a moment to read the reveal message before accessing the private key."
            )}
          ></p>
        </div>
        <div>
          <pre
            ref={revealMessagePre}
            style="white-space: pre-wrap; padding: 10px; display: none; margin-bottom: 16px;"
          ></pre>
        </div>
        <div style="text-align: center;">
          <button
            ref={showMessageButton}
            class="button is-outlined"
            onClick={(e) => {
              showElements(
                revealMessagePre,
                messageReadCheckbox.parent(),
                showCredentialsButton
              );
              hideElements(showMessageButton);
            }}
          >
            {localize("Show Message")}
          </button>
          <div class="field" style="display: none;">
            <input
              class="is-checkradio is-info"
              id="messageReadCheckbox"
              type="checkbox"
              ref={messageReadCheckbox}
              onChange={(e) => {
                showCredentialsButton.setDisabled(
                  !messageReadCheckbox.isChecked()
                );
              }}
            ></input>
            <label htmlFor="messageReadCheckbox">
              {localize("I have read the reveal message.")}
            </label>
          </div>
          <button
            ref={showCredentialsButton}
            class="button is-outlined"
            style="display: none;"
            disabled={true}
            onClick={(e) => {
              hideElements(
                revealMessageBlurb,
                messageReadCheckbox.parent(),
                showCredentialsButton
              );
              onFinished();
            }}
          >
            {localize("Show private key")}
          </button>
        </div>
      </div>
    </article>
  );
};
