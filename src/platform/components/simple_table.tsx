import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { htmlRef } from "../util/html_ref";
import { extendHtmlElement } from "../util/extended_html_element";

export interface SimpleTableRef {
  setData: (data: string[][]) => void;
}
export const SimpleTable = ({
  simpleTable,
  headers,
  data,
}: {
  simpleTable: SimpleTableRef;
  headers: JSX.Element[];
  data?: string[][];
}) => {
  const table = htmlRef();

  simpleTable.setData = (data: string[][]) => {
    table.empty(1);
    data.forEach((row) => {
      table.appendChild(
        <tr>
          {row.map((cell) => {
            return <td>{cell}</td>;
          })}
        </tr>
      );
    });
  };

  if (data) {
    simpleTable.setData(data);
  }

  const filterTable = extendHtmlElement(
    <div>
      <table class="table is-bordered is-striped">
        <tbody ref={table}>
          <tr>
            {headers.map((h) => (
              <th>{h}</th>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
  return filterTable.asHtmlElement();
};
