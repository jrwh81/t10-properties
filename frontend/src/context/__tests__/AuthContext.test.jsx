import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";
import { renderWithProviders } from "../../test/testUtils";

vi.mock("../../api/auth", () => ({
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  fetchCurrentUser: vi.fn()
}));

import { login as mockLogin } from "../../api/auth";

function Probe() {
  const { user, isAuthenticated, isAdmin, login } = useAuth();
  return (
    <div>
      <span data-testid="authed">{String(isAuthenticated)}</span>
      <span data-testid="admin">{String(isAdmin)}</span>
      <span data-testid="name">{user?.name ?? "none"}</span>
      <button onClick={() => login({ email: "a@example.com", password: "secret" })}>Log in</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    window.localStorage?.clear();
    vi.clearAllMocks();
  });

  it("starts unauthenticated with no stored token", async () => {
    renderWithProviders(<Probe />);

    await waitFor(() => expect(screen.getByTestId("authed")).toHaveTextContent("false"));
    expect(screen.getByTestId("name")).toHaveTextContent("none");
  });

  it("updates state to authenticated after a successful login", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ id: 1, name: "Jamie", email: "a@example.com", role: "member" });

    renderWithProviders(<Probe />);
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByTestId("authed")).toHaveTextContent("true"));
    expect(screen.getByTestId("name")).toHaveTextContent("Jamie");
    expect(screen.getByTestId("admin")).toHaveTextContent("false");
  });

  it("marks admin users as isAdmin", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ id: 1, name: "Boss", email: "boss@example.com", role: "admin" });

    renderWithProviders(<Probe />);
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByTestId("admin")).toHaveTextContent("true"));
  });
});
