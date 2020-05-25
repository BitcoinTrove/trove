import * as React from "jsx-dom"; // Fake React for JSX->DOM support

import { removeAnyModals } from "../../platform/util/modals";
import { MasterSeed } from "../types/master_seed";

export const ViewAdditionalDetails = ({
  masterSeed,
  addressStrategy,
  creationDate,
}: {
  masterSeed: MasterSeed;
  addressStrategy: string;
  creationDate: string;
}) => {
  removeAnyModals();

  return (
    <div name="modal" style="text-align: center;">
      <table class="table" style="word-wrap: anywhere;">
        <tr>
          <th style="word-wrap: normal;">Masterseed (hex)</th>
          <td>{masterSeed.toHex()}</td>
        </tr>
        <tr>
          <th style="word-wrap: normal;">Network</th>
          <td>{masterSeed.getNetworkAsString()}</td>
        </tr>
        <tr>
          <th style="word-wrap: normal;">Address Strategy</th>
          <td>{addressStrategy}</td>
        </tr>
        <tr>
          <th style="white-space: nowrap;">Creation Date</th>
          <td>{creationDate}</td>
        </tr>
        <tr>
          <th style="white-space: nowrap;">Address</th>
          <td>{masterSeed.getAddress()}</td>
        </tr>
        <tr>
          <th style="white-space: nowrap;">Public key (hex)</th>
          <td>{masterSeed.getEcPair().publicKey.toString("hex")}</td>
        </tr>
        <tr>
          <th style="white-space: nowrap;">Private key (hex)</th>
          <td>{masterSeed.getEcPair().privateKey.toString("hex")}</td>
        </tr>
        <tr>
          <th style="white-space: nowrap;">WIF</th>
          <td>{masterSeed.getEcPair().toWIF()}</td>
        </tr>
      </table>
    </div>
  );
};
