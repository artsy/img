import {
  DEFAULT_IMG_QUALITY,
  ResizeExec,
  validateResizeOptions,
} from "../services";

export type Lambda = {
  endpoint: string;
  sources: {
    source: string;
    bucket: string;
  }[];
};

export const lambda = (config: Lambda): ResizeExec => {
  return (mode, src, { width, height, quality = DEFAULT_IMG_QUALITY }) => {
    if (!validateResizeOptions(mode, { width, height })) return src;

    const source = config.sources.find((source) => {
      return src.startsWith(source.source);
    });

    if (!source) return src;

    const key = decodeURIComponent(
      src.replace(`${source.source}/`, "")
    ).replace(/\+/g, " ");

    const params = {
      bucket: source.bucket,
      key,
      edits: {
        resize: {
          width,
          height,
          fit: { crop: "cover", resize: "inside" }[mode],
        },
        webp: { quality },
        jpeg: { quality },
        rotate: null,
      },
    };

    const encoded = Buffer.from(JSON.stringify(params)).toString("base64");

    return `${config.endpoint}/${encoded}`;
  };
};
