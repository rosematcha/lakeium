// Mirrors the site's own modal (Advanced Search) and button tokens.
export const styles = `
:host { all: initial; }
.overlay {
  position: fixed; inset: 0; z-index: 30;
  display: flex; align-items: center; justify-content: center;
  padding: 16px; background: rgba(0, 0, 0, .5);
  font-family: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--lc-text, #222);
}
.dialog {
  position: relative; box-sizing: border-box;
  width: 100%; max-width: 440px; overflow: hidden;
  background: var(--lc-bg-two, #f9f9f9); border-radius: 8px; outline: none;
}
/* Header matches the site's black nav bar in both themes. */
.head { padding: 16px 20px; color: #fff; background: #151515; }
.head .subtitle { color: #bbb; }
.body { padding: 4px 20px 20px; }
.close {
  position: absolute; top: 4px; right: 4px;
  display: flex; width: 34px; height: 34px; padding: 0;
  align-items: center; justify-content: center; cursor: pointer;
  color: #fff; background: #2c2c2e;
  border: 1px solid #48484a; border-radius: 8px;
}
.close svg { width: 24px; height: 24px; }
.title { margin: 0; font-size: 20px; font-weight: 700; line-height: 1.3; }
.subtitle { margin: 2px 0 0; font-size: 14px; color: var(--lc-text-two, #3c3c3c); }
.service { margin: 16px 0 6px; font-weight: 700; }
.details {
  display: grid; grid-template-columns: auto 1fr; gap: 2px 6px;
  margin: 0; font-size: 14px;
}
.details dt { font-weight: 700; }
.details dd { margin: 0; color: var(--lc-text-two, #3c3c3c); }
.actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 18px; }
.action {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 12px; border-radius: 8px; text-decoration: none;
  font-size: 15px; font-weight: 700; color: inherit;
  background: var(--lc-el, #ebebeb); border: 1px solid var(--lc-border, #c7c7c7);
}
.action:hover { background: var(--lc-el-two, #e0e0e0); }
.close:hover { background: #3a3a3c; }
.action.primary { color: #fff; background: var(--lc-primary, #a41c32); border-color: var(--lc-primary, #a41c32); }
.action.primary:hover { filter: brightness(1.1); }
.action svg { width: 18px; height: 18px; flex: none; }
.action:focus-visible, .close:focus-visible { outline: 2px solid var(--lc-link-blue, #0275d8); outline-offset: 2px; }
@media (max-width: 400px) { .actions { grid-template-columns: 1fr; } }
`;
