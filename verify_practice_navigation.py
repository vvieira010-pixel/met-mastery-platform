from playwright.sync_api import sync_playwright

TARGETS = [
    ("student-dashboard", "practice-navigation", "src/pages/student-dashboard.jsx"),
    ("practice-studio grid", "practice-navigation", "src/pages/practice-studio.jsx"),
    ("practice-studio card", "practice-skill-grammar", "src/pages/practice-studio.jsx"),
    ("practice-studio session", "practice-session", "src/pages/practice-studio.jsx"),
    ("webmcp lib", "practice-navigation", "src/lib/webmcp-practice-tour.js"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000", wait_until="networkidle")
    print(f"Loaded {page.url} title={page.title()}")
    page.screenshot(path="C:\\Users\\vviei\\platform0.3\\platform0.3\\verify_nav.png", full_page=True)
    print("Screenshot saved to verify_nav.png")
    print("DOM has practice-navigation?", "practice-navigation" in page.content())

    # Verify source files are served with tour targets (no auth needed)
    for label, needle, url_path in TARGETS:
        resp = page.request.get(f"http://localhost:3000/{url_path}")
        body = resp.text() if resp.ok else ""
        ok = needle in body
        print(f"{'PASS' if ok else 'FAIL'} {label}: '{needle}' in {url_path} -> {resp.status} {'found' if ok else 'MISSING'}")
        if not ok:
            print(body[:400])

    # Direct DOM check after navigating to hash that should show practice-studio if stubbed
    # Try to inject minimal student stub and hash navigation
    page.evaluate("""() => {
        localStorage.setItem('vv:studentsCrud', JSON.stringify([{id:'test-student', name:'Test Student', email:'test@test.com'}]));
        location.hash = '#practice-studio';
    }""")
    page.wait_for_timeout(1500)
    page.wait_for_load_state("networkidle")
    content = page.content()
    print("After hash #practice-studio, has practice-navigation?", "practice-navigation" in content)
    print("After hash, has practice-skill-grammar?", "practice-skill-grammar" in content)
    print("After hash, has practice-session?", "practice-session" in content)
    page.screenshot(path="C:\\Users\\vviei\\platform0.3\\platform0.3\\verify_nav_after.png", full_page=True)
    print("Second screenshot saved to verify_nav_after.png")

    # Final verdict for expected /practice-navigation/ route (tour target id)
    has_all = all(page.request.get(f"http://localhost:3000/{u}").text().__contains__(n) for _, n, u in TARGETS)
    print(f"\nOverall expected /practice-navigation/: {'PASS' if has_all else 'FAIL'}")

    browser.close()
