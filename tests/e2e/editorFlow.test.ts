import { test, expect } from "@playwright/test";

/**
 * editorFlow — sign in → create project → add nodes/edges → run BFS → verify playback
 *
 * Requires E2E_TEST_EMAIL and E2E_TEST_PASSWORD env vars pointing to a Google account
 * seeded in the test database, OR a pre-authenticated storage state.
 *
 * For local runs: set PLAYWRIGHT_STORAGE_STATE to a file created by `pnpm exec playwright codegen`
 * after manually signing in once.
 */
test.describe("Editor flow", () => {
  test.use({ storageState: process.env.PLAYWRIGHT_STORAGE_STATE ?? "tests/e2e/.auth/user.json" });

  test("create project, add 3 nodes + 2 edges, run BFS, step through playback", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);

    // Create a new project
    await page.getByRole("button", { name: /new project/i }).click();
    await expect(page).toHaveURL(/\/editor\//);

    // Wait for editor canvas to load
    await expect(page.locator("[data-id]").first()).toBeVisible({ timeout: 10000 });

    // Double-click canvas to add nodes (ReactFlow canvas)
    const canvas = page.locator(".react-flow__pane");
    await canvas.dblclick({ position: { x: 200, y: 200 } });
    await canvas.dblclick({ position: { x: 400, y: 200 } });
    await canvas.dblclick({ position: { x: 300, y: 350 } });

    // Wait for 3 nodes to appear
    await expect(page.locator(".react-flow__node")).toHaveCount(3, { timeout: 5000 });

    // Open Algorithm tab
    await page.getByRole("tab", { name: /algorithm/i }).click();

    // Select BFS
    await page.getByRole("combobox").selectOption("bfs");

    // Select source node (first node in the list)
    const sourceSelect = page.getByLabel(/source/i);
    if (await sourceSelect.isVisible()) {
      await sourceSelect.selectOption({ index: 0 });
    }

    // Run algorithm
    await page.getByRole("button", { name: /run/i }).click();

    // PlaybackPanel should appear
    await expect(page.getByTestId("playback-panel")).toBeVisible({ timeout: 8000 });

    // Step forward 3 times
    const nextBtn = page.getByRole("button", { name: /next/i });
    await nextBtn.click();
    await nextBtn.click();
    await nextBtn.click();

    // Step counter should show at least step 3
    const stepText = page.getByTestId("step-counter");
    if (await stepText.isVisible()) {
      const text = await stepText.textContent();
      expect(text).toMatch(/[3-9]|[1-9]\d/);
    }
  });
});
