import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material";
import theme from "../../theme/theme";
import PhotoSlideshow from "../PhotoSlideshow";

function renderSlideshow(props) {
  return render(
    <ThemeProvider theme={theme}>
      <PhotoSlideshow {...props} />
    </ThemeProvider>
  );
}

describe("PhotoSlideshow", () => {
  it("renders a single photo with no navigation controls", () => {
    renderSlideshow({ photos: ["/photo1.jpg"], alt: "A property" });

    expect(screen.getByRole("img")).toHaveAttribute("src", "/photo1.jpg");
    expect(screen.queryByRole("button", { name: /next photo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /previous photo/i })).not.toBeInTheDocument();
  });

  it("renders navigation controls and a counter when there are multiple photos", () => {
    renderSlideshow({ photos: ["/a.jpg", "/b.jpg", "/c.jpg"], alt: "A destination" });

    expect(screen.getByRole("img")).toHaveAttribute("src", "/a.jpg");
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next photo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous photo/i })).toBeInTheDocument();
  });

  it("advances to the next photo when the next button is clicked", async () => {
    const user = userEvent.setup();
    renderSlideshow({ photos: ["/a.jpg", "/b.jpg", "/c.jpg"] });

    await user.click(screen.getByRole("button", { name: /next photo/i }));

    expect(screen.getByRole("img")).toHaveAttribute("src", "/b.jpg");
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("wraps around from the last photo to the first", async () => {
    const user = userEvent.setup();
    renderSlideshow({ photos: ["/a.jpg", "/b.jpg"] });

    await user.click(screen.getByRole("button", { name: /next photo/i }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next photo/i }));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("wraps around backwards when clicking previous from the first photo", async () => {
    const user = userEvent.setup();
    renderSlideshow({ photos: ["/a.jpg", "/b.jpg"] });

    await user.click(screen.getByRole("button", { name: /previous photo/i }));

    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("jumps to a specific photo when its dot indicator is clicked", async () => {
    const user = userEvent.setup();
    renderSlideshow({ photos: ["/a.jpg", "/b.jpg", "/c.jpg"] });

    await user.click(screen.getByRole("button", { name: "Go to photo 3" }));

    expect(screen.getByRole("img")).toHaveAttribute("src", "/c.jpg");
  });

  it("navigates with the keyboard when focused", async () => {
    const user = userEvent.setup();
    renderSlideshow({ photos: ["/a.jpg", "/b.jpg"] });

    const region = screen.getByRole("region", { name: /photos/i });
    region.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("renders an empty placeholder with no controls when there are no photos", () => {
    renderSlideshow({ photos: [] });

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("defaults to an empty placeholder when photos is omitted", () => {
    renderSlideshow({});

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
