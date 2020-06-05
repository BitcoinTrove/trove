import { el } from "redom";
import { clone, equalForKeys } from "../util/object";
import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { PlatformImages } from "../images/platform_images";
import { htmlRef } from "../util/html_ref";
import { showJsxInModal } from "../util/modals";

declare var localize: (enText: string) => string;

export class WizardStepHeader {
  title: string;
  el: HTMLElement;
  indexLookup: Map<string, string> = new Map();
  isFinished: boolean = false;
  iconContainer = htmlRef();
  subStep = htmlRef();

  constructor(title: string) {
    this.title = title;
    this.el = (
      <div class="step-item">
        <div class="step-marker">
          <span ref={this.iconContainer} class="icon">
            <i class="fa fa-check"></i>
          </span>
        </div>
        <div class="step-details">
          <p>{title}</p>
          <p ref={this.subStep}></p>
        </div>
      </div>
    );
  }

  public getTitle(): string {
    return this.title;
  }

  public clearIcon() {
    return this.iconContainer.empty();
  }

  public setIcon(image) {
    this.clearIcon();
    this.iconContainer.appendChild(image);
  }

  public setCompleted(): void {
    this.el.classList.add("is-completed", "is-success");
    this.setIcon(PlatformImages.Check500x500.create());
  }

  public setFinished(): void {
    this.el.classList.add("is-completed", "is-success");
    this.setIcon(PlatformImages.Finished500x500.create());
    this.isFinished = true;
  }

  // The way finished/unfinished works sucks
  public setUnFinished(): void {
    this.el.classList.remove("is-completed", "is-success");
    this.isFinished = false;
  }

  public setActive(isActive: boolean): void {
    if (isActive) {
      this.el.classList.add("is-active");
      this.el.classList.remove("is-completed", "is-success");
    } else {
      this.el.classList.remove("is-active");
    }
  }

  public setActiveStep(wizardStepBody: WizardStepBody): void {
    if (this.indexLookup.size == 1) {
      this.subStep.setText("");
    } else {
      const index = this.indexLookup.get(wizardStepBody.getKey());
      this.subStep.setText(index + " of " + this.indexLookup.size);
    }
  }

  register(wizardStepBody: WizardStepBody) {
    this.indexLookup.set(
      wizardStepBody.getKey(),
      this.indexLookup.size + 1 + ""
    );
  }
}

export abstract class WizardStepBody {
  title: string;
  stepItem: WizardStepHeader;
  stepIndex: number;
  changeHandler: () => void;
  changeHappened: boolean = false; // changeHandler was called before it was set

  constructor(title: string) {
    this.title = title;
  }

  abstract getBody(): JSX.Element; // TODO - rename this to createBody or just body or something or maybe render?
  abstract enableNextButton(): boolean;
  abstract saveState(wizardState: object): void;
  abstract loadState(wizardState: object): void;
  abstract dependentStateProperties(): string[];
  abstract onGoBack(wizardState: object, yes: () => void, no: () => void);

  setStepIndex(stepIndex: number) {
    this.stepIndex = stepIndex;
  }

  getStepIndex(): number {
    return this.stepIndex;
  }

  getKey(): string {
    return this.stepIndex + "";
  }

  public getTitle(): string {
    return this.title;
  }

  public setStepHeader(stepItem: WizardStepHeader): void {
    this.stepItem = stepItem;
    stepItem.register(this);
  }

  public getStepHeader(): WizardStepHeader {
    return this.stepItem;
  }

  public setChangeHandler(changeHandler: () => void): void {
    this.changeHandler = changeHandler;
    if (this.changeHappened) {
      this.changeHandler();
      this.changeHappened = false;
    }
  }

  public callChangeHandler() {
    if (this.changeHandler) {
      this.changeHandler();
    } else {
      this.changeHappened = true;
    }
  }
}

export class Wizard {
  private header: HTMLElement;
  el: HTMLElement;
  private steps: WizardStepBody[] = [];
  private currentStep: number = 0;

  private backButton = htmlRef();
  private nextButton = htmlRef();
  private cancelButton = htmlRef();
  private buttons = (
    <div class="wizardStepButtons">
      <span>
        <button
          ref={this.backButton}
          class="button is-info is-outlined"
          style="float: left; margin-bottom: 50px;"
        >
          {localize("Back")}
        </button>
        <button
          ref={this.nextButton}
          class="button is-info is-outlined"
          style="float: right; margin-bottom: 50px;"
        >
          {localize("Next")}
        </button>
        <button
          ref={this.cancelButton}
          class="button is-info is-outlined"
          style="float: right; margin-bottom: 50px; margin-right: 12px;"
        >
          {localize("Cancel")}
        </button>
      </span>
    </div>
  );
  private onCancelF: () => void;
  private wizardState: object;
  private lastSeenState: Map<WizardStepBody, object> = new Map();
  private stepContainer = htmlRef();

