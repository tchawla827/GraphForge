import { test, expect } from "@playwright/test";

test.describe("Share flow", () => {
  test.use({ storageState: process.env.PLAYWRIGHT_STORAGE_STATE ?? "tests/e2e/.auth/user.json" });

  test("create public share → open in incognito → verify read-only → click Fork → redirect to sign-in", async ({
    page,
    browser,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);

    // Create a new project
    await page.getByRole("button", { name: /new project/i }).click();
    await expect(page).toHaveURL(/\/editor\//);

    // Wait for canvas
    await page.waitForURL(/\/editor\//);

    // Open Share modal
    await page.getByRole("button", { name: /share/i }).click();

    // Create a public share
    await page.getByRole("button", { name: /public/i }).click();

    // Get the share URL from the input or link
    const shareUrlInput = page.getByTestId("share-url-input").or(
      page.locator("input[readonly]").first()
    );
    await expect(shareUrlInput).toBeVisible({ timeout: 8000 });
    const shareUrl = await shareUrlInput.inputValue();
    expect(shareUrl).toContain("/share/");

    // Open share URL in a fresh incognito context (no auth cookies)
    const incognitoContext = await browser.newContext({ storageState: undefined });
    const guestPage = await incognitoContext.newPage();
    await guestPage.goto(shareUrl);

    // Read-only badge should be visible
    await expect(
      guestPage.getByText(/read.only/i).or(guestPage.getByTestId("read-only-badge"))
    ).toBeVisible({ timeout: 8000 });

    // Fork button should be present
    const forkBtn = guestPage.getByRole("button", { name: /fork/i });
    await expect(forkBtn).toBeVisible();

    // Clicking Fork should redirect to sign-in (unauthenticated user)
    await forkBtn.click();
    await expect(guestPage).toHaveURL(/sign.?in|auth/i, { timeout: 8000 });

    await incognitoContext.close();
  });
});
