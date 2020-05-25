import { DOCUMENT_DATA_KEY } from "./constants";

export const completedTemplate = (
  documentData: string,
  pakoScript: string,
  ourScript: string
) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta content="text/html;charset=utf-8" http-equiv="Content-Type"></meta>
      </head>
      <body>
        <textarea id="data" class="data" disabled="disabled" style="display: none;">${documentData ||
          DOCUMENT_DATA_KEY}</textarea>
          <script type="text/javascript">${pakoScript}</script>
        <script type="text/javascript">${ourScript}</script>
      </body>
    </html>`;
};

export const emptyTemplate = (pakoScript: string, ourScript: string) => {
  return completedTemplate("", "", "");
};
