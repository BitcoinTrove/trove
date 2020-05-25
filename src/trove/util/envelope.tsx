import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { download } from "./files";
import { htmlRef } from "../../platform/util/html_ref";
import {
  IS_DEBUG,
  IS_DEV,
  serializeEnvelope,
  DocumentData,
  DEBUG_DISPLAY,
} from "../trove_constants";
import { showTextInModal, showJsxModal } from "../../platform/util/modals";
import { baseTemplate } from "../../platform/util/duplication";
import { sha256 } from "../../platform/util/checksum";
import { CreatePaperTemplate } from "../components/create_paper_template";
import { SecretShareEnvelope } from "../types/secret_share_envelope";

declare var localize: (enText: string) => string;

export const createHtmlFromEnvelope = (
  envelope: SecretShareEnvelope,
  slip39Password: string,
  downloadClicked: (filename: string) => void,
  paperClicked: (filename: string) => void
) => {
  const filename = envelope.shareNames[envelope.thisSharesIndex];
  const peekEnvelopeData = htmlRef();
  const progress = htmlRef();
  const downloadButton = htmlRef();
  const createPaperBackup = htmlRef();
  const envelopeHtml = (
    <tr>
      <td>{envelope.thisSharesIndex + 1}</td>
      <td>{envelope.custodian}</td>
      <td style="text-align: center;">
        <progress
          ref={progress}
          class="progress is-success"
          max="2"
          value="0"
          style="width: 50px; display: inline-block; background-color: transparent; border: 2px solid #777;"
        ></progress>
      </td>
      <td style={{ display: DEBUG_DISPLAY }}>
        <a
          ref={peekEnvelopeData}
          class="button is-link is-outlined"
          style="display: none; border-style: dashed;"
        >
          {localize("Peek envelope data")}
        </a>
      </td>
      <td>
        <div>
          <a
            ref={downloadButton}
            style="width: 100%;"
            class={"button " + (IS_DEV ? "is-danger" : "is-success")}
          >
            {IS_DEV ? "Save*" : localize("Save")}
          </a>
        </div>
      </td>
      <td>
        <div>
          <a
            ref={createPaperBackup}
            style="width: 100%;"
            class="button is-success"
          >
            {localize("Create")}
          </a>
        </div>
      </td>
    </tr>
  );

  if (IS_DEBUG) {
    peekEnvelopeData.show();
    peekEnvelopeData.events().onclick = () => {
      showTextInModal(localize("Envelope data"), serializeEnvelope(envelope));
    };
  }

  let downloadDone = false;
  let templateDone = false;

  const updateProgress = () => {
    let value = 0;
    value += downloadDone ? 1 : 0;
    value += templateDone ? 1 : 0;
    progress.setValue(value);
  };

  const documentData: DocumentData = {
    envelope: envelope,
  };
  const newHTML = baseTemplate(documentData);
  downloadButton.events().onclick = () => {
    download(newHTML, filename);
    downloadButton.removeClass("is-success", "is-danger");
    downloadDone = true;
    updateProgress();
    downloadClicked(filename);
  };

  createPaperBackup.events().onclick = async () => {
    const checksumValue: string = await sha256(baseTemplate());
    const hideCreatePaperBackup = showJsxModal(
      <CreatePaperTemplate
        envelope={envelope}
        checksumValue={checksumValue}
        slip39Password={slip39Password}
        onFinished={() => {
          templateDone = true;
          updateProgress();
          createPaperBackup.removeClass("is-success");
          paperClicked(filename);
          hideCreatePaperBackup();
        }}
      ></CreatePaperTemplate>
    );
  };

  return envelopeHtml;
};
