# MET Mastery prototype redesign

## Product thesis

MET Mastery is a teacher-led preparation workspace for adults preparing for the Michigan English Test. The interface should answer one question quickly: **what is the most useful thing to do next?** Scores are evidence, not decoration, and AI feedback remains provisional until teacher review.

## Information architecture

The primary path is `Home → Practice → Homework → Feedback → Progress`. Grammar, vocabulary, calendar, and notifications support that path and remain secondary. Reading, listening, writing, and speaking open as focused study modes with the task context kept visible.

## Spatial system

- Desktop application: 248px navigation rail, 72px command bar, and a bounded 1180–1380px workspace selected by page purpose.
- Learning template: 1380px canvas for grammar, vocabulary, reading, listening, writing, and speaking, with the lesson surface leading and guidance held nearby.
- Workspace template: 1180px focused canvas for practice, homework, and calendar tasks, with one dominant action path.
- Progress template: 1320px evidence canvas for dashboards, feedback, notifications, and progress history, with the next step visually prioritized.
- Dashboard: a 1.45 / 0.55 task-and-context split. Teacher direction and the next action lead; evidence and schedule support.
- Study modes: readable work surface plus a stable 320–330px context rail.
- Mobile: one DOM-ordered column, full-size type, and a four-item bottom navigation.
- Spacing follows an 8px rhythm with 14–18px local gaps and 36–48px section separation.

## Visual language

- Deep teal `#123f46` establishes calm authority in navigation and focused states.
- Action teal `#006877` is reserved for navigation, progress, and primary actions.
- Terracotta `#a95325` marks deadlines, attention, and milestones.
- Cormorant Garamond carries editorial headings; DM Sans carries interface and learning content; Space Mono is limited to dates and evidence.
- Borders establish most grouping. Shadows are reserved for hover, overlays, and the landing-page product preview.

## Interaction and accessibility

- All controls retain visible focus outlines and at least 44px interactive height where the generated screen structure permits.
- Responsive changes preserve source and keyboard order.
- Existing prototype routing, theme control, form labels, disabled-state explanations, image fallbacks, and reduced-motion support remain active.
- The login screen includes the existing form feedback path; study screens keep their answer, recording, and save interactions.
