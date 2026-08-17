import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";
import Navbar from "../Navbar";

describe("Navbar", () => {
  it("shows Log in and Sign up for anonymous visitors", async () => {
    renderWithProviders(<Navbar />);

    expect(await screen.findByRole("link", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  it("renders the primary nav links", async () => {
    renderWithProviders(<Navbar />);

    expect(await screen.findByRole("link", { name: "Properties" })).toHaveAttribute("href", "/properties");
    expect(screen.getByRole("link", { name: "T10 Destinations" })).toHaveAttribute("href", "/destinations");
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
  });

  it("does not show an Admin link for anonymous visitors", async () => {
    renderWithProviders(<Navbar />);
    await screen.findByRole("link", { name: /log in/i });
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });
});
