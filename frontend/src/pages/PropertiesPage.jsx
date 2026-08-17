import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { fetchProperties } from "../api/properties";
import PropertyCard from "../components/Cards/PropertyCard";
import { LoadingState, ErrorState } from "../components/StateHelpers";

const TYPES = [
  { value: "", label: "All" },
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" }
];

export default function PropertiesPage() {
  const [propertyType, setPropertyType] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["properties", { propertyType }],
    queryFn: () => fetchProperties(propertyType ? { property_type: propertyType } : {})
  });

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Properties
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Current listings from T10 Properties LLC.
      </Typography>

      <ToggleButtonGroup
        value={propertyType}
        exclusive
        onChange={(_e, value) => setPropertyType(value ?? "")}
        sx={{ mb: 4, flexWrap: "wrap" }}
      >
        {TYPES.map((type) => (
          <ToggleButton key={type.value} value={type.value} size="small">
            {type.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {data && data.properties.length === 0 && (
        <Typography color="text.secondary">No properties match that filter yet.</Typography>
      )}
      {data && (
        <Grid container spacing={3}>
          {data.properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.slug}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
