import { completedTemplate } from "../../shared/index_template_utils";
import { DocumentData, getRawDocumentData } from "../../trove/trove_constants";
import { canonicalize } from "json-canonicalize";
import { replaceAll, DOCUMENT_DATA_KEY } from "../../shared/constants";
import { isEmpty } from "./object";

export const baseTemplate = (documentData: DocumentData = null) => {
  const scripts = Array.from(document.body.querySelectorAll("script")).map(
    (e) => e as HTMLScriptElement
  );
  const serializedDocumentData =
    documentData && !isEmpty(documentData)
      ? canonicalize(documentData)
      : DOCUMENT_DATA_KEY;
  return completedTemplate(
    serializedDocumentData,
    scripts[0].textContent,
    scripts[1].textContent
  );
};

export const removeDocumentDataFromText = (text: string) => {
  const html = document.createElement("html");
  html.innerHTML = text;
  const rawDocumentData = getRawDocumentData(html);
  return replaceAll(text, rawDocumentData, DOCUMENT_DATA_KEY);
};

export const replaceDocumentData = (
  text: string,
  documentData: DocumentData
) => {
  const html = document.createElement("html");
  html.innerHTML = text;
  const rawDocumentData = getRawDocumentData(html);
  return replaceAll(text, rawDocumentData, canonicalize(documentData));
};
