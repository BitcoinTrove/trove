import * as ObjecUtils from "./object";

const A = {
  one: "one",
  two: "two",
  three: "three",
};
const B = {
  two: "two",
  three: "THREE",
  four: "four",
};
const C = {};

const equalForKeys = (o1: object, o2: object, keys: string[]) => {
  const a = ObjecUtils.equalForKeys(o1, o2, keys);
  const b = ObjecUtils.equalForKeys(o2, o1, keys);
  expect(a).toEqual(b);
  return a;
};

const deepEquals = (o1: object, o2: object) => {
  const a = ObjecUtils.deepEquals(o1, o2);
  const b = ObjecUtils.deepEquals(o2, o1);
  expect(a).toEqual(b);
  return a;
};

describe("Object utils", () => {
  test("equalForKeys", () => {
    expect(equalForKeys(A, B, [])).toBe(true);
    expect(equalForKeys(A, B, ["two"])).toBe(true);
    expect(equalForKeys(A, B, ["three"])).toBe(false);
    expect(equalForKeys(A, B, ["four"])).toBe(false);
    expect(equalForKeys(A, B, ["five"])).toBe(true);
    expect(equalForKeys(A, C, [])).toBe(true);
    expect(equalForKeys(A, C, ["one"])).toBe(false);
    expect(equalForKeys(A, C, ["four"])).toBe(true);
  });

  test("clone", () => {
    const A1 = ObjecUtils.clone(A);
    const B1 = ObjecUtils.clone(B);
    const C1 = ObjecUtils.clone(C);
    expect(deepEquals(A, A1)).toBe(true);
    expect(deepEquals(B, B1)).toBe(true);
    expect(deepEquals(C, C1)).toBe(true);
  });

  test("deepEquals", () => {
    expect(deepEquals(A, B)).toBe(false);
    expect(deepEquals(B, C)).toBe(false);
    expect(deepEquals(C, A)).toBe(false);
  });

  test("isEmpty", () => {
    expect(ObjecUtils.isEmpty(A)).toBe(false);
    expect(ObjecUtils.isEmpty(B)).toBe(false);
    expect(ObjecUtils.isEmpty(C)).toBe(true);
  });
});
