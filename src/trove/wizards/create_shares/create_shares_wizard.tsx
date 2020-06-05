import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { mount } from "redom";
import { Screen } from "../../../platform/components/screen";
import { Wizard, WizardStepBody } from "../../../platform/components/wizard";
import { Step1_Settings } from "./step1_settings";
import { Step2_GenerateAddress } from "./step2_generate_address";
import { Step3_SaveShares } from "./step3_save_shares";
import { Step4_Finished } from "./step4_finished";
import { AddressStrategy } from "../../types/address_strategy";

declare var localize: (enText: string) => string;

export type EntropySource = "dice" | "coin" | "browser" | undefined;

export interface SettingsState {
  network: string;
  referenceName: string;
  creationDate: string;
  ownerName: string;
  custodianNames: string[];
  requiredShares: number;
  messageOnEachShare: string[];
  messageAfterRevealing: string;
  entropySource: EntropySource;
  addressStrategy: AddressStrategy;
  slip39Password: string;
}

export class CreateSharesWizard extends Screen {
  home: Screen;

  constructor(home: Screen) {
    super("CreateShares", localize("Create Shares"));
    this.setContent(<div class="screen"></div>);
    this.home = home;
  }

  onmount() {
    const steps: WizardStepBody[] = [
      new Step1_Settings(),
      new Step2_GenerateAddress(),
      new Step3_SaveShares(),
      new Step4_Finished(),
    ];

    const wizard: Wizard = new Wizard(steps, () => this.home.show());
    const section = <section class="section"></section>;
    mount(this, section);
    mount(section, wizard);
  }
}
