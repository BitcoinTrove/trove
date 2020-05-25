import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { TroveImages } from "../images/trove_images";

declare var localize: (enText: string) => string;

export const DIGITAL_SHARE = (
  <article class="message is-info">
    <div class="message-body">
      <table>
        <tbody>
          <tr>
            <td style="width: 200px; padding-right: 50px;">
              <img src={TroveImages.ShareEnvelope.src}></img>
            </td>
            <td>
              <p>
                {localize("Each digital share is an html file. It contains:")}
                <ul>
                  <li class="item">
                    {localize("The encryption data for the share.")}
                  </li>
                  <li class="item">
                    {localize(
                      "The UI and code for using the shares to access the bitcoin."
                    )}
                  </li>
                </ul>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
);

export const PAPER_SHARE = (
  <article class="message is-info">
    <div class="message-body">
      <table>
        <tbody>
          <tr>
            <td style="width: 200px; padding-right: 50px;">
              <img src={TroveImages.Paper.src}></img>
            </td>
            <td>
              <p>
                {localize("Each paper share contains:")}
                <ul>
                  <li class="item">{localize("The Slip39 share words.")}</li>
                </ul>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
);
