import { Gemini, gemini } from "./services/gemini";
import { imgix, Imgix } from "./services/imgix";
import { lambda, Lambda } from "./services/lambda";

export const RESIZE_MODES = ["resize", "crop"] as const;

export const DEFAULT_IMG_QUALITY = 80;

export type ResizeMode = typeof RESIZE_MODES[number];

export type ResizeOptions = {
  width?: number;
  height?: number;
  quality?: number;
  cachePolicy?: string;
};

export type ServiceConfigurations = {
  gemini?: Gemini;
  imgix?: Imgix;
  lambda?: Lambda;
};

export type ResizeExec = (
  mode: ResizeMode,
  src: string,
  options: ResizeOptions
) => string;

export type ImageService = { exec: ResizeExec };

export const validateResizeOptions = (
  mode: ResizeMode,
  { width, height, cachePolicy }: ResizeOptions
) => {
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
export const configureImageServices = <T extends ServiceConfigurations>(
  config: T
) => {
  const services = {} as Record<keyof T, ImageService>;

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
