import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AppHeader from "./AppHeader";
import { notifications as defaultNotifications } from "../fixtures/notifications";

const notifications = Object.freeze([
  Object.freeze({
    id: 1,
    actor: "Sora Nyx",
    action: "commented on your post.",
    text: "Sora Nyx commented on your post.",
    time: "2 minutes ago",
    type: "comment",
    preview: "Love the colors!",
    avatar: "https://pumdoki.example/avatar.jpg",
    unread: true,
    group: "today",
  }),
  Object.freeze({
    id: 2,
    actor: "Mika Rose",
    action: "started following you.",
    text: "Mika Rose started following you.",
    time: "15 minutes ago",
    type: "follow",
    unread: true,
    group: "today",
  }),
  Object.freeze({
    id: 3,
    actor: "Luna Bloom",
    action: "gave your post a Kokoro.",
    text: "Luna Bloom gave your post a Kokoro.",
    time: "Yesterday",
    type: "reaction",
    unread: false,
    group: "earlier",
  }),
]);

function header(items) {
  return (
    <MemoryRouter>
      <AppHeader notifications={items} />
    </MemoryRouter>
  );
}

function renderHeader(items = notifications) {
  return render(header(items));
}

function bell() {
  return screen.getByRole("button", { name: "Notifications" });
}

function notificationButton(actor) {
  return screen.getByRole("button", { name: new RegExp(`^${actor}`) });
}

