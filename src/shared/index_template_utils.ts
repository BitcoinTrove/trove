import { canonicalize } from "json-canonicalize";
import { DocumentData } from "../trove/types/document_data";

export const createTroveWithData = (
  documentData: DocumentData,
  pakoScript: string,
  ourScript: string
) => {
  const serializedDocumentData = canonicalize(documentData || {});
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta content="text/html;charset=utf-8" http-equiv="Content-Type"></meta>
      </head>
      <body>
        <textarea id="data" class="data" disabled="disabled" style="display: none;">${serializedDocumentData}</textarea>
        <script type="text/javascript">${pakoScript}</script>
        <script type="text/javascript">${ourScript}</script>
      </body>
    </html>`;
};
