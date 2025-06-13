import { stringify } from "../utils/stringify";

describe("stringify utility", () => {
  it("encodes parameter values correctly", () => {
    const params = {
      height: 200,
      width: 200,
      quality: 80,
      src: "https://example.com/file name.jpg",
    };

    const result = stringify(params);

    expect(result).toEqual(
      "height=200&quality=80&src=https%3A%2F%2Fexample.com%2Ffile%20name.jpg&width=200"
    );
  });

  it("does not double-encode src parameters that are already encoded", () => {
    const params = {
      height: 200,
      src: "https://example.com/file%20name%2Bversion.jpg",
      width: 200,
    };

    const result = stringify(params);

    expect(result).toEqual(
      "height=200&src=https%3A%2F%2Fexample.com%2Ffile%20name%2Bversion.jpg&width=200"
    );

    // Verify no double-encoding occurred
    expect(result).not.toContain("%2520"); // No double-encoded spaces
    expect(result).not.toContain("%252B"); // No double-encoded plus signs

    // Verify URL structure is properly encoded for parameter use
    expect(result).toContain("https%3A%2F%2F"); // Slashes and colons encoded
    expect(result).not.toContain("://"); // No raw URL structure
  });

  it("filters out null and undefined values", () => {
    const params = {
      height: 200,
      width: undefined,
      quality: null,
      src: "https://example.com/test.jpg",
      resize_to: "fit",
    };

    const result = stringify(params);

    expect(result).toEqual(
      "height=200&resize_to=fit&src=https%3A%2F%2Fexample.com%2Ftest.jpg"
    );

    // Verify null/undefined values are filtered out
    expect(result).not.toContain("width=");
    expect(result).not.toContain("quality=");
    expect(result).not.toContain("undefined");
    expect(result).not.toContain("null");
  });

  it("alphabetizes parameter keys", () => {
    const params = {
      z_param: "last",
      a_param: "first",
      m_param: "middle",
      src: "https://example.com/test.jpg",
    };

    const result = stringify(params);

    expect(result).toEqual(
      "a_param=first&m_param=middle&src=https%3A%2F%2Fexample.com%2Ftest.jpg&z_param=last"
    );
  });

  it("handles non-src parameters with special characters correctly", () => {
    const params = {
      custom_param: "value with spaces & symbols",
      src: "https://example.com/test.jpg",
    };

    const result = stringify(params);

    expect(result).toEqual(
      "custom_param=value%20with%20spaces%20%26%20symbols&src=https%3A%2F%2Fexample.com%2Ftest.jpg"
    );
  });

  it("detects already encoded URLs correctly", () => {
    const testCases = [
      {
        // "URL with encoded space"
        src: "https://example.com/file%20name.jpg",
        shouldBeDetectedAsEncoded: true,
        expectedResult: "src=https%3A%2F%2Fexample.com%2Ffile%20name.jpg",
      },
      {
        // "URL with encoded plus"
        src: "https://example.com/file%2Bname.jpg",
        shouldBeDetectedAsEncoded: true,
        expectedResult: "src=https%3A%2F%2Fexample.com%2Ffile%2Bname.jpg",
      },
      {
        // "URL with encoded forward slash"
        src: "https://example.com/path%2Fto%2Ffile.jpg",
        shouldBeDetectedAsEncoded: true,
        expectedResult: "src=https%3A%2F%2Fexample.com%2Fpath%2Fto%2Ffile.jpg",
      },
      {
        // "Raw URL with space"
        src: "https://example.com/file name.jpg",
        shouldBeDetectedAsEncoded: false,
        expectedResult: `src=${encodeURIComponent(
          "https://example.com/file name.jpg"
        )}`,
      },
      {
        // "Raw URL with plus"
        src: "https://example.com/file+name.jpg",
        shouldBeDetectedAsEncoded: false,
        expectedResult: `src=${encodeURIComponent(
          "https://example.com/file+name.jpg"
        )}`,
      },
      {
        // "Raw URL with parentheses"
        src: "https://example.com/file(name).jpg",
        shouldBeDetectedAsEncoded: false,
        expectedResult: `src=${encodeURIComponent(
          "https://example.com/file(name).jpg"
        )}`,
      },
    ];

    testCases.forEach(({ src, expectedResult }) => {
      const params = { src };
      const result = stringify(params);
      expect(result).toEqual(expectedResult);
    });
  });

  it("handles boolean and number parameters correctly", () => {
    const params = {
      enabled: true,
      disabled: false,
      count: 42,
      zero: 0,
      src: "https://example.com/test.jpg",
    };

    const result = stringify(params);

    expect(result).toEqual(
      "count=42&disabled=false&enabled=true&src=https%3A%2F%2Fexample.com%2Ftest.jpg&zero=0"
    );
  });

  it("handles edge case with mixed encoding scenarios", () => {
    // Test case where URL has both encoded and unencoded characters
    const mixedUrl = "https://example.com/file%20name+version.jpg";
    const params = { src: mixedUrl };
    const result = stringify(params);

    // Since it contains %20, it should be detected as already encoded
    // URL structure should be encoded, but %20 should not be double-encoded
    expect(result).toEqual(
      "src=https%3A%2F%2Fexample.com%2Ffile%20name%2Bversion.jpg"
    );
    expect(result).not.toContain("%2520"); // No double-encoding of %20
    expect(result).toContain("https%3A%2F%2F"); // URL structure encoded
  });
});
