import type { PrismaClient } from "@pumdoki/database";
import { describe, expect, it, vi } from "vitest";
import { createContentService } from "./service.js";
import type { MediaStorage } from "./storage.js";

const ownerId = "b08f4cde-f024-42b7-8c19-1d6d55b42082";
const requestKey = "abda6503-52fa-4f56-89b8-1714e11b1725";
const stored = {
  key: "a".repeat(64),
  mimeType: "image/png" as const,
  byteSize: 100,
  sha256: "b".repeat(64),
};

function dependencies() {
  const findUnique = vi.fn().mockResolvedValueOnce(null);
  const findReference = vi.fn();
  const lock = vi.fn().mockResolvedValue([{ id: ownerId }]);
  const cleanupTransaction = {
    $queryRaw: lock,
    mediaAsset: { findUnique: findReference },
  };
  const transaction = vi.fn(
    async (callback: (tx: typeof cleanupTransaction) => Promise<unknown>) =>
      callback(cleanupTransaction)
  );
  const db = {
    mediaAsset: { findUnique },
    $transaction: transaction,
  } as unknown as PrismaClient;
  const storage = {
    put: vi.fn().mockResolvedValue(stored),
    read: vi.fn(),
    remove: vi.fn().mockResolvedValue(undefined),
  } satisfies MediaStorage;
  return {
    service: createContentService(db, storage),
    storage,
    findUnique,
    findReference,
    lock,
    transaction,
  };
}

describe("media upload cleanup after transaction outcomes", () => {
  it("preserves bytes when a transaction rejects after its media reference committed", async () => {
    const { service, storage, findReference, transaction } = dependencies();
    const uncertainCommit = new Error("transaction response lost");
    transaction.mockRejectedValueOnce(uncertainCommit);
    findReference.mockResolvedValueOnce({ id: "committed-media-record" });

    await expect(
      service.upload(
        ownerId,
        Buffer.from("sample bytes"),
        "image/png",
        requestKey
      )
    ).rejects.toBe(uncertainCommit);

    expect(findReference).toHaveBeenLastCalledWith({
      where: { storageKey: stored.key },
      select: { id: true },
    });
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("preserves private bytes and the original error when reference verification is unavailable", async () => {
    const { service, storage, findReference, transaction } = dependencies();
    const uncertainCommit = new Error("transaction response lost");
    transaction.mockRejectedValueOnce(uncertainCommit);
    findReference.mockRejectedValueOnce(new Error("database unavailable"));

    await expect(
      service.upload(
        ownerId,
        Buffer.from("sample bytes"),
        "image/png",
        requestKey
      )
    ).rejects.toBe(uncertainCommit);

    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("removes temporary stored bytes after a failed transaction is confirmed to have no reference", async () => {
    const { service, storage, findReference, transaction } = dependencies();
    const rolledBack = new Error("transaction rolled back");
    transaction.mockRejectedValueOnce(rolledBack);
    findReference.mockResolvedValueOnce(null);

    await expect(
      service.upload(
        ownerId,
        Buffer.from("sample bytes"),
        "image/png",
        requestKey
      )
    ).rejects.toBe(rolledBack);

    expect(storage.remove).toHaveBeenCalledExactlyOnceWith(stored.key, "LOCAL");
  });

  it("removes only the unused object after an idempotent race returns another committed object", async () => {
    const { service, storage, findReference, transaction } = dependencies();
    transaction.mockResolvedValueOnce({
      id: "62ad4e91-31bb-448f-a706-e30f19bd9b9b",
      storageKey: "c".repeat(64),
      mimeType: "image/png",
      byteSize: 80,
    });
    findReference.mockResolvedValueOnce(null);

    const media = await service.upload(
      ownerId,
      Buffer.from("sample bytes"),
      "image/png",
      requestKey
    );

    expect(media.id).toBe("62ad4e91-31bb-448f-a706-e30f19bd9b9b");
    expect(storage.remove).toHaveBeenCalledExactlyOnceWith(stored.key, "LOCAL");
  });

  it("does no cleanup or additional database check after a confirmed commit of this object", async () => {
    const { service, storage, findUnique, transaction } = dependencies();
    transaction.mockResolvedValueOnce({
      id: "62ad4e91-31bb-448f-a706-e30f19bd9b9b",
      storageKey: stored.key,
      mimeType: stored.mimeType,
      byteSize: stored.byteSize,
    });

    await service.upload(
      ownerId,
      Buffer.from("sample bytes"),
      "image/png",
      requestKey
    );

    expect(findUnique).toHaveBeenCalledOnce();
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("waits for an in-flight upload transaction to settle before deciding a reference is absent", async () => {
    const { service, storage, findReference, transaction, lock } =
      dependencies();
    const uncertainCommit = new Error("transaction response lost");
    transaction.mockRejectedValueOnce(uncertainCommit);
    findReference.mockResolvedValueOnce(null);
    let releaseLock!: () => void;
    lock.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          releaseLock = resolve;
        })
    );

    const upload = service.upload(
      ownerId,
      Buffer.from("sample bytes"),
      "image/png",
      requestKey
    );
    const rejectedUpload = expect(upload).rejects.toBe(uncertainCommit);
    await vi.waitFor(() => expect(lock).toHaveBeenCalledOnce());
    expect(findReference).not.toHaveBeenCalled();
    expect(storage.remove).not.toHaveBeenCalled();

    releaseLock();
    await rejectedUpload;
    expect(storage.remove).toHaveBeenCalledExactlyOnceWith(stored.key, "LOCAL");
  });
});
