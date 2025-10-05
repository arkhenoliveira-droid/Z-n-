from playwright.sync_api import sync_playwright, expect

def run_verification():
    """
    Navigates to the upload page, verifies the title, and takes a screenshot.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Navigate to the upload page.
            page.goto("http://127.0.0.1:3000/upload")

            # 2. Verify the heading is visible.
            heading = page.get_by_role("heading", name="Upload Biophoton Experiment")
            expect(heading).to_be_visible()

            # 3. Take a screenshot for visual verification.
            page.screenshot(path="jules-scratch/verification/verification.png")

            print("Screenshot captured successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()