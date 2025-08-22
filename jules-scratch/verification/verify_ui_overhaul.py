from playwright.sync_api import sync_playwright, Page, expect

def verify_ui(page: Page):
    """
    This script verifies the UI overhaul by logging in,
    viewing the notes page, and opening a note in the drawer.
    """
    # 1. Navigate to login and sign in
    page.goto("http://localhost:3001/login")
    page.get_by_label("Email").fill("test@test.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # 2. Wait for navigation to the notes page and take a screenshot
    expect(page).to_have_url("http://localhost:3001/notes")
    page.screenshot(path="jules-scratch/verification/notes_page.png")

    # 3. Click the first note to open the drawer
    # The note card itself doesn't have a role, but its parent div does.
    # We'll target the motion.div that has the onClick handler.
    first_note = page.locator("div.MuiGrid-root > div").first
    first_note.click()

    # 4. Wait for the drawer to be visible and take a screenshot
    drawer = page.locator(".MuiDrawer-paper")
    expect(drawer).to_be_visible()
    page.screenshot(path="jules-scratch/verification/notes_page_with_drawer.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_ui(page)
        browser.close()

if __name__ == "__main__":
    main()
