import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma before importing shareService
vi.mock("@/lib/db/client", () => ({
  prisma: {
    shareLink: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/share/slugGenerator", () => ({
  generateUniqueSlug: vi.fn().mockResolvedValue("bright-graph-7a3f"),
}));

import { prisma } from "@/lib/db/client";
import {
  createPublicShare,
  createPrivateShare,
  revokeShare,
  getShareBySlugOrToken,
  forkSharedProject,
} from "@/server/shareService";

const prismaMock = prisma as unknown as {
  shareLink: {
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  project: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

const OWNER_ID = "user_owner";
const OTHER_USER_ID = "user_other";
const PROJECT_ID = "project_1";

const baseProject = {
  id: PROJECT_ID,
  ownerId: OWNER_ID,
  title: "Test Graph",
  description: null,
  archivedAt: null,
};

const baseGraph = {
  id: "graph_1",
  projectId: PROJECT_ID,
  schemaVersion: 1,
  isDirected: true,
  isWeighted: false,
  allowSelfLoops: false,
  allowParallelEdges: false,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  nodes: [],
  edges: [],
};

const baseShareLink = {
  id: "share_1",
  projectId: PROJECT_ID,
  type: "public",
  slug: "bright-graph-7a3f",
  tokenHash: null,
  isActive: true,
  createdBy: OWNER_ID,
  createdAt: new Date("2026-01-01"),
  revokedAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ──────────────────────────────────────────────
// createPublicShare
// ──────────────────────────────────────────────

describe("createPublicShare", () => {
  it("creates a public share for the project owner", async () => {
    prismaMock.project.findUnique.mockResolvedValue(baseProject);
    prismaMock.shareLink.create.mockResolvedValue(baseShareLink);

    const result = await createPublicShare(PROJECT_ID, OWNER_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.type).toBe("public");
      expect(result.data.slug).toBe("bright-graph-7a3f");
      expect(result.data.url).toContain("bright-graph-7a3f");
    }
  });

  it("returns forbidden when a non-owner tries to create a share", async () => {
    prismaMock.project.findUnique.mockResolvedValue(baseProject);

    const result = await createPublicShare(PROJECT_ID, OTHER_USER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("forbidden");
    }
    expect(prismaMock.shareLink.create).not.toHaveBeenCalled();
  });

  it("returns not_found for a non-existent project", async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);

    const result = await createPublicShare("nonexistent", OWNER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });

  it("returns not_found for an archived project", async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      ...baseProject,
      archivedAt: new Date(),
    });

    const result = await createPublicShare(PROJECT_ID, OWNER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_found");
    }
  });
});

// ──────────────────────────────────────────────
// createPrivateShare
// ──────────────────────────────────────────────

describe("createPrivateShare", () => {
  it("creates a private share and returns rawToken only once", async () => {
    prismaMock.project.findUnique.mockResolvedValue(baseProject);
    prismaMock.shareLink.create.mockResolvedValue({
      ...baseShareLink,
      type: "private_token",
      slug: null,
      tokenHash: "somehash",
    });

    const result = await createPrivateShare(PROJECT_ID, OWNER_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.type).toBe("private_token");
      expect(result.data.rawToken).toBeDefined();
      expect(result.data.rawToken).toHaveLength(64); // 32 bytes = 64 hex chars
      // tokenHash must NOT be in the response
      expect(result.data).not.toHaveProperty("tokenHash");
    }
  });

  it("returns forbidden for non-owner", async () => {
    prismaMock.project.findUnique.mockResolvedValue(baseProject);

    const result = await createPrivateShare(PROJECT_ID, OTHER_USER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("forbidden");
  });
});

// ──────────────────────────────────────────────
// revokeShare
// ──────────────────────────────────────────────

describe("revokeShare", () => {
  it("allows the project owner to revoke a share", async () => {
    prismaMock.shareLink.findUnique.mockResolvedValue({
      ...baseShareLink,
      project: baseProject,
    });
    prismaMock.shareLink.update.mockResolvedValue({
      ...baseShareLink,
      isActive: false,
    });

    const result = await revokeShare("share_1", OWNER_ID);

    expect(result.ok).toBe(true);
    expect(prismaMock.shareLink.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "share_1" },
        data: expect.objectContaining({ isActive: false }),
      })
    );
  });

  it("returns forbidden when a non-owner tries to revoke", async () => {
    prismaMock.shareLink.findUnique.mockResolvedValue({
      ...baseShareLink,
      project: baseProject,
    });

    const result = await revokeShare("share_1", OTHER_USER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("forbidden");
    expect(prismaMock.shareLink.update).not.toHaveBeenCalled();
  });

  it("returns not_found for a non-existent share", async () => {
    prismaMock.shareLink.findUnique.mockResolvedValue(null);

    const result = await revokeShare("nonexistent", OWNER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("not_found");
  });
});

