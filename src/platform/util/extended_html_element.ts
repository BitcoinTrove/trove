import { HtmlRef } from "./html_ref";

export interface BulmaElement {
  primary: () => HTMLElement & ExtendedHtmlElement;
  link: () => HTMLElement & ExtendedHtmlElement;
  info: () => HTMLElement & ExtendedHtmlElement;
  success: () => HTMLElement & ExtendedHtmlElement;
  warning: () => HTMLElement & ExtendedHtmlElement;
  danger: () => HTMLElement & ExtendedHtmlElement;
  clear: () => HTMLElement & ExtendedHtmlElement;
}

const extendWithBulma = (element: ExtendedHtmlElement) => {
  const extendedElement = element as BulmaElement &
    HTMLElement &
    ExtendedHtmlElement;
  const bulmaClasses = extendedElement.toggleClasses(BULMA_STD_CLASSES);
  extendedElement.primary = () => {
    bulmaClasses.select("is-primary");
    return extendedElement;
  };
  extendedElement.link = () => {
    bulmaClasses.select("is-link");
    return extendedElement;
  };
  extendedElement.info = () => {
    bulmaClasses.select("is-info");
    return extendedElement;
  };
  extendedElement.success = () => {
    bulmaClasses.select("is-success");
    return extendedElement;
  };
  extendedElement.warning = () => {
    bulmaClasses.select("is-warning");
    return extendedElement;
  };
  extendedElement.danger = () => {
    bulmaClasses.select("is-danger");
    return extendedElement;
  };
  extendedElement.clear = () => {
    bulmaClasses.clear();
    return extendedElement;
  };
  return extendedElement;
};

export interface ExtendedHtmlElement {
  // Updates a an HtmlRef to point to this ExtendedHtmlElement
  bind: (ref: HtmlRef) => ExtendedHtmlElement;
  equals: (element: HTMLElement | ExtendedHtmlElement) => boolean;
  style: () => CSSStyleDeclaration;
  events: () => GlobalEventHandlers;
  dispatchEvent: (event: Event) => ExtendedHtmlElement;

  show: () => ExtendedHtmlElement;
  hide: () => ExtendedHtmlElement;
  showOrHide: (condition: boolean) => ExtendedHtmlElement;
  isShown: () => boolean;
  hideChildren: () => ExtendedHtmlElement;

  classList: () => DOMTokenList;
  addClass: (...className: string[]) => ExtendedHtmlElement;
  removeClass: (...className: string[]) => ExtendedHtmlElement;
  replaceClass: (oldClass: string, newClass: string) => ExtendedHtmlElement;
  toggleClasses: (
    classNames: string[]
  ) => {
    select: (className: string) => ExtendedHtmlElement;
    clear: () => ExtendedHtmlElement;
  };
  switchClass: (
    condition: boolean,
    classA: string,
    classB: string
  ) => ExtendedHtmlElement;

  parent: () => ExtendedHtmlElement;
  indexInParent: () => number;
  remove: () => void;
  getChildren: () => ExtendedHtmlElement[];
  getChildCount: () => number;
  getChild: (index: number) => ExtendedHtmlElement;
  getFirstChild: () => ExtendedHtmlElement;
  getLastChild: () => ExtendedHtmlElement;
  appendChild: (
    element: HTMLElement | ExtendedHtmlElement
  ) => ExtendedHtmlElement;
  insertBefore: (
    newChild: ExtendedHtmlElement,
    child: ExtendedHtmlElement
  ) => ExtendedHtmlElement;
  removeChild: (el: ExtendedHtmlElement) => void;
  removeChildAtIndex: (index: number) => void;
  removeChildrenAfterIndex: (index: number) => void;
  empty: (afterIndex?: number) => ExtendedHtmlElement;

  find: (selectors: string) => ExtendedHtmlElement;
  findAll: (selectors: string) => ExtendedHtmlElement[];

  setText: (text: string) => ExtendedHtmlElement;
  getText: () => string;
  getAttribute: (attribute: string) => string;
  setAttribute: (attribute: string, value: string) => ExtendedHtmlElement;

  click: () => void;
  focus: () => ExtendedHtmlElement;
  select: () => ExtendedHtmlElement;

  setDisabled: (disable: boolean) => ExtendedHtmlElement;
  isDisabled: () => boolean;
  isChecked: () => boolean;
  setPlaceHolder: (text: string) => ExtendedHtmlElement;
  setValue: (value: any) => ExtendedHtmlElement;
  getValueString: () => string;
  getValueNumber: () => number;
  setReadOnly: (readOnly: boolean) => ExtendedHtmlElement;
  setProgress: (value: number, max?: number) => ExtendedHtmlElement;
  offsetWidth: () => number;

