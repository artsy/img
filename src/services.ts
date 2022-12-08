import { Gemini, gemini } from "./services/gemini";
import { imgix, Imgix } from "./services/imgix";
import { lambda, Lambda } from "./services/lambda";

export const SERVICES = ["gemini", "imgix", "lambda"] as const;

export const MODES = ["resize", "crop"] as const;

export const DEFAULT_QUALITY = 80;

export type Mode = typeof MODES[number];

export type Config = {
  gemini?: Gemini;
  imgix?: Imgix;
  lambda?: Lambda;
};

export type Options = {
  width?: number;
  height?: number;
  quality?: number;
};

export type Exec = (mode: Mode, src: string, options: Options) => string;

export type Service = { exec: Exec };

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
  const services = {} as Record<keyof T, Service>;

  if (config.gemini) {
    services.gemini = { exec: gemini(config.gemini) };
  }

  if (config.imgix) {
    services.imgix = { exec: imgix(config.imgix) };
  }

  if (config.lambda) {
    services.lambda = { exec: lambda(config.lambda) };
  }

  return services;
};
