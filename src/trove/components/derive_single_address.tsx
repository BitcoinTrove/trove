import * as React from "jsx-dom"; // Fake React for JSX->DOM support

import { removeAnyModals } from "../../platform/util/modals";
import { MasterSeed } from "../types/master_seed";
import { htmlRefs } from "../../platform/util/html_ref";
import { getAddress, addressAsCanvasSimple } from "../util/address";

declare var localize: (enText: string) => string;

/* This is for the multiple address scenario. It only generates 1 address and shows the QR. */
export const DeriveSingleAddress = ({
  masterSeed,
  maxIndex,
}: {
  masterSeed: MasterSeed;
  maxIndex: number;
}) => {
  removeAnyModals();

  const [qrContainer, addressSpan, indexInput, errorMessage] = htmlRefs(4);

  const modal = (
    <div style="text-align: center;">
      <div>
        <label class="label" style="display: inline-block; margin-right: 10px;">
          {localize("Derivation index")}
        </label>
        <input
          ref={indexInput}
          type="number"
          value={0}
          min={0}
          max={maxIndex}
          style="width: 100px;"
          onInput={(e) => {
            const valueAsNumber = indexInput.getValueNumber();
            if (
              Number.isNaN(valueAsNumber) ||
              valueAsNumber < 0 ||
              valueAsNumber > maxIndex
            ) {
              errorMessage.show();
              qrContainer.hide();
              addressSpan.hide();
              return;
            }
            errorMessage.hide();
            const node = masterSeed.getbip44Account0Index(
              indexInput.getValueNumber()
            );
            const address = getAddress(node, masterSeed.getNetwork());
            addressSpan.setText(address);
            addressAsCanvasSimple(
              address,
              (error: any, canvas: HTMLCanvasElement) => {
                qrContainer.empty().appendChild(canvas);
                qrContainer.show();
                addressSpan.show();
              }
            );
          }}
        ></input>
        <p ref={errorMessage} class="help is-danger">
          {localize("The index must be between 0 and") + " " + maxIndex}
        </p>
        <div ref={qrContainer}></div>
        <div style="margin-bottom: 12px;">
          <span ref={addressSpan}></span>
        </div>
      </div>
    </div>
  );

  indexInput.dispatchEvent(new Event("input"));

  return modal;
};
