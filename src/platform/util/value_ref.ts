export interface ValueRef<T> {
  onChange: (a: (t: T) => void) => void;
  setValue: (t: T) => void;
  trigger: () => void;
}
export function valueRef<T>() {
  const handlers = [];
  return {
    onChange: (a: (t: T) => void) => {
      handlers.push(a);
    },
    setValue: (t: T) => {
      handlers.forEach((h) => h(t));
    },
  } as ValueRef<T>;
}
