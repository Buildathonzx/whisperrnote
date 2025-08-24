from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    print("Waiting for URL...")
    page.wait_for_url("http://localhost:3000", timeout=60000)
    print("URL found, navigating...")
    page.goto("http://localhost:3000")
    print("Taking screenshot...")
    page.screenshot(path="jules-scratch/verification/landing_page.png")
    print("Screenshot taken.")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
