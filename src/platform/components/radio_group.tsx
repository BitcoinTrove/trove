import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { UNIQUE_IDENTIFIER, NO_OP } from "../../trove/trove_constants";
import { HtmlRef, htmlRef } from "../util/html_ref";

export type RadioDescription = {
  displayText: string;
  value: string;
  details?: JSX.Element;
  wrapDetailsInContainer?: boolean;
  className?: string;
  showIf?: boolean;
};

export const RadioGroup = ({
  selectedIndex,
  selectedRadioRef,
  options,
  onValueChanged,
}: {
  selectedIndex?: number;
  selectedRadioRef: HtmlRef;
  options: RadioDescription[];
  onValueChanged?: () => void;
}) => {
  onValueChanged = onValueChanged || NO_OP;
  const identifier = "radio_" + UNIQUE_IDENTIFIER.get();
  const radioContainer = htmlRef();
  const detailsContainer = htmlRef();
  selectedIndex = selectedIndex || 0;
  options = options.filter((o) => o.showIf !== false);

  const element = (
    <div>
      <div ref={radioContainer} style="text-align: left; padding-bottom: 12px;">
        {options.map((option, index) => (
          <span>
            <input
              value={option.value}
              class={"is-checkradio " + (option.className || "is-info")}
              id={identifier + "_" + index}
              type="radio"
              name={identifier}
              checked={index === selectedIndex}
              onChange={(e) => {
                if ((e.srcElement as HTMLInputElement).checked) {
                  const selectedRadio = radioContainer.find("input:checked");
                  //const selectedIndex = selectedRadio.parent().indexInParent();
                  detailsContainer.hideChildren();
                  const details = detailsContainer.find(
                    "#details_" + identifier + "_" + index
                  );
                  details && details.show();
                  selectedRadio.bind(selectedRadioRef);
                  onValueChanged();
                }
              }}
            ></input>
            <label htmlFor={identifier + "_" + index}>
              {option.displayText}
            </label>
          </span>
        ))}
      </div>
      <div ref={detailsContainer}>
        {options.map((option, index) => {
          if (!option.details) {
            return;
          }
          return option.wrapDetailsInContainer === false ? (
            <div
              id={"details_" + identifier + "_" + index}
              style={
                "margin-bottom: 1.5em;" +
                (index === selectedIndex ? "" : "display: none;")
              }
            >
              {option.details}
            </div>
          ) : (
            <article
              class={"message " + (option.className || "is-info")}
              id={"details_" + identifier + "_" + index}
              style={
                "margin-bottom: 1.5em;" +
                (index === selectedIndex ? "" : "display: none;")
              }
            >
              <div class="message-body" style="text-align: left;">
                {option.details}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );

  radioContainer.find("input:checked").bind(selectedRadioRef);
  onValueChanged();
  return element;
};
