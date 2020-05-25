import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { ExtendedHtmlElement } from "../../platform/util/extended_html_element";

const base64toBlob = (base64string) => {
  var byteString = atob(base64string);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var bb = new Blob([ab], { type: "octet/stream" });
  return bb;
};

export const downloadBase64 = (base64string: string, filename: string) => {
  const blob = base64toBlob(base64string);
  const url = window.URL.createObjectURL(blob);
  const hiddenDownloadA = (
    <a download={filename} style="display: none;" href={url}></a>
  );
  document.body.appendChild(hiddenDownloadA);
  hiddenDownloadA.click();
  document.body.removeChild(hiddenDownloadA);
};

export const downloadCanvasAsImage = (
  canvas: ExtendedHtmlElement,
  filename: string
) => {
  const hiddenDownloadA = (
    <a
      download={filename}
      style="display: none;"
      href={canvas.asCanvas().toDataURL("image/png;base64")}
    ></a>
  );
  document.body.appendChild(hiddenDownloadA);
  hiddenDownloadA.click();
  document.body.removeChild(hiddenDownloadA);
};

export const download = (text: string, filename: string) => {
  var data = new Blob([text], { type: "text/plain" });
  const url = window.URL.createObjectURL(data);
  const hiddenDownloadA = (
    <a download={filename} style="display: none;" href={url}></a>
  );
  document.body.appendChild(hiddenDownloadA);
  hiddenDownloadA.click();
  document.body.removeChild(hiddenDownloadA);
};

export const readBase64 = (
  accept: string,
  callback: (data: Uint8Array) => void
) => {
  const hiddenInput = (
    <input
      type="file"
      accept={accept}
      style="display:none;"
      onChange={(e) => {
        const target: any = e.target;
        const file = target.files[0];
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.onload = function (e2) {
          const contents = (e2.target as any).result;
          const array = new Uint8Array(contents);
          callback(array);
        };
        reader.readAsArrayBuffer(file);
      }}
    ></input>
  );
  document.body.appendChild(hiddenInput);
  hiddenInput.click();
  document.body.removeChild(hiddenInput);
};

export const readText = (accept: string, callback: (text: string) => void) => {
  const hiddenInput = (
    <input
      type="file"
      accept={accept}
      style="display:none;"
      onChange={(e) => {
        const target: any = e.target;
        const file = target.files[0];
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.onload = function (e2) {
          const contents: string = (e2.target as any).result;
          callback(contents);
        };
        reader.readAsText(file);
      }}
    ></input>
  );
  document.body.appendChild(hiddenInput);
  hiddenInput.click();
  document.body.removeChild(hiddenInput);
};
