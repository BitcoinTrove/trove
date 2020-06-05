import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { htmlRef } from "../../platform/util/html_ref";
import { networkFromString } from "../util/network";
import { SHOW_RANDOM_ADDRESS_STRATEGY, IS_DEBUG } from "../trove_constants";
import { MasterSeed } from "../types/master_seed";
import { AddressStrategy } from "../types/address_strategy";
import { SecretShareEnvelope } from "../types/secret_share_envelope";
import { SecurityConfig } from "../types/security_config";
import { ValueRef } from "../../platform/util/value_provider";

declare var localize: (enText: string) => string;

export interface SecurityConfigControlsRef {
  setMasterSeed: (masterSeed: string) => void;
  setNetwork: (network: string) => void;
  setAddressStrategy: (strategy: string) => void;
  setBaseEnvelope: (baseEnvelope: SecretShareEnvelope) => void;
}

export const SecurityConfigControls = ({
  securityConfigControls,
  securityConfig,
  visible,
}: {
  securityConfigControls: SecurityConfigControlsRef;
  securityConfig: ValueRef<SecurityConfig>;
  visible: boolean;
}) => {
  let baseEnvelope: SecretShareEnvelope = null;

  const debugMasterSeed = htmlRef();
  const masterSeedInput = htmlRef();
  const debugNetworkRow = htmlRef();
  const debugAddressStrategySelect = htmlRef();
  const debugAddressStrategyRow = htmlRef();
  const debugNetworkSelect = htmlRef();
  const multipleRandomOption = htmlRef();

  const onChange = () => {
    let masterSeed = undefined;
    const ms = masterSeedInput.getValueString();
    const network = networkFromString(debugNetworkSelect.getValueString());
    if (ms.length == 64) {
      masterSeed = MasterSeed.fromHex(ms, network);
    }
    const addressStrategy = AddressStrategy.fromStrategyName(
      debugAddressStrategySelect.getValueString()
    );
    securityConfig.setValue({
      masterSeed,
      addressStrategy,
      baseEnvelope,
    });
  };
  securityConfig.trigger = () => {
    onChange();
  };

  securityConfigControls.setBaseEnvelope = (envelope: SecretShareEnvelope) => {
    baseEnvelope = envelope;
  };
  securityConfigControls.setMasterSeed = (masterSeed: string) => {
    masterSeedInput.setValue(masterSeed);
  };
  securityConfigControls.setNetwork = (network: string) => {
    debugNetworkSelect.setValue(network);
  };
  securityConfigControls.setAddressStrategy = (strategy: string) => {
    multipleRandomOption.showOrHide(
      SHOW_RANDOM_ADDRESS_STRATEGY || strategy === "multipleRandom"
    );
    debugAddressStrategySelect.setValue(strategy);
  };

  let disabled = false;
  if (!visible && IS_DEBUG) {
    // show it, but disabled
    visible = true;
    disabled = true;
  }

  return (
    <table
      class="keyDetailsTable"
      style={{
        margin: "auto auto 28px auto",
        display: visible ? "" : "none",
      }}
    >
      <tr ref={debugMasterSeed} style="border: 1px dashed #209cee;">
        <th style="color: #209cee;">{localize("Master seed (hex)")}</th>
        <td>
          <input
            ref={masterSeedInput}
            class="input"
            type="text"
            style="color: #209cee;"
            onInput={onChange}
            disabled={disabled}
          ></input>
        </td>
      </tr>
      <tr
        ref={debugNetworkRow}
        style={{
          border: "1px dashed #209cee",
        }}
      >
        <th style="color: #209cee;">{localize("Network")}</th>
        <td>
          <div class="select">
            <select
              ref={debugNetworkSelect}
              style="color: #209cee;"
              onInput={onChange}
              disabled={disabled}
            >
              <option value="testnet">{localize("Testnet")}</option>
              <option value="bitcoin">{localize("Bitcoin")}</option>
            </select>
          </div>
        </td>
      </tr>
      <tr
        ref={debugAddressStrategyRow}
        style={{
          border: "1px dashed #209cee",
        }}
      >
        <th style="color: #209cee;">{localize("Address strategy")}</th>
        <td>
          <div class="select">
            <select
              ref={debugAddressStrategySelect}
              style="color: #209cee;"
              onInput={onChange}
              disabled={disabled}
            >
              <option value="single">{localize("Single address")}</option>
              <option value="multiplePrinted">
                {localize("Multiple printed addresses")}
              </option>
              <option
                ref={multipleRandomOption}
                value="multipleRandom"
                style="display: none;"
              >
                {localize("Multiple - Address generator")}
              </option>
            </select>
          </div>
        </td>
      </tr>
    </table>
  );
};
