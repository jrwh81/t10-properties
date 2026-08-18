import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { fetchProperty } from "../api/properties";
import { LoadingState, ErrorState } from "../components/StateHelpers";
import PhotoSlideshow from "../components/PhotoSlideshow";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const { data: property, isLoading, isError } = useQuery({
    queryKey: ["property", slug],
    queryFn: () => fetchProperty(slug)
  });

  if (isLoading) return <LoadingState />;
  if (isError || !property) return <ErrorState message="We couldn't find that property." />;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={7}>
          <PhotoSlideshow photos={property.photo_urls} alt={property.title} />
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip label={property.status.replace("_", " ")} color="primary" variant="outlined" />
            <Chip label={property.property_type.replace("_", " ")} variant="outlined" />
          </Stack>
          <Typography variant="h3" component="h1" gutterBottom>
            {property.title}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {property.full_address}
          </Typography>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800, my: 2 }}>
            {currency.format(property.price)}
          </Typography>

          <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6">{property.bedrooms ?? "--"}</Typography>
              <Typography variant="caption" color="text.secondary">Bedrooms</Typography>
            </Box>
            <Box>
              <Typography variant="h6">{property.bathrooms ?? "--"}</Typography>
              <Typography variant="caption" color="text.secondary">Bathrooms</Typography>
            </Box>
            <Box>
              <Typography variant="h6">{property.square_feet?.toLocaleString() ?? "--"}</Typography>
              <Typography variant="caption" color="text.secondary">Sqft</Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {property.description}
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
