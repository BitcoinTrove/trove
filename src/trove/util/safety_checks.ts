import { WINDOW_CRYPTO } from "../trove_constants";

declare var localize: (enText: string) => string;

export interface SafetyCheck {
  isSuccess: boolean;
  successMessage: string;
  failureMessage: string;
  detail: string;
  isHardRequirement: boolean;
}

var isAnchorDownloadSupported = (function () {
  var link = document.createElement("a");
  var supported = "download" in link;
  return function () {
    return supported;
  };
})();

var isBigIntSupported = (function () {
  const anyWindow: any = window;
  return function () {
    return anyWindow.BigInt && !anyWindow.BigIntNotDefined;
  };
})();

const NO_INTERNET_CONNECTION: SafetyCheck = {
  isSuccess: !window.navigator.onLine,
  successMessage: localize("You are disconnected from the internet."),
  failureMessage: localize("You are connected to the internet"),
  detail: localize(
    "Trove should be used from an air-gapped computer. Malware on your computer may be able to steal your secret."
  ),
  isHardRequirement: false,
};

const LOAD_FROM_DISK: SafetyCheck = {
  isSuccess: window.location.protocol === "file:",
  successMessage: localize("File is loaded from local disk."),
  failureMessage: localize("File is not loaded from local disk."),
  detail: localize(
    "This file should be downloaded off the internet and opened on an air-gapped computer."
  ),
  isHardRequirement: false,
};

const STRONG_RNG: SafetyCheck = {
  isSuccess: !WINDOW_CRYPTO.cryptoNotDefined,
  successMessage: localize("Browser has strong random number generator."),
  failureMessage: localize(
    "Browser does not have a strong random number generator."
  ),
  detail: localize(
    "This may result in shares which do not properly hide your secret."
  ),
  isHardRequirement: true,
};

const REQUIRED_JS_AVAILABLE: SafetyCheck = {
  isSuccess: isAnchorDownloadSupported() && isBigIntSupported(),
  successMessage: localize("Browser supports required functionality."),
  failureMessage: localize("Browser is missing required functionality."),
  detail: localize("Trove requires specific JavaScript functionality."),
  isHardRequirement: true,
};

export const SAFETY_CHECKS: SafetyCheck[] = [
  NO_INTERNET_CONNECTION,
  LOAD_FROM_DISK,
  STRONG_RNG,
  REQUIRED_JS_AVAILABLE,
];

export const ALL_SAFETY_CHECKS_SUCCEEDED: boolean = (() => {
  let result: boolean = true;
  SAFETY_CHECKS.forEach((check) => {
    result = result && check.isSuccess;
  });
  return result;
})();

export const BROWSER_IS_SUPPORTED: boolean = (() => {
  let result: boolean = true;
  SAFETY_CHECKS.forEach((check) => {
    if (!check.isSuccess && check.isHardRequirement) {
      result = false;
    }
  });
  return result;
})();
