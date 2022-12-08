# @artsy/img

#### Meta 
- TODO 

## Usage

```tsx
import { configure } from "@artsy/img";

const services = configure({
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

services.gemini.exec(
  "resize",
  "https://d32dm0rphc51dk.cloudfront.net/MFFPXvpJSoGzggU8zujwBw/normalized.jpg",
  { width: 400, height: 400 }
);
// => https://d7hftxdivxxvm.cloudfront.net?height=400&quality=80&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FMFFPXvpJSoGzggU8zujwBw%2Fnormalized.jpg&width=400
```
