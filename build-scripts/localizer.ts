import { replaceAll, UNSIGNED_FILENAME } from "../src/shared/constants";

// NOTE - I don't think this is being properly interpretted as ts. It seems to be only seen as js
// TODO - Look at switching to synchronous calls (fs.readFileSync)
// NOTE - It's a pity that getParameterByName is added to the page. This already exists elsewhere in the browser code

var fs = require("fs");
var cheerio = require("cheerio");
var recast = require("recast");

var locFiles = fs.readdirSync("localization");
console.log("locFiles");
console.log(locFiles);
var languages = new Set();

var content = {};

const aCharCode = "a".charCodeAt(0);
const ACharCode = "A".charCodeAt(0);
// Any locales that begin with "fake_" will be populated with fake localization text
// Note: You may need to run a release build twice. First time populates the files, second time uses them.
// I'm not sure if this fake localization stuff
// TODO - Can this be removed? What is it useful for? (Update the localization section in README)
const fakeLocalization = (text: string) => {
  let newText = "";
  for (let i = 0; i < text.length; ++i) {
    const c = text[i];
    if (c >= "a" && c <= "z") {
      newText += String.fromCharCode(
        aCharCode + Math.floor(Math.random() * 26)
      );
    } else if (c >= "A" && c <= "Z") {
      newText += String.fromCharCode(
        ACharCode + Math.floor(Math.random() * 26)
      );
    } else {
      newText += c;
    }
  }
  return newText;
};

locFiles.forEach((filename) => {
  if (filename.endsWith(".json")) {
    var thisLocale = filename.substring(0, filename.length - 5);
    languages.add(thisLocale);
    var localeContent = JSON.parse(fs.readFileSync("localization/" + filename));
    for (var key in localeContent) {
      if (!content[key]) {
        content[key] = {};
      }
      content[key][thisLocale] = localeContent[key];
    }
  }
});

var textToIndex = new Map();
var foundText = [];
fs.readFile("release/" + UNSIGNED_FILENAME, "utf8", (err, contents) => {
  if (err) throw err;

  var $ = cheerio.load(contents);
  $("#indexts")
    .toArray()
    .forEach((element, index) => {
      // This forEach should only be called once. We are only doing this for #index.ts
      // This code can assume it will only be run once. This is likely brittle.
      element.children.forEach((child) => {
        if (child.type === "text") {
          var ast = recast.parse(child.data);
          recast.visit(ast, {
            visitCallExpression: function (path) {
              if (path.value.callee.name === "localize") {
                if (!textToIndex.has(path.value.arguments[0].value)) {
                  textToIndex.set(
                    path.value.arguments[0].value,
                    textToIndex.size
                  );
                  foundText.push(path.value.arguments[0].value);
                }
                path.value.arguments[0].value = textToIndex.get(
                  path.value.arguments[0].value
                );
              }
              this.traverse(path); // continue visiting
            },
          });
          child.data = recast.print(ast).code;
        }
      });
    });

  var localizationLookup = "var localizationLookup = {\n";

  localizationLookup += "en: [";
  var d = "";
  foundText.forEach((key, index) => {
    localizationLookup += d + "`" + key + "`";
    d = ", ";
  });
  localizationLookup += "]";

  var txtFile = "";
  foundText.forEach((key, index) => {
    txtFile += key + "\n";
  });
  fs.writeFile("localization/en.txt", txtFile, (err) => {
    if (err) throw err;
  });

  languages.forEach((language: string) => {
    const isFake = language.length > 5 && language.substring(0, 5) === "fake_";
    localizationLookup += ",\n" + language + ": [";
    var d = "";
    foundText.forEach((key: string, index) => {
      var localizedText = undefined;
      if (content[key]) {
        var languageText = content[key];
        if (languageText[language]) {
          localizedText = languageText[language];
        } else {
          content[key][language] = isFake ? fakeLocalization(key) : null;
        }
      } else {
        content[key] = {};
        content[key][language] = isFake ? fakeLocalization(key) : null;
      }
      localizedText = localizedText ? "`" + localizedText + "`" : "undefined";
      localizationLookup += d + localizedText;
      d = ", ";
    });
    localizationLookup += "]";
  });

  localizationLookup += "\n};";

  for (var k in content) {
    if (!textToIndex.has(k)) {
      delete content[k];
    }
  }

  languages.forEach((language) => {
    var newContent = {};
    for (var k in content) {
      newContent[k] = content[k][language];
    }

    fs.writeFile(
      "localization/" + language + ".json",
      JSON.stringify(newContent, null, 4),
      (err) => {
        if (err) throw err;
      }
    );

    var txtFile = "";
    for (var k in content) {
      txtFile += content[k][language] + "\n";
    }
    fs.writeFile("localization/" + language + ".txt", txtFile, (err) => {
      if (err) throw err;
    });
  });

  contents = $.html();
  contents = replaceAll(
    contents,
    `<script id="localizer.ts"></script>`,
    `<script>
         window.isReleaseBuild = true;
         // console.log('localization injected');
         var getParameterByName = function(name) {
           var url = window.location.href;
           name = name.replace(/[\\[\\]]/g, "\\\\$$&");
           var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
           var results = regex.exec(url);
           if (!results) return null;
           if (!results[2]) return "";
           return decodeURIComponent(results[2].replace(/\\+/g, " "));
         };
         ${localizationLookup}
         window.queryLocale = getParameterByName("locale") || "en";
         window.uppercaseTextOnly = function(text) {
           var span = document.createElement('span');
           span.innerHTML = text;
           upperCase = function(node) {
             if (node.nodeType === 3) {
               node.data = node.data.toUpperCase();
             }
             for (var i = 0; i < node.childNodes.length; ++i) {
               upperCase(node.childNodes[i]);
             }
           }
           upperCase(span);
           return span.innerHTML;
         }
         if (window.queryLocale === 'uppercase') {
           localizationLookup["uppercase"] = localizationLookup["en"].map(function(t){
             return uppercaseTextOnly(t);
           })
         }
         var localeArray = localizationLookup[queryLocale] ? localizationLookup[queryLocale] : localizationLookup["en"];
         window.localize = function(index) {
          return localeArray[index] || localizationLookup["en"][index];
         };
      </script>`
  );
  fs.writeFile("release/" + UNSIGNED_FILENAME, contents, (err) => {
    if (err) throw err;
    console.log("localize function overwritten");
  });
});