  // Casting to HTMLElement types. Ideally, these should not be used
  asHtmlElement: () => HTMLElement;
  asButton: () => HTMLButtonElement;
  asInput: () => HTMLInputElement;
  asTextArea: () => HTMLTextAreaElement;
  asProgress: () => HTMLProgressElement;
  asSelect: () => HTMLSelectElement;
  asTable: () => HTMLTableElement;
  asCanvas: () => HTMLCanvasElement;

  // Add UI library functionality
  bulma: () => HTMLElement & ExtendedHtmlElement & BulmaElement;
}

export const extendHtmlElement = <T extends HTMLElement>(element: T) => {
  if (!element) {
    return null;
  }
  const elementToExtend: ExtendedHtmlElement = {
    bind: (ref: HtmlRef) => {
      ref(element);
      return elementToExtend;
    },
    equals: (element2: HTMLElement | ExtendedHtmlElement) => {
      if (element2 instanceof HTMLElement) {
        return element2 === element;
      }
      if ((element2 as ExtendedHtmlElement).asHtmlElement) {
        return (element2 as ExtendedHtmlElement).asHtmlElement() === element;
      }
    },
    style: () => {
      return element.style;
    },
    events: () => {
      return element as GlobalEventHandlers;
    },
    dispatchEvent: (event: Event) => {
      element.dispatchEvent(event);
      return elementToExtend;
    },

    show: () => {
      element.style.display = "";
      return elementToExtend;
    },
    hide: () => {
      element.style.display = "none";
      return elementToExtend;
    },
    showOrHide: (condition: boolean) => {
      if (condition) {
        elementToExtend.show();
      } else {
        elementToExtend.hide();
      }
      return elementToExtend;
    },
    isShown: () => {
      return element.style.display != "none";
    },
    hideChildren: () => {
      elementToExtend.getChildren().forEach((c) => c.hide());
      return elementToExtend;
    },

    classList: () => {
      return element.classList;
    },
    addClass: (...className: string[]) => {
      element.classList.add(...className);
      return elementToExtend;
    },
    removeClass: (...className: string[]) => {
      element.classList.remove(...className);
      return elementToExtend;
    },
    replaceClass: (oldClass: string, newClass: string) => {
      return elementToExtend.removeClass(oldClass).addClass(newClass);
    },
    toggleClasses: (classNames: string[]) => {
      return {
        select: (className: string) => {
          classNames.forEach((c) => {
            elementToExtend.removeClass(c);
          });
          elementToExtend.addClass(className);
          return elementToExtend;
        },
        clear: () => {
          classNames.forEach((c) => {
            elementToExtend.removeClass(c);
          });
          return elementToExtend;
        },
      };
    },
    switchClass: (condition: boolean, classA: string, classB: string) => {
      elementToExtend.addClass(condition ? classA : classB);
      elementToExtend.removeClass(!condition ? classA : classB);
      return elementToExtend;
    },

    parent: () => {
      return extendHtmlElement(element.parentElement);
    },
    indexInParent: () => {
      return Array.from(element.parentElement.children).indexOf(element);
    },
    remove: () => {
      element.remove();
    },
    getChildren: () => {
      return Array.from(element.children).map((e) => {
        return extendHtmlElement(e as HTMLElement);
      });
    },
    getChildCount: () => {
      return element.children.length;
    },
    getChild: (index: number) => {
      return extendHtmlElement(element.children[index] as HTMLElement);
    },
    getFirstChild: () => {
      return extendHtmlElement(element.children[0] as HTMLElement);
    },
    getLastChild: () => {
      return extendHtmlElement(
        element.children[element.children.length - 1] as HTMLElement
      );
    },
    appendChild: (element2: HTMLElement | ExtendedHtmlElement) => {
      if (element2 instanceof HTMLElement) {
        element.appendChild(element2);
      } else if ((element2 as ExtendedHtmlElement).asHtmlElement) {
        element.appendChild((element2 as ExtendedHtmlElement).asHtmlElement());
      }
      return elementToExtend;
    },
    insertBefore: (
      newChild: ExtendedHtmlElement,
      child: ExtendedHtmlElement
    ) => {
      element.insertBefore(newChild.asHtmlElement(), child.asHtmlElement());
      return elementToExtend;
    },
    removeChild: (el: ExtendedHtmlElement) => {
      element.removeChild(el.asHtmlElement());
    },
    removeChildAtIndex: (index: number) => {
      element.removeChild(element.children[index]);
    },
    removeChildrenAfterIndex: (index: number) => {
      while (element.children.length > 1) {
        element.removeChild(element.children[index]);
      }
    },
    empty: (afterIndex: number = 0) => {
      while (element.children.length > afterIndex) {
        element.removeChild(element.children[afterIndex]);
      }
      return elementToExtend;
    },

    find: (selectors: string) => {
      return extendHtmlElement(element.querySelector(selectors) as HTMLElement);
    },
    findAll: (selectors: string) => {
      return Array.from(element.querySelectorAll(selectors)).map((e, i) => {
        return extendHtmlElement(e as HTMLElement);
      });
    },

    setText: (text: string) => {
      element.textContent = text;
      return elementToExtend;
    },
    getText: () => {
      return element.textContent;
    },
    getAttribute: (attribute: string) => {
      return element.getAttribute(attribute);
    },
    setAttribute: (attribute: string, value: string) => {
      element.setAttribute(attribute, value);
      return elementToExtend;
    },

    click: () => {
      return element.click();
    },
    focus: () => {
      element.focus();
      return elementToExtend;
    },
    select: () => {
      if (typeof (element as any).select === "function") {
        (element as any).select();
      }
      return elementToExtend;
    },

    setDisabled: (disable: boolean) => {
      (element as any).disabled = disable;
      return elementToExtend;
    },
    isDisabled: () => {
      return (element as any).disabled;
    },
    isChecked: () => {
      return (element as any).checked;
    },
    setPlaceHolder: (text: string) => {
      (element as any).placeholder = text;
      return elementToExtend;
    },
    setValue: (value: any) => {
      (element as any).value = value;
      return elementToExtend;
    },
    getValueString: () => {
      return (element as any).value as string;
    },
    getValueNumber: () => {
      const anyElement = element as any;
      if (anyElement.valueAsNumber) {
        return anyElement.valueAsNumber as number;
      }
      return anyElement.value as number;
    },
    setReadOnly: (readOnly: boolean) => {
      (element as any).readOnly = readOnly;
      return elementToExtend;
    },
    setProgress: (value: number, max?: number) => {
      (element as any).value = value;
      if (max !== undefined) {
        (element as any).max = max;
      }
      return elementToExtend;
    },
    offsetWidth: () => {
      return element.offsetWidth;
    },

    asHtmlElement: () => {
      return element as HTMLElement;
    },
    asButton: () => {
      return (element as unknown) as HTMLButtonElement;
    },
    asInput: () => {
      return (element as unknown) as HTMLInputElement;
    },
    asTextArea: () => {
      return (element as unknown) as HTMLTextAreaElement;
    },
    asProgress: () => {
      return (element as unknown) as HTMLProgressElement;
    },
    asSelect: () => {
      return (element as unknown) as HTMLSelectElement;
    },
    asTable: () => {
      return (element as unknown) as HTMLTableElement;
    },
    asCanvas: () => {
      return (element as unknown) as HTMLCanvasElement;
    },

    bulma: () => {
      return extendWithBulma(elementToExtend);
    },
  };
  return elementToExtend;
};

