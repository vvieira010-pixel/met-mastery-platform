"""Card-alignment test for the MET Proficiency Platform.

Real facts (verified in source, not guessed):
- Cards in the homework flow render from ExerciseCard.jsx with class
  `.homework-exercise-card` (selector confirmed in src/components/exercises/ExerciseCard.jsx:38).
- `.card-container` / `.card-item` / `quiz-card` do NOT exist — ignore them.
- Route is `/homework` (route-table.js). auth requires `vv:supabase_session`
  in localStorage (src/lib/supabase-storage.js), seeded below.

Run:  python scripts/with_server.py --server "npm run dev" --port 3000 -- python test_card_alignment.py
"""
from playwright.sync_api import sync_playwright

MOCK_USER = {"id": "mock-user", "email": "teacher@met.edu", "aud": "authenticated"}


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Seed the client-side session (no real Supabase needed).
        page.add_init_script(f"""
            localStorage.setItem('vv:supabase_session', JSON.stringify({{
                access_token: 'mock',
                refresh_token: 'mock',
                expires_at: Math.floor(Date.now() / 000) / 1000 + 3600,
                user: {MOCK_USER!r}
            }}));
        """)
        # Satisfy the client's session-validation call.
        page.route("**/auth/v1/user", lambda r: r.fulfill(
            status=200, content_type="application/json", body="{}"))

        page.goto("http://localhost:3000/homework")
        page.wait_for_load_state("networkidle")

        cards = page.query_selector_all(".homework-exercise-card")
        print("CARD_COUNT:", len(cards))
        if not cards:
            print("RESULT: no cards rendered on /homework (need a homework set with exercises)")
            browser.close()
            return

        heights = [round(c.bounding_box()["height"], 1) for c in cards]
        print("HEIGHTS:", heights)
        spread = max(heights) - min(heights)
        print("SPREAD_PX:", round(spread, 1))
        print("EVEN:", spread < 5)
        browser.close()


if __name__ == "__main__":
    main()
