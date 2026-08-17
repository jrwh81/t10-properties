import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import theme from "../../../theme/theme";
import ConfirmDialog from "../ConfirmDialog";

function renderDialog(props) {
  return render(
    <ThemeProvider theme={theme}>
      <ConfirmDialog
        open
        title="Delete property?"
        description='This will permanently remove "Riverfront Loft".'
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        {...props}
      />
    </ThemeProvider>
  );
}

describe("ConfirmDialog", () => {
  it("renders the title and description", () => {
    renderDialog();
    expect(screen.getByText("Delete property?")).toBeInTheDocument();
    expect(screen.getByText('This will permanently remove "Riverfront Loft".')).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderDialog({ onConfirm });

    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderDialog({ onCancel });

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("supports a custom confirm label", () => {
    renderDialog({ confirmLabel: "Revoke" });
    expect(screen.getByRole("button", { name: "Revoke" })).toBeInTheDocument();
  });
});
