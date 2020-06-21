import { mount, unmount } from "redom";
import { hideWhatsVisible } from "./effects";

export const print = (html: JSX.Element, isPreview: boolean) => {
  const showItAgainF = hideWhatsVisible();
  mount(document.body, html);
  if (!isPreview) {
    window.print();
    unmount(document.body, html);
    showItAgainF();
  } else {
    const oldOnPopState = window.onpopstate;
    window.onpopstate = () => {
      unmount(document.body, html);
      showItAgainF();
      window.onpopstate = oldOnPopState;
    };
  }
};
