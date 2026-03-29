import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";
import { generateToken, hashToken } from "@/lib/share/tokenGenerator";
import { generateUniqueSlug } from "@/lib/share/slugGenerator";
import { track } from "@/lib/analytics/track";
import type { CanonicalGraph } from "@/types/graph";

export type ShareServiceError = "not_found" | "forbidden" | "revoked";

export type ShareResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ShareServiceError };

export interface SharePayload {
  project: { id: string; title: string };
  graph: CanonicalGraph;
  share: { id: string; type: string; readOnly: true };
}

export interface PublicShareInfo {
  id: string;
  type: "public";
  url: string;
  isActive: boolean;
  slug: string;
  createdAt: Date;
}

export interface PrivateShareInfo {
  id: string;
  type: "private_token";
  url: string;
  isActive: boolean;
  rawToken: string;
  createdAt: Date;
}

export interface ActivePrivateShareInfo {
  id: string;
  type: "private_token";
  url: string;
  isActive: boolean;
  createdAt: Date;
}

const PRIVATE_SHARE_TOKEN_RE = /^[a-f0-9]{64}$/i;

function buildShareUrl(base: string, slugOrToken: string): string {
  return `${base}/share/${slugOrToken}`;
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function looksLikePrivateShareToken(slugOrToken: string): boolean {
  return PRIVATE_SHARE_TOKEN_RE.test(slugOrToken);
}

export async function createPublicShare(
  projectId: string,
  userId: string
): Promise<ShareResult<PublicShareInfo>> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.archivedAt !== null) {
    return { ok: false, error: "not_found" };
  }
  if (project.ownerId !== userId) {
    return { ok: false, error: "forbidden" };
  }

  const slug = await generateUniqueSlug();
  const share = await prisma.shareLink.create({
    data: {
      projectId,
      type: "public",
      slug,
      isActive: true,
      createdBy: userId,
    },
  });

  void track({ name: "share_created", type: "public" });
  return {
    ok: true,
    data: {
      id: share.id,
      type: "public",
      url: buildShareUrl(getBaseUrl(), slug),
      isActive: true,
      slug,
      createdAt: share.createdAt,
    },
  };
}

export async function createPrivateShare(
  projectId: string,
  userId: string
): Promise<ShareResult<PrivateShareInfo>> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.archivedAt !== null) {
    return { ok: false, error: "not_found" };
  }
  if (project.ownerId !== userId) {
    return { ok: false, error: "forbidden" };
  }

  const { raw, hash } = generateToken();
  const share = await prisma.shareLink.create({
    data: {
      projectId,
      type: "private_token",
      tokenHash: hash,
      isActive: true,
      createdBy: userId,
    },
  });

  void track({ name: "share_created", type: "private_token" });
  return {
    ok: true,
    data: {
      id: share.id,
      type: "private_token",
      url: buildShareUrl(getBaseUrl(), raw),
      isActive: true,
      rawToken: raw,
      createdAt: share.createdAt,
    },
  };
}

export async function revokeShare(
  shareId: string,
  userId: string
): Promise<ShareResult<null>> {
  const share = await prisma.shareLink.findUnique({
    where: { id: shareId },
    include: { project: true },
  });

  if (!share) {
    return { ok: false, error: "not_found" };
  }
  if (share.project.ownerId !== userId) {
    return { ok: false, error: "forbidden" };
  }

  await prisma.shareLink.update({
    where: { id: shareId },
    data: { isActive: false, revokedAt: new Date() },
  });

  return { ok: true, data: null };
}

export async function listProjectShares(
  projectId: string,
  userId: string
): Promise<ShareResult<Array<{ id: string; type: string; isActive: boolean; slug: string | null; createdAt: Date; url: string }>>> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.archivedAt !== null) {
    return { ok: false, error: "not_found" };
  }
  if (project.ownerId !== userId) {
    return { ok: false, error: "forbidden" };
  }

  const shares = await prisma.shareLink.findMany({
    where: { projectId, isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, isActive: true, slug: true, createdAt: true },
  });

  const base = getBaseUrl();
  return {
    ok: true,
    data: shares.map((s) => ({
      id: s.id,
      type: s.type,
      isActive: s.isActive,
      slug: s.slug,
      createdAt: s.createdAt,
      // Private shares: url cannot be reconstructed (raw token was shown once)
      url: s.type === "public" && s.slug ? buildShareUrl(base, s.slug) : "",
    })),
  };
}

