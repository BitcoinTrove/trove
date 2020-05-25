import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import {
  ExtendedHtmlElement,
  extendHtmlElement,
} from "../util/extended_html_element";
import { htmlRef } from "../util/html_ref";

export class MiniWizard {
  private steps: ExtendedHtmlElement[];
  private currentStepIndex = 0;
  private container: ExtendedHtmlElement;
  private header = htmlRef();
  private stepHeaders: HTMLElement[] = [];

  constructor(...stepsTemp: JSX.Element[]) {
    this.steps = stepsTemp.map((s) => extendHtmlElement(s));
    this.steps.forEach((s) => s.hide());
    this.steps[this.currentStepIndex].show();
    this.container = extendHtmlElement(
      <div>
        <div ref={this.header} class="steps" style="display: none;"></div>
        <div>{this.steps.map((step) => step.asHtmlElement())}</div>
      </div>
    );
  }

  addHeaders = (...headerNames: string[]) => {
    if (headerNames.length != this.steps.length) {
      throw "Number of headers does not match number of steps";
    }
    if (this.stepHeaders.length > 0) {
      throw "Headers have already been added";
    }
    headerNames.forEach((headerName) => {
      const header = (
        <div class="step-item">
          <div class="step-marker">
            <span class="icon">
              <i class="fa fa-check"></i>
            </span>
          </div>
          <div class="step-details">
            <p>{headerName}</p>
          </div>
        </div>
      );
      this.stepHeaders.push(header);
      this.header.appendChild(header);
    });
    this.header.show();
    this.updateHeaders();
  };

  getContainer = () => {
    return this.container.asHtmlElement();
  };

  nextStep = () => {
    this.steps[this.currentStepIndex].hide();
    this.currentStepIndex += 1;
    this.steps[this.currentStepIndex].show();
    this.updateHeaders();
  };

  previousStep = () => {
    this.steps[this.currentStepIndex].hide();
    this.currentStepIndex -= 1;
    this.steps[this.currentStepIndex].show();
    this.updateHeaders();
  };

  resetToFirstStep = () => {
    while (this.currentStepIndex > 0) {
      this.previousStep();
    }
  };

  getCurrentStepIndex = () => {
    return this.currentStepIndex;
  };

  private updateHeaders = () => {
    this.stepHeaders.forEach((header, index) => {
      header.classList.remove("is-active", "is-completed", "is-success");
      if (index < this.currentStepIndex) {
        header.classList.add("is-completed", "is-success");
      } else if (index == this.currentStepIndex) {
        header.classList.add("is-active");
      }
    });
  };
}
