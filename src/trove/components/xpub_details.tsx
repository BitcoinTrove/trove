import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { MasterSeed } from "../types/master_seed";
import { htmlRefs } from "../../platform/util/html_ref";
import { xpubAsCanvasSimple } from "../util/address";

export const XpubDetails = ({ masterSeed }: { masterSeed: MasterSeed }) => {
  const [canvasContainer] = htmlRefs(1);
  const content = (
    <article name="content" class="message is-info">
      <div class="message-body">
        <table style="margin: auto;">
          <tr>
            <td name="canvasContainer"></td>
            <td style="vertical-align: middle; padding-left: 16px; max-width: 360px;">
              <span>
                <strong>Xpub (BIP 44, Account0)</strong>
              </span>
              <br></br>
              <span style="line-break: anywhere;">
                {masterSeed.getBip44Account0Xpub()}
              </span>
              <br></br>
              <br></br>
              <span>
                <strong>BIP32 derivation path</strong>
              </span>
              <br></br>
              <span style="line-break: anywhere;">
                m/44'/0'/0'/0/0 (BIP44 compatible)
              </span>
            </td>
          </tr>
        </table>
      </div>
    </article>
  );

  xpubAsCanvasSimple(masterSeed.getBip44Account0Xpub(), (error, canvas) => {
    canvas.style.border = "1px solid #12537e";
    canvas.style.borderRadius = "10px";
    canvasContainer.empty().appendChild(canvas);
  });

  return content;
};
