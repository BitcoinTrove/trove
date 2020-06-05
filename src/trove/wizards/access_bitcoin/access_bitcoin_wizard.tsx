import { mount } from "redom";
import { Screen } from "../../../platform/components/screen";
import { Wizard, WizardStepBody } from "../../../platform/components/wizard";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { Step1_Instructions } from "./step1_instructions";
import { Step2_LoadShares } from "./step2_load_shares";
import { Step3_PerformActions } from "./step3_perform_actions";
import { SecretShareEnvelope } from "../../types/secret_share_envelope";

declare var localize: (enText: string) => string;

export class AccessBitcoin extends Screen {
  home: Screen;
  baseEnvelope: SecretShareEnvelope;

  constructor(home: Screen, baseEnvelope: SecretShareEnvelope) {
    super("AccessBitcoin", localize("Access bitcoin"));
    this.setContent(<div class="screen"></div>);
    this.home = home;
    this.baseEnvelope = baseEnvelope;
  }

  onmount() {
    const steps: WizardStepBody[] = [
      new Step1_Instructions(),
      new Step2_LoadShares(),
      new Step3_PerformActions(false /* showSecurityConfigControls */),
    ];

    const initialWizardState = {
      baseEnvelope: this.baseEnvelope,
    };
    const wizard: Wizard = new Wizard(
      steps,
      () => this.home.show(),
      initialWizardState
    );

    const section = <section class="section"></section>;
    mount(this, section);
    mount(section, wizard);
  }
}

export class AccessBitcoinFastForward extends Screen {
  private home: Screen;
  private wizardState: object;
  private showSecurityConfigControls: boolean;

  constructor(
    home: Screen,
    wizardState: object,
    showSecurityConfigControls: boolean
  ) {
    super("AccessBitcoinFastForward", localize("Access bitcoin"));
    this.setContent(<div class="screen"></div>);
    this.home = home;
    this.wizardState = wizardState;
    this.showSecurityConfigControls = showSecurityConfigControls;
  }

  onmount() {
    const steps: WizardStepBody[] = [
      new Step3_PerformActions(this.showSecurityConfigControls),
    ];

    const wizard: Wizard = new Wizard(
      steps,
      () => this.home.show(),
      this.wizardState
    );

    const section = <section class="section"></section>;
    mount(this, section);
    mount(section, wizard);
  }
}
