import { createTroveWithData } from "../src/shared/index_template_utils";
import * as Babel from "@babel/standalone";
import { FILENAME } from "../src/shared/constants";
import { depsFromPackageLock } from "./deps_from_package_lock";
import { DocumentData } from "../src/trove/types/document_data";

var fs = require("fs");
var cheerio = require("cheerio");
var pako = require("pako");

const USE_PAKO = true;
const PAKO_INFLATE = fs.readFileSync(
  "node_modules/pako/dist/pako_inflate.min.js",
  "utf8"
);

const INDEX_TEMPLATE = (script) => {
  const options = {
    presets: [["es2015", { loose: true, modules: false }]],
  };
  script = Babel.transform(script, options).code;
  var compressedScript = Buffer.from(pako.deflate(script)).toString("base64");

  const documentData = {
    dependencies: depsFromPackageLock(),
  } as DocumentData;

  if (USE_PAKO) {
    var newscript = `var newScript = document.createElement("script");
      var encodedScript = "${compressedScript}";

      var decodedScript = window.atob(encodedScript);
      var decodedScriptLength = decodedScript.length;
      var decodedBytes = new Uint8Array(new ArrayBuffer(decodedScriptLength));

      for(var i = 0; i < decodedScriptLength; i++) {
        decodedBytes[i] = decodedScript.charCodeAt(i);
      }

      var decompressedBytes = pako.inflate(decodedBytes);

      var fullText = "";
      for (var i = 0 ; i < decompressedBytes.length; ++i) {
        fullText += String.fromCharCode(decompressedBytes[i]);
      }

      try {
        newScript.appendChild(document.createTextNode(fullText));
      } catch (e) {
        newScript.text = fullText;
      }

      document.body.appendChild(newScript);
    `;
    return createTroveWithData(documentData, PAKO_INFLATE, newscript);
  } else {
    return createTroveWithData(documentData, "", script);
  }
};

fs.readFile("release/" + FILENAME, "utf8", (err, contents) => {
  if (err) throw err;
  var $ = cheerio.load(contents);

  // concatinate all of the styles
  var concatinatedStyles = "";
  $("style")
    .toArray()
    .forEach((element, index) => {
      concatinatedStyles += element.children[0].data;
    });

  // delete all the styles except the first
  // set the concatinated styles on the first one.
  $("style")
    .toArray()
    .forEach((element, index) => {
      $(element).remove();
    });

  var styleRecreationScript = `var styleElement = document.createElement("style");
      styleElement.type = 'text/css';
      var tempStyles = \`${concatinatedStyles}\`;
      if (styleElement.styleSheet)  
        styleElement.styleSheet.cssText = tempStyles; 
      else  
        styleElement.appendChild(document.createTextNode(tempStyles));
      document.getElementsByTagName("head")[0].appendChild(styleElement); `;

  var imagesInnerHtml = $($(".imagests").toArray()[0]).html();
  $($(".imagests").toArray()[0]).remove();
  // The images kinda get double base64 encoded, which I thought would be bad
  // Some quick testing and making them only encoded once produced a bigger file.
  // TODO - This should all be simplified and cleaned up.
  var imagesInjectionScript = `var imagesDiv = document.createElement("div");
      imagesDiv.classList.add("imagests2");
      imagesDiv.style.display = "none";
      imagesDiv.innerHTML = \`${imagesInnerHtml}\`
      document.body.appendChild(imagesDiv);`;

  // concatinate all of the scripts
  var concatinatedScripts =
    styleRecreationScript + "\n" + imagesInjectionScript;
  $("script")
    .toArray()
    .forEach((element, index) => {
      concatinatedScripts +=
        "\n\r\n\r//testpoint" + index + "\n\r\n\r" + element.children[0].data;
    });

  // delete all the scripts except the first
  // set the concatinated scripts on the first one.
  $("script")
    .toArray()
    .forEach((element, index) => {
      $(element).remove();
    });

  contents = INDEX_TEMPLATE(concatinatedScripts);

  fs.writeFile("release/" + FILENAME, contents, (err) => {
    if (err) throw err;
    console.log("bootstrapified");
  });
});
