import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { RadioGroup, RadioDescription } from "./radio_group";
import { mutableHtmlRef } from "../util/html_ref";
import { extendHtmlElement } from "../util/extended_html_element";

const basicOptions = () => {
  return [
    {
      displayText: "DisplayText1",
      value: "value1",
      details: <div>content1</div>,
    },
    {
      displayText: "DisplayText2",
      value: "value2",
      details: <div>content2</div>,
    },
    {
      displayText: "DisplayText3",
      value: "value3",
      details: <div>content3</div>,
    },
  ] as RadioDescription[];
};

describe("<RadioWithDetails/>", () => {
  test("selectedRadioRef updates to the selected radio", async () => {
    const selectedRadioRef = mutableHtmlRef();
    const radioWithDetails = extendHtmlElement(
      <RadioGroup
        selectedIndex={0}
        selectedRadioRef={selectedRadioRef}
        options={basicOptions()}
      />
    );
    const radioButtons = radioWithDetails.findAll(".is-checkradio");
    expect(radioButtons.length).toBe(3);

    expect(selectedRadioRef.getValueString()).toBe("value1");
    radioButtons[1].click();
    expect(selectedRadioRef.getValueString()).toBe("value2");
    radioButtons[2].click();
    expect(selectedRadioRef.getValueString()).toBe("value3");
    radioButtons[0].click();
    expect(selectedRadioRef.getValueString()).toBe("value1");
  });

  test("selectedIndex prop controls the selected radio button", async () => {
    const selectedRadioRef = mutableHtmlRef();
    extendHtmlElement(
      <RadioGroup
        selectedIndex={1}
        selectedRadioRef={selectedRadioRef}
        options={basicOptions()}
      />
    );
    expect(selectedRadioRef.getValueString()).toBe("value2");
  });

  test("showIf property controls whether an option is available", async () => {
    const selectedRadioRef = mutableHtmlRef();
    const options = basicOptions();
    options[1].showIf = false;
    options[2].showIf = true;
    const radioWithDetails = extendHtmlElement(
      <RadioGroup
        selectedIndex={0}
        selectedRadioRef={selectedRadioRef}
        options={options}
      />
    );

    const radioButtons = radioWithDetails.findAll(".is-checkradio");
    expect(radioButtons.length).toBe(2);
    radioButtons[1].click();
    expect(selectedRadioRef.getValueString()).toBe("value3");
  });
});
