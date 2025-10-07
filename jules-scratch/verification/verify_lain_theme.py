from playwright.sync_api import sync_playwright, Page, expect
import re

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # 1. Arrange: Go to the Aurum Grid Uploader page.
    page.goto("http://localhost:3000/aurum-grid-uploader")

    # 2. Act: Find the "Lain Protocol" tab and click it.
    lain_protocol_tab = page.get_by_role("tab", name="Lain Protocol")
    expect(lain_protocol_tab).to_be_visible()
    lain_protocol_tab.click()

    # 3. Assert: Confirm the $AURUM Grid Monitor is visible.
    aurum_monitor_title = page.get_by_text("$AURUM Grid Monitor // Lain Protocol Intelligence")
    expect(aurum_monitor_title).to_be_visible()

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/lain_theme_verification.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)