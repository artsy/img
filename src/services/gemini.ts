import {
  DEFAULT_IMG_QUALITY,
  ResizeExec,
  validateResizeOptions,
} from "../services";
import { stringify } from "../utils/stringify";

export type Gemini = {
  endpoint: string;
};

export const gemini = (config: Gemini): ResizeExec => {
  return (mode, src, { width, height, quality = DEFAULT_IMG_QUALITY }) => {
    if (!validateResizeOptions(mode, { width, height })) return src;

    let resizeTo: "width" | "height" | "fit" | "fill";

    switch (mode) {
      case "crop": {
        resizeTo = "fill";
        break;
      }

      case "resize": {
        if (width && !height) {
          resizeTo = "width";
          break;
        }

        if (height && !width) {
          resizeTo = "height";
          break;
        }

        resizeTo = "fit";
      }
    }

    const params = {
      height,
      resize_to: resizeTo,
      src,
      width,
      quality,
    };

    const query = stringify(params);

    return `${config.endpoint}?${query}`;
  };
};