describe("notification activity panel", () => {
  it("opens All without reading anything and filters unread activity", async () => {
    const user = userEvent.setup();
    renderHeader();

    expect(bell()).toHaveAccessibleDescription("2 unread notifications");
    expect(within(bell()).getByText("2")).toBeVisible();
    await user.click(bell());

    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("heading", { name: "Today" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Earlier" })).toBeVisible();
    expect(screen.getByText("“Love the colors!”")).toBeVisible();
    expect(notificationButton("Sora Nyx")).toHaveAccessibleName(
      /Unread\. Mark as read\./
    );
    expect(bell()).toHaveAccessibleDescription("2 unread notifications");

    await user.click(screen.getByRole("tab", { name: "Unread" }));

    expect(screen.getByRole("tabpanel", { name: "Unread" })).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("Luna Bloom")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Earlier" })
    ).not.toBeInTheDocument();
    expect(bell()).toHaveAccessibleDescription("2 unread notifications");
  });

  it("reads an item, updates its indicator, and retains that state when reopened", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(bell());

    const sora = notificationButton("Sora Nyx");
    expect(sora.closest("li")).toHaveAttribute("data-unread", "true");
    await user.click(sora);

    expect(sora.closest("li")).toHaveAttribute("data-unread", "false");
    expect(bell()).toHaveAccessibleDescription("1 unread notification");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Notification marked as read."
    );
    expect(notifications[0].unread).toBe(true);

    await user.click(bell());
    await user.click(bell());
    expect(notificationButton("Sora Nyx").closest("li")).toHaveAttribute(
      "data-unread",
      "false"
    );
    expect(bell()).toHaveAccessibleDescription("1 unread notification");
  });

  it("keeps focus in Unread when reading removes the focused row", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(bell());
    const unread = screen.getByRole("tab", { name: "Unread" });
    await user.click(unread);
    await user.click(notificationButton("Sora Nyx"));

    expect(unread).toHaveFocus();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByText("Sora Nyx")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Mark as read: Mika Rose started following you.",
      })
    );
    expect(unread).toHaveFocus();
    expect(screen.getByText("You’re all caught up")).toBeVisible();
    expect(bell()).toHaveAccessibleDescription("0 unread notifications");
  });

  it("marks everything read without deleting activity or losing focus", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(bell());
    const markAll = screen.getByRole("button", {
      name: "Mark all notifications as read",
    });
    await user.click(markAll);

    expect(markAll).toHaveAttribute("aria-disabled", "true");
    expect(markAll).toHaveFocus();
    expect(bell()).toHaveAccessibleDescription("0 unread notifications");
    expect(bell()).toHaveTextContent("");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    screen.getAllByRole("listitem").forEach((item) => {
      expect(item).toHaveAttribute("data-unread", "false");
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "All notifications marked as read."
    );

    await user.click(screen.getByRole("tab", { name: "Unread" }));
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    expect(screen.getByText("You’re all caught up")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "View all notifications" })
    );
    expect(screen.getByRole("tab", { name: "All" })).toHaveFocus();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("can mark a read item unread again", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(bell());
    await user.click(
      screen.getByRole("button", {
        name: "Mark as unread: Luna Bloom gave your post a Kokoro.",
      })
    );

    expect(bell()).toHaveAccessibleDescription("3 unread notifications");
    expect(notificationButton("Luna Bloom").closest("li")).toHaveAttribute(
      "data-unread",
      "true"
    );
    await user.click(screen.getByRole("tab", { name: "Unread" }));
    expect(notificationButton("Luna Bloom")).toBeVisible();
    expect(notifications[2].unread).toBe(false);
  });

  it("provides a distinct empty state when there is no activity", async () => {
    const user = userEvent.setup();
    renderHeader([]);
    await user.click(bell());

    expect(screen.getByText("No notifications yet")).toBeVisible();
    expect(screen.queryByText("You’re all caught up")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mark all notifications as read" })
    ).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("tab", { name: "Unread" }));
    expect(screen.getByText("No notifications yet")).toBeVisible();
  });

  it("supports roving keyboard tabs, arrows, Home, and End", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(bell());
    const all = screen.getByRole("tab", { name: "All" });
    const unread = screen.getByRole("tab", { name: "Unread" });

    expect(all).toHaveFocus();
    expect(all).toHaveAttribute("tabindex", "0");
    expect(unread).toHaveAttribute("tabindex", "-1");
    await user.keyboard("{ArrowRight}");
    expect(unread).toHaveFocus();
    expect(unread).toHaveAttribute("aria-selected", "true");
    expect(all).toHaveAttribute("tabindex", "-1");
    await user.keyboard("{ArrowRight}");
    expect(all).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(unread).toHaveFocus();
    await user.keyboard("{Home}");
    expect(all).toHaveFocus();
    await user.keyboard("{End}");
    expect(unread).toHaveFocus();
  });

  it("closes with Escape or the close button and restores bell focus", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(bell());
    await user.keyboard("{Escape}");

    expect(bell()).toHaveAttribute("aria-expanded", "false");
    expect(bell()).toHaveFocus();
    expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();

    await user.click(bell());
    await user.click(
      screen.getByRole("button", { name: "Close notifications" })
    );
    expect(bell()).toHaveFocus();
    expect(bell()).toHaveAttribute("aria-expanded", "false");
  });

  it("dismisses outside the panel and switches cleanly to sibling popovers", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(bell());
    await user.click(document.body);
    expect(bell()).toHaveAttribute("aria-expanded", "false");

    await user.click(bell());
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(bell()).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("textbox", { name: "Search creators, posts, and tags" })
    ).toHaveFocus();

    await user.click(bell());
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(bell()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "My Profile" })).toBeVisible();
  });

  it("dismisses when keyboard focus leaves the notification disclosure", async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(bell());
    await user.tab({ shift: true });
    expect(
      screen.getByRole("button", { name: "Close notifications" })
    ).toHaveFocus();
    await user.tab({ shift: true });
    expect(bell()).toHaveFocus();
    expect(bell()).toHaveAttribute("aria-expanded", "true");
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Search" })).toHaveFocus();
    expect(bell()).toHaveAttribute("aria-expanded", "false");
  });

  it("accepts new notification props without resurrecting read items", async () => {
    const user = userEvent.setup();
    const view = renderHeader();
    await user.click(bell());
    await user.click(notificationButton("Sora Nyx"));

    view.rerender(
      header([
        ...notifications,
        {
          id: 4,
          text: "Airi Vale shared a post.",
          time: "Just now",
          unread: true,
        },
      ])
    );
    expect(bell()).toHaveAccessibleDescription("2 unread notifications");
    expect(notificationButton("Sora Nyx").closest("li")).toHaveAttribute(
      "data-unread",
      "false"
    );
    expect(notificationButton("Airi Vale")).toBeVisible();
  });

  it("supports legacy fixtures, unknown activity, and unavailable avatars", async () => {
    const user = userEvent.setup();
    renderHeader([
      notifications[0],
      { id: 8, text: "A new update", time: "Just now", type: "unknown" },
    ]);
    await user.click(bell());

    expect(bell()).toHaveAccessibleDescription("2 unread notifications");
    expect(notificationButton("A new update")).toBeVisible();
    expect(screen.getByTitle("Notification")).toBeInTheDocument();
    const sora = notificationButton("Sora Nyx");
    fireEvent.error(sora.querySelector("img"));
    expect(sora.querySelector("img")).not.toBeInTheDocument();
    expect(within(sora).getByText("S")).toBeVisible();
  });

  it("caps the visual badge while keeping the full accessible count", () => {
    renderHeader(
      Array.from({ length: 120 }, (_, id) => ({
        id,
        text: "Sample notification",
        time: "Just now",
        unread: true,
      }))
    );
    expect(within(bell()).getByText("99+")).toBeVisible();
    expect(bell()).toHaveAccessibleDescription("120 unread notifications");
  });

  it("previews each activity badge with mixed read and unread sample data", async () => {
    const user = userEvent.setup();
    renderHeader(defaultNotifications);
    await user.click(bell());

    expect(bell()).toHaveAccessibleDescription("4 unread notifications");
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getAllByTitle("Comment")).toHaveLength(2);
    for (const label of ["Kokoro", "New follower", "New drop", "Mention"]) {
      expect(screen.getByTitle(label)).toBeInTheDocument();
    }
    expect(
      screen.getByText("Sample activity · read status is temporary")
    ).toBeVisible();
  });
});
