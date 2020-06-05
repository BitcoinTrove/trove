import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { htmlRef } from "../util/html_ref";
import { extendHtmlElement } from "../util/extended_html_element";

export const FilterTable = ({
  headers,
  data,
}: {
  headers: JSX.Element[];
  data: string[][];
}) => {
  const table = htmlRef();
  const filterInput = htmlRef();
  const resultsCount = htmlRef();
  const previousButton = htmlRef();
  const pageNumber = htmlRef();
  const nextButton = htmlRef();

  const PAGE_SIZE = 10;
  let currentPage = 0;

  const setRows = (rows: string[][]) => {
    table.empty(1);
    rows.forEach((row) => {
      table.appendChild(
        <tr>
          {row.map((cell) => {
            return <td>{cell}</td>;
          })}
        </tr>
      );
    });
    for (let i = 0; i < PAGE_SIZE - rows.length; ++i) {
      table.appendChild(
        <tr>
          <td colSpan={2}>
            <span style="color: transparent;">Mpqlh</span>
          </td>
        </tr>
      );
    }
  };

  const filterChanged = () => {
    currentPage = 0;
    const filterValue = filterInput.getValueString();
    // TODO - We only check the first cell value here, maybe check all?
    const filteredData = data.filter((row) => {
      return row[0].indexOf(filterValue) > -1;
    });
    resultsCount.setText(filteredData.length + " results");
    const pages = Math.floor(filteredData.length / PAGE_SIZE) + 1;

    const loadPage = (index: number) => {
      const startIndex = PAGE_SIZE * index;
      const pagedData = filteredData.slice(startIndex, startIndex + PAGE_SIZE);
      setRows(pagedData);
      pageNumber.setText("page " + (index + 1) + " of " + pages);
      previousButton.showOrHide(currentPage > 0);
      nextButton.showOrHide(currentPage < pages - 1);
    };
    loadPage(0);

    previousButton.events().onclick = (e) => {
      currentPage -= 1;
      loadPage(currentPage);
    };
    nextButton.events().onclick = (e) => {
      currentPage += 1;
      loadPage(currentPage);
    };
  };

  const filterTable = extendHtmlElement(
    <div style="max-width: 80%;">
      <span>Filter: </span>
      <input
        ref={filterInput}
        class="input is-small"
        type="text"
        style="width: 180px;"
        onInput={(e) => {
          filterChanged();
        }}
      ></input>
      <span ref={resultsCount} style="float: right;"></span>
      <table
        class="table is-bordered is-striped"
        style="margin-top: 8px; width: 100%; margin-bottom: 0;"
      >
        <tbody ref={table}>
          <tr>
            {headers.map((h) => (
              <th>{h}</th>
            ))}
          </tr>
        </tbody>
      </table>
      <div style="display: flex;">
        <span ref={previousButton} class="link">
          Previous
        </span>
        <span ref={pageNumber} style="margin: auto;"></span>
        <span ref={nextButton} class="link">
          Next
        </span>
      </div>
    </div>
  );
  filterChanged();
  return filterTable.asHtmlElement();
};
