import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Manual (not auto-advancing) photo carousel. Auto-advancing carousels are
// a well-known accessibility anti-pattern -- content that moves on its own
// can be genuinely disruptive for some visitors -- which would be an odd
// thing to ship on a site whose whole point is accessibility. Arrow
// buttons, dot indicators, and left/right arrow-key navigation instead.
export default function PhotoSlideshow({ photos = [], alt = "", height = 420 }) {
  const [index, setIndex] = useState(0);
  const count = photos.length;

  const goTo = (nextIndex) => setIndex((nextIndex + count) % count);
  const goPrev = () => goTo(index - 1);
  const goNext = () => goTo(index + 1);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  if (count === 0) {
    return (
      <Box
        sx={{
          height,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider"
        }}
      />
    );
  }

  return (
    <Box
      role="region"
      aria-label="Photos"
      tabIndex={count > 1 ? 0 : -1}
      onKeyDown={count > 1 ? handleKeyDown : undefined}
      sx={{
        position: "relative",
        height,
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        outline: "none",
        "&:focus-visible": { boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}` }
      }}
    >
      <Box
        component="img"
        key={photos[index]}
        src={photos[index]}
        alt={count > 1 ? `${alt} (photo ${index + 1} of ${count})` : alt}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block"
        }}
      />

      {count > 1 && (
        <>
          <IconButton
            onClick={goPrev}
            aria-label="Previous photo"
            sx={{
              position: "absolute",
              top: "50%",
              left: 8,
              transform: "translateY(-50%)",
              bgcolor: "rgba(11, 13, 15, 0.6)",
              color: "common.white",
              "&:hover": { bgcolor: "rgba(11, 13, 15, 0.85)" }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            onClick={goNext}
            aria-label="Next photo"
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              bgcolor: "rgba(11, 13, 15, 0.6)",
              color: "common.white",
              "&:hover": { bgcolor: "rgba(11, 13, 15, 0.85)" }
            }}
          >
            <ChevronRightIcon />
          </IconButton>

          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: "rgba(11, 13, 15, 0.6)",
              color: "common.white"
            }}
          >
            {index + 1} / {count}
          </Typography>

          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 0.75
            }}
          >
            {photos.map((photo, i) => (
              <Box
                key={photo}
                component="button"
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  p: 0,
                  bgcolor: i === index ? "primary.main" : "rgba(255, 255, 255, 0.5)",
                  "&:hover": { bgcolor: i === index ? "primary.main" : "rgba(255, 255, 255, 0.8)" }
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
