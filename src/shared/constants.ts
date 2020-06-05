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

export const FILENAME = "trove.html";
