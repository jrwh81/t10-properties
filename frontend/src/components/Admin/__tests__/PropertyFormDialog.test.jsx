import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material";
import theme from "../../../theme/theme";
import PropertyFormDialog from "../PropertyFormDialog";

const baseProps = () => ({
  open: true,
  onClose: vi.fn(),
  onCreate: vi.fn(),
  onUpdate: vi.fn(),
  onUploadPhotos: vi.fn(),
  onDeletePhoto: vi.fn(),
  initialValues: null
});

function renderDialog(overrides = {}) {
  const props = { ...baseProps(), ...overrides };
  render(
    <ThemeProvider theme={theme}>
      <PropertyFormDialog {...props} />
    </ThemeProvider>
  );
  return props;
}

describe("PropertyFormDialog", () => {
  it("shows a validation error when required fields are missing", async () => {
    const user = userEvent.setup();
    const props = renderDialog();

    await user.click(screen.getByRole("button", { name: /create property/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/required fields/i);
    expect(props.onCreate).not.toHaveBeenCalled();
  });

  it("creates a new property, then stays open and reveals the photo manager", async () => {
    const user = userEvent.setup();
    const created = {
      slug: "riverfront-loft",
      title: "Riverfront Loft",
      description: "A lovely loft.",
      address: "123 River Ave",
      city: "Pittsburgh",
      state: "PA",
      zip_code: "15222",
      price: 349000,
      property_type: "single_family",
      status: "active",
      featured: false,
      photos: []
    };
    const props = renderDialog({ onCreate: vi.fn().mockResolvedValue(created) });

    await user.type(screen.getByLabelText(/^title/i), "Riverfront Loft");
    await user.type(screen.getByLabelText(/^description/i), "A lovely loft.");
    await user.type(screen.getByLabelText(/^address/i), "123 River Ave");
    await user.type(screen.getByLabelText(/^city/i), "Pittsburgh");
    await user.type(screen.getByLabelText(/^state/i), "PA");
    await user.type(screen.getByLabelText(/^zip/i), "15222");
    await user.type(screen.getByLabelText(/^price/i), "349000");

    await user.click(screen.getByRole("button", { name: /create property/i }));

    await waitFor(() =>
      expect(props.onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Riverfront Loft",
          price: 349000,
          property_type: "single_family",
          status: "active",
          featured: false
        })
      )
    );

    // Dialog stays open, switches into edit mode, and now shows photo management.
    expect(await screen.findByText("Edit property")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add photos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it("pre-fills the form when editing an existing property and shows its photos", () => {
    renderDialog({
      initialValues: {
        slug: "existing-home",
        title: "Existing Home",
        description: "Already here.",
        address: "1 Main St",
        city: "Pittsburgh",
        state: "PA",
        zip_code: "15222",
        price: 200000,
        property_type: "condo",
        status: "pending",
        featured: true,
        photos: [{ id: 1, url: "/photo1.jpg" }]
      }
    });

    expect(screen.getByLabelText(/^title/i)).toHaveValue("Existing Home");
    expect(screen.getByLabelText(/^price/i)).toHaveValue(200000);
    expect(screen.getByText("Edit property")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByAltText("")).toHaveAttribute("src", "/photo1.jpg");
  });

  it("updates an existing property via onUpdate", async () => {
    const user = userEvent.setup();
    const initialValues = {
      slug: "existing-home",
      title: "Existing Home",
      description: "Already here.",
      address: "1 Main St",
      city: "Pittsburgh",
      state: "PA",
      zip_code: "15222",
      price: 200000,
      property_type: "condo",
      status: "pending",
      featured: false,
      photos: []
    };
    const props = renderDialog({
      initialValues,
      onUpdate: vi.fn().mockResolvedValue({ ...initialValues, title: "Updated Home" })
    });

    const titleInput = screen.getByLabelText(/^title/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Home");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(props.onUpdate).toHaveBeenCalledWith("existing-home", expect.objectContaining({ title: "Updated Home" }))
    );
  });

  // Regression test: the record passed in as `initialValues` carries a
  // `photos` array (from the API's detailed serializer). Save must never
  // let that stale array ride along in the update payload -- has_many_attached
  // treats assignment as a REPLACE, so sending it back would silently wipe
  // every photo that was uploaded via the PhotoManager.
  it("never includes photos in the update payload, even though the record has them", async () => {
    const user = userEvent.setup();
    const initialValues = {
      slug: "existing-home",
      title: "Existing Home",
      description: "Already here.",
      address: "1 Main St",
      city: "Pittsburgh",
      state: "PA",
      zip_code: "15222",
      price: 200000,
      property_type: "condo",
      status: "pending",
      featured: false,
      photos: [{ id: 1, url: "/photo1.jpg" }, { id: 2, url: "/photo2.jpg" }]
    };
    const props = renderDialog({
      initialValues,
      onUpdate: vi.fn().mockResolvedValue(initialValues)
    });

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(props.onUpdate).toHaveBeenCalled());
    const [, payload] = props.onUpdate.mock.calls[0];
    expect(payload).not.toHaveProperty("photos");
  });

  it("uploads photos for an existing property", async () => {
    const user = userEvent.setup();
    const initialValues = {
      slug: "existing-home",
      title: "Existing Home",
      description: "Already here.",
      address: "1 Main St",
      city: "Pittsburgh",
      state: "PA",
      zip_code: "15222",
      price: 200000,
      property_type: "condo",
      status: "pending",
      featured: false,
      photos: []
    };
    const updated = { ...initialValues, photos: [{ id: 9, url: "/uploaded.jpg" }] };
    const props = renderDialog({ initialValues, onUploadPhotos: vi.fn().mockResolvedValue(updated) });

    const file = new File(["fake-image-bytes"], "photo.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByLabelText(/add photos/i);
    await user.upload(fileInput, file);

    await waitFor(() => expect(props.onUploadPhotos).toHaveBeenCalledWith("existing-home", expect.anything()));
    expect(await screen.findByAltText("")).toHaveAttribute("src", "/uploaded.jpg");
  });
});