export async function getShareBySlugOrToken(
  slugOrToken: string
): Promise<SharePayload | null> {
  // Try public slug first
  let share = await prisma.shareLink.findFirst({
    where: { slug: slugOrToken, type: "public" },
    include: {
      project: {
        include: {
          graphs: { include: { nodes: true, edges: true } },
        },
      },
    },
  });

  // If not found, try hashing as private token
  if (!share) {
    const hash = hashToken(slugOrToken);
    share = await prisma.shareLink.findFirst({
      where: { tokenHash: hash, type: "private_token" },
      include: {
        project: {
          include: {
            graphs: { include: { nodes: true, edges: true } },
          },
        },
      },
    });
  }

  if (!share || !share.isActive) return null;

  const project = share.project;
  if (!project || project.archivedAt !== null) return null;

  const record = project.graphs;
  if (!record) return null;

  const graph: CanonicalGraph = {
    schemaVersion: 1,
    id: record.id,
    projectId: project.id,
    config: {
      directed: record.isDirected,
      weighted: record.isWeighted,
      allowSelfLoops: record.allowSelfLoops,
      allowParallelEdges: record.allowParallelEdges,
    },
    nodes: record.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      position: { x: n.x, y: n.y },
      metadata: (n.metadataJson as Record<string, unknown>) ?? undefined,
    })),
    edges: record.edges.map((e) => ({
      id: e.id,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      weight: e.weight ?? null,
      label: e.label ?? null,
      metadata: (e.metadataJson as Record<string, unknown>) ?? undefined,
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };

  return {
    project: { id: project.id, title: project.title },
    graph,
    share: { id: share.id, type: share.type, readOnly: true },
  };
}

export async function forkSharedProject(
  slugOrToken: string,
  forkingUserId: string
): Promise<ShareResult<{ id: string; title: string }>> {
  const payload = await getShareBySlugOrToken(slugOrToken);
  if (!payload) {
    return { ok: false, error: "not_found" };
  }

  const sourceProject = await prisma.project.findUnique({
    where: { id: payload.project.id },
    include: {
      graphs: { include: { nodes: true, edges: true } },
    },
  });

  if (!sourceProject || sourceProject.archivedAt !== null) {
    return { ok: false, error: "not_found" };
  }

  const sourceGraph = sourceProject.graphs;
  const newTitle = `Copy of ${sourceProject.title}`;

  const forkedProject = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        ownerId: forkingUserId,
        title: newTitle,
        description: sourceProject.description,
        graphs: {
          create: {
            schemaVersion: sourceGraph?.schemaVersion ?? 1,
            isDirected: sourceGraph?.isDirected ?? true,
            isWeighted: sourceGraph?.isWeighted ?? false,
            allowSelfLoops: sourceGraph?.allowSelfLoops ?? false,
            allowParallelEdges: sourceGraph?.allowParallelEdges ?? false,
          },
        },
      },
      include: { graphs: true },
    });

    if (!sourceGraph) return created;

    const targetGraph = created.graphs;
    if (!targetGraph) return created;
    const nodeIdMap = new Map<string, string>();

    if (sourceGraph.nodes.length > 0) {
      await tx.nodeRecord.createMany({
        data: sourceGraph.nodes.map((node) => {
          const nextId = crypto.randomUUID();
          nodeIdMap.set(node.id, nextId);
          return {
            id: nextId,
            graphId: targetGraph.id,
            label: node.label,
            x: node.x,
            y: node.y,
            metadataJson: node.metadataJson
              ? (node.metadataJson as Prisma.InputJsonValue)
              : Prisma.JsonNull,
          };
        }),
      });
    }

    if (sourceGraph.edges.length > 0) {
      await tx.edgeRecord.createMany({
        data: sourceGraph.edges.map((edge) => ({
          id: crypto.randomUUID(),
          graphId: targetGraph.id,
          sourceNodeId: nodeIdMap.get(edge.sourceNodeId) ?? edge.sourceNodeId,
          targetNodeId: nodeIdMap.get(edge.targetNodeId) ?? edge.targetNodeId,
          weight: edge.weight,
          label: edge.label,
          metadataJson: edge.metadataJson
            ? (edge.metadataJson as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        })),
      });
    }

    return created;
  });

  return { ok: true, data: { id: forkedProject.id, title: newTitle } };
}
