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

  it("shows the logo linking back to the homepage", async () => {
    renderWithProviders(<Navbar />);

    const logo = await screen.findByAltText("T10 Properties LLC");
    expect(logo).toHaveAttribute("src", "/logos/logo-e-wordmark.png");
    expect(logo.closest("a")).toHaveAttribute("href", "/");
  });

  it("does not show an Admin link for anonymous visitors", async () => {
    renderWithProviders(<Navbar />);
    await screen.findByRole("link", { name: /log in/i });
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });
});
