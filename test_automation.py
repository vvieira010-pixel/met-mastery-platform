from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    title = page.title()
    print(f"TITLE: {title}")
    page.screenshot(path='C:/Users/vviei/AppData/Local/Temp/opencode/smoke-check.png', full_page=True)
    print(f"LINKS: {page.locator('a').count()}")
    print(f"BUTTONS: {page.locator('button').count()}")
    browser.close()
