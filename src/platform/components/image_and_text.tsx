import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import { InternalImage } from "../util/image_utils";

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
