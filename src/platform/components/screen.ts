export abstract class Screen {
  el: HTMLElement;
  hashName: string;
  displayName: string;

  constructor(hashName: string, displayName: string) {
    this.hashName = hashName;
    this.displayName = displayName;

    // This is not performant because it is added for each screen.
    // This could become slow if there are lots of screens.
    const screen = this;
    window.addEventListener("popstate", function (event) {
      if (window.location.hash === "#" + hashName) {
        screen.show();
      }
    });
  }

  setContent(el: HTMLElement) {
    this.el = el;
    this.el.style.display = "none";
  }

  show() {
    history.pushState(null, null, "#" + this.hashName);
    Array.from(document.querySelectorAll(".screen")).forEach(
      (element: HTMLElement) => (element.style.display = "none")
    );
    this.el.style.display = "block";
  }
}
