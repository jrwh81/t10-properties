import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import theme from "../../../theme/theme";
import RatingBadge from "../RatingBadge";

function renderBadge(props) {
  return render(
    <ThemeProvider theme={theme}>
      <RatingBadge {...props} />
    </ThemeProvider>
  );
}

describe("RatingBadge", () => {
  it("renders the numeric rating", () => {
    renderBadge({ rating: 9 });
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("exposes an accessible label describing the T10 rating", () => {
    renderBadge({ rating: 7 });
    expect(screen.getByRole("img", { name: "T10 rating: 7 out of 10" })).toBeInTheDocument();
  });
});
