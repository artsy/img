export const stringify = (
  params: Record<string, string | number | undefined | null | boolean>
): string => {
  const keys = Object.keys(params)
    // Alphabetize the keys
    .sort((a, b) => a.localeCompare(b))
    // Filter out null values
    .filter((key) => params[key] !== null);

  return keys
    .map((key) => {
      return `${key}=${encodeURIComponent(`${params[key]}`)}`;
    })
    .join("&");
};
