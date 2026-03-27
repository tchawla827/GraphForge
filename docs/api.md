# GraphForge API Spec

This file defines the intended HTTP/API contracts for the MVP.

## Conventions
- All request bodies are validated with Zod.
- All mutation routes require authentication unless explicitly public.
- All owner-only routes must enforce ownership server-side.
- Error shape should be stable across the app.

## Error response shape
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Readable human message",
    "details": {}
  }
}
```

## 1. Projects

### POST `/api/projects`
Create a project.

Request:
```json
{
  "title": "My Graph Project",
  "description": "optional"
}
```

Response:
```json
{
  "project": {
    "id": "proj_123",
    "title": "My Graph Project",
    "description": "optional",
    "createdAt": "2026-03-27T00:00:00.000Z",
    "updatedAt": "2026-03-27T00:00:00.000Z"
  }
}
```

### GET `/api/projects`
List current user's projects.

Response:
```json
{
  "projects": [
    {
      "id": "proj_123",
      "title": "My Graph Project",
      "updatedAt": "2026-03-27T00:00:00.000Z",
      "graphStats": {
        "nodeCount": 5,
        "edgeCount": 7
      },
      "lastAlgorithm": "dijkstra"
    }
  ]
}
```

### GET `/api/projects/:id`
Get a single owned project and graph summary.

### PATCH `/api/projects/:id`
Update project metadata.

Request:
```json
{
  "title": "Renamed Project",
  "description": "new description"
}
```

### DELETE `/api/projects/:id`
Soft-delete a project.

Response:
```json
{
  "ok": true
}
```

## 2. Graphs

### GET `/api/projects/:id/graph`
Return canonical graph state.

Response:
```json
{
  "graph": {
    "schemaVersion": 1,
    "id": "graph_123",
    "projectId": "proj_123",
    "config": {
      "directed": true,
      "weighted": true,
      "allowSelfLoops": false,
      "allowParallelEdges": false
    },
    "nodes": [],
    "edges": [],
    "createdAt": "2026-03-27T00:00:00.000Z",
    "updatedAt": "2026-03-27T00:00:00.000Z"
  }
}
```

### PUT `/api/projects/:id/graph`
Replace current graph state with validated canonical graph state.

Request:
```json
{
  "graph": {
    "schemaVersion": 1,
    "config": {
      "directed": true,
      "weighted": true,
      "allowSelfLoops": false,
      "allowParallelEdges": false
    },
    "nodes": [],
    "edges": []
  }
}
```

Response:
```json
{
  "ok": true,
  "updatedAt": "2026-03-27T00:00:00.000Z"
}
```

## 3. Imports

### POST `/api/projects/:id/import/adjacency-list`
Request:
```json
{
  "text": "A: B(4), C(2)\\nB: D(7)"
}
```

Response:
```json
{
  "graph": { "schemaVersion": 1 },
  "summary": {
    "nodeCount": 4,
    "edgeCount": 3
  }
}
```

### POST `/api/projects/:id/import/adjacency-matrix`
Request:
```json
{
  "text": " ,A,B,C\\nA,0,1,4\\nB,0,0,2\\nC,0,0,0"
}
```

### POST `/api/projects/:id/import/json`
Request:
```json
{
  "graph": {}
}
```

## 4. Algorithm runs

### POST `/api/projects/:id/run`
Run an algorithm against the current canonical graph.

Request:
```json
{
  "algorithm": "dijkstra",
  "sourceNodeId": "A",
  "targetNodeId": "D",
  "heuristic": "euclidean"
}
```

Response:
```json
{
  "run": {
    "algorithm": "dijkstra",
    "events": [],
    "result": {
      "status": "success",
      "summary": "Shortest path found",
      "metrics": {
        "visitedNodeCount": 4,
        "consideredEdgeCount": 5,
        "stepCount": 10
      },
      "output": {},
      "warnings": []
    }
  }
}
```

Validation notes:
- reject Dijkstra when negative weights exist
- require source for traversal/shortest path algorithms
- require target for A*
- require directed graph for Topological Sort
- require undirected weighted graph for Prim/Kruskal

## 5. Sharing

### POST `/api/projects/:id/shares`
Create a share link.

Request:
```json
{
  "type": "public"
}
```

or

```json
{
  "type": "private_token"
}
```

Response:
```json
{
  "share": {
    "id": "share_123",
    "type": "public",
    "url": "https://example.com/share/graph-demo",
    "isActive": true
  }
}
```

### GET `/api/share/:slugOrToken`
Return shared read-only project payload.

Response:
```json
{
  "project": {
    "id": "proj_123",
    "title": "Shared Graph"
  },
  "graph": {},
  "share": {
    "type": "public",
    "readOnly": true
  }
}
```

### DELETE `/api/shares/:id`
Revoke a share link.

Response:
```json
{
  "ok": true
}
```

### POST `/api/share/:slugOrToken/fork`
Fork a shared project into the current authenticated user's workspace.

Response:
```json
{
  "project": {
    "id": "proj_new",
    "title": "Copy of Shared Graph"
  }
}
```

## 6. Admin

### GET `/api/admin/stats`
Internal-only admin stats.

### POST `/api/admin/moderation/share/:id/revoke`
Revoke abusive public content.

## 7. Suggested internal service boundaries
- `projectService`
- `graphService`
- `importService`
- `algorithmService`
- `shareService`
- `adminService`
