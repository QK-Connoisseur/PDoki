import { test, expect } from "@playwright/test";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { loginAs } from "./auth-helpers";

const API = "http://127.0.0.1:3180/api/v1";

for (const kind of ["photo", "video"]) {
  test(`${kind}: creator draft persists, publishes real media to a member, and removal revokes access`, async ({
    page,
    browser,
  }, testInfo) => {
    const caption = `Safe ${kind} browser check ${Date.now()}`;
    const email = `content-${kind}-browser-${Date.now()}@pumdoki.example`;
    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    let postId;
    try {
      const registration = await memberContext.request.post(
        `${API}/auth/register`,
        {
          data: {
            email,
            password: "content-browser-password",
            displayName: "Content Test Member",
            ageAttested: true,
            acceptedTermsVersion: "terms-2026-08-01",
            acceptedPrivacyVersion: "privacy-2026-08-01",
          },
        }
      );
      expect(registration.status()).toBe(201);
      let mail = "";
      await expect
        .poll(async () => {
          const response = await memberContext.request.get(
            `http://127.0.0.1:8025/view/latest.txt?query=${encodeURIComponent(`to:${email}`)}`
          );
          mail = response.ok() ? await response.text() : "";
          return mail;
        })
        .toContain("/verify-email?token=");
      const token = new URL(
        mail.match(/http:\/\/127\.0\.0\.1:5180\/verify-email\?token=[^\s]+/)[0]
      ).searchParams.get("token");
      expect(
        (
          await memberContext.request.post(`${API}/auth/verify-email/confirm`, {
            data: { token },
          })
        ).ok()
      ).toBeTruthy();

      await loginAs(page, "creator");
      await expect(
        page.getByRole("heading", { name: "Your posts and drafts" })
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Create Post", exact: true })
        .click();
      const dialog = page.getByRole("dialog", { name: "Create Post" });
      await dialog.getByLabel("Caption", { exact: true }).fill(caption);
      const sample =
        kind === "photo"
          ? await sharp({
              create: {
                width: 800,
                height: 450,
                channels: 3,
                background: "#f9a8c8",
              },
            })
              .png()
              .toBuffer()
          : await readFile(
              new URL("../fixtures/content-sample.mp4", import.meta.url)
            );
      await dialog.getByLabel("Photos or videos").setInputFiles({
        name: kind === "photo" ? "safe-sample.png" : "safe-sample.mp4",
        mimeType: kind === "photo" ? "image/png" : "video/mp4",
        buffer: sample,
      });
      await dialog.getByRole("checkbox").check();
      const saveResponse = page.waitForResponse(
        (response) =>
          response.url() === `${API}/content/posts` &&
          response.request().method() === "POST"
      );
      await dialog.getByRole("button", { name: "Save draft" }).click();
      const saved = await saveResponse;
      expect(saved.status()).toBe(201);
      const { post } = await saved.json();
      postId = post.id;
      const mediaUrl = `http://127.0.0.1:3180${post.media[0].url}`;
      await expect(dialog).not.toBeVisible();
      await page.reload();
      const draft = page
        .getByRole("article", { name: "Draft by Sample Creator" })
        .filter({ hasText: caption });
      await expect(draft).toBeVisible();
      await expect(
        kind === "photo"
          ? draft.getByRole("img", { name: "Post photo" })
          : draft.getByLabel("Post video")
      ).toBeVisible();
      expect((await memberContext.request.get(mediaUrl)).status()).toBe(404);
      await memberPage.goto("http://127.0.0.1:5180/home");
      await expect(memberPage.getByText(caption)).toHaveCount(0);
      await draft.getByRole("button", { name: "Publish", exact: true }).click();
      await expect(
        page.getByText("Post published.", { exact: true })
      ).toBeVisible();
      await memberPage.reload();
      const published = memberPage
        .getByRole("article", { name: "Post by Sample Creator" })
        .filter({ hasText: caption });
      await expect(published).toBeVisible();
      if (kind === "photo") {
        await expect
          .poll(() =>
            published
              .getByRole("img", { name: "Post photo" })
              .evaluate((img) => img.complete && img.naturalWidth === 800)
          )
          .toBe(true);
      } else {
        const video = published.getByLabel("Post video");
        await expect
          .poll(() =>
            video.evaluate(
              (element) => element.readyState >= 1 && element.videoWidth === 640
            )
          )
          .toBe(true);
        await video.evaluate(async (element) => {
          element.muted = true;
          await element.play();
        });
        await expect
          .poll(() => video.evaluate((element) => element.currentTime))
          .toBeGreaterThan(0);
      }
      expect((await memberContext.request.get(mediaUrl)).status()).toBe(200);
      await memberPage.screenshot({
        path: testInfo.outputPath(`member-${kind}-content.png`),
        fullPage: true,
      });
      const ownPost = page
        .getByRole("region", { name: "Your posts and drafts" })
        .getByRole("article")
        .filter({ hasText: caption });
      await ownPost.getByRole("button", { name: "Remove post" }).click();
      await expect(
        page.getByText("Post removed.", { exact: true })
      ).toBeVisible();
      expect(
        (
          await memberContext.request.get(mediaUrl, {
            headers: { Range: "bytes=0-9" },
          })
        ).status()
      ).toBe(404);
      await memberPage.reload();
      await expect(memberPage.getByText(caption)).toHaveCount(0);
    } finally {
      if (postId)
        await page.request.delete(`${API}/content/posts/${postId}`, {
          headers: { Origin: "http://127.0.0.1:5180" },
        });
      await memberContext.close();
    }
  });
}
