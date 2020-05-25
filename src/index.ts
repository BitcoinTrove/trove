import "babel-polyfill";

const anyWindow: any = window;

if (!anyWindow.BigInt) {
  // BigInt is created so that some of the libraries don't fall over on startup
  anyWindow.BigInt = () => {};
  // This is a marker, so that we know that the browser is actually missing BigInt
  // It is used in the safety/security checks
  anyWindow.BigIntNotDefined = true;
}

import { mount } from "redom";
import "bulma-steps/dist/css/bulma-steps.min.css";
import "bulma-checkradio/dist/css/bulma-checkradio.min.css";
import { Home } from "./trove/screens/home";
import { JoinHomeScreen } from "./trove/screens/join_home_page";
import {
  deserializeEnvelope,
  IS_DEBUG,
  DOCUMENT_DATA,
} from "./trove/trove_constants";
import { getParameterByName, hasParameter } from "./platform/util/query_params";
import { AccessBitcoinFastForward } from "./trove/wizards/access_bitcoin/access_bitcoin_wizard";
import { VerifyMessage } from "./trove/screens/verify_message"; // disabled in favor of PGP
import { canonicalize } from "json-canonicalize";
import { AddressPage } from "./trove/screens/address_page";
import { VerifyFile } from "./trove/screens/verify_file"; // disabled in favor of PGP
import { TroveImages } from "./trove/images/trove_images";
import { SecretShareEnvelope } from "./trove/types/secret_share_envelope";
import { networkFromString } from "./trove/util/network";
import { MasterSeed } from "./trove/types/master_seed";

document.title = "Trove";

const link = document.createElement("link");
link.type = "image/x-icon";
link.rel = "shortcut icon";
link.href = TroveImages.Favicon.src;
document.getElementsByTagName("head")[0].appendChild(link);

const getDocumentEnvelope = (): SecretShareEnvelope | undefined => {
  const paramEnvelopeData: string = getParameterByName("data");
  if (paramEnvelopeData) {
    return deserializeEnvelope(paramEnvelopeData);
  }
  return DOCUMENT_DATA.envelope;
};

const DOCUMENT_ENVELOPE:
  | SecretShareEnvelope
  | undefined = getDocumentEnvelope();

if (IS_DEBUG && DOCUMENT_ENVELOPE && console && console.log) {
  console.log(canonicalize(DOCUMENT_ENVELOPE));
  console.log(DOCUMENT_ENVELOPE);
}

const networkString = hasParameter("network")
  ? getParameterByName("network")
  : "testnet";
const network = networkFromString(networkString);
const masterSeed = MasterSeed.fromHex(
  getParameterByName("masterSeed"),
  network
);

// For firefox
/* Disabled in favor of PGP
window.onhashchange = () => {
  if (location.hash === "#VerifyMessage") {
    const screen = new VerifyMessage();
    mount(document.body, screen);
    screen.show();
  } else if (location.hash === "#VerifyFile") {
    const screen = new VerifyFile();
    mount(document.body, screen);
    screen.show();
  }
};*/

const addressGenerator = DOCUMENT_DATA.addressGenerator;
if (addressGenerator) {
  const addressPage: AddressPage = new AddressPage(addressGenerator);
  mount(document.body, addressPage);
  addressPage.show();
} /* Disabled in favor of PGP
  else if (location.hash === "#VerifyMessage") {
  const screen = new VerifyMessage();
  mount(document.body, screen);
  screen.show();
} else if (
  location.hash === "#VerifyFile"
) {
  const screen = new VerifyFile();
  mount(document.body, screen);
  screen.show();
} */ else if (
  masterSeed &&
  (IS_DEBUG ||
    getParameterByName(
      "debug"
    )) /* Any debug value needs to be set, even false */
) {
  let wizardState = {};
  wizardState["masterSeed"] = masterSeed;
  const wiz = new AccessBitcoinFastForward(new Home(), wizardState);
  mount(document.body, wiz);
  wiz.show();
} else if (!DOCUMENT_ENVELOPE) {
  const home: Home = new Home();
  mount(document.body, home);
  home.show();
} else {
  const joinHomeScreen: JoinHomeScreen = new JoinHomeScreen(DOCUMENT_ENVELOPE);
  mount(document.body, joinHomeScreen);
  joinHomeScreen.show();
}
