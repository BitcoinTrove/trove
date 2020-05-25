import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { MasterSeed } from "../types/master_seed";
import { htmlRefs } from "../../platform/util/html_ref";
import { getAddress, addressAsCanvasSimple } from "../util/address";

export const PublicAddressMulti = ({
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
    const address = getAddress(
      masterSeed.getbip44Account0Index(currentIndex),
      masterSeed.getNetwork()
    );
    addressAsCanvasSimple(address, (error, canvas) => {
      canvas.style.border = "1px solid #12537e";
      canvas.style.borderRadius = "10px";
      canvasContainer.empty().appendChild(canvas);
      textContainer.setText(address);
      const number = currentIndex - indexStart + 1;
      const totalCount = indexEnd - indexStart;
      publicAddressNumber.setText(
        "~ Public address " + number + " of " + totalCount + " ~"
      );
      previous.showOrHide(currentIndex > 0);
      next.showOrHide(currentIndex < indexEnd - 1);
    });
  };
  const [
    canvasContainer,
    textContainer,
    publicAddressNumber,
    previous,
    next,
  ] = htmlRefs(5);
  const content = (
    <article class="message is-info">
      <div class="message-body">
        <div class="messageBodyHeading">
          <span ref={publicAddressNumber}></span>
        </div>
        <br></br>
        <table style="margin: auto;">
          <tr>
            <td ref={canvasContainer}></td>
            <td style="vertical-align: middle; padding-left: 16px;">
              <span>
                <strong>Public address (p2wpkh)</strong>
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
            class="button is-info is-outlined"
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
            class="button is-info is-outlined"
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
