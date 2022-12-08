import md5 from "md5";
import { stringify } from "qs";

export const SERVICES = ["gemini", "imgix", "lambda"] as const;

export const MODES = ["resize", "crop"] as const;

export const DEFAULT_QUALITY = 80;

type Mode = typeof MODES[number];

type Config = {
  gemini?: {
    endpoint: string;
  };
  imgix?: {
    endpoint: string;
    token: string;
  };
  lambda?: {
    endpoint: string;
    sources: {
      source: string;
      bucket: string;
    }[];
  };
};

type Options = {
  width?: number;
  height?: number;
  quality?: number;
};

type Exec = (mode: Mode, src: string, options: Options) => string;

type Strategy = { exec: Exec };

export const validate = (mode: Mode, { width, height }: Options) => {
  if (mode === "crop" && (!width || !height)) {
    console.warn("`crop`requires both `width` and `height`");
    return false;
  }

  if (mode === "resize" && !width && !height) {
    console.warn("`resize` requires either `width` or `height`");
    return false;
  }

  if (width && width < 1) {
    console.warn("`width` must be greater than `0`");
    return false;
  }

  if (height && height < 1) {
    console.warn("`height` must be greater than `0`");
    return false;
  }

  return true;
};

/**
 * Returns a list of configured services.
 * All endpoints should *not* have trailing slashes.
 */
export const configure = <T extends Config>(config: T) => {
  const services = {} as Record<keyof T, Strategy>;

  if (config.gemini) {
    services.gemini = {
      exec: (mode, src, { width, height, quality = DEFAULT_QUALITY }) => {
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

        const query = stringify(params, {
          arrayFormat: "brackets",
          skipNulls: true,
          sort: (a, b) => a.localeCompare(b),
        });

        return `${config.gemini!.endpoint}?${query}`;
      },
    };
  }

  if (config.imgix) {
    services.imgix = {
      exec: (mode, src, { width, height, quality = DEFAULT_QUALITY }) => {
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
        const signature = md5(config.imgix!.token + path + query);

        return `${config.imgix!.endpoint}${path}${query}&s=${signature}`;
      },
    };
  }

  if (config.lambda) {
    services.lambda = {
      exec: (mode, src, { width, height, quality = DEFAULT_QUALITY }) => {
        if (!validate(mode, { width, height })) return src;
        const source = config.lambda!.sources.find((source) => {
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
        return `${config.lambda!.endpoint}/${encoded}`;
      },
    };
  }

  return services;
};
