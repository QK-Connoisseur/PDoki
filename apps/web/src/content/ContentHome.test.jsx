import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/authContext";
import ContentHome from "./ContentHome";
import { contentApi } from "./contentApi";
import HomePage from "../pages/HomePage";
import { env } from "../lib/env";

vi.mock("../components/MemberLayout", () => ({
  default: ({ children, onComposePost, onComposeMoment }) => (
    <div>
      {onComposePost && <button onClick={onComposePost}>Header create</button>}
      {onComposeMoment && (
        <button onClick={onComposeMoment}>Header moment</button>
      )}
      {children}
    </div>
  ),
}));
vi.mock("./contentApi", async (original) => ({
  ...(await original()),
  contentApi: {
    upload: vi.fn(),
    createDraft: vi.fn(),
    mine: vi.fn(),
    feed: vi.fn(),
    publish: vi.fn(),
    remove: vi.fn(),
  },
}));

const creator = { id: "creator-test", role: "CREATOR", emailVerified: true };
const member = { id: "member-test", role: "MEMBER", emailVerified: true };
const media = {
  id: "b38d0e64-f70d-4c99-a54f-225fdb87c74c",
  mimeType: "image/png",
  byteSize: 50,
  url: "/api/v1/content/media/b38d0e64-f70d-4c99-a54f-225fdb87c74c",
};
const draft = {
  id: "post-1",
  body: "A safe sample",
  state: "DRAFT",
  createdAt: "2026-09-09T12:00:00Z",
  publishedAt: null,
  creator: { id: creator.id, displayName: "Sample Creator" },
  media: [media],
};
const published = {
  ...draft,
  state: "PUBLISHED",
  publishedAt: "2026-09-09T12:01:00Z",
};

function viewAs(user = creator) {
  return render(
    <AuthContext.Provider value={{ user }}>
      <ContentHome />
    </AuthContext.Provider>
  );
}

async function fillComposer(user) {
  await user.click(
    screen.getByRole("button", { name: "Create Post", exact: true })
  );
  const dialog = within(screen.getByRole("dialog", { name: "Create Post" }));
  await user.type(dialog.getByLabelText("Caption"), draft.body);
  const file = new File(["safe sample"], "sample.png", { type: "image/png" });
  await user.upload(dialog.getByLabelText("Photos or videos"), file);
  await user.click(dialog.getByRole("checkbox"));
  return { dialog, file };
}

beforeEach(() => {
  vi.resetAllMocks();
  contentApi.feed.mockResolvedValue({ posts: [], nextCursor: null });
  contentApi.mine.mockResolvedValue({ posts: [] });
  contentApi.upload.mockResolvedValue({ media });
  contentApi.createDraft.mockResolvedValue({ post: draft });
  contentApi.publish.mockResolvedValue({ post: published });
  contentApi.remove.mockResolvedValue({ post: { ...draft, state: "REMOVED" } });
});

afterEach(() => {
  env.contentMode = "disabled";
});

