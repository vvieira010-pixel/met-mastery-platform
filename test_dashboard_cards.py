"""Card-alignment test for the MET Proficiency Platform dashboards.

Real facts (verified in source this session):
- Real card class is `.card` (src/components/ui/Card.jsx). Dashboards add
  `kpi-card` / `square-card` / `td-card-section`. `.card-container` / `.card-item`
  / `quiz-card` do NOT exist.
- KPI tiles render in teacher-dashboard.jsx inside `.td-kpi-grid` / `.grid-square`
  flex parents, and in risk-dashboard.jsx inside `.kpi-grid` — content-driven
  heights, no equal-height constraint (the "not even" vector).
- Auth: seed `vv:supabase_session` (future expires_at) + intercept /auth/v1/user.
  Dashboards are teacher-scoped, so mock email matches VITE_TEACHER_EMAIL.

Run: python scripts/with_server.py --server "npm run dev" --port 3000 -- python test_dashboard_cards.py
"""
from playwright.sync_api import sync_playwright

MOCK_USER = {"id": "mock-teacher", "email": "teacher@met.edu", "aud": "authenticated"}


def measure(page, selector):
    cards = page.query_selector_all(selector)
    print(f"  {selector}: {len(cards)} cards")
    if len(cards) < 2:
        return
    heights = [round(c.bounding_box()["height"], 1) for c in cards]
    widths = [round(c.bounding_box()["width"], 1) for c in cards]
    spread_h = round(max(heights) - min(heights), 1)
    spread_w = round(max(widths) - min(widths), 1)
    print(f"    heights={heights}  spread={spread_h}px")
    print(f"    widths ={widths}  spread={spread_w}px")
    print(f"    EVEN_HEIGHTS: {spread_h < 5}")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.add_init_script(f"""
        localStorage.setItem('vv:supabase_session', JSON.stringify({{
            access_token: 'mock', refresh_token: 'mock',
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: {MOCK_USER!r}
        }}));
    """)
    page.route("**/auth/v1/user", lambda r: r.fulfill(status=200, content_type="application/json", body="{}"))
    # Dashboards also fetch student/submission data; mock so they render without Supabase.
    page.route("**/api/get-submissions", lambda r: r.fulfill(status=200, content_type="application/json", body="[]"))
    page.route("**/api/save-submission", lambda r: r.fulfill(status=200, content_type="application/json", body="{}"))

    for route in ("/teacher", "/risk"):
        print(f"ROUTE {route}:")
        page.goto(f"http://localhost:3000{route}")
        page.wait_for_load_state("networkidle")
        measure(page, ".card")
    browser.close()