// ──────────────────────────────────────────────
// getShareBySlugOrToken
// ──────────────────────────────────────────────

describe("getShareBySlugOrToken", () => {
  const projectWithGraph = {
    ...baseProject,
    graphs: [baseGraph],
  };

  it("returns project and graph for a valid public slug", async () => {
    prismaMock.shareLink.findFirst.mockResolvedValueOnce({
      ...baseShareLink,
      project: projectWithGraph,
    });

    const result = await getShareBySlugOrToken("bright-graph-7a3f");

    expect(result).not.toBeNull();
    expect(result?.project.id).toBe(PROJECT_ID);
    expect(result?.share.readOnly).toBe(true);
    // tokenHash must NOT be in the response
    expect(result?.share).not.toHaveProperty("tokenHash");
  });

  it("returns null for a revoked public share", async () => {
    prismaMock.shareLink.findFirst.mockResolvedValueOnce({
      ...baseShareLink,
      isActive: false,
      project: projectWithGraph,
    });

    const result = await getShareBySlugOrToken("bright-graph-7a3f");

    expect(result).toBeNull();
  });

  it("returns null for a non-existent slug", async () => {
    prismaMock.shareLink.findFirst.mockResolvedValue(null);

    const result = await getShareBySlugOrToken("does-not-exist");

    expect(result).toBeNull();
  });

  it("returns null for a wrong private token", async () => {
    // Neither slug lookup nor token hash lookup returns a share
    prismaMock.shareLink.findFirst.mockResolvedValue(null);

    const result = await getShareBySlugOrToken("wrong_token_that_does_not_match");

    expect(result).toBeNull();
  });

  it("does not expose tokenHash in the returned payload", async () => {
    prismaMock.shareLink.findFirst.mockResolvedValueOnce({
      ...baseShareLink,
      tokenHash: "secret_hash",
      project: projectWithGraph,
    });

    const result = await getShareBySlugOrToken("bright-graph-7a3f");

    expect(result).not.toBeNull();
    // Verify the share object in the payload has no tokenHash
    const shareKeys = Object.keys(result?.share ?? {});
    expect(shareKeys).not.toContain("tokenHash");
  });
});

// ──────────────────────────────────────────────
// forkSharedProject
// ──────────────────────────────────────────────

describe("forkSharedProject", () => {
  const projectWithGraph = {
    ...baseProject,
    graphs: [{ ...baseGraph, nodes: [], edges: [] }],
  };

  const forkedProject = {
    id: "project_forked",
    ownerId: OTHER_USER_ID,
    title: "Copy of Test Graph",
    description: null,
    archivedAt: null,
    graphs: [{ ...baseGraph, id: "graph_forked" }],
  };

  it("creates a new project owned by the forking user", async () => {
    // getShareBySlugOrToken internal call
    prismaMock.shareLink.findFirst.mockResolvedValueOnce({
      ...baseShareLink,
      project: projectWithGraph,
    });
    prismaMock.project.findUnique.mockResolvedValue(projectWithGraph);
    prismaMock.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => {
      const tx = {
        project: {
          create: vi.fn().mockResolvedValue(forkedProject),
        },
        nodeRecord: { createMany: vi.fn() },
        edgeRecord: { createMany: vi.fn() },
      };
      return fn(tx);
    });

    const result = await forkSharedProject("bright-graph-7a3f", OTHER_USER_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("Copy of Test Graph");
      expect(result.data.id).toBe("project_forked");
    }
  });

  it("returns not_found for an invalid or revoked share", async () => {
    prismaMock.shareLink.findFirst.mockResolvedValue(null);

    const result = await forkSharedProject("invalid-slug", OTHER_USER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("not_found");
  });

  it("forked project has a different ownerId than the original", async () => {
    prismaMock.shareLink.findFirst.mockResolvedValueOnce({
      ...baseShareLink,
      project: projectWithGraph,
    });
    prismaMock.project.findUnique.mockResolvedValue(projectWithGraph);

    let capturedOwnerId: string | undefined;
    prismaMock.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => {
      const tx = {
        project: {
          create: vi.fn().mockImplementation((args: { data: { ownerId: string } }) => {
            capturedOwnerId = args.data.ownerId;
            return Promise.resolve(forkedProject);
          }),
        },
        nodeRecord: { createMany: vi.fn() },
        edgeRecord: { createMany: vi.fn() },
      };
      return fn(tx);
    });

    await forkSharedProject("bright-graph-7a3f", OTHER_USER_ID);

    expect(capturedOwnerId).toBe(OTHER_USER_ID);
    expect(capturedOwnerId).not.toBe(OWNER_ID);
  });
});