export const showElements = (...elements: ExtendedHtmlElement[]) => {
  elements.forEach((e) => e.show());
};

export const hideElements = (...elements: ExtendedHtmlElement[]) => {
  elements.forEach((e) => e.hide());
};

export const showOrHideElements = (
  showIf: boolean,
  ...elements: ExtendedHtmlElement[]
) => {
  elements.forEach((e) => e.showOrHide(showIf));
};

export const lockInputs = (...inputs: ExtendedHtmlElement[]) => {
  inputs.forEach((e) => {
    const input = e.asHtmlElement();
    if (
      input instanceof HTMLInputElement ||
      input instanceof HTMLButtonElement ||
      input instanceof HTMLTextAreaElement ||
      input instanceof HTMLSelectElement
    ) {
      input.disabled = true;
    }
  });
  return () => {
    inputs.forEach((e) => {
      const input = e.asHtmlElement();
      if (
        input instanceof HTMLInputElement ||
        input instanceof HTMLButtonElement ||
        input instanceof HTMLTextAreaElement ||
        input instanceof HTMLSelectElement
      ) {
        input.disabled = false;
      }
    });
  };
};

export const IS_PRIMARY = [
  "is-primary",
  "is-link",
  "is-info",
  "is-success",
  "is-warning",
  "is-danger",
];
export const BULMA_STD_CLASSES = [
  "is-primary",
  "is-link",
  "is-info",
  "is-success",
  "is-warning",
  "is-danger",
];
