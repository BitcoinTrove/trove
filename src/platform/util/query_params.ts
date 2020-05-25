// Copy-pasta from https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
export const getParameterByName = name => {
  const url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

export const hasParameter = name => {
  return getParameterByName(name) !== null;
};
