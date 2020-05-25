import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { IS_DEBUG } from "../trove_constants";
import { AddressListTemplate } from "./addess_list_template";
import { print } from "../../platform/util/print_helper";
import { MasterSeed } from "../types/master_seed";

declare var localize: (enText: string) => string;

export const AddressViewMultiplePrinted = ({
  masterSeed,
  referenceName,
  indexStart,
  indexEnd,
}: {
  masterSeed: MasterSeed;
  referenceName: string;
  indexStart: number;
  indexEnd: number;
}) => {
  return (
    <div>
      <article class="message is-info">
        <div class="message-body">
          <p style="text-align: left;">
            {localize(
              "Print the addresses using the button below, cut them out, and staple them together to make a booklet."
            )}
          </p>
          <p style="text-align: left;">
            {localize(
              "These addresses are not stored with the individual share files. You must print them now."
            )}
          </p>
          <p style="text-align: left;">
            {localize(
              "The share files can be used to access bitcoin sent to any of these addresses."
            )}
          </p>
          <div style="margin-top: 20px;">
            <button
              class="button is-info is-outlined"
              style="margin: 5px;"
              onClick={async (e) => {
                const template = await AddressListTemplate({
                  masterSeed: masterSeed,
                  indexStart: indexStart,
                  indexEnd: indexEnd,
                  referenceName: referenceName,
                });
                print(template, false);
              }}
            >
              {localize("Print addresses")}
            </button>
            {IS_DEBUG ? (
              <button
                class="button is-info is-outlined"
                style="border-style: dashed; margin: 5px;"
                onClick={async (e) => {
                  const template = await AddressListTemplate({
                    masterSeed: masterSeed,
                    indexStart: indexStart,
                    indexEnd: indexEnd,
                    referenceName: referenceName,
                  });
                  print(template, true);
                }}
              >
                {localize("Print preview")}
              </button>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
};
