# Vendored Geist fonts

These `.woff2` files are copied from the [`geist`](https://www.npmjs.com/package/geist) package
(a `devDependency`, pinned via `package.json`) and referenced by `../fonts.css` with co-located
relative URLs so any consumer's bundler resolves and emits them.

They are vendored on purpose: referencing them through `node_modules/geist/...` breaks once the
package is installed by a downstream app, because `geist`'s `exports` map blocks deep font imports
and the relative `node_modules` path no longer points at the font once dependencies are hoisted.

To refresh after a `geist` bump, recopy from `node_modules/geist/dist/fonts/` (the bracketed
`Italic[wght]` source files are renamed to `Italic-wght` here to avoid tooling edge cases).
