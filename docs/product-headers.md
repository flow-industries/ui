# Product headers

Use `Header layout="product"`, `HeaderBrand` at its default size, and `HeaderActions` for standalone product chrome. Import `@flow-industries/ui/styles/base.css`; it includes the header contract. Keep header geometry independent of authentication state, account names, avatar loading, and scroll position.

| Property | Standard |
| --- | --- |
| Brand icon | 20 × 20px, never shrinks |
| Brand text | 19.8px, existing HeaderBrand tracking and weights |
| Brand gap | 8px |
| First row | At least 48px, including empty account actions |
| Block padding | 24px above/below; top includes safe-area inset |
| Inline padding | 16px below 768px; 32px at 768px and above |
| Minimum shell height | 96px plus top safe-area inset |

Align the brand and account actions on the first row. Search or dense navigation may occupy a second row when space runs out; keep the first row at the same position. Do not center a constrained content container around the header: product brands align to the viewport inset. Content can keep its own maximum width. Do not animate shell padding or replace brand size on account switch.

Keep the existing Flow ID `ProfileButton` and its coarse-pointer touch floor. Reserve the account row during SSR, hydration and session restoration. An avatar image must have dimensions before it loads. Inline profile wrappers can add a text baseline gap; align the trigger to the top (the Game menu already does this) or place it directly in a flex row. Test failed as well as delayed images.

`Header` without `layout="product"` remains an unstyled layout primitive. Explicit exceptions:

- Documentation sidebar and compact navigation can retain the documentation framework's dimensions; reuse default `HeaderBrand` for the brand itself.
- Dense operations dashboards can retain compact toolbars and 24px fine-pointer account controls; preserve the 44px coarse-pointer floor.
- Authentication dialogs, authorization forms, room/thread toolbars, voice frames, game customizers and chat embeds are embedded or task-local chrome. They do not receive a standalone product header.
- Hero and content logos retain their existing scale variants.

Record new exceptions in the consumer's guide. Verify desktop, tablet, and mobile, fine/coarse pointers, signed-out/loading/signed-in states, long usernames, delayed/failed avatars, hydration and account switches. Compare bounding rectangles across transitions, not just final screenshots; the brand's x/y/width/height and first-row height should not move.
