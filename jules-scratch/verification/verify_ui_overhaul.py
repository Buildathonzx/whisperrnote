import time
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    time.sleep(10)

    for i in range(3):
        try:
            page.goto("http://localhost:3000/login")
            break
        except Exception as e:
            if i == 2:
                raise e
            time.sleep(5)

    # Login
    page.get_by_label("Email").fill("user@example.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the notes page
    expect(page).to_have_url("http://localhost:3000/notes")

    # Create a new note
    page.get_by_role("button", name="add note").click()
    page.get_by_label("Title").fill("My New Note")
    page.get_by_label("Content").fill("This is the content of my new note.")
    page.get_by_role("button", name="Create Note").click()

    # Navigate to the new note's page
    page.get_by_text("My New Note").first.click()
    expect(page).to_have_url(lambda url: "/notes/" in url)

    # Add an attachment
    page.get_by_label("Attachments").set_input_files("public/file.svg")

    # Add a comment
    page.get_by_label("Add a comment").fill("This is a comment.")
    page.get_by_role("button", name="Add Comment").click()
    expect(page.get_by_text("This is a comment.")).to_be_visible()

    # Invite a collaborator
    page.get_by_label("User email").fill("test@example.com")
    page.get_by_role("button", name="Add Collaborator").click()
    expect(page.get_by_text("test@example.com")).to_be_visible()

    # Change status to published
    page.get_by_label("Status").select_option("published")

    # Make the note public
    page.get_by_label("Public").check()

    # Save changes
    page.get_by_role("button", name="Save Changes").click()

    # Navigate to profile page
    page.get_by_role("link", name="Profile").click()
    expect(page).to_have_url("http://localhost:3000/profile")

    # Edit profile
    page.get_by_role("button", name="Edit Profile").click()
    page.get_by_label("Name").fill("New Name")
    page.get_by_role("button", name="Save").click()
    expect(page.get_by_text("New Name")).to_be_visible()

    # Navigate to settings page
    page.get_by_role("link", name="Settings").click()
    expect(page).to_have_url("http://localhost:3000/settings")

    # Change a setting
    page.get_by_label("Enable Notifications").uncheck()
    page.get_by_role("button", name="Update Settings").click()

    page.screenshot(path="jules-scratch/verification/verification.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
