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
  });
});
