import { renderToString } from "react-dom/server";
import { App } from "./App";

const html = renderToString(<App />);
await Bun.write(
  "index.html",
  `<!doctype html><html><head><title>Package compatibility</title></head><body><div id="root">${html}</div><script type="module" src="/client.tsx"></script></body></html>`,
);
