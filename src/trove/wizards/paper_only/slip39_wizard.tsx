import { mount } from "redom";
import { Screen } from "../../../platform/components/screen";
import { Wizard, WizardStepBody } from "../../../platform/components/wizard";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { Step3_PerformActions } from "../access_bitcoin/step3_perform_actions";
import { Step1_Instructions } from "./step1_instructions";
import { Step2_LoadWords } from "./step2_load_words";

declare var localize: (enText: string) => string;

export class Slip39Wizard extends Screen {
  home: Screen;

  constructor(home: Screen) {
    super("Slip39Wizard", localize("Access bitcoin"));
    this.setContent(<div class="screen"></div>);
    this.home = home;
  }

  onmount() {
    const steps: WizardStepBody[] = [
      new Step1_Instructions(),
      new Step2_LoadWords(),
      new Step3_PerformActions(),
    ];

    const wizard: Wizard = new Wizard(steps, () => this.home.show(), {});

    const section = <section class="section"></section>;
    mount(this, section);
    mount(section, wizard);
  }
}
