import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material";
import theme from "../../../theme/theme";
import PropertyFormDialog from "../PropertyFormDialog";

function renderDialog(props) {
  return render(
    <ThemeProvider theme={theme}>
      <PropertyFormDialog open onClose={vi.fn()} onSubmit={vi.fn().mockResolvedValue()} initialValues={null} {...props} />
    </ThemeProvider>
  );
}

describe("PropertyFormDialog", () => {
  it("shows a validation error when required fields are missing", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderDialog({ onSubmit });

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/required fields/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the entered values with defaults for type/status/featured", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue();
    const onClose = vi.fn();
    renderDialog({ onSubmit, onClose });

    await user.type(screen.getByLabelText(/^title/i), "Riverfront Loft");
    await user.type(screen.getByLabelText(/^description/i), "A lovely loft.");
    await user.type(screen.getByLabelText(/^address/i), "123 River Ave");
    await user.type(screen.getByLabelText(/^city/i), "Pittsburgh");
    await user.type(screen.getByLabelText(/^state/i), "PA");
    await user.type(screen.getByLabelText(/^zip/i), "15222");
    await user.type(screen.getByLabelText(/^price/i), "349000");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Riverfront Loft",
          description: "A lovely loft.",
          address: "123 River Ave",
          city: "Pittsburgh",
          state: "PA",
          zip_code: "15222",
          price: 349000,
          property_type: "single_family",
          status: "active",
          featured: false
        })
      )
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("pre-fills the form when editing an existing property", () => {
    renderDialog({
      initialValues: {
        title: "Existing Home",
        description: "Already here.",
        address: "1 Main St",
        city: "Pittsburgh",
        state: "PA",
        zip_code: "15222",
        price: 200000,
        property_type: "condo",
        status: "pending",
        featured: true
      }
    });

    expect(screen.getByLabelText(/^title/i)).toHaveValue("Existing Home");
    expect(screen.getByLabelText(/^price/i)).toHaveValue(200000);
    expect(screen.getByText("Edit property")).toBeInTheDocument();
  });
});
