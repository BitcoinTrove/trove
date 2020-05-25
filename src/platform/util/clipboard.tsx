import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { buttonSuccessAnimation } from "./effects";
import {
  ExtendedHtmlElement,
  extendHtmlElement,
} from "./extended_html_element";

export const copyTextToClipboard = (
  text: string,
  button: ExtendedHtmlElement
) => {
  const hiddenInput = extendHtmlElement(
    <textarea style="height: 0px; width: 0px;" name="hiddenInput" type="text">
      {text}
    </textarea>
  );
  document.body.appendChild(hiddenInput.asHtmlElement());

  hiddenInput.focus().select();

  const successful = document.execCommand("copy");
  buttonSuccessAnimation(button, successful);
  setTimeout(() => {
    hiddenInput.remove();
  }, 200);
};
