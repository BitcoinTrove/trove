import { Screen } from "../../platform/components/screen";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import * as bitcoinMessage from "bitcoinjs-message";
import { SIGNING_ADDRESS } from "../util/donation";
import { htmlRefs } from "../../platform/util/html_ref";

// This is currently not used, in favor of PGP signing
export class VerifyMessage extends Screen {
  constructor() {
    const update = () => {
      let isValid = false;
      try {
        isValid = bitcoinMessage.verify(
          message.getValueString(),
          SIGNING_ADDRESS,
          signature.getValueString()
        );
      } catch {
        // nothing
      }
      const forceHide =
        !message.getValueString() || !signature.getValueString();
      valid.showOrHide(!forceHide && isValid);
      invalid.showOrHide(!forceHide && !isValid);
    };

    const [message, signature, invalid, valid] = htmlRefs(4);
    const screen = (
      <div name="screen" class="screen">
        <div style="margin: 20px auto; max-width: 700px;">
          <div class="field">
            <label class="label">Message that was signed</label>
            <div class="control">
              <textarea
                name="message"
                class="textarea is-info"
                placeholder="Message that was signed"
                onInput={(e) => {
                  update();
                }}
              ></textarea>
            </div>
          </div>
          <div class="field">
            <label class="label">Signature to verify</label>
            <div class="control">
              <textarea
                name="signature"
                class="textarea is-info"
                placeholder="Signature to verify"
                onInput={(e) => {
                  update();
                }}
              ></textarea>
            </div>
          </div>
          <div style="text-align: center;">
            <article
              name="invalid"
              class="message is-danger"
              style="display: none;"
            >
              <div class="message-body">Signature is invalid</div>
            </article>
            <article
              name="valid"
              class="message is-success"
              style="display: none;"
            >
              <div class="message-body">Signature is valid</div>
            </article>
          </div>
        </div>
      </div>
    );

    super("VerifyMessage", "Verify message");
    this.setContent(screen);
  }
}
