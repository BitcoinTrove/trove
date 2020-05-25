import { canonicalize } from "json-canonicalize";

// TODO - Check for problematic types in o and return an error if found. Alternatively do this a better way.
// https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
export const clone = (o: object): object => {
  return JSON.parse(JSON.stringify(o));
};

export const deepEquals = (o1: object, o2: object): boolean => {
  return canonicalize(o1) === canonicalize(o2);
};

// Returns whether two objects are equal for the given keys
export const equalForKeys = (
  o1: object,
  o2: object,
  keys: string[]
): boolean => {
  if (!o1 || !o2) {
    throw "Objects cannot be null";
  }
  for (let keyIndex = 0; keyIndex < keys.length; ++keyIndex) {
    const key = keys[keyIndex];
    const v1 = o1[key];
    const v2 = o2[key];
    if ((!v1 && v2) || (v1 && !v2)) {
      return false;
    }
    if (v1 && JSON.stringify(o1[key]) !== JSON.stringify(o2[key])) {
      return false;
    }
  }
  return true;
};

export const isEmpty = (obj: object) => {
  return deepEquals(obj, {});
};
