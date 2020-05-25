import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import {
  textAsCanvas,
  textAsCanvas2,
  addMargins,
  combineVertical,
} from "../../platform/util/canvas";
import { addressBookletPageIncorrectWidth } from "../util/address";
import { MasterSeed } from "../types/master_seed";

const createFrontPage = (
  referenceName: string,
  width: number,
  height: number
) => {
  const frontPageText1 = textAsCanvas2(
    "These are public addresses for",
    "16px monospace",
    16,
    width - 30 - 2 * 10
  );
  const frontPageText2 = addMargins(
    textAsCanvas(referenceName, "16px monospace", 16, width - 30 - 2 * 10),
    0,
    0,
    10,
    30
  );
  const frontPageText3 = textAsCanvas2(
    "Each address should only be used once. When you receive bitcoin to an address, tear it up and throw it away.",
    "16px monospace",
    16,
    width - 30 - 2 * 10
  );

  const frontPageText = combineVertical(
    frontPageText1,
    frontPageText2,
    frontPageText3
  );

  const topBottomMargin = (height - frontPageText.height) / 2;
  const frontPage = addMargins(
    frontPageText,
    30 + 10,
    10,
    topBottomMargin,
    topBottomMargin
  );
  return frontPage;
};

const createSecurityPage = (width: number, height: number) => {
  const securityPageText1 = textAsCanvas2(
    "Security notes",
    "16px bold monospace",
    16,
    width - 30 - 2 * 10
  );
  const securityPageText2 = textAsCanvas2(
    "1. If someone sees your addresses, they can see how much bitcoin you have in those addresses.",
    "16px monospace",
    16,
    width - 30 - 2 * 10
  );
  const securityPageText3 = textAsCanvas2(
    "2. If someone is able to swap these addresses with their own, you could be tricked into sending your bitcoin to them.",
    "16px monospace",
    16,
    width - 30 - 2 * 10
  );
  const securityPageText4 = textAsCanvas2(
    "3. If you search for your bitcoin address on a website or block explorer, your bitcoin address could be linked to your IP address.",
    "16px monospace",
    16,
    width - 30 - 2 * 10
  );

  const securityPageText = combineVertical(
    addMargins(securityPageText1, 0, 0, 0, 20),
    addMargins(securityPageText2, 0, 0, 0, 15),
    addMargins(securityPageText3, 0, 0, 0, 15),
    addMargins(securityPageText4, 0, 0, 0, 0)
  );

  const topBottomMargin = (height - securityPageText.height) / 2;
  const securityPage = addMargins(
    securityPageText,
    30 + 10,
    10,
    topBottomMargin,
    topBottomMargin
  );
  return securityPage;
};

export const AddressListTemplate = async ({
  masterSeed,
  indexStart,
  indexEnd,
  referenceName,
}: {
  masterSeed: MasterSeed;
  indexStart: number;
  indexEnd: number;
  referenceName: string;
}) => {
  let addresses: JSX.Element[] = [];
  let width = 0;
  let height = 0;
  for (var i = indexStart; i < indexEnd; ++i) {
    const addressCanvas = await addressBookletPageIncorrectWidth(
      masterSeed,
      i,
      indexEnd
    );
    addresses.push(
      <div style="text-align: center; border: 1px solid grey; display: inline-block; margin: 2px;">
        {addressCanvas}
      </div>
    );
    width = addressCanvas.width; // Kinda dumb, how this gets set every time
    height = addressCanvas.height; // Kinda dumb, how this gets set every time
  }

  const frontPage = createFrontPage(referenceName, width, height);
  const securityPage = createSecurityPage(width, height);
  addresses.splice(
    0,
    0,
    <div style="text-align: center; border: 1px solid grey; display: inline-block; margin: 2px;">
      {securityPage}
    </div>
  );
  addresses.splice(
    0,
    0,
    <div style="text-align: center; border: 1px solid grey; display: inline-block; margin: 2px;">
      {frontPage}
    </div>
  );
  return <div>{addresses}</div>;
};
