import { mount, unmount } from "redom";

const hideWhatsVisible = () => {
  let elements: HTMLElement[] = [];
  let originalDisplay: string[] = [];
  for (let i = 0; i < document.body.children.length; ++i) {
    const child = document.body.children[i];
    if (child instanceof HTMLElement) {
      elements.push(child);
      originalDisplay.push(child.style.display);
      child.style.display = "none";
    }
  }
  // showItAgain
  return () => {
    for (let i = 0; i < elements.length; ++i) {
      elements[i].style.display = originalDisplay[i];
    }
  };
};

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
