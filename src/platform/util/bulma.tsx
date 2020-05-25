import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { extendHtmlElement } from "./extended_html_element";

// TODO - Is this used? shouldn't this rather be a React component
export class Bulma {
  static message = (contents: string | JSX.Element) => {
    return extendHtmlElement(
      <article class="message">
        <div class="message-body">{contents}</div>
      </article>
    ).bulma();
  };
}
