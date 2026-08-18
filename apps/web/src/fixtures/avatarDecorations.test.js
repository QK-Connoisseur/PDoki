import { describe, expect, it } from "vitest";
import { chatContacts } from "./chatContacts";
import { feedPosts, fypPosts, moments } from "./homeFeed";

describe("avatar decoration fixtures", () => {
  it("keeps one decoration per creator and leaves Moments independent", () => {
    const decorationByCreator = new Map();
    const decoratedSurfaces = [
      ...feedPosts.map((post) => ({
        creator: post.creator,
        decoration: post.avatarDecoration,
      })),
      ...fypPosts.map((post) => ({
        creator: post.creator,
        decoration: post.avatarDecoration,
      })),
      ...chatContacts.map((contact) => ({
        creator: contact.name,
        decoration: contact.avatarDecoration,
      })),
    ];

    decoratedSurfaces.forEach(({ creator, decoration }) => {
      expect(decoration).toBeTruthy();
      if (decorationByCreator.has(creator)) {
        expect(decoration).toBe(decorationByCreator.get(creator));
      } else {
        decorationByCreator.set(creator, decoration);
      }
    });

    moments.forEach((moment) => {
      expect(moment).not.toHaveProperty("avatarDecoration");
    });
  });
});
