import * as React from "jsx-dom"; // Fake React for JSX->DOM support

export interface InternalImage {
  src: string;
  create: () => HTMLImageElement;
}

export interface ImageCollection {
  [name: string]: InternalImage;
}

export const initializeImages = (collection: ImageCollection) => {
  Object.keys(collection).forEach((key) => {
    const element = document.getElementById("image." + key);
    collection[key] = {
      src: element.getAttribute("src"),
      create: () => {
        return (
          <img src={element.getAttribute("src")}></img>
        ) as HTMLImageElement;
      },
    };
  });
};
