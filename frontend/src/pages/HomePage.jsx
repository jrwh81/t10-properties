import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { fetchProperties } from "../api/properties";
import { fetchDestinations } from "../api/destinations";
import { fetchBlogPosts } from "../api/blogPosts";
import PropertyCard from "../components/Cards/PropertyCard";
import DestinationCard from "../components/Cards/DestinationCard";
import BlogPostCard from "../components/Cards/BlogPostCard";
import { LoadingState, ErrorState } from "../components/StateHelpers";

function SectionHeader({ title, to, ctaLabel }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Typography variant="h4" component="h2">
        {title}
      </Typography>
      <Button component={RouterLink} to={to} color="primary">
        {ctaLabel}
      </Button>
    </Stack>
  );
}

export default function HomePage() {
  const properties = useQuery({
    queryKey: ["properties", { featured: "true" }],
    queryFn: () => fetchProperties({ featured: "true", per_page: 3 })
  });
  const destinations = useQuery({
    queryKey: ["destinations", { featured: "true" }],
    queryFn: () => fetchDestinations({ featured: "true", per_page: 3 })
  });
  const posts = useQuery({
    queryKey: ["blogPosts", { per_page: 3 }],
    queryFn: () => fetchBlogPosts({ per_page: 3 })
  });

  return (
    <Box>
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          textAlign: "center",
          background: "radial-gradient(circle at top, rgba(201,169,97,0.12), transparent 60%)"
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Home should never be a compromise.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
            T10 Properties finds and builds homes designed for real accessibility, and rates
            the restaurants, hotels, and venues around them on the T10 scale — a straight,
            1-to-10 read on how easy a place actually is to navigate in a wheelchair or with
            limited mobility.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button component={RouterLink} to="/properties" variant="contained" color="primary" size="large">
              Browse Properties
            </Button>
            <Button component={RouterLink} to="/destinations" variant="outlined" color="primary" size="large">
              See T10 Destinations
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "background.paper", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="overline" color="primary">
                Our Story
              </Typography>
              <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 1 }}>
                Built by someone who knows what doesn't work.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                T10 Properties was founded by Christopher Juba, who has lived as a
                paraplegic for years and knows firsthand how much of the built world
                simply wasn't designed with wheelchair users in mind — from a single
                step at a front door to a bathroom that's technically "accessible" on
                paper but not in practice.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Chris owns three properties. Two were intentionally designed from the
                ground up to accommodate residents with disabilities: zero-step entries,
                wider doorways and hallways, roll-in showers, lowered counters and
                controls, and the kind of details that only show up when accessibility
                is the starting point, not an afterthought.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                That same standard drives the T10 rating system — an honest, on-the-ground
                score for how accommodating a restaurant, hotel, or venue really is,
                rated by people who actually navigate the world in a wheelchair.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 4,
                  bgcolor: "background.default"
                }}
              >
                <Typography variant="h6" gutterBottom>
                  What makes a T10 property
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Step-free entries and wide, wheelchair-friendly hallways
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Roll-in showers and accessible bathroom layouts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Lowered counters, switches, and controls within reach
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Accessibility considered from the first blueprint, not retrofitted
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SectionHeader title="Accessible Properties" to="/properties" ctaLabel="View all" />
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 720 }}>
          Homes purpose-built or thoughtfully adapted for accessible living — every
          listing notes what actually matters, like entry, doorway width, and bathroom
          access.
        </Typography>
        {properties.isLoading && <LoadingState />}
        {properties.isError && <ErrorState />}
        {properties.data && (
          <Grid container spacing={3}>
            {properties.data.properties.map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property.slug}>
                <PropertyCard property={property} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SectionHeader title="Top-Rated on the T10 Scale" to="/destinations" ctaLabel="View all" />
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 720 }}>
          Restaurants, hotels, and venues rated 1 to 10 on how easy they actually are to
          access in a wheelchair — parking, entry, seating, and restrooms, rated by people
          who navigate them firsthand.
        </Typography>
        {destinations.isLoading && <LoadingState />}
        {destinations.isError && <ErrorState />}
        {destinations.data && (
          <Grid container spacing={3}>
            {destinations.data.destinations.map((destination) => (
              <Grid item xs={12} sm={6} md={4} key={destination.slug}>
                <DestinationCard destination={destination} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SectionHeader title="From the Blog" to="/blog" ctaLabel="Read more" />
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 720 }}>
          Notes on accessible living, home design, and getting out into the world without
          it being a fight.
        </Typography>
        {posts.isLoading && <LoadingState />}
        {posts.isError && <ErrorState />}
        {posts.data && (
          <Grid container spacing={3}>
            {posts.data.blog_posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.slug}>
                <BlogPostCard post={post} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
