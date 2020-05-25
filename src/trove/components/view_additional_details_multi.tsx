import * as React from "jsx-dom"; // Fake React for JSX->DOM support

import { removeAnyModals } from "../../platform/util/modals";
import { MasterSeed } from "../types/master_seed";

export const ViewAdditionalDetailsMulti = ({
  masterSeed,
  addressStrategy,
  creationDate,
  startIndex,
  endIndex,
}: {
  masterSeed: MasterSeed;
  addressStrategy: string;
  creationDate: string;
  startIndex: number;
  endIndex: number;
}) => {
  removeAnyModals();

  return (
    <div style="text-align: center;">
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
          <th style="word-wrap: normal;">Creation Date</th>
          <td>{creationDate}</td>
        </tr>
        <tr>
          <th style="word-wrap: normal;">Xpub (BIP 44, Account0)</th>
          <td>{masterSeed.getBip44Account0Xpub()}</td>
        </tr>
        <tr>
          <th style="word-wrap: normal;">Xpriv (BIP 44, Account0)</th>
          <td>{masterSeed.getBip44Account0Xpriv()}</td>
        </tr>
      </table>
    </div>
  );
};
