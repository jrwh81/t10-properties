import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import RatingBadge from "../components/Cards/RatingBadge";
import { fetchDestination } from "../api/destinations";
import { LoadingState, ErrorState } from "../components/StateHelpers";
import PhotoSlideshow from "../components/PhotoSlideshow";

export default function DestinationDetailPage() {
  const { slug } = useParams();
  const { data: destination, isLoading, isError } = useQuery({
    queryKey: ["destination", slug],
    queryFn: () => fetchDestination(slug)
  });

  if (isLoading) return <LoadingState />;
  if (isError || !destination) return <ErrorState message="We couldn't find that destination." />;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={7}>
          <PhotoSlideshow photos={destination.photo_urls} alt={destination.name} />
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <RatingBadge rating={destination.t10_rating} size="large" />
            <Chip label={destination.category.replace("_", " ")} variant="outlined" color="primary" />
          </Stack>
          <Typography variant="h3" component="h1" gutterBottom>
            {destination.name}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {destination.address ? `${destination.address}, ` : ""}
            {destination.city}, {destination.state}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {destination.description}
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
