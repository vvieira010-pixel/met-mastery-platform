"""Authenticated Playwright flow for the MET Proficiency Platform.

Works WITHOUT real Supabase credentials by replicating exactly what the client
reads (src/lib/supabase-storage.js): seed `vv:supabase_session` in localStorage
and intercept the GoTrue session check. Server-side /api/* data endpoints still
fail-closed without SUPABASE_SERVICE_ROLE_KEY in .env.local (proven by unit
tests) — so they are also intercepted here to let the full UI flow run offline.
"""
from playwright.sync_api import sync_playwright
import json

MOCK_USER = {"id": "mock-user-id", "email": "tester@met-platform.dev", "aud": "authenticated"}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # 1. Seed the session BEFORE any app code runs. Real key + shape from
    #    supabase-storage.js; expires_at must be future or the app clears it.
    page.add_init_script(f"""
        window.localStorage.setItem('vv:supabase_session', JSON.stringify({{
            access_token: 'mock-jwt',
            refresh_token: 'mock-refresh',
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: {json.dumps(MOCK_USER)}
        }}));
    """)

    # 2. Satisfy the client's session validation call (GET /auth/v1/user).
    #    `**` also catches the relative URL the app uses when unconfigured.
    page.route("**/auth/v1/user", lambda route: route.fulfill(
        status=200, content_type="application/json", body=json.dumps(MOCK_USER)))
    page.route("**/auth/v1/token*", lambda route: route.fulfill(
        status=200, content_type="application/json",
        body=json.dumps({"access_token": "mock-jwt", "refresh_token": "mock-refresh",
                         "expires_in": 3600, "user": MOCK_USER})))

    # 3. Let the authenticated UI talk to its real API routes (server fails
    #    closed without SUPABASE_SERVICE_ROLE_KEY, so mock them here).
    for ep in ("get-submissions", "save-submission", "send-invite", "evaluate-speaking"):
        page.route(f"**/api/{ep}", lambda route: route.fulfill(
            status=200, content_type="application/json", body="[]"))

    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")

    # 4. Assert the app ACCEPTED the session (did not self-clear it).
    kept = page.evaluate("window.localStorage.getItem('vv:supabase_session')")
    print("SESSION_ACCEPTED:", bool(kept))
    print("TITLE:", page.title())
    page.screenshot(path="authenticated-state.png", full_page=True)
    browser.close()
