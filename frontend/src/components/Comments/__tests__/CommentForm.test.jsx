import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/testUtils";
import CommentForm from "../CommentForm";

describe("CommentForm (anonymous visitor)", () => {
  it("requires a name, email, and body before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<CommentForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /post comment/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/write a comment/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects an invalid guest email", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<CommentForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^add a comment/i), "Great post!");
    await user.type(screen.getByLabelText(/^name/i), "Val");
    await user.type(screen.getByLabelText(/^email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /post comment/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/valid email/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits guest_name, guest_email, and body when valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue();
    renderWithProviders(<CommentForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^add a comment/i), "Great post!");
    await user.type(screen.getByLabelText(/^name/i), "Val");
    await user.type(screen.getByLabelText(/^email/i), "val@example.com");
    await user.click(screen.getByRole("button", { name: /post comment/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ body: "Great post!", guest_name: "Val", guest_email: "val@example.com" })
      )
    );
  });

  it("clears the form after a successful submission", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue();
    renderWithProviders(<CommentForm onSubmit={onSubmit} />);

    const body = screen.getByLabelText(/^add a comment/i);
    await user.type(body, "Great post!");
    await user.type(screen.getByLabelText(/^name/i), "Val");
    await user.type(screen.getByLabelText(/^email/i), "val@example.com");
    await user.click(screen.getByRole("button", { name: /post comment/i }));

    await waitFor(() => expect(body).toHaveValue(""));
  });
});
