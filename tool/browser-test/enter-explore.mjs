export async function enterExplore(page) {
  if (await page.locator('#session-entry').count()) {
    await page.locator('#player-name').fill('Cún kiểm tra');
    await page.locator('.session-modes [value="explore"]').click();
  }
}
