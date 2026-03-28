import { expect, test } from "@playwright/test";

test.describe("Import flow", () => {
  test.use({ storageState: process.env.PLAYWRIGHT_STORAGE_STATE ?? "tests/e2e/.auth/user.json" });

  test("paste adjacency list and verify canvas shows 4 nodes", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);

    await page.getByRole("button", { name: /new project/i }).click();
    await expect(page).toHaveURL(/\/editor\//);

    await page.getByRole("button", { name: /import/i }).click();
    await page.getByRole("textbox").fill("A: B(4), C(2)\nB: D(7)");
    await page.getByRole("button", { name: /validate/i }).click();
    await page.getByRole("button", { name: /import and replace graph/i }).click();

    await expect(page.locator(".react-flow__node")).toHaveCount(4, { timeout: 10000 });
  });
});
