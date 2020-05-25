import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { InternalImage } from "../images/platform_images";

export const ImageAndText = ({
  image,
  body,
}: {
  image: InternalImage;
  body: JSX.Element;
}) => {
  return (
    <table>
      <tbody>
        <tr>
          <td style="width: 20%;">
            <img src={image.src}></img>
          </td>
          <td>{body}</td>
        </tr>
      </tbody>
    </table>
  );
};
