import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/apiClient";
import {
  createCreatorApplicationApi,
  parseCreatorApplication,
} from "./creatorApplicationApi";

const application = {
  id: "e03581af-ded8-42e3-8298-f4d93844fd1e",
  userId: "7024fc48-182a-4544-b341-046837db9d2f",
  creatorName: "Sakura Studio",
  countryCode: "US",
  status: "PENDING",
  identityVerificationStatus: "NOT_STARTED",
  submittedAt: "2026-08-02T01:00:00.000Z",
  updatedAt: "2026-08-02T01:00:00.000Z",
};

describe("creatorApplicationApi", () => {
  it("accepts a valid application and a nullable current result", () => {
    expect(parseCreatorApplication({ application })).toEqual(application);
    expect(
      parseCreatorApplication({ application: null }, { nullable: true })
    ).toBeNull();
  });

  it("rejects malformed service responses", () => {
    expect(() =>
      parseCreatorApplication({
        application: { ...application, status: "INVENTED" },
      })
    ).toThrowError(ApiError);
    expect(() => parseCreatorApplication({ application: null })).toThrowError(
      ApiError
    );
  });

  it("maps reads and submissions to their endpoints", async () => {
    const client = {
      get: vi.fn().mockResolvedValue({ application: null }),
      post: vi.fn().mockResolvedValue({ application }),
    };
    const api = createCreatorApplicationApi(client);
    const input = { creatorName: "Sakura Studio", countryCode: "US" };

    await expect(api.getCurrent()).resolves.toBeNull();
    await expect(api.submit(input)).resolves.toEqual(application);
    expect(client.get).toHaveBeenCalledWith("/me/creator-application");
    expect(client.post).toHaveBeenCalledWith("/creator-applications", input);
  });
});
