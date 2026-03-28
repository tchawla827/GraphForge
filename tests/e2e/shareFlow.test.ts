import { expect, test } from "@playwright/test";

test.describe("Share flow", () => {
  test.use({ storageState: process.env.PLAYWRIGHT_STORAGE_STATE ?? "tests/e2e/.auth/user.json" });

  test("create public share, open in incognito, verify read-only, and prompt sign-in on fork", async ({
    page,
    browser,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);

    await page.getByRole("button", { name: /new project/i }).click();
    await expect(page).toHaveURL(/\/editor\//);

    await page.getByRole("button", { name: /share/i }).click();
    await page.getByRole("button", { name: /public link/i }).click();

    const shareUrlInput = page.getByTestId("share-url-input");
    await expect(shareUrlInput).toBeVisible({ timeout: 8000 });
    const shareUrl = await shareUrlInput.inputValue();
    expect(shareUrl).toContain("/share/");

    const incognitoContext = await browser.newContext({ storageState: undefined });
    const guestPage = await incognitoContext.newPage();
    await guestPage.goto(shareUrl);

    await expect(guestPage.getByTestId("read-only-badge")).toBeVisible({ timeout: 8000 });

    const forkBtn = guestPage.getByRole("button", { name: /sign in to fork/i });
    await expect(forkBtn).toBeVisible();

    await forkBtn.click();
    await expect(guestPage).toHaveURL(/sign.?in|auth/i, { timeout: 8000 });

    await incognitoContext.close();
  });
});
