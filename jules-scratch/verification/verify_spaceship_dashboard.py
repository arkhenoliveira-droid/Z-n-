from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the dashboard
    page.goto("http://localhost:3000/spaceship-dashboard")

    # Check for the main title
    expect(page.get_by_role("heading", name="Spaceship Dashboard")).to_be_visible()

    # Check for the visualization card
    expect(page.get_by_text("AurumGrid Spaceship Visualization")).to_be_visible()

    # Check for the Ethereum Network card
    expect(page.get_by_text("Ethereum Network")).to_be_visible()

    # Check for the AurumGrid Status card
    expect(page.get_by_text("AurumGrid Status")).to_be_visible()

    # Wait for the data to load to avoid capturing the "Loading..." state
    page.wait_for_function("() => !document.body.innerText.includes('Loading...')")

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/spaceship_dashboard.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)