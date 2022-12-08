import md5 from "md5";
import { stringify } from "qs";
import { DEFAULT_QUALITY, Exec, validate } from "../services";

export type Imgix = {
  endpoint: string;
  token: string;
};

export const imgix = (config: Imgix): Exec => {
  return (mode, src, { width, height, quality = DEFAULT_QUALITY }) => {
    if (!validate(mode, { width, height })) return src;

    const params = {
      fit: { crop: "crop", resize: "clip" }[mode],
      height,
      width,
      quality,
      auto: "format",
    };

    const path = `/${encodeURIComponent(src)}`;
    const query = `?${stringify(params)}`;
    const signature = md5(config.token + path + query);

    return `${config.endpoint}${path}${query}&s=${signature}`;
  };
};