describe("controlled content home", () => {
  it("uses the real feed through HomePage when the content flag is enabled", async () => {
    env.contentMode = "development";
    render(
      <AuthContext.Provider value={{ user: member }}>
        <HomePage />
      </AuthContext.Provider>
    );
    await screen.findByText("No published posts yet.");
    expect(contentApi.feed).toHaveBeenCalledOnce();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.queryByText("For You")).not.toBeInTheDocument();
  });
  it("saves a private draft and recovers it from the server after remount", async () => {
    const user = userEvent.setup();
    const view = viewAs();
    await screen.findByText("No published posts yet.");
    const { dialog, file } = await fillComposer(user);
    await user.click(dialog.getByRole("button", { name: "Save draft" }));

    await screen.findByText(
      "Draft saved. Only you can see it until you publish."
    );
    expect(contentApi.upload).toHaveBeenCalledWith(file, expect.any(String));
    expect(contentApi.createDraft).toHaveBeenCalledWith(
      draft.body,
      [media.id],
      expect.any(String)
    );
    expect(screen.getByText("Private draft · only you")).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("region", { name: "Published posts" })
      ).queryByText(draft.body)
    ).not.toBeInTheDocument();
    view.unmount();

    contentApi.mine.mockResolvedValue({ posts: [draft] });
    viewAs();
    await screen.findByRole("article", { name: "Draft by Sample Creator" });
    expect(screen.getByText(draft.body)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Post photo" })).toHaveAttribute(
      "crossorigin",
      "use-credentials"
    );
  });

  it("publishes a recovered draft and shows the resulting feed to a member", async () => {
    const user = userEvent.setup();
    contentApi.mine.mockResolvedValue({ posts: [draft] });
    const view = viewAs();
    await screen.findByRole("button", { name: "Publish", exact: true });
    contentApi.feed.mockResolvedValue({ posts: [published], nextCursor: null });
    await user.click(
      screen.getByRole("button", { name: "Publish", exact: true })
    );
    await screen.findByText("Post published.");
    expect(contentApi.publish).toHaveBeenCalledWith(draft.id);
    await waitFor(() =>
      expect(
        within(
          screen.getByRole("region", { name: "Published posts" })
        ).getByText(draft.body)
      ).toBeInTheDocument()
    );
    view.unmount();

    const mineCalls = contentApi.mine.mock.calls.length;
    viewAs(member);
    await screen.findByText(draft.body);
    expect(
      screen.queryByRole("button", { name: "Create Post" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Header create" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Header moment" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Publish", exact: true })
    ).not.toBeInTheDocument();
    expect(contentApi.mine).toHaveBeenCalledTimes(mineCalls);
  });

  it("preserves text and uploaded media and reuses the draft retry key after a save failure", async () => {
    const user = userEvent.setup();
    contentApi.createDraft.mockRejectedValueOnce(
      new Error("Temporary save failure")
    );
    viewAs();
    const { dialog } = await fillComposer(user);
    await user.click(dialog.getByRole("button", { name: "Save draft" }));
    await screen.findByText("Temporary save failure");
    expect(dialog.getByLabelText("Caption")).toHaveValue(draft.body);
    await user.click(dialog.getByRole("button", { name: "Save draft" }));
    await screen.findByText(
      "Draft saved. Only you can see it until you publish."
    );
    expect(contentApi.upload).toHaveBeenCalledTimes(1);
    expect(contentApi.createDraft).toHaveBeenCalledTimes(2);
    expect(contentApi.createDraft.mock.calls[0]).toEqual(
      contentApi.createDraft.mock.calls[1]
    );
  });

  it("retries an ambiguous upload with the same idempotency key", async () => {
    const user = userEvent.setup();
    contentApi.upload.mockRejectedValueOnce(
      new Error("Upload connection lost")
    );
    viewAs();
    const { dialog } = await fillComposer(user);
    await user.click(dialog.getByRole("button", { name: "Save draft" }));
    await screen.findByText("Upload connection lost");
    expect(contentApi.createDraft).not.toHaveBeenCalled();
    await user.click(dialog.getByRole("button", { name: "Save draft" }));
    await screen.findByText(
      "Draft saved. Only you can see it until you publish."
    );
    expect(contentApi.upload.mock.calls[0]).toEqual(
      contentApi.upload.mock.calls[1]
    );
  });

  it("retains earlier successful files when a later upload fails", async () => {
    const user = userEvent.setup();
    const secondMedia = {
      ...media,
      id: "d9558e72-0699-483c-9a3b-a24430a020bd",
    };
    contentApi.upload
      .mockResolvedValueOnce({ media })
      .mockRejectedValueOnce(new Error("Second upload failed"))
      .mockResolvedValueOnce({ media: secondMedia });
    viewAs();
    const { dialog, file } = await fillComposer(user);
    const second = new File(["another safe sample"], "second.png", {
      type: "image/png",
    });
    await user.upload(dialog.getByLabelText("Photos or videos"), [
      file,
      second,
    ]);
    await user.click(dialog.getByRole("button", { name: "Save draft" }));
    await screen.findByText("Second upload failed");
    await user.click(dialog.getByRole("button", { name: "Save draft" }));
    await screen.findByText(
      "Draft saved. Only you can see it until you publish."
    );
    expect(contentApi.upload).toHaveBeenCalledTimes(3);
    expect(contentApi.upload.mock.calls[1]).toEqual(
      contentApi.upload.mock.calls[2]
    );
    expect(contentApi.createDraft).toHaveBeenCalledWith(
      draft.body,
      [media.id, secondMedia.id],
      expect.any(String)
    );
  });

  it("shows a feed failure and retries without displaying fixture posts", async () => {
    const user = userEvent.setup();
    contentApi.feed.mockRejectedValueOnce(
      new Error("Content service unavailable")
    );
    viewAs(member);
    await screen.findByText("Content service unavailable");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(
      screen.queryByText("No published posts yet.")
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry feed" }));
    await screen.findByText("No published posts yet.");
    expect(contentApi.feed).toHaveBeenCalledTimes(2);
  });

  it("does not claim publishing succeeded when the server denies it", async () => {
    const user = userEvent.setup();
    contentApi.mine.mockResolvedValue({ posts: [draft] });
    contentApi.publish.mockRejectedValue(new Error("Publishing denied"));
    viewAs();
    await user.click(
      await screen.findByRole("button", { name: "Publish", exact: true })
    );
    await screen.findByText("Publishing denied");
    expect(screen.queryByText("Post published.")).not.toBeInTheDocument();
    expect(screen.getByText("Private draft · only you")).toBeInTheDocument();
  });

  it("removes a published post from both lists after the server confirms", async () => {
    const user = userEvent.setup();
    contentApi.mine.mockResolvedValue({ posts: [published] });
    contentApi.feed.mockResolvedValueOnce({
      posts: [published],
      nextCursor: null,
    });
    viewAs();
    await user.click(
      await screen.findByRole("button", { name: "Remove post" })
    );
    await screen.findByText("Post removed.");
    expect(contentApi.remove).toHaveBeenCalledWith(draft.id);
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("requires a permitted file and the safe sample confirmation", async () => {
    const user = userEvent.setup({ applyAccept: false });
    viewAs();
    await user.click(
      screen.getByRole("button", { name: "Create Post", exact: true })
    );
    const dialog = within(screen.getByRole("dialog", { name: "Create Post" }));
    expect(dialog.getByRole("button", { name: "Save draft" })).toBeDisabled();
    await user.upload(
      dialog.getByLabelText("Photos or videos"),
      new File(["script"], "sample.svg", { type: "image/svg+xml" })
    );
    await screen.findByText(
      "Choose up to 4 PNG, JPEG or MP4 files, each no larger than 20 MiB and not empty."
    );
    await user.click(dialog.getByRole("checkbox"));
    expect(dialog.getByRole("button", { name: "Save draft" })).toBeDisabled();
    expect(contentApi.upload).not.toHaveBeenCalled();
  });
});
