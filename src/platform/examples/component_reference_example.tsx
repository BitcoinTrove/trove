import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { extendHtmlElement } from "../util/extended_html_element";
import { htmlRef } from "../util/html_ref";
import { compRef } from "../util/component_references";
import { randomInt } from "../../trove/util/random";

type TodoItemListRef = {
  addItem: (itemValue: string) => void;
  getList: () => string[];
};

export const TodoItemList = ({
  compRef,
  onListChanged,
}: {
  compRef: TodoItemListRef;
  onListChanged: () => void;
}) => {
  const ulRef = htmlRef();
  compRef.addItem = (itemValue: string) => {
    const newItem = (
      <li>
        <span class="item">{itemValue}</span>
        <button
          class="delete"
          onClick={(e) => {
            newItem.remove();
            onListChanged();
          }}
        ></button>
      </li>
    );
    ulRef.appendChild(newItem);
    onListChanged();
  };
  compRef.getList = () => {
    return ulRef.getChildren().map((c) => c.find("li span.item").getText());
  };
  return <ul ref={ulRef}></ul>;
};

// This doesn't work
class OldClassComponent {
  constructor() {}

  public render() {
    return <div>It's alive!!</div>;
  }
}

interface TestButtonRef {
  setText: (text: string) => void;
  makeSucces: () => void;
}
const TestButton = ({
  compRef,
  onClick,
}: {
  compRef: TestButtonRef;
  onClick: () => void;
}) => {
  const button = extendHtmlElement(
    <button class="button" onClick={onClick}>
      initial text
    </button>
  );
  compRef.setText = (text: string) => {
    button.setText(text);
  };
  compRef.makeSucces = () => {
    button.addClass("is-success");
  };

  return button.asHtmlElement();
};

export const TodoApp = () => {
  const todoItemList = compRef<TodoItemListRef>();
  const button1 = compRef<TestButtonRef>();
  const button2 = compRef<TestButtonRef>();
  return (
    <table>
      <tbody>
        <tr>
          <td>
            <OldClassComponent />
            <TestButton
              compRef={button1}
              onClick={() => {
                button2.setText("abcd");
              }}
            ></TestButton>
            <TestButton
              compRef={button2}
              onClick={button1.makeSucces}
            ></TestButton>
          </td>
        </tr>
        <tr>
          <td>
            <TodoItemList
              compRef={todoItemList}
              onListChanged={() => {
                console.log(todoItemList.getList());
              }}
            />
          </td>
        </tr>
        <tr>
          <td>
            <button
              class="button is-info"
              onClick={(e) => {
                todoItemList.addItem("Item #" + randomInt(100));
              }}
            >
              Add item
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
