import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { DEBUG_DISPLAY } from "../trove_constants";
import { MasterSeed } from "../types/master_seed";
import { htmlRefs } from "../../platform/util/html_ref";
import { textAsCanvasSimple } from "../util/address";

export const PrivateKeyWifMulti = ({
  masterSeed,
  indexStart,
  indexEnd,
}: {
  masterSeed: MasterSeed;
  indexStart: number;
  indexEnd: number;
}) => {
  let currentIndex = indexStart;
  const update = () => {
    const keyPair = masterSeed.getbip44Account0Index(currentIndex);
    textAsCanvasSimple(keyPair.toWIF(), (error, canvas) => {
      canvas.style.border = "1px solid #12537e";
      canvas.style.borderRadius = "10px";
      canvasContainer.empty().appendChild(canvas);
      textContainer.setText(keyPair.toWIF());
      index.setText(currentIndex + "");
      const number = currentIndex - indexStart + 1;
      const totalCount = indexEnd - indexStart;
      privateKeyNumber.setText(
        "~ Private key " + number + " of " + totalCount + " ~"
      );
      previous.showOrHide(currentIndex > 0);
      next.showOrHide(currentIndex < indexEnd - 1);
    });
  };
  const [
    canvasContainer,
    textContainer,
    index,
    privateKeyNumber,
    previous,
    next,
  ] = htmlRefs(6);
  const content = (
    <article class="message is-success">
      <div class="message-body">
        <div class="messageBodyHeading">
          <span ref={privateKeyNumber}></span>
        </div>
        <table style="margin: auto;">
          <tr>
            <td ref={canvasContainer}></td>
            <td style="vertical-align: middle; padding-left: 16px;">
              <div
                style={{
                  border: "1px dashed #209cee",
                  color: "#209cee",
                  display: DEBUG_DISPLAY,
                }}
              >
                <span>
                  <strong>Derivation index</strong>
                </span>
                <br></br>
                <span ref={index}></span>
                <br></br>
                <br></br>
              </div>
              <span>
                <strong>Wallet import format (WIF)</strong>
              </span>
              <br></br>
              <span ref={textContainer} style="line-break: anywhere;"></span>
            </td>
          </tr>
        </table>
        <br></br>
        <div style="display: flex;">
          <button
            ref={previous}
            class="button is-success is-outlined"
            style="margin-right: auto;"
            onClick={(e) => {
              currentIndex--;
              update();
            }}
          >
            Previous
          </button>
          <button
            ref={next}
            class="button is-success is-outlined"
            style="margin-left: auto;"
            onClick={(e) => {
              currentIndex++;
              update();
            }}
          >
            Next
          </button>
        </div>
      </div>
    </article>
  );
  update();

  return content;
};
