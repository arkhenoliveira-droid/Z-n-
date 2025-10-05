from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_page()
    page = context

    try:
        # 1. Navigate to the dashboard page (logged-out state)
        page.goto("http://localhost:3000/spaceship-dashboard")
        page.wait_for_load_state('networkidle')

        # 2. Take a screenshot of the logged-out state
        os.makedirs("screenshots", exist_ok=True)
        page.screenshot(path="screenshots/logged_out_dashboard.png")

        # 3. Simulate authentication by setting a token in localStorage
        page.evaluate("() => localStorage.setItem('authToken', 'dummy_token_for_testing')")

        # 4. Reload the page for the auth state to be recognized
        page.reload()
        page.wait_for_load_state('networkidle')

        # 5. Verify that the "New Post" button is visible
        new_post_button = page.locator('text="New Post"')
        expect(new_post_button).to_be_visible()

        # 6. Take a screenshot of the logged-in state
        page.screenshot(path="screenshots/logged_in_dashboard.png")

        # 7. Click the "New Post" button
        new_post_button.click()

        # 8. Verify that the URL is now /posts/new
        expect(page).to_have_url("http://localhost:3000/posts/new")

        # 9. Take a screenshot of the new post page
        page.screenshot(path="screenshots/new_post_page.png")

        print("Frontend verification successful. Screenshots saved in the 'screenshots' directory.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="screenshots/error.png")

    finally:
        browser.close()

if __name__ == '__main__':
    with sync_playwright() as playwright:
        run(playwright)