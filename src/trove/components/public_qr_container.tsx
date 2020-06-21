import * as React from "jsx-dom"; // Fake React for JSX->DOM support

import { htmlRef } from "../../platform/util/html_ref";
import { PublicAddress } from "./public_address";
import { PublicAddressMulti } from "./public_address_multi";
import { SecurityConfig } from "../types/security_config";
import { ValueRef } from "../../platform/util/value_ref";

export const PublicQrContainer = ({
  securityConfig,
}: {
  securityConfig: ValueRef<SecurityConfig>;
}) => {
  const div = htmlRef();

  securityConfig.onChange((config) => {
    div.empty();
    if (!config.masterSeed) {
      div.appendChild(<div>Failed to load. Invalid master seed.</div>);
      return;
    }
    div.appendChild(
      config.addressStrategy.isSingle() ? (
        <PublicAddress address={config.masterSeed.getAddress()} />
      ) : (
        <PublicAddressMulti
          masterSeed={config.masterSeed}
          indexStart={0}
          indexEnd={config.addressStrategy.getAddressCount()}
        />
      )
    );
  });

  return <div style="margin: 24px 0;" ref={div}></div>;
};
