import { createTroveWithData } from "../../shared/index_template_utils";
import { DOCUMENT_DATA, DocumentData } from "../../trove/types/document_data";

export const createTroveWithDataInBrowser = (
  documentData: DocumentData = null
) => {
  const scripts = Array.from(document.body.querySelectorAll("script")).map(
    (e) => e as HTMLScriptElement
  );
  return createTroveWithData(
    documentData,
    scripts[0].textContent,
    scripts[1].textContent
  );
};

export const createTroveClean = () => {
  const cleanDocumentData = {
    dependencies: DOCUMENT_DATA.dependencies || {},
  } as DocumentData;
  return createTroveWithDataInBrowser(cleanDocumentData);
};
