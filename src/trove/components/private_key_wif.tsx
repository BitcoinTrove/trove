import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { ECPairInterface, BIP32Interface } from "bitcoinjs-lib";

import { htmlRefs } from "../../platform/util/html_ref";
import { textAsCanvasSimple } from "../util/address";

export const PrivateKeyWif = ({
  keyPair,
}: {
  keyPair: ECPairInterface | BIP32Interface;
}) => {
  const [canvasContainer] = htmlRefs(1);
  const content = (
    <article class="message is-success">
      <div class="message-body">
        <table style="margin: auto;">
          <tr>
            <td ref={canvasContainer}></td>
            <td style="vertical-align: middle; padding-left: 16px;">
              <span>
                <strong>Wallet import format (WIF)</strong>
              </span>
              <br></br>
              <span style="line-break: anywhere;">{keyPair.toWIF()}</span>
            </td>
          </tr>
        </table>
      </div>
    </article>
  );
  textAsCanvasSimple(keyPair.toWIF(), (error, canvas) => {
    canvas.style.border = "1px solid #12537e";
    canvas.style.borderRadius = "10px";
    canvasContainer.empty().appendChild(canvas);
  });

  return content;
};
