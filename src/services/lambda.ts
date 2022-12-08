import { DEFAULT_QUALITY, Exec, validate } from "../services";

export type Lambda = {
  endpoint: string;
  sources: {
    source: string;
    bucket: string;
  }[];
};

export const lambda = (config: Lambda): Exec => {
  return (mode, src, { width, height, quality = DEFAULT_QUALITY }) => {
    if (!validate(mode, { width, height })) return src;

    const source = config.sources.find((source) => {
      return src.startsWith(source.source);
    });

    if (!source) return src;

    const params = {
      bucket: source.bucket,
      key: src.replace(`${source.source}/`, ""),
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
