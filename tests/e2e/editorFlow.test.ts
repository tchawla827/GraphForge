import { expect, test } from "@playwright/test";

test.describe("Editor flow", () => {
  test.use({ storageState: process.env.PLAYWRIGHT_STORAGE_STATE ?? "tests/e2e/.auth/user.json" });

  test("create project, add nodes, run BFS, and step through playback", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);

    await page.getByRole("button", { name: /new project/i }).click();
    await expect(page).toHaveURL(/\/editor\//);

    await page.getByRole("button", { name: /add node/i }).click();

    const canvas = page.locator(".react-flow__pane");
    await canvas.click({ position: { x: 200, y: 200 } });
    await canvas.click({ position: { x: 400, y: 200 } });
    await canvas.click({ position: { x: 300, y: 350 } });

    await expect(page.locator(".react-flow__node")).toHaveCount(3, { timeout: 5000 });

    await page.getByRole("tab", { name: /algo/i }).click();
    await page.getByRole("button", { name: /run algorithm/i }).click();

    await expect(page.getByTestId("playback-panel")).toBeVisible({ timeout: 8000 });

    const nextBtn = page.getByRole("button", { name: /step forward/i });
    await nextBtn.click();
    await nextBtn.click();
    await nextBtn.click();

    await expect(page.getByTestId("step-counter")).toContainText("3/");
  });
});
