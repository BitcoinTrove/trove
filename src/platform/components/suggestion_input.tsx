import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { htmlRef } from "../util/html_ref";

export interface SuggestionInputRef {
  setPretext: (text: string) => void;
  setPlaceHolder: (text: string) => void;
  setValue: (text: string, fireEvent?: boolean) => void;
  autoComplete(suggested: string);
  focusAndSelect: () => void;
  hide: () => void;
}

export const SuggestionInput = ({
  suggestionInput,
  onInput,
  getSuggestions,
}: {
  suggestionInput?: SuggestionInputRef;
  onInput?: (e: Event) => void;
  getSuggestions?: (value: string) => string[];
}) => {
  const container = htmlRef();
  const input = htmlRef();
  const suggestions = htmlRef();
  const preText = htmlRef();
  let suggestionClicked = false;

  if (suggestionInput) {
    suggestionInput.setPretext = (text: string) => {
      container.addClass("has-icons-left");
      preText.setText(text);
      preText.show();
    };
    suggestionInput.setPlaceHolder = (text: string) => {
      input.setPlaceHolder(text);
    };
    suggestionInput.setValue = (text: string, fireEvent?: boolean) => {
      suggestions.empty().hide();
      input.setValue(text);
      fireEvent !== false && input.dispatchEvent(new Event("input"));
    };
    suggestionInput.autoComplete = (suggested: string) => {
      const cursorIndex = input.getValueString().length;
      setTimeout(() => {
        input.setValue(suggested);
        input.focus();
        input
          .asInput()
          .setSelectionRange(cursorIndex, suggested.length, "backward");
      }, 1);
    };
    suggestionInput.focusAndSelect = () => {
      input.focus().select();
    };
    suggestionInput.hide = () => {
      container.hide();
    };
  }

  const updateSuggestions = () => {
    if (!getSuggestions) {
      return;
    }
    const suggestedValues = getSuggestions(input.getValueString());
    suggestions
      .empty()
      .appendChildren(
        suggestedValues.map((suggestion) => (
          <li
            class="suggestion-list-item"
            onClick={(e) => {
              suggestionClicked = true;
              input.setValue(suggestion);
              input.focus();
              input.dispatchEvent(new Event("input"));
            }}
          >
            {suggestion}
          </li>
        ))
      )
      .showOrHide(
        suggestedValues.length > 0 &&
          (suggestedValues.length != 1 ||
            suggestedValues[0] != input.getValueString())
      );
  };

  return (
    <div ref={container} class="control">
      <input
        ref={input}
        type="text"
        class="input is-medium"
        onBlur={(e) => {
          suggestionClicked = false;
          setTimeout(() => {
            !suggestionClicked && suggestions.hide();
          }, 500);
        }}
        onFocus={(e) => {
          updateSuggestions();
        }}
        onInput={(e) => {
          updateSuggestions();
          onInput && onInput(e);
        }}
        onKeyDown={(e) => {
          const allChildren = suggestions.getChildren();
          const selectedItem = suggestions.find(".selected");
          const selectedIndex = selectedItem
            ? selectedItem.indexInParent()
            : null;
          if (e.keyCode === 38 /* keyup */) {
            if (selectedIndex === null && allChildren.length > 0) {
              allChildren[allChildren.length - 1].addClass("selected");
            } else {
              selectedItem.removeClass("selected");
              allChildren[
                (allChildren.length + selectedIndex - 1) % allChildren.length
              ].addClass("selected");
            }
            e.preventDefault();
          }
          if (e.keyCode === 40 /* keydown */) {
            if (selectedIndex === null && allChildren.length > 0) {
              allChildren[0].addClass("selected");
            } else {
              selectedItem.removeClass("selected");
              allChildren[(selectedIndex + 1) % allChildren.length].addClass(
                "selected"
              );
            }
            e.preventDefault();
          }
          if (e.keyCode === 13 /* enter */) {
            if (selectedItem) {
              input.setValue(selectedItem.getText());
            }
            e.preventDefault();
            input.dispatchEvent(new Event("input"));
          }

          if (e.keyCode === 8 /* backspace */) {
            // remove the auto complete text
            input.setValue(
              input
                .getValueString()
                .substring(0, input.asInput().selectionStart)
            );
          }
        }}
      ></input>
      <span ref={preText} class="icon is-left" style="display: none;"></span>
      <div style="position: fixed; z-index: 5;">
        <ol
          ref={suggestions}
          class="suggestion-list"
          style="display: none; background-color: white;"
        ></ol>
      </div>
    </div>
  );
};
