import { beforeEach, describe, expect, it, vi } from "vitest";

const { getShareBySlugOrToken, looksLikePrivateShareToken } = vi.hoisted(() => ({
  getShareBySlugOrToken: vi.fn(),
  looksLikePrivateShareToken: vi.fn(),
}));

vi.mock("@/server/shareService", () => ({
  getShareBySlugOrToken,
  looksLikePrivateShareToken,
}));

import { GET } from "@/app/api/share/[slugOrToken]/route";

describe("GET /api/share/[slugOrToken]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for an invalid private token without leaking project data", async () => {
    getShareBySlugOrToken.mockResolvedValue(null);
    looksLikePrivateShareToken.mockReturnValue(true);

    const response = await GET(new Request("http://localhost/api/share/token") as never, {
      params: Promise.resolve({ slugOrToken: "a".repeat(64) }),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "PERMISSION_DENIED",
        message: "Private share token is invalid or no longer active",
      },
    });
  });

  it("returns 404 for a missing public slug", async () => {
    getShareBySlugOrToken.mockResolvedValue(null);
    looksLikePrivateShareToken.mockReturnValue(false);

    const response = await GET(new Request("http://localhost/api/share/missing") as never, {
      params: Promise.resolve({ slugOrToken: "missing-slug" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Share link not found or no longer active",
      },
    });
  });
});
