import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { SecretShareEnvelope } from "../types/secret_share_envelope";
import { serializeEnvelope } from "../trove_constants";
import { htmlRef } from "../../platform/util/html_ref";
import { copyTextToClipboard } from "../../platform/util/clipboard";

declare var localize: (enText: string) => string;

export const EnvelopeDataDebug = ({
  envelope,
  password,
}: {
  envelope: SecretShareEnvelope;
  password?: string;
}) => {
  const envelopeData = serializeEnvelope(envelope);

  const copyEnvelopeData = htmlRef();
  const copySlip39Words = htmlRef();
  const copySlip39Password = htmlRef();

  return (
    <div>
      <pre style="white-space: pre-wrap; padding: 10px;">{envelopeData}</pre>
      <div>
        <span>
          <strong>Copy to clipboard: </strong>
        </span>
        <br></br>
        <button
          ref={copyEnvelopeData}
          class="button is-info is-outlined"
          onClick={(e) => {
            copyTextToClipboard(envelopeData, copyEnvelopeData);
          }}
        >
          Envelope data
        </button>
        <button
          ref={copySlip39Words}
          class="button is-info is-outlined"
          style="margin-left: 4px;"
          onClick={(e) => {
            copyTextToClipboard(envelope.shareData, copySlip39Words);
          }}
        >
          Slip39 words
        </button>
        <button
          ref={copySlip39Password}
          class="button is-info is-outlined"
          style={{
            display: password ? "" : "none",
            "margin-left": "4px",
          }}
          onClick={(e) => {
            copyTextToClipboard(password, copySlip39Password);
          }}
        >
          Slip39 password
        </button>
      </div>
      <div>
        <span>
          <strong>Dev server link</strong>
        </span>
        <br></br>
        <a href={"http://localhost:1234?data=" + envelopeData}>
          {"http://localhost:1234?data=<...>"}
        </a>
      </div>
    </div>
  );
};
