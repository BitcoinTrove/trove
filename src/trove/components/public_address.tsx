import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { htmlRef } from "../../platform/util/html_ref";
import { addressAsCanvasSimple } from "../util/address";

export const PublicAddress = ({ address }: { address: string }) => {
  const canvasContainer = htmlRef();
  const content = (
    <article class="message is-info">
      <div class="message-body">
        <table style="margin: auto;">
          <tr>
            <td ref={canvasContainer}></td>
            <td style="vertical-align: middle; padding-left: 16px;">
              <span>
                <strong>Public address (p2wpkh)</strong>
              </span>
              <br></br>
              <span style="line-break: anywhere;">{address}</span>
            </td>
          </tr>
        </table>
      </div>
    </article>
  );

  addressAsCanvasSimple(address, (error, canvas) => {
    canvas.style.border = "1px solid #12537e";
    canvas.style.borderRadius = "10px";
    canvasContainer.empty().appendChild(canvas);
  });

  return content;
};
