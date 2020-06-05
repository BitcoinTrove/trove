import * as React from "jsx-dom"; // Fake React for JSX->DOM support

export const BulmaLevel = ({ levelItems }: { levelItems: JSX.Element[] }) => {
  return (
    <nav class="level">
      {levelItems.map((item) => (
        <p class="level-item">{item}</p>
      ))}
    </nav>
  );
};
