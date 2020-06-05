import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { SecretShareEnvelope } from "../types/secret_share_envelope";
import { TROVE_VERSION } from "../util/version";

// This might not be used anymore
export const ShareId = ({ shareId }: { shareId: string }) => {
  const shareIdBoxes = [];
  for (let i = 0; i < shareId.length; ++i) {
    shareIdBoxes.push(
      <div style="display: inline-block; border: 1px solid black; margin: 6px; width: 3em; height: 3em; text-align: center;">
        <span></span>
      </div>
    );
  }
  return <div>{shareIdBoxes}</div>;
};

export const PaperTemplate = ({
  envelope,
}: {
  envelope: SecretShareEnvelope;
}) => {
  return (
    <div class="paperTemplate">
      <h1>Software</h1>
      <div>
        <span>https://bitcointrove.github.io/</span>
      </div>
      <br></br>
      <h1>Version</h1>
      <div>
        <span>{TROVE_VERSION}</span>
      </div>
      <br></br>
      <h1>Reference Name</h1>
      <div>
        <span>{envelope.referenceName}</span>
      </div>
      <br></br>
      <div class="templateDetailDiv">
        <h1>Share ID</h1>
        <div>
          <span>{envelope.shareId}</span>
        </div>
      </div>
      <div class="templateDetailDiv">
        <h1>Creation Date</h1>
        <div>
          <span>{envelope.creationDate}</span>
        </div>
      </div>
      <div class="templateDetailDiv">
        <h1>Threshold</h1>
        <div>
          <span>
            {envelope.numberOfRequiredShares} of {envelope.numberOfShares}
          </span>
        </div>
      </div>
      <div class="templateDetailDiv">
        <h1>Address Strategy</h1>
        <div>
          <span>{envelope.addressStrategy}</span>
        </div>
      </div>
      <div class="templateDetailDiv">
        <h1>Network</h1>
        <div>
          <span>{envelope.network}</span>
        </div>
      </div>
      <div class="templateDetailDiv">
        <h1>Derivation path</h1>
        <div>
          <span>BIP44 m/44'/0'/0'/0/index</span>
        </div>
      </div>
      <div class="templateDetailDiv">
        <h1>Password encrypted</h1>
        <div>
          <span>{envelope.slip39PasswordHash ? "Yes" : "No"}</span>
        </div>
      </div>
      {envelope.slip39PasswordHash ? (
        <div class="templateDetailDiv">
          <h1>Password</h1>
          <div>
            <span style="display: inline-block; color: transparent; min-width: 120px; border-bottom: 1px solid black;">
              Mpqlh
            </span>
          </div>
        </div>
      ) : null}
      <br></br>
      <br></br>
      <h1>Share Message</h1>
      <div>
        <span>{envelope.message}</span>
      </div>
      <br></br>
      <h1>Slip39 Words</h1>
      <div>
        {envelope.shareData.split(" ").map((word, index) => (
          <div style="display: inline-block; line-height: 30px;">
            <div style="display: inline-block; padding-left: 8px; width: 24px; text-align: right;">
              {index + 1 + "."}
            </div>
            <div style="display: inline-block;">
              <div style="margin: 5px; display: inline-block; color: transparent; min-width: 100px; border-bottom: 1px solid black;">
                Mpqlh
              </div>
            </div>
          </div>
        ))}
      </div>
      <br></br>
      <h1>Reveal message</h1>
      <div>
        <span>
          The reveal message is not available on the paper backup. At least 1
          digital share needs to be used to see the reveal message.
        </span>
      </div>
    </div>
  );
};
