import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { fetchDestinations } from "../api/destinations";
import DestinationCard from "../components/Cards/DestinationCard";
import { LoadingState, ErrorState } from "../components/StateHelpers";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "restaurant", label: "Restaurants" },
  { value: "outdoors", label: "Outdoors" },
  { value: "nightlife", label: "Nightlife" },
  { value: "museum", label: "Museums" },
  { value: "shopping", label: "Shopping" },
  { value: "lodging", label: "Lodging" },
  { value: "other", label: "Other" }
];

export default function DestinationsPage() {
  const [category, setCategory] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["destinations", { category }],
    queryFn: () => fetchDestinations(category ? { category } : {})
  });

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        T10 Destinations
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Every spot rated on our 1-10 T10 scale, ranked highest first.
      </Typography>

      <ToggleButtonGroup
        value={category}
        exclusive
        onChange={(_e, value) => setCategory(value ?? "")}
        sx={{ mb: 4, flexWrap: "wrap" }}
      >
        {CATEGORIES.map((c) => (
          <ToggleButton key={c.value} value={c.value} size="small">
            {c.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {data && data.destinations.length === 0 && (
        <Typography color="text.secondary">No destinations in this category yet.</Typography>
      )}
      {data && (
        <Grid container spacing={3}>
          {data.destinations.map((destination) => (
            <Grid item xs={12} sm={6} md={4} key={destination.slug}>
              <DestinationCard destination={destination} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
