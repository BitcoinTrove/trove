import { ExtendedHtmlElement } from "./extended_html_element";

// This is broken. I didn't understand how transition worked.
// I think it needs to get removed after the animation.
// This isn't being used anywhere at the moment, so not a priority
export const fadeBetween = (el1: HTMLElement, el2: HTMLElement) => {
  el1.style.transition = "opacity 0.25s";
  el1.style.opacity = "0";

  window.setTimeout(() => {
    el1.style.display = "none";

    el1.style.display = "none";
    el2.style.display = "";
    window.setTimeout(() => {
      el2.style.transition = "opacity 0.25s";
      el2.style.opacity = "1";
    }, 1);
  }, 250);
};

export const buttonSuccessAnimation = (
  button: ExtendedHtmlElement,
  success: boolean
) => {
  const originalContent = button.getText();
  const width = button.offsetWidth();
  button.style().minWidth = width + "px";
  const texts = [success ? "Success" : "Error", originalContent];
  const nextText = () => {
    button.setText(texts.shift());
    if (texts.length > 0) {
      setTimeout(nextText, 1000);
    } else {
      button.setDisabled(false);
      button.style().minWidth = "";
    }
  };
  button.setDisabled(true);
  nextText();
};

const SMOOTH_FINISH_STEPS = 20;
const SMOOTH_FINISH_TIME = 1000;
// TODO - Would be nice if this used promises and we can use await on it
export const smoothFinish = (
  progress: HTMLProgressElement,
  callback: () => void
) => {
  const range = progress.max - progress.value;
  const stepSize = range / SMOOTH_FINISH_STEPS;
  const timeStep = SMOOTH_FINISH_TIME / SMOOTH_FINISH_STEPS;
  const values = [];
  for (let i = 1; i < SMOOTH_FINISH_STEPS; ++i) {
    values.push(progress.value + i * stepSize);
  }
  values[values.length - 1] = progress.max;

  const updateProgress = (values: number[]) => {
    if (values.length == 0) {
      setTimeout(callback, timeStep);
    } else {
      const newValue = values.shift();
      setTimeout(() => {
        progress.value = newValue;
        updateProgress(values);
      }, timeStep);
    }
  };
  updateProgress(values);
};
