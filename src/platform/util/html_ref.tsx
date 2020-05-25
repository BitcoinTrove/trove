import {
  ExtendedHtmlElement,
  extendHtmlElement,
} from "./extended_html_element";

// This is a hack so that we do not not to pass in n into htmlRefs
// TODO - Is there a better way of doing this? (With iterators or generators?)
const MAX_REFS = 100;

export const htmlRefs: (n?: number) => HtmlRef[] = (n: number) => {
  n = n || MAX_REFS;
  const refs = [];
  for (let i = 0; i < n; ++i) {
    refs.push(htmlRef());
  }
  return refs;
};

export type JsxDomRefCallback = (htmlElement: HTMLElement) => void;
export type HtmlRef = JsxDomRefCallback & ExtendedHtmlElement;
export const htmlRef: (mutable?: boolean) => HtmlRef = (mutable?: boolean) => {
  let element: ExtendedHtmlElement = null;

  let callback = (htmlElement: HTMLElement) => {
    if (!!element && mutable !== true) {
      throw "Reference has already been loaded and this reference is immutable.";
    }
    element = extendHtmlElement(htmlElement);

    Object.keys(element).forEach((key) => {
      if (typeof element[key] === "function") {
        htmlRef[key] = element[key];
      }
    });
  };
  let htmlRef = (callback as unknown) as HtmlRef;
  return htmlRef;
};

export const mutableHtmlRef: () => HtmlRef = () => {
  return htmlRef(true);
};
