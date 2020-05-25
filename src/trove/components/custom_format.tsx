import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { MasterSeed, DEFAULT_FORMAT } from "../types/master_seed";
import { htmlRefs } from "../../platform/util/html_ref";

export const CustomFormat = ({
  masterSeed,
  walletName,
  indexStart,
  indexEnd,
}: {
  masterSeed: MasterSeed;
  walletName: string;
  indexStart: number;
  indexEnd: number;
}) => {
  const update = () => {
    masterSeed.deriveBulkFormatted(
      input.getValueString(),
      indexStart,
      indexEnd,
      walletName,
      {
        update: (done: number, totalNumber: number) => {},
        cancelled: () => {},
        finished: (fullText: string) => {
          textarea.setValue(fullText);
        },
      }
    );
  };

  const [input, textarea] = htmlRefs(2);
  const content = (
    <div name="content">
      <input
        ref={input}
        class="input is-info"
        type="text"
        value={DEFAULT_FORMAT}
        onInput={update}
      ></input>
      <textarea
        ref={textarea}
        class="textarea is-info"
        style="white-space: pre;"
        readOnly={true}
      ></textarea>
    </div>
  );

  update();

  return content;
};