  constructor(
    steps: WizardStepBody[],
    onCancelF: () => void,
    wizardState?: object
  ) {
    this.onCancelF = onCancelF;
    this.wizardState = wizardState || {};
    // Build up the list of step headers (Consecutive steps can share a header)
    const stepHeaders: WizardStepHeader[] = [];
    let stepIndex: number = 0; // Could consider getting rid of this, and always using currentStep directly
    steps.forEach((wizardStep) => {
      if (
        stepHeaders.length == 0 ||
        stepHeaders[stepHeaders.length - 1].getTitle() != wizardStep.getTitle()
      ) {
        stepHeaders.push(new WizardStepHeader(wizardStep.getTitle()));
      }
      wizardStep.setStepIndex(stepIndex);
      wizardStep.setStepHeader(stepHeaders[stepHeaders.length - 1]);
      stepIndex += 1;

      const changeHandler = () => {
        this.nextButton.setDisabled(!wizardStep.enableNextButton());
      };
      wizardStep.setChangeHandler(changeHandler);
    });
    this.header = el(".steps", stepHeaders);
    this.steps = steps;

    this.el = (
      <div>
        {this.header}
        <div ref={this.stepContainer} class="wizardStepBody">
          {this.steps.map((e) => e.getBody())}
        </div>
        {this.buttons}
      </div>
    );

    const wizard = this;

    this.backButton.events().onclick = (e) => {
      const currentStep = wizard.steps[wizard.currentStep];
      currentStep.onGoBack(
        wizard.wizardState,
        () => {
          wizard.goToPreviousStep();
        },
        () => {
          // do nothing
        }
      );
    };
    this.nextButton.events().onclick = (e) => {
      wizard.goToNextStep();
    };
    this.cancelButton.events().onclick = (e) => {
      // TODO - This last step stuff is messy.
      // The cancel button shouldn't change into a close button on the last step
      // A close button should be added and their visibility should be updated
      const isLastStep = this.currentStep === this.steps.length - 1;
      if (isLastStep) {
        wizard.onCancelF();
        return;
      }
      const buttons = (
        <span>
          <button
            class="button"
            onClick={(e) => {
              hide();
            }}
          >
            {localize("Go back")}
          </button>
          <button
            class="button is-danger is-outlined"
            onClick={(e) => {
              hide();
              wizard.onCancelF();
            }}
          >
            {localize("Yes, cancel")}
          </button>
        </span>
      );
      const hide = showJsxInModal(
        "Cancel wizard",
        <span>{localize("Are you sure you want to cancel this wizard?")}</span>,
        false,
        buttons
      );
    };

    this.handleStepChange(null, this.steps[0], true, false);
  }

  goToNextStep() {
    const oldStep = this.steps[this.currentStep];
    const newStep = this.steps[++this.currentStep];
    const isFirstStep = this.currentStep === 0;
    const isLastStep = this.currentStep === this.steps.length - 1;
    oldStep.getStepHeader().setCompleted();
    this.handleStepChange(oldStep, newStep, isFirstStep, isLastStep);
  }

  goToPreviousStep() {
    const oldStep = this.steps[this.currentStep];
    const newStep = this.steps[--this.currentStep];
    const isFirstStep = this.currentStep === 0;
    const isLastStep = this.currentStep === this.steps.length - 1;
    oldStep.getStepHeader().clearIcon();
    this.handleStepChange(oldStep, newStep, isFirstStep, isLastStep);
  }

  handleStepChange(
    oldStep: WizardStepBody,
    newStep: WizardStepBody,
    isFirstStep: boolean,
    isLastStep: boolean
  ) {
    if (oldStep) {
      oldStep.saveState(this.wizardState);
      this.lastSeenState.set(oldStep, clone(this.wizardState));
      oldStep.getStepHeader().setActive(false);

      if (oldStep.getStepHeader().isFinished) {
        oldStep.getStepHeader().setUnFinished();
      }
    }
    const thisStepsLastSeenState = this.lastSeenState.get(newStep);

    const firstLoadOrStateChange =
      !thisStepsLastSeenState ||
      !equalForKeys(
        thisStepsLastSeenState,
        this.wizardState,
        newStep.dependentStateProperties()
      );

    if (firstLoadOrStateChange) {
      const firstLoad = !thisStepsLastSeenState;
      newStep.loadState(/*firstLoad,*/ this.wizardState);
    }
    this.lastSeenState.set(newStep, clone(this.wizardState));
    this.stepContainer.getChildren().forEach((step, i) => {
      step.showOrHide(i === newStep.getStepIndex());
    });
    newStep.getStepHeader().setActive(true);
    newStep.getStepHeader().setActiveStep(this.steps[this.currentStep]);

    // The last step goes straight to finished
    if (isLastStep) {
      newStep.getStepHeader().setFinished();
      newStep.getStepHeader().setActive(false);
    }

    this.resetButtons(isLastStep);
    newStep.callChangeHandler();
  }

  // This is more of an init kinda thing, or onmount or something.
  resetButtons(isLastStep: boolean) {
    const onFirstStep = this.currentStep === 0;
    const onLastStep = this.currentStep === this.steps.length - 1;
    this.backButton.showOrHide(!onFirstStep /* && !onLastStep */);
    this.nextButton.showOrHide(!onLastStep);
    this.cancelButton.setText(isLastStep ? "Close" : "Cancel");
  }
}
