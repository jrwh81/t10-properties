import { describe, it, expect } from "vitest";
import theme from "../theme";

describe("theme", () => {
  it("uses the gold accent sampled from the logo as the primary color", () => {
    expect(theme.palette.primary.main).toBe("#c9a961");
  });

  it("uses the near-black logo background as the default background", () => {
    expect(theme.palette.background.default).toBe("#0b0d0f");
  });

  it("is a dark theme", () => {
    expect(theme.palette.mode).toBe("dark");
  });
});
