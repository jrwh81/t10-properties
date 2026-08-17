import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";
import PropertyCard from "../PropertyCard";

const property = {
  slug: "riverfront-loft",
  title: "Riverfront Loft",
  city: "Pittsburgh",
  state: "PA",
  price: 349000,
  bedrooms: 2,
  bathrooms: 2,
  square_feet: 1450,
  featured: true,
  cover_photo_url: null
};

describe("PropertyCard", () => {
  it("renders the title, location, and formatted price", () => {
    renderWithProviders(<PropertyCard property={property} />);

    expect(screen.getByText("Riverfront Loft")).toBeInTheDocument();
    expect(screen.getByText("Pittsburgh, PA")).toBeInTheDocument();
    expect(screen.getByText("$349,000")).toBeInTheDocument();
  });

  it("shows a Featured chip when the property is featured", () => {
    renderWithProviders(<PropertyCard property={property} />);
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("omits the Featured chip when not featured", () => {
    renderWithProviders(<PropertyCard property={{ ...property, featured: false }} />);
    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
  });

  it("links to the property detail page", () => {
    renderWithProviders(<PropertyCard property={property} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/properties/riverfront-loft");
  });
});
