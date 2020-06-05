import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { Screen } from "../../platform/components/screen";
import { IS_DEV } from "../trove_constants";
import { createTroveClean } from "../../platform/util/duplication";
import { FilterTable } from "../../platform/components/filter_table";
import { FILENAME } from "../../shared/constants";
import { download } from "../util/files";
import { PublicAddress2 } from "../components/public_address";
import { DONATE_ADDRESS } from "../util/donation";
import { BulmaLevel } from "../../platform/components/bulma_level";
import { htmlRef } from "../../platform/util/html_ref";
import { copyTextToClipboard } from "../../platform/util/clipboard";
import { DOCUMENT_DATA } from "../types/document_data";
import { TROVE_VERSION } from "../util/version";

export class VersionInfoPage extends Screen {
  constructor(home: Screen) {
    super("VersionInfo", "Version Info");

    const dataSource = DOCUMENT_DATA.dependencies || {};
    const data = Object.keys(dataSource).map((packageName) => {
      return [packageName, dataSource[packageName]];
    });
    const copyToClipboard = htmlRef();
    this.setContent(
      <div class="screen">
        <div style="max-width: 700px; margin: 30px auto;">
          <div>
            <span style="font-size: 32px;">Version Info</span>
            <button
              style="float: right;"
              class="button"
              onClick={(e) => {
                home.show();
              }}
            >
              Back home
            </button>
          </div>
          <br></br>
          <div>
            <span>
              <strong>Trove Version:</strong>
            </span>
            <br></br>
            <span>{TROVE_VERSION}</span>
            <br></br>
            <span
              class="link"
              onClick={(e) => {
                download(createTroveClean(), FILENAME);
              }}
            >
              {window.location.protocol === "file:"
                ? "Create a copy"
                : "Save for offline usage"}
            </span>
          </div>
          <br></br>
          <span>
            <strong>Verification:</strong>
          </span>
          <div style="margin-left: 35px;">
            <ol>
              <li>
                Trove should always be downloaded from{" "}
                <a
                  target="_blank"
                  href="https://bitcointrove.github.io/trove.html"
                >
                  https://bitcointrove.github.io/trove.html
                </a>
              </li>
              <li>
                The signature can be downloaded from{" "}
                <a
                  target="_blank"
                  href="https://bitcointrove.github.io/trove.html.sig"
                >
                  https://bitcointrove.github.io/trove.html.sig
                </a>
              </li>
              <li>
                The file can be verified with{" "}
                <code>gpg --verify trove.html.sig trove.html</code>
              </li>
              <li>
                The Trove public key can be downloaded from{" "}
                <a
                  target="_blank"
                  href="https://bitcointrove.github.io/trove.pub"
                >
                  https://bitcointrove.github.io/trove.pub
                </a>
              </li>
              <li>
                Trove is open timestamped{" "}
                <a
                  target="_blank"
                  href="https://bitcointrove.github.io/trove.ots"
                >
                  https://bitcointrove.github.io/trove.ots
                </a>
              </li>
            </ol>
          </div>
          <br></br>
          <br></br>
          <span>
            <strong>Support Trove:</strong>
          </span>
          <article class="message is-info">
            <div class="message-body">
              <BulmaLevel
                levelItems={[
                  <PublicAddress2 address={DONATE_ADDRESS} />,
                  <div style="text-align: center;">
                    <span>
                      <strong>Public Address</strong>
                    </span>
                    <br></br>
                    <span>{DONATE_ADDRESS}</span>
                    <br></br>
                    <br></br>
                    <button
                      ref={copyToClipboard}
                      class="button is-outlined is-info"
                      onClick={(e) => {
                        copyTextToClipboard(DONATE_ADDRESS, copyToClipboard);
                      }}
                    >
                      Copy to clipboard
                    </button>
                  </div>,
                ]}
              />
            </div>
          </article>
          <br></br>
          <span>
            <strong>Contact:</strong>
          </span>
          <br></br>
          <div style="margin: 6px;">
            <p>Found a bug? Got a feature request? or a question?</p>
            <p>
              Send an email to{" "}
              <a href="mailto:bitcoin_trove@protonmail.com">
                bitcoin_trove@protonmail.com
              </a>
            </p>
          </div>
          <br></br>
          <span>
            <strong>Dependencies:</strong>
          </span>
          <br></br>
          <br></br>
          {!IS_DEV ? (
            <FilterTable
              headers={[<span>Package name</span>, <span>Version</span>]}
              data={data}
            ></FilterTable>
          ) : (
            <article class="message is-info">
              <div class="message-body">
                Dependencies are only available for release builds. This is a
                development build.
              </div>
            </article>
          )}
          <br></br>
          <br></br>
          <br></br>
          <button
            class="button"
            onClick={(e) => {
              home.show();
            }}
          >
            Back home
          </button>
        </div>
      </div>
    );
  }
}
