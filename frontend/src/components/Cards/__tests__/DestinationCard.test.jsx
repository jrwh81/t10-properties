import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/testUtils";
import DestinationCard from "../DestinationCard";

const destination = {
  slug: "point-state-park",
  name: "Point State Park",
  city: "Pittsburgh",
  state: "PA",
  category: "outdoors",
  t10_rating: 10,
  cover_photo_url: null
};

describe("DestinationCard", () => {
  it("renders the destination name, location, and T10 rating", () => {
    renderWithProviders(<DestinationCard destination={destination} />);

    expect(screen.getByText("Point State Park")).toBeInTheDocument();
    expect(screen.getByText("Pittsburgh, PA")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "T10 rating: 10 out of 10" })).toBeInTheDocument();
  });

  it("links to the destination detail page", () => {
    renderWithProviders(<DestinationCard destination={destination} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/destinations/point-state-park");
  });
});
