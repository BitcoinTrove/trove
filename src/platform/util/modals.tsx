import * as React from "jsx-dom"; // Fake React for JSX->DOM support

export const removeAnyModals = () => {
  const modals = document.body.querySelectorAll(".modal");
  modals.forEach(m => {
    m.parentElement.removeChild(m);
  });
};

export const showTextInModal = (heading: string, text: string) => {
  removeAnyModals();
  const el = (
    <div class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-card" style="width: 90%; max-width: 900px;">
        <header class="modal-card-head">
          <p class="modal-card-title">{heading}</p>
          <button
            class="delete closeButton"
            aria-label="close"
            onClick={removeAnyModals}
          ></button>
        </header>
        <section class="modal-card-body">
          <pre style="white-space: pre-wrap; padding: 10px;">{text}</pre>
        </section>
        <footer class="modal-card-foot" style="justify-content: flex-end;">
          <button class="button closeButton" onClick={removeAnyModals}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
  document.body.appendChild(el);
};

export const showJsxInModal = (
  heading: string,
  jsx: JSX.Element,
  stretch: boolean,
  buttons?: JSX.Element
) => {
  removeAnyModals();
  const el = (
    <div class="modal is-active">
      <div class="modal-background"></div>
      <div
        class="modal-card"
        style={"max-width: 900px;" + (stretch ? "width: 90%;" : "")}
      >
        <header class="modal-card-head">
          <p class="modal-card-title">{heading}</p>
          <button
            class="delete closeButton"
            aria-label="close"
            onClick={removeAnyModals}
          ></button>
        </header>
        <section class="modal-card-body">{jsx}</section>
        <footer class="modal-card-foot" style="justify-content: flex-end;">
          {buttons || (
            <button class="button closeButton" onClick={removeAnyModals}>
              Close
            </button>
          )}
        </footer>
      </div>
    </div>
  );
  document.body.appendChild(el);
  return () => {
    removeAnyModals();
  };
};

export const showJsxInSimpleModal = (jsx: JSX.Element) => {
  removeAnyModals();

  const el = (
    <div class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-content">{jsx}</div>
      <button
        class="modal-close is-large"
        aria-label="close"
        onClick={removeAnyModals}
      ></button>
    </div>
  );

  document.body.appendChild(el);
  return () => {
    removeAnyModals();
  };
};

export const showJsxModal = (jsx: JSX.Element, onMount?: () => void) => {
  removeAnyModals();
  document.body.appendChild(jsx);
  if (onMount) {
    onMount();
  }
  return () => {
    removeAnyModals();
  };
};
