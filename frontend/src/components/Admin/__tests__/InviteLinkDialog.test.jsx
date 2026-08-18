import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material";
import theme from "../../../theme/theme";
import InviteLinkDialog from "../InviteLinkDialog";

// Mocking navigator.clipboard directly via jsdom proved unreliable (the
// Clipboard API is gated behind secure/HTTPS contexts, which this test
// environment isn't). InviteLinkDialog delegates the actual clipboard
// call to utils/clipboard.js specifically so tests can mock that instead
// -- the same reliable pattern used for every API module in this project.
vi.mock("../../../utils/clipboard", () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true)
}));

import { copyToClipboard } from "../../../utils/clipboard";

function renderDialog(props) {
  return render(
    <ThemeProvider theme={theme}>
      <InviteLinkDialog
        open
        onClose={vi.fn()}
        email="future-admin@example.com"
        url="http://localhost:5173/admin/accept-invite/abc123"
        {...props}
      />
    </ThemeProvider>
  );
}

describe("InviteLinkDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the invitee's email and the full link", () => {
    renderDialog();

    expect(screen.getByText(/future-admin@example.com/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("http://localhost:5173/admin/accept-invite/abc123")).toBeInTheDocument();
  });

  it("copies the link to the clipboard when Copy link is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /copy link/i }));

    expect(copyToClipboard).toHaveBeenCalledWith("http://localhost:5173/admin/accept-invite/abc123");
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("calls onClose when Done is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({ onClose });

    await user.click(screen.getByRole("button", { name: /^done$/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
