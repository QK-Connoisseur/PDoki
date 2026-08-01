import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "./ForgotPasswordPage";

describe("ForgotPasswordPage", () => {
  it("shows the enumeration-neutral accepted result", async () => {
    const onRequest = vi.fn().mockResolvedValue({ status: "accepted" });
    render(<ForgotPasswordPage onRequest={onRequest} onBack={vi.fn()} />);

    await userEvent.type(
      screen.getByLabelText("Email address"),
      "UNKNOWN@PUMDOKI.EXAMPLE"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Request reset link" })
    );

    await waitFor(() =>
      expect(onRequest).toHaveBeenCalledWith("unknown@pumdoki.example")
    );
    expect(screen.getByText("Check your email")).toBeVisible();
    expect(
      screen.getByText(/this result is the same for every address/i)
    ).toBeVisible();
  });

  it("does not claim acceptance after a transport failure", async () => {
    render(
      <ForgotPasswordPage
        onRequest={vi.fn().mockRejectedValue(new Error("offline"))}
        onBack={vi.fn()}
      />
    );
    await userEvent.type(
      screen.getByLabelText("Email address"),
      "member@pumdoki.example"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Request reset link" })
    );

    expect(
      await screen.findByText(
        "We couldn’t submit the request. Check your connection and try again."
      )
    ).toBeVisible();
    expect(screen.queryByText("Check your email")).not.toBeInTheDocument();
  });
});
