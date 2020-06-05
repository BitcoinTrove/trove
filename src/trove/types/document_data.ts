import { SecretShareEnvelope } from "./secret_share_envelope";

export type AddressGenerator = {
  xpub: string;
  network: string;
  maxIndex: number;
};

export type DepVersions = {
  [key: string]: string;
};

export type DocumentData = {
  envelope?: SecretShareEnvelope;
  addressGenerator?: AddressGenerator;
  signature?: string;
  dependencies?: DepVersions;
};

export const getDocumentDataFromText: (text: string) => DocumentData = (
  text: string
) => {
  const html = document.createElement("html");
  html.innerHTML = text;
  return getDocumentDataFromNode(html);
};

export const getDocumentDataFromNode: (element: ParentNode) => DocumentData = (
  element: Element
) => {
  const documentDataString = getRawDocumentData(element);
  if (!documentDataString) {
    return {};
  }
  return JSON.parse(documentDataString);
};

export const getRawDocumentData: (element: ParentNode) => string = (
  element: Element
) => {
  const textarea: HTMLTextAreaElement = element.querySelector(".data");
  if (!textarea) {
    return "";
  }
  return textarea.value;
};

export const DOCUMENT_DATA: DocumentData = getDocumentDataFromNode(document);
