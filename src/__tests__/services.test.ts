import { configureImageServices } from "../services";

const EXAMPLE_SRC =
  "https://d32dm0rphc51dk.cloudfront.net/MFFPXvpJSoGzggU8zujwBw/normalized.jpg";

describe("strategies", () => {
  it("only returns the services that are configured", () => {
    const services = configureImageServices({
      gemini: { endpoint: "https://example.com" },
    });

    expect(Object.keys(services)).toEqual(["gemini"]);
  });

  const { gemini, imgix, lambda } = configureImageServices({
    imgix: {
      endpoint: "https://example.imgix.net",
      token: "secret",
    },
    gemini: {
      endpoint: "https://d7hftxdivxxvm.cloudfront.net",
    },
    lambda: {
      endpoint: "https://d1j88w5k23s1nr.cloudfront.net",
      sources: [
        {
          source: "https://d32dm0rphc51dk.cloudfront.net",
          bucket: "artsy-media-assets",
        },
        {
          source: "https://artsy-media-uploads.s3.amazonaws.com",
          bucket: "artsy-media-uploads",
        },
      ],
    },
  });

  describe("gemini", () => {
    it("returns a resized url", () => {
      const img = gemini.exec("resize", EXAMPLE_SRC, {
        width: 200,
        height: 200,
      });

      expect(img).toEqual(
        "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg&width=200"
      );
    });

    it("returns a resized url with only width specified", () => {
      const img = gemini.exec("resize", EXAMPLE_SRC, { width: 200 });

      expect(img).toEqual(
        "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg&width=200"
      );
    });

    it("returns a resized url with only height specified", () => {
      const img = gemini.exec("resize", EXAMPLE_SRC, { height: 200 });

      expect(img).toEqual(
        "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=height&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg"
      );
    });

    it("returns a cropped url", () => {
      const img = gemini.exec("crop", EXAMPLE_SRC, { width: 200, height: 200 });

      expect(img).toEqual(
        "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg&width=200"
      );
    });

    it("encodes raw URLs with spaces and special characters", () => {
      const srcWithSpaces = "https://example.com/file name.jpg";
      const img = gemini.exec("resize", srcWithSpaces, {
        width: 200,
        height: 200,
      });

      expect(img).toEqual(
        "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=fit&src=https%3A%2F%2Fexample.com%2Ffile%20name.jpg&width=200"
      );

      // Verify the src parameter can be decoded correctly
      const urlParams = new URLSearchParams(img.split("?")[1]);
      expect(urlParams.get("src")).toEqual(srcWithSpaces);
    });

    it("does not double-encode already encoded URLs", () => {
      const alreadyEncodedSrc = "https://example.com/file%20name%2Bversion.jpg";
      const img = gemini.exec("resize", alreadyEncodedSrc, {
        width: 200,
        height: 200,
      });

      expect(img).toEqual(
        "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=fit&src=https%3A%2F%2Fexample.com%2Ffile%20name%2Bversion.jpg&width=200"
      );

      // Verify no double-encoding occurred
      expect(img).not.toContain("%2520"); // No double-encoded spaces
      expect(img).not.toContain("%252B"); // No double-encoded plus signs

      // Verify URL structure is properly encoded for parameter use
      expect(img).toContain("src=https%3A%2F%2F"); // URL structure encoded
    });

    it("handles URLs with parentheses correctly", () => {
      const srcWithParens = "https://example.com/file(name).jpg";
      const img = gemini.exec("resize", srcWithParens, {
        width: 200,
        height: 200,
      });

      expect(img).toEqual(
        "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=fit&src=https%3A%2F%2Fexample.com%2Ffile(name).jpg&width=200"
      );

      // Verify the src parameter can be decoded correctly
      const urlParams = new URLSearchParams(img.split("?")[1]);
      expect(urlParams.get("src")).toEqual(srcWithParens);
    });

    it("handles real-world S3 URLs with encoded characters", () => {
      const s3EncodedSrc =
        "https://artsy-media-uploads.s3.amazonaws.com/path%2Fto%2Ffile%20name.jpg";
      const img = gemini.exec("resize", s3EncodedSrc, {
        width: 200,
        height: 200,
      });

      expect(img).toEqual(
        "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=fit&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2Fpath%2Fto%2Ffile%20name.jpg&width=200"
      );

      // Verify no double-encoding of forward slashes or spaces
      expect(img).not.toContain("%252F"); // No double-encoded forward slashes
      expect(img).not.toContain("%2520"); // No double-encoded spaces

      // Verify URL structure is properly encoded for parameter use
      expect(img).toContain("src=https%3A%2F%2F"); // URL structure encoded
    });
  });

  describe("imgix", () => {
    it("returns a resized url", () => {
      const img = imgix.exec("resize", EXAMPLE_SRC, {
        width: 200,
        height: 200,
      });

      expect(img).toEqual(
        "https://example.imgix.net/https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg?auto=format&fit=clip&height=200&quality=80&width=200&s=1d931e11fbfb846dbe5f1ffa895017d9"
      );
    });

    it("returns a cropped url", () => {
      const img = imgix.exec("crop", EXAMPLE_SRC, { width: 200, height: 200 });

      expect(img).toEqual(
        "https://example.imgix.net/https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg?auto=format&fit=crop&height=200&quality=80&width=200&s=fd511845304eb4a5cad016b52aee939b"
      );
    });
  });

  describe("lambda", () => {
    it("returns a resized url", () => {
      const img = lambda.exec("resize", EXAMPLE_SRC, {
        width: 200,
        height: 200,
      });

      expect(img).toEqual(
        "https://d1j88w5k23s1nr.cloudfront.net/eyJidWNrZXQiOiJhcnRzeS1tZWRpYS1hc3NldHMiLCJrZXkiOiJNRkZQWHZwSlNvR3pnZ1U4enVqd0J3L25vcm1hbGl6ZWQuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjoyMDAsImhlaWdodCI6MjAwLCJmaXQiOiJpbnNpZGUifSwid2VicCI6eyJxdWFsaXR5Ijo4MH0sImpwZWciOnsicXVhbGl0eSI6ODB9LCJyb3RhdGUiOm51bGx9fQ=="
      );
    });

    it("returns a cropped url", () => {
      const img = lambda.exec("crop", EXAMPLE_SRC, { width: 200, height: 200 });

      expect(img).toEqual(
        "https://d1j88w5k23s1nr.cloudfront.net/eyJidWNrZXQiOiJhcnRzeS1tZWRpYS1hc3NldHMiLCJrZXkiOiJNRkZQWHZwSlNvR3pnZ1U4enVqd0J3L25vcm1hbGl6ZWQuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjoyMDAsImhlaWdodCI6MjAwLCJmaXQiOiJjb3ZlciJ9LCJ3ZWJwIjp7InF1YWxpdHkiOjgwfSwianBlZyI6eyJxdWFsaXR5Ijo4MH0sInJvdGF0ZSI6bnVsbH19"
      );
    });

    it("decodes any encoded keys", () => {
      const img = lambda.exec(
        "crop",
        "https://artsy-media-uploads.s3.amazonaws.com/MJVDlZdpah8pU2cASanWbQ%2FAPB0048_A_phc3cc.jpeg",
        { width: 200, height: 200 }
      );

      expect(img).toEqual(
        "https://d1j88w5k23s1nr.cloudfront.net/eyJidWNrZXQiOiJhcnRzeS1tZWRpYS11cGxvYWRzIiwia2V5IjoiTUpWRGxaZHBhaDhwVTJjQVNhbldiUS9BUEIwMDQ4X0FfcGhjM2NjLmpwZWciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjIwMCwiaGVpZ2h0IjoyMDAsImZpdCI6ImNvdmVyIn0sIndlYnAiOnsicXVhbGl0eSI6ODB9LCJqcGVnIjp7InF1YWxpdHkiOjgwfSwicm90YXRlIjpudWxsfX0="
      );
    });

    it('decodes any encoded keys with a "+"', () => {
      const img = lambda.exec(
        "crop",
        "https://artsy-media-uploads.s3.amazonaws.com/IxeU8_kDftXzCfFdM36fWA/MAG_Textile+Artists.jpg",
        { width: 200, height: 200 }
      );

      expect(img).toEqual(
        "https://d1j88w5k23s1nr.cloudfront.net/eyJidWNrZXQiOiJhcnRzeS1tZWRpYS11cGxvYWRzIiwia2V5IjoiSXhlVThfa0RmdFh6Q2ZGZE0zNmZXQS9NQUdfVGV4dGlsZSBBcnRpc3RzLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6MjAwLCJoZWlnaHQiOjIwMCwiZml0IjoiY292ZXIifSwid2VicCI6eyJxdWFsaXR5Ijo4MH0sImpwZWciOnsicXVhbGl0eSI6ODB9LCJyb3RhdGUiOm51bGx9fQ=="
      );
    });

    it("decodes keys with multiple '+'", () => {
      const img = lambda.exec(
        "crop",
        "https://artsy-media-uploads.s3.amazonaws.com/XPPFfQt-eyhkbVmFlcii2g%2FHauser+%26+Wirth+New+York%2C+542+West+22nd+Street-hires-4.jpg",
        { width: 200, height: 200 }
      );

      expect(img).toEqual(
        "https://d1j88w5k23s1nr.cloudfront.net/eyJidWNrZXQiOiJhcnRzeS1tZWRpYS11cGxvYWRzIiwia2V5IjoiWFBQRmZRdC1leWhrYlZtRmxjaWkyZy9IYXVzZXIgJiBXaXJ0aCBOZXcgWW9yaywgNTQyIFdlc3QgMjJuZCBTdHJlZXQtaGlyZXMtNC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjIwMCwiaGVpZ2h0IjoyMDAsImZpdCI6ImNvdmVyIn0sIndlYnAiOnsicXVhbGl0eSI6ODB9LCJqcGVnIjp7InF1YWxpdHkiOjgwfSwicm90YXRlIjpudWxsfX0="
      );
    });
  });
});
