export const stringify = (
  params: Record<string, string | number | undefined | null | boolean>
): string => {
  const keys = Object.keys(params)
    // Alphabetize the keys
    .sort((a, b) => a.localeCompare(b))
    // Filter out null or undefined values
    .filter((key) => params[key] != null);

  return keys
    .map((key) => {
      const value = `${params[key]}`;

      // For 'src' parameter, use smart encoding to avoid double-encoding
      if (key === "src" && isAlreadyEncoded(value)) {
        return `${key}=${smartEncode(value)}`;
      }

      return `${key}=${encodeURIComponent(value)}`;
    })
    .join("&");
};

// Helper function to detect if a URL is already encoded
const isAlreadyEncoded = (url: string): boolean => {
  // If it contains percent-encoded characters like %20, %2B, %2F, it's likely already encoded
  return /%[0-9A-Fa-f]{2}/.test(url);
};

// Smart encoding function that encodes for URL parameter use but preserves already-encoded parts
const smartEncode = (url: string): string => {
  return url.replace(
    /(%[0-9A-Fa-f]{2})|([^%]+)|%/g,
    (_match, validEncoded, rawText) => {
      if (validEncoded) {
        return validEncoded; // Keep valid percent-encodings as-is
      } else if (rawText) {
        return encodeURIComponent(rawText); // Encode raw text segments
      } else {
        return "%25"; // Encode lone % characters
      }
    }
  );
};
