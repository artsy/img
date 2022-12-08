import { configure } from "../strategies";

describe("strategies", () => {
  it("only returns the services that are configured", () => {
    const services = configure({ gemini: { endpoint: "https://example.com" } });

    expect(Object.keys(services)).toEqual(["gemini"]);
  });

  const { gemini, imgix, lambda } = configure({
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
      ],
    },
  });

  describe("gemini", () => {
    it("returns a resized url", () => {
      const img = gemini.exec(
        "resize",
        "https://d32dm0rphc51dk.cloudfront.net/MFFPXvpJSoGzggU8zujwBw/normalized.jpg",
        { width: 200, height: 200 }
      );

      expect(img).toEqual(
        "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg&width=200"
      );
    });

    it("returns a cropped url", () => {
      const img = gemini.exec(
        "crop",
        "https://d32dm0rphc51dk.cloudfront.net/MFFPXvpJSoGzggU8zujwBw/normalized.jpg",
        { width: 200, height: 200 }
      );

      expect(img).toEqual(
        "https://d7hftxdivxxvm.cloudfront.net?height=200&quality=80&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg&width=200"
      );
    });
  });

  describe("imgix", () => {
    it("returns a resized url", () => {
      const img = imgix.exec(
        "resize",
        "https://d32dm0rphc51dk.cloudfront.net/MFFPXvpJSoGzggU8zujwBw/normalized.jpg",
        { width: 200, height: 200 }
      );

      expect(img).toEqual(
        "https://example.imgix.net/https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg?fit=clip&height=200&width=200&quality=80&auto=format&s=5cce72615e263db4c22e027d2ae73cd1"
      );
    });

    it("returns a cropped url", () => {
      const img = imgix.exec(
        "crop",
        "https://d32dm0rphc51dk.cloudfront.net/MFFPXvpJSoGzggU8zujwBw/normalized.jpg",
        { width: 200, height: 200 }
      );

      expect(img).toEqual(
        "https://example.imgix.net/https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg?fit=crop&height=200&width=200&quality=80&auto=format&s=3fd908feecc9fecb39aebe909071c362"
      );
    });
  });

  describe("lambda", () => {
    it("returns a resized url", () => {
      const img = lambda.exec(
        "resize",
        "https://d32dm0rphc51dk.cloudfront.net/MFFPXvpJSoGzggU8zujwBw/normalized.jpg",
        { width: 200, height: 200 }
      );

      expect(img).toEqual(
        "https://d1j88w5k23s1nr.cloudfront.net/eyJidWNrZXQiOiJhcnRzeS1tZWRpYS1hc3NldHMiLCJrZXkiOiJNRkZQWHZwSlNvR3pnZ1U4enVqd0J3L25vcm1hbGl6ZWQuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjoyMDAsImhlaWdodCI6MjAwLCJmaXQiOiJpbnNpZGUifSwid2VicCI6eyJxdWFsaXR5Ijo4MH0sImpwZWciOnsicXVhbGl0eSI6ODB9LCJyb3RhdGUiOm51bGx9fQ=="
      );
    });

    it("returns a cropped url", () => {
      const img = lambda.exec(
        "crop",
        "https://d32dm0rphc51dk.cloudfront.net/MFFPXvpJSoGzggU8zujwBw/normalized.jpg",
        { width: 200, height: 200 }
      );

      expect(img).toEqual(
        "https://d1j88w5k23s1nr.cloudfront.net/eyJidWNrZXQiOiJhcnRzeS1tZWRpYS1hc3NldHMiLCJrZXkiOiJNRkZQWHZwSlNvR3pnZ1U4enVqd0J3L25vcm1hbGl6ZWQuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjoyMDAsImhlaWdodCI6MjAwLCJmaXQiOiJjb3ZlciJ9LCJ3ZWJwIjp7InF1YWxpdHkiOjgwfSwianBlZyI6eyJxdWFsaXR5Ijo4MH0sInJvdGF0ZSI6bnVsbH19"
      );
    });
  });
});
