import * as React from "jsx-dom"; // Fake React for JSX->DOM support

import { removeAnyModals } from "../../platform/util/modals";
import { MasterSeed, DEFAULT_FORMAT } from "../types/master_seed";
import { htmlRefs } from "../../platform/util/html_ref";
import { download } from "../util/files";

export const DeriveAddresses = ({
  masterSeed,
  walletName,
}: {
  masterSeed: MasterSeed;
  walletName: string;
}) => {
  removeAnyModals();

  let cancelDerivation: () => void = null;

  const [
    fromNumber,
    toNumber,
    format,
    textarea,
    progress,
    deriveButton,
    cancelButton,
  ] = htmlRefs(7);

  const modal = (
    <div style="text-align: center;">
      <table style="width: 100%;">
        <tbody>
          <tr>
            <th>From index</th>
            <th>To index</th>
            <th>Format</th>
            <th></th>
          </tr>
          <tr>
            <td style="width: 120px;">
              <input
                ref={fromNumber}
                class="input"
                type="number"
                value="0"
                min="0"
                placeholder="From index"
              ></input>
            </td>
            <td style="width: 120px;">
              <input
                ref={toNumber}
                class="input"
                type="number"
                value="1000"
                min="0"
                placeholder="To index"
              ></input>
            </td>
            <td>
              <input
                ref={format}
                class="input"
                type="text"
                value={DEFAULT_FORMAT}
              ></input>
            </td>
            <td style="text-align: center;">
              <button
                ref={deriveButton}
                class="button is-info is-outlined"
                onClick={(e) => {
                  deriveButton.hide();
                  cancelButton.show();
                  textarea.setValue("").parent().hide();
                  progress.show().setValue(0);

                  cancelDerivation = masterSeed.deriveBulkFormatted(
                    format.getValueString(),
                    fromNumber.getValueNumber(),
                    toNumber.getValueNumber(),
                    walletName,
                    {
                      update: (done: number, totalNumber: number) => {
                        progress.setProgress(done, totalNumber);
                      },
                      cancelled: () => {
                        deriveButton.show();
                        textarea.parent().hide();
                        progress.hide();
                      },
                      finished: (fullText: string) => {
                        textarea.setValue(fullText).parent().show();
                        progress.hide();
                        deriveButton.show();
                        cancelButton.hide();
                      },
                    }
                  );
                }}
              >
                Derive
              </button>
              <button
                ref={cancelButton}
                class="button is-danger is-outlined"
                style="display: none;"
                onClick={(e) => {
                  cancelButton.hide();
                  cancelDerivation();
                }}
              >
                Cancel
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <progress
        ref={progress}
        class="progress is-success"
        value="0"
        max="0"
        style="width: 80%; margin: 10px auto; display: none;"
      ></progress>
      <div style="max-height: 600px; overflow-y: scroll; display: none;">
        <textarea
          ref={textarea}
          class="textarea"
          style="white-space: pre; height: 200px; margin: 8px 0;"
        ></textarea>
        <button
          class="button is-info is-outlined"
          onClick={(e) => {
            download(textarea.getValueString(), "output.txt");
          }}
        >
          Save as file
        </button>
      </div>
    </div>
  );

  return modal;
};
