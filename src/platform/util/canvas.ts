export const measureText = (
  text: string,
  font: string,
  fontSize: number
): number[] => {
  const canvas = document.createElement("canvas");
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
  ctx.font = font;
  const addressMeasurement = ctx.measureText(text);
  const height = fontSize;
  return [addressMeasurement.width, height];
};

/* 
If maxWidth is specified, text is wrapped on any character. textAsCanvas2 will wrap on words.
TODO - These should be joined
*/
export const textAsCanvas = (
  text: string,
  font: string,
  fontSize: number,
  maxWidth: number = -1
): HTMLCanvasElement => {
  const [textWidth, textHeight] = measureText(text, font, fontSize);

  const lines = [];
  while (text.length > 0) {
    let cutIndex = text.length;
    let subText = text.substring(0, cutIndex);
    let subTextWidth = measureText(subText, font, fontSize)[0];
    while (maxWidth != -1 && subTextWidth > maxWidth) {
      cutIndex -= 1;
      subText = text.substring(0, cutIndex);
      subTextWidth = measureText(subText, font, fontSize)[0];
    }
    lines.push(subText);
    text = text.substring(cutIndex, text.length);
  }

  const canvas = document.createElement("canvas");
  canvas.width = maxWidth === -1 ? textWidth : Math.min(maxWidth, textWidth);
  canvas.height = textHeight * lines.length;
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  ctx.font = font;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  lines.forEach((line, index) => {
    ctx.fillText(line, 0, index * textHeight);
  });
  return canvas;
};

/* 
If maxWidth is specified, text is wrapped on any character. textAsCanvas will wrap on any character.
TODO - These should be joined
*/
export const textAsCanvas2 = (
  text: string,
  font: string,
  fontSize: number,
  maxWidth: number = -1
): HTMLCanvasElement => {
  const [textWidth, textHeight] = measureText(text, font, fontSize);

  const lines = [];
  let words = text.split(" ");
  while (words.length > 0) {
    let cutIndex = words.length;
    let subText = words.slice(0, cutIndex).join(" "); //text.substring(0, cutIndex);
    let subTextWidth = measureText(subText, font, fontSize)[0];
    while (maxWidth != -1 && subTextWidth > maxWidth) {
      cutIndex -= 1;
      subText = words.slice(0, cutIndex).join(" "); //text.substring(0, cutIndex);
      subTextWidth = measureText(subText, font, fontSize)[0];
    }
    lines.push(subText);
    // text = text.substring(cutIndex, text.length);
    words = words.slice(cutIndex, words.length);
  }
  const canvas = document.createElement("canvas");
  canvas.width = maxWidth === -1 ? textWidth : Math.min(maxWidth, textWidth);
  canvas.height = textHeight * lines.length;
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
  ctx.font = font;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  lines.forEach((line, index) => {
    ctx.fillText(line, 0, index * textHeight);
  });
  return canvas;
};

const combineVertical2 = (
  top: HTMLCanvasElement,
  bottom: HTMLCanvasElement
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");

  canvas.width = Math.max(top.width, bottom.width);
  canvas.height = top.height + bottom.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(top, Math.floor((canvas.width - top.width) / 2), 0);
  ctx.drawImage(
    bottom,
    Math.floor((canvas.width - bottom.width) / 2),
    top.height
  );
  return canvas;
};

export const combineVertical = (...elements: HTMLCanvasElement[]) => {
  let canvas = elements[0];
  for (let i = 1; i < elements.length; ++i) {
    canvas = combineVertical2(canvas, elements[i]);
  }
  return canvas;
};

const combineHorizontal2 = (
  left: HTMLCanvasElement,
  right: HTMLCanvasElement
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");

  canvas.width = left.width + right.width;
  canvas.height = Math.max(left.height, right.height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(left, 0, Math.floor((canvas.height - left.height) / 2));
  ctx.drawImage(
    right,
    left.width,
    Math.floor((canvas.height - right.height) / 2)
  );
  return canvas;
};

export const combineHorizontal = (...elements: HTMLCanvasElement[]) => {
  let canvas = elements[0];
  for (let i = 1; i < elements.length; ++i) {
    canvas = combineHorizontal2(canvas, elements[i]);
  }
  return canvas;
};

export const addMargins = (
  inputCanvas: HTMLCanvasElement,
  left: number,
  right: number,
  top: number,
  bottom: number
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");

  canvas.width = inputCanvas.width + left + right;
  canvas.height = inputCanvas.height + top + bottom;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(inputCanvas, left, top);
  return canvas;
};
