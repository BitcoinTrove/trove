export const DOCUMENT_DATA_KEY = "__DOCUMENT_DATA__";

export const replaceAll = (full: string, old: string, neww: string) => {
  if (neww === old) {
    return full;
  } else if (neww.indexOf(old) > 0) {
    // Infinite loop detection
    throw "The old text cannot be a substring of the new text.";
  }
  while (true) {
    var index = full.indexOf(old);
    if (index === -1) {
      break;
    }
    full = full.substring(0, index) + neww + full.substring(index + old.length);
  }
  return full;
};

// This is not used everywhere yet, sadly
export const FILENAME = "trove.html";
export const UNSIGNED_FILENAME = "trove.html"; // "trove_unsigned.html"; The signing stuff is disabled in favor of PGP
