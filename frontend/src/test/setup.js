import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia, but MUI's useMediaQuery (used by the
// Navbar for its mobile breakpoint) needs it.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  });
}
