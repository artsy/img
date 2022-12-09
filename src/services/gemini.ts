import { DEFAULT_QUALITY, Exec, validate } from "../services";
import { stringify } from "../utils/stringify";

export type Gemini = {
  endpoint: string;
};

export const gemini = (config: Gemini): Exec => {
  return (mode, src, { width, height, quality = DEFAULT_QUALITY }) => {
    if (!validate(mode, { width, height })) return src;

    let resizeTo: "width" | "height" | "fit" | "fill";

    switch (mode) {
      case "crop": {
        resizeTo = "fill";
      }

      case "resize": {
        if (width && !height) {
          resizeTo = "width";
        }

        if (height && !width) {
          resizeTo = "height";
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
