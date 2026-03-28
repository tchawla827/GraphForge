import { test, expect } from "@playwright/test";

test.describe("Import flow", () => {
  test.use({ storageState: process.env.PLAYWRIGHT_STORAGE_STATE ?? "tests/e2e/.auth/user.json" });

  test("paste adjacency list → verify canvas shows 4 nodes", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);

    // Create a new project
    await page.getByRole("button", { name: /new project/i }).click();
    await expect(page).toHaveURL(/\/editor\//);

    // Open the Import tab or button
    await page.getByRole("tab", { name: /import/i }).click();

    // Select adjacency list format
    const formatSelect = page.getByRole("combobox");
    if (await formatSelect.isVisible()) {
      await formatSelect.selectOption("adjacency_list");
    }

    // Paste sample adjacency list
    const textarea = page.getByRole("textbox");
    await textarea.fill("A: B(4), C(2)\nB: D(7)");

    // Validate and import
    const validateBtn = page.getByRole("button", { name: /validate|preview/i });
    if (await validateBtn.isVisible()) {
      await validateBtn.click();
    }

    await page.getByRole("button", { name: /import|apply/i }).click();

    // Canvas should show 4 nodes: A, B, C, D
    await expect(page.locator(".react-flow__node")).toHaveCount(4, { timeout: 10000 });
  });
});
