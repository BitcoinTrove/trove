import * as React from "jsx-dom"; // Fake React for JSX->DOM support

import { htmlRef } from "../../platform/util/html_ref";
import { IS_DEV, walletNameFromEnvelope } from "../trove_constants";
import { showJsxInModal } from "../../platform/util/modals";
import { ViewAdditionalDetailsMulti } from "./view_additional_details_multi";
import { PublicAddressMulti } from "./public_address_multi";
import { XpubDetails } from "./xpub_details";
import { CustomFormat } from "./custom_format";
import { ViewAdditionalDetails } from "./view_additional_details";
import { DeriveSingleAddress } from "./derive_single_address";
import { DeriveAddresses } from "./derive_addresses";
import { SecurityConfig } from "../types/security_config";
import { ValueRef } from "../../platform/util/value_ref";

declare var localize: (enText: string) => string;

export const Other = ({
  securityConfig,
}: {
  securityConfig: ValueRef<SecurityConfig>;
}) => {
  const viewDetails = htmlRef();
  const viewDetailsMulti = htmlRef();
  const viewAddresses = htmlRef();
  const viewXpub = htmlRef();
  const customFormat = htmlRef();
  const deriveAddress = htmlRef();
  const bulkDeriveAddresses = htmlRef();

  let masterSeed = null;
  let addressStrategy = null;
  let baseEnvelope = null;

  securityConfig.onChange((fullConfig) => {
    masterSeed = fullConfig.masterSeed;
    addressStrategy = fullConfig.addressStrategy;
    baseEnvelope = fullConfig.baseEnvelope;

    viewDetails.showOrHide(addressStrategy.isSingle());
    viewDetailsMulti.showOrHide(addressStrategy.isMultiple());
    viewAddresses.showOrHide(addressStrategy.isMultiple());
    viewXpub.showOrHide(addressStrategy.isMultiple());
    customFormat.showOrHide(addressStrategy.isMultiple());
    deriveAddress.showOrHide(addressStrategy.isMultiple() && IS_DEV);
    bulkDeriveAddresses.showOrHide(addressStrategy.isMultiple() && IS_DEV);
  });

  return (
    <table style="margin: auto;">
      <tr ref={viewDetailsMulti}>
        <td>
          <button
            class="button is-info is-outlined"
            style="width: 100%; margin: 8px 0;"
            onClick={(e) => {
              if (!masterSeed) {
                // Show dialog asking to fix masterSeed
                // Same for other buttons too
                return;
              }
              showJsxInModal(
                "View details",
                <ViewAdditionalDetailsMulti
                  masterSeed={masterSeed}
                  addressStrategy={addressStrategy.getStrategyName()}
                  creationDate={baseEnvelope?.creationDate || "<none/unknown>"}
                  startIndex={0}
                  endIndex={addressStrategy.getAddressCount()}
                />,
                true
              );
            }}
          >
            {localize("View Details")}
          </button>
        </td>
      </tr>
      <tr ref={viewAddresses}>
        <td>
          <button
            class="button is-info is-outlined"
            style="width: 100%; margin: 8px 0;"
            onClick={(e) => {
              if (!masterSeed) {
                // Show dialog asking to fix masterSeed
                // Same for other buttons too
                return;
              }
              showJsxInModal(
                localize("View addresses"),
                <PublicAddressMulti
                  masterSeed={masterSeed}
                  indexStart={0}
                  indexEnd={addressStrategy.getAddressCount()}
                />,
                true
              );
            }}
          >
            {localize("View addresses")}
          </button>
        </td>
      </tr>
      <tr ref={viewXpub}>
        <td>
          <button
            class="button is-info is-outlined"
            style="width: 100%; margin: 8px 0;"
            onClick={(e) => {
              if (!masterSeed) {
                // Show dialog asking to fix masterSeed
                // Same for other buttons too
                return;
              }
              showJsxInModal(
                "Xpub",
                <XpubDetails masterSeed={masterSeed} />,
                true
              );
            }}
          >
            {localize("View Xpub")}
          </button>
        </td>
      </tr>
      <tr ref={customFormat}>
        <td>
          <button
            class="button is-info is-outlined"
            style="width: 100%; margin: 8px 0;"
            onClick={(e) => {
              if (!masterSeed) {
                // Show dialog asking to fix masterSeed
                // Same for other buttons too
                return;
              }
              showJsxInModal(
                "Custom format",
                <CustomFormat
                  masterSeed={masterSeed}
                  walletName={walletNameFromEnvelope(baseEnvelope)}
                  indexStart={0}
                  indexEnd={addressStrategy.getAddressCount()}
                />,
                true
              );
            }}
          >
            {localize("Custom format")}
          </button>
        </td>
      </tr>
      <tr ref={viewDetails}>
        <td>
          <button
            class="button is-info is-outlined"
            style="width: 100%; margin: 8px 0;"
            onClick={(e) => {
              if (!masterSeed) {
                // Show dialog asking to fix masterSeed
                // Same for other buttons too
                return;
              }
              showJsxInModal(
                "View details",
                <ViewAdditionalDetails
                  masterSeed={masterSeed}
                  addressStrategy={addressStrategy.getStrategyName()}
                  creationDate={baseEnvelope?.creationDate || "<none/unknown>"}
                />,
                true
              );
            }}
          >
            {localize("View details")}
          </button>
        </td>
      </tr>
      <tr ref={deriveAddress}>
        <td>
          <button
            class="button is-info is-outlined"
            style="width: 100%; margin: 8px 0; border-style: dashed;"
            onClick={(e) => {
              if (!masterSeed) {
                // Show dialog asking to fix masterSeed
                // Same for other buttons too
                return;
              }
              showJsxInModal(
                localize("Derive address"),
                <DeriveSingleAddress
                  masterSeed={masterSeed}
                  maxIndex={addressStrategy.getAddressCount()}
                />,
                false
              );
            }}
          >
            {localize("Derive address")}
          </button>
        </td>
      </tr>
      <tr ref={bulkDeriveAddresses}>
        <td>
          <button
            class="button is-info is-outlined"
            style="width: 100%; margin: 8px 0; border-style: dashed;"
            onClick={(e) => {
              if (!masterSeed) {
                // Show dialog asking to fix masterSeed
                // Same for other buttons too
                return;
              }
              showJsxInModal(
                localize("Bulk derive addresses"),
                <DeriveAddresses
                  masterSeed={masterSeed}
                  walletName={walletNameFromEnvelope(baseEnvelope)}
                />,
                true
              );
            }}
          >
            {localize("Bulk derive addresses")}
          </button>
        </td>
      </tr>
      {
        /*IS_DEBUG*/ false ? (
          <tr>
            <td>
              <button
                class="button is-info is-outlined"
                style="width: 100%; margin: 8px 0; border-style: dashed;"
                onClick={(e) => {
                  this.signAFile();
                }}
              >
                Sign a file
              </button>
            </td>
          </tr>
        ) : null
      }
    </table>
  );
};
