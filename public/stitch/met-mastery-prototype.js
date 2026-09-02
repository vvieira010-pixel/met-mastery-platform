(() => {
  const currentScreen = location.pathname.split('/').filter(Boolean).at(-2) || 'landing_page_master_the_met';
  document.documentElement.dataset.mmScreen = currentScreen;
  document.body.classList.add('mm2-body');

  const screenLayout = {
    landing_page_master_the_met: 'marketing',
    login_access_your_workspace: 'access',
    student_dashboard_with_teacher_memo_board: 'progress',
    student_dashboard_with_progress_graphs: 'progress',
    student_progress_timeline: 'progress',
    student_feedback_teacher_s_notes: 'progress',
    student_notifications_center: 'progress',
    practice_studio_redesign: 'workspace',
    assigned_homework: 'workspace',
    student_calendar_view: 'workspace',
    grammar_guide_rules_mastery: 'learning',
    vocabulary_builder_personalized_lexicon: 'learning',
    reading_practice_immersive_study_mode: 'learning',
    listening_lab_immersive_audio_study: 'learning',
    writing_studio_structured_composition: 'learning',
    speaking_mirror_interactive_conversation: 'learning',
  };
  const layout = screenLayout[currentScreen] || 'learning';
  document.documentElement.dataset.mmLayout = layout;
  document.body.classList.add(`mm-layout-${layout}`);

  // The landing export originally omitted the shared product stylesheet.
  if (![...document.styleSheets].some((sheet) => sheet.href?.includes('met-mastery-platform.css'))) {
    const productStyles = document.createElement('link');
    productStyles.rel = 'stylesheet';
    productStyles.href = '../met-mastery-platform.css';
    document.head.append(productStyles);
  }

  const pages = { home: "student_dashboard_with_teacher_memo_board", practice: "practice_studio_redesign", lessons: "grammar_guide_rules_mastery", feedback: "student_feedback_teacher_s_notes", grades: "student_progress_timeline", resources: "vocabulary_builder_personalized_lexicon", reading: "reading_practice_immersive_study_mode", listening: "listening_lab_immersive_audio_study", writing: "writing_studio_structured_composition", speaking: "speaking_mirror_interactive_conversation", calendar: "student_calendar_view", notifications: "student_notifications_center", login: "login_access_your_workspace", landing: "landing_page_master_the_met" };
  const routeUrl = (page) => `../${pages[page]}/code.html`;
  const routes = [[/reading/, pages.reading], [/listening/, pages.listening], [/writing/, pages.writing], [/speaking/, pages.speaking], [/calendar/, pages.calendar], [/notification/, pages.notifications], [/feedback|teacher notes/, pages.feedback], [/grade|progress|timeline/, pages.grades], [/resource|vocab|dictionary/, pages.resources], [/lesson|grammar/, pages.lessons], [/practice|exercise/, pages.practice], [/home|dashboard/, pages.home], [/sign in|get started|log in/, pages.login], [/feature|methodology|pricing|success stor/, pages.landing]];

  document.querySelectorAll("a[href='#']").forEach((anchor) => {
    const label = anchor.textContent.replace(/\s+/g, " ").trim().toLowerCase();
    const route = routes.find(([pattern]) => pattern.test(label));
    if (route) anchor.href = `../${route[1]}/code.html`;
    else {
      anchor.setAttribute("aria-disabled", "true");
      anchor.dataset.prototypeDisabled = "true";
      anchor.title = "Prototype control — available in the live application";
      anchor.addEventListener("click", (event) => event.preventDefault());
    }
  });
  if (location.pathname.includes("landing_page_master_the_met")) {
    document.querySelectorAll("a[href='#signin']").forEach((anchor) => { anchor.href = routeUrl("login"); });
    document.querySelector(".hero .eyebrow")?.remove();
  }

  // The prototype is a visual layer; hand authentication to the real app.
  if (location.pathname.includes("login_access_your_workspace")) {
    document.querySelectorAll("form").forEach((form) => {
      form.dataset.realAuth = "true";
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        window.location.href = "../../?login=1";
      }, { capture: true });
    });
  }

  document.querySelectorAll("img").forEach((image) => {
    if (!image.alt) image.alt = image.dataset.alt || "MET Mastery illustration";
    image.loading = "lazy";
    image.addEventListener("error", () => { image.removeAttribute("src"); image.alt = ""; image.setAttribute("aria-hidden", "true"); image.classList.add("mm-image-fallback"); }, { once: true });
  });
  document.querySelectorAll("input, textarea, select").forEach((field, index) => {
    if (field.labels?.length || field.hasAttribute("aria-label") || field.hasAttribute("aria-labelledby")) return;
    const placeholder = field.getAttribute("placeholder"); const type = field.getAttribute("type");
    field.setAttribute("aria-label", placeholder || (type === "radio" ? `Answer option ${index + 1}` : field.tagName === "TEXTAREA" ? "Written response" : "Search"));
  });

  const main = document.querySelector('main');
  if (main) {
    main.classList.add('mm-page-canvas', `mm-page-canvas--${layout}`);
    main.id ||= 'main-content';
  }
  if (!document.querySelector('.mm-skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.className = 'mm-skip-link';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    document.body.prepend(skipLink);
  }
  if (main && !['marketing', 'access'].includes(layout)) {
    const pageName = document.title.replace(/\s*-\s*MET Mastery.*$/i, '').replace(/^MET Mastery\s*-\s*/i, '').trim() || 'Workspace';
    const context = document.createElement('nav');
    context.className = 'mm-page-context';
    context.setAttribute('aria-label', 'Page context');
    context.innerHTML = `<a href="${routeUrl('home')}">MET Mastery</a><span aria-hidden="true">/</span><span>${pageName}</span><small>${layout === 'learning' ? 'Learn and apply' : layout === 'workspace' ? 'Complete your next task' : 'Review progress and next steps'}</small>`;
    main.prepend(context);
  }

  const iconPaths = {
    home: '<path d="M3 10.5 12 3l9 7.5v9.25a1.25 1.25 0 0 1-1.25 1.25H4.25A1.25 1.25 0 0 1 3 19.75z"/><path d="M9 21v-6h6v6"/>', school: '<path d="m3 10 9-5 9 5-9 5z"/><path d="M6 12.1V17c2.7 2.1 9.3 2.1 12 0v-4.9"/><path d="M21 10v6"/>', notifications: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>', settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20.3h-3v-.08A1.7 1.7 0 0 0 10.66 18.7a1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 15.04a1.7 1.7 0 0 0-1.56-1.04h-.08v-3h.08A1.7 1.7 0 0 0 7 9.96a1.7 1.7 0 0 0-.34-1.88L6.6 8.02 8.72 5.9l.06.06A1.7 1.7 0 0 0 10.66 6.3a1.7 1.7 0 0 0 1.04-1.56v-.08h3v.08a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1.04h.08v3h-.08A1.7 1.7 0 0 0 19.4 15z"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', more_horiz: '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>', arrow_back: '<path d="M19 12H5M11 18l-6-6 6-6"/>', arrow_forward: '<path d="M5 12h14M13 6l6 6-6 6"/>', chevron_left: '<path d="m15 18-6-6 6-6"/>', chevron_right: '<path d="m9 18 6-6-6-6"/>', expand_more: '<path d="m6 9 6 6 6-6"/>', import_contacts: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h8M8 15h5"/>', folder_open: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z"/>', grade: '<path d="m12 3 2.78 5.63L21 9.54l-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.93 1.06-6.2L3 9.54l6.22-.91z"/>', emoji_events: '<path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3M12 12v5M9 21h6M8 18h8"/>', history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 7v5l3 2"/>', schedule: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', trending_up: '<path d="m4 16 6-6 4 4 6-7"/><path d="M15 7h5v5"/>', task_alt: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 9"/>', radio_button_unchecked: '<circle cx="12" cy="12" r="8"/>', check_circle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 9"/>', edit_document: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 16h6M9 12h4"/>', exercise: '<path d="M8 5h8M12 5v14M6 9h12M7 19h10"/>', style: '<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>', logout: '<path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/>'
  };
  Object.assign(iconPaths, {
    add: '<path d="M12 5v14M5 12h14"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>', check: '<path d="m5 12 4 4L19 6"/>', search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>', send: '<path d="m3 11 18-8-6 18-4-7z"/><path d="m11 14 10-11"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    play_arrow: '<path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>', pause: '<path d="M8 5v14M16 5v14"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>', videocam: '<rect x="3" y="7" width="13" height="10" rx="2"/><path d="m16 10 5-3v10l-5-3"/>', volume_up: '<path d="M4 10h4l5-4v12l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    format_bold: '<path d="M7 5h5a3 3 0 0 1 0 6H7zm0 6h6a3 3 0 0 1 0 6H7z"/>', format_italic: '<path d="M10 5h7M7 19h7M14 5 10 19"/>', format_underlined: '<path d="M8 5v6a4 4 0 0 0 8 0V5M6 20h12"/>', format_list_bulleted: '<circle cx="5" cy="7" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="5" cy="17" r="1" fill="currentColor"/><path d="M9 7h10M9 12h10M9 17h10"/>', format_list_numbered: '<path d="M4 6h2v3M4 9h3M4 15h3l-3 3h3M10 7h9M10 12h9M10 17h9"/>', font_download: '<path d="M5 19 9 5h6l4 14M7 14h10"/>', spellcheck: '<path d="m4 17 6-6 4 4 6-7M4 5h8"/>',
    dashboard: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>', calendar_month: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h2M14 14h2M8 17h2"/>', calendar_today: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>', analytics: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', bar_chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', timeline: '<path d="M4 6h5M15 6h5M4 18h5M15 18h5M9 6l6 12"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="18" r="2"/>',
    assignment: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3h6v3H9zM8 10h8M8 14h8M8 18h5"/>', checklist: '<path d="m4 7 2 2 3-3M11 7h9M4 13l2 2 3-3M11 13h9M4 19l2 2 3-3M11 19h9"/>', dictionary: '<path d="M5 4h13v16H5zM8 8h7M8 12h7M8 16h5"/>', library_books: '<path d="M5 4h3v16H5zM10 4h3v16h-3zM15 4h4v16h-4z"/>', menu_book: '<path d="M4 5a3 3 0 0 1 3-3h5v18H7a3 3 0 0 0-3 2zM20 5a3 3 0 0 0-3-3h-5v18h5a3 3 0 0 1 3 2z"/>',
    feedback: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>', forum: '<path d="M4 5h14v10H9l-5 4z"/><path d="M10 9h10v8h-6l-4 3z"/>', help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.1 2.1c-1.1.8-1.6 1.3-1.6 2.4M12 17h.01"/>', help_outline: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.1 2.1c-1.1.8-1.6 1.3-1.6 2.4M12 17h.01"/>', lightbulb: '<path d="M9 18h6M10 21h4M8 14c-1.2-1-2-2.5-2-4.2a6 6 0 1 1 12 0c0 1.7-.8 3.2-2 4.2-.8.7-1 1.4-1 2H9c0-.6-.2-1.3-1-2z"/>', warning: '<path d="M12 3 2.8 20h18.4z"/><path d="M12 9v5M12 17h.01"/>',
    filter_list: '<path d="M4 6h16M7 12h10M10 18h4"/>', sort_by_alpha: '<path d="M4 6h6M7 6v12M4 18h6M14 7h6M14 17h6M16 17l4-10"/>', grid_view: '<rect x="4" y="4" width="5" height="5"/><rect x="15" y="4" width="5" height="5"/><rect x="4" y="15" width="5" height="5"/><rect x="15" y="15" width="5" height="5"/>', download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', edit_note: '<path d="M5 4h10v4H5zM5 12h8M5 16h6M15 14l4 4M15 18l4-4"/>', edit_square: '<path d="M5 4h11l3 3v12H5zM9 15l6-6 2 2-6 6-3 1z"/>',
    account_tree: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v4h12V7M12 11v6"/>', bolt: '<path d="m13 2-9 12h7l-1 8 9-12h-7z"/>', closed_caption: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 11h3M7 15h3M14 11h3M14 15h3"/>', event: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3"/>', flag: '<path d="M5 21V4M5 5h11l-2 4 2 4H5"/>', headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h4v5H5a1 1 0 0 1-1-1zM20 14h-4v5h3a1 1 0 0 0 1-1z"/>', insights: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/><path d="m4 8 6-4 6 6 5-4"/>', local_fire_department: '<path d="M12 22a6 6 0 0 0 6-6c0-4-3-5-4-9-2 1-3 3-3 5-1-2-3-3-3-6-2 2-4 5-4 9a7 7 0 0 0 8 7z"/>', loop: '<path d="M17 4h4v4M21 8a8 8 0 0 0-14.5-2M7 20H3v-4M3 16a8 8 0 0 0 14.5 2"/>', psychology: '<path d="M9 5a3 3 0 0 1 6 0 4 4 0 0 1 3 3.8A4 4 0 0 1 16 16H8a4 4 0 0 1-2-7.2A4 4 0 0 1 9 5z"/><path d="M9 11h6M12 8v6"/>', quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.1 2.1c-1.1.8-1.6 1.3-1.6 2.4M12 17h.01"/>', record_voice_over: '<circle cx="9" cy="9" r="3"/><path d="M4 19c.8-3 3-4 5-4s4.2 1 5 4M17 8a4 4 0 0 1 0 8M19 6a7 7 0 0 1 0 12"/>', replay_10: '<path d="M4 7v5h5M4.5 12a8 8 0 1 0 3-6"/><path d="M11 10h2v5M10 15h4"/>', forward_10: '<path d="M20 7v5h-5M19.5 12a8 8 0 1 1-3-6"/><path d="M11 10h2v5M10 15h4"/>', timer: '<circle cx="12" cy="13" r="7"/><path d="M9 3h6M12 6v2M12 13l3 2"/>', translate: '<path d="M4 5h9M8.5 3v2M6 9c2 1 4 1 6 0M15 7h5M17.5 5v2M14 20l4-10 4 10M15.5 16h5"/>'
  });
  document.querySelectorAll(".material-symbols-outlined").forEach((icon) => {
    const name = icon.textContent.trim() || icon.dataset.icon || "symbol";
    const parent = icon.parentElement;
    if (parent && /^(BUTTON|A)$/.test(parent.tagName) && parent.textContent.trim() === name) parent.setAttribute("aria-label", name.replace(/_/g, " "));
    icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${iconPaths[name] || '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'}</svg>`;
    icon.classList.add("mm-icon"); icon.setAttribute("aria-hidden", "true");
  });

  let previousHeading = 1;
  document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((heading) => { const level = Number(heading.tagName[1]); if (level > previousHeading + 1) { const replacement = document.createElement(`h${previousHeading + 1}`); [...heading.attributes].forEach((attribute) => replacement.setAttribute(attribute.name, attribute.value)); replacement.innerHTML = heading.innerHTML; heading.replaceWith(replacement); previousHeading += 1; } else previousHeading = level; });

  if (!location.pathname.includes("landing_page_master_the_met")) {
    document.documentElement.dataset.mmTheme = localStorage.getItem("met-mastery-theme") || "light";
    const nav = document.createElement("nav"); nav.className = "mm-mobile-nav"; nav.setAttribute("aria-label", "Mobile navigation"); nav.innerHTML = `<a href="${routeUrl("home")}">Home</a><a href="${routeUrl("practice")}">Practice</a><a href="${routeUrl("feedback")}">Feedback</a><a href="${routeUrl("grades")}">Progress</a>`; document.body.append(nav);
    const themeToggle = document.createElement("button"); themeToggle.className = "mm-theme-toggle"; themeToggle.type = "button";
    const updateThemeLabel = () => { const dark = document.documentElement.dataset.mmTheme === "dark"; themeToggle.innerHTML = `<span aria-hidden="true">${dark ? "Light" : "Dark"}</span>`; themeToggle.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`); };
    themeToggle.addEventListener("click", () => { const next = document.documentElement.dataset.mmTheme === "dark" ? "light" : "dark"; document.documentElement.dataset.mmTheme = next; localStorage.setItem("met-mastery-theme", next); updateThemeLabel(); }); updateThemeLabel(); document.body.append(themeToggle);
  }

  const announcer = document.createElement("div"); announcer.className = "mm-action-status"; announcer.setAttribute("role", "status"); announcer.setAttribute("aria-live", "polite"); document.body.append(announcer);
  const announce = (message) => { announcer.textContent = message; announcer.classList.add("is-visible"); window.setTimeout(() => announcer.classList.remove("is-visible"), 4200); };
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const submit = form.querySelector("button[type='submit'], input[type='submit']");
      if (submit) {
        const original = submit.textContent || submit.value || "Continue";
        if ("value" in submit) submit.value = "Saved"; else submit.textContent = "Saved";
        window.setTimeout(() => { if ("value" in submit) submit.value = original; else submit.textContent = original; }, 1200);
      }
      announce("This prototype keeps the form on the page. No information was sent.");
    });
  });
  document.querySelectorAll("button").forEach((button) => {
    const label = button.textContent.replace(/\s+/g, " ").trim(); const route = routes.find(([pattern]) => pattern.test(label.toLowerCase()));
    if (/^start (reading|listening|writing|speaking)/i.test(label) && route) button.addEventListener("click", () => { location.href = `../${route[1]}/code.html`; });
    if (/save draft/i.test(label)) button.addEventListener("click", () => { button.disabled = true; button.textContent = "Saving…"; window.setTimeout(() => { button.textContent = "Saved just now"; button.disabled = false; announce("Draft saved on this device. You can keep editing."); }, 450); });
    if (/submit.*review|submit/i.test(label)) button.addEventListener("click", () => { button.disabled = true; button.textContent = "Submitting…"; window.setTimeout(() => { button.textContent = "Sent for review"; button.disabled = false; announce("Your work is ready for teacher review in this prototype."); }, 550); });
    if (/record/i.test(label)) button.addEventListener("click", () => { button.classList.toggle("is-recording"); const recording = button.classList.contains("is-recording"); button.setAttribute("aria-pressed", String(recording)); announce(recording ? "Recording started. Finish when you are ready." : "Recording paused. Your draft remains available."); });
    if (/^start practice$/i.test(label)) button.addEventListener("click", () => { document.querySelector("main")?.scrollIntoView({ behavior: "smooth" }); announce("Choose a skill below to begin a focused session."); });
  });
})();
