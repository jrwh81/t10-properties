// Isolated in its own module specifically so tests can vi.mock() it
// instead of fighting jsdom's Clipboard API directly -- that API is
// gated behind secure (HTTPS) contexts in real browsers, and mocking it
// with Object.defineProperty/vi.spyOn proved unreliable in this test
// environment (http://localhost jsdom origin).
export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
