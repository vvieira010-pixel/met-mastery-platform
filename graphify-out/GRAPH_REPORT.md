# Graph Report - platform0.3  (2026-09-07)

## Corpus Check
- Large corpus: 1232 files · ~1,654,137 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 4071 nodes · 8882 edges · 247 communities (184 shown, 63 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 191 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- workflow.js
- student-home.jsx
- vocab-homework-bank.js
- ref_node_assert_strict
- ref_react
- met-shell.js
- parseSkillMd
- App.jsx
- met-shell.js
- METShell Controller
- supabase-db.js
- devDependencies
- PracticeAssignment
- ClaudeFlowKernel
- prompt-builders.js
- quick-practice.jsx
- homework-create.jsx
- homework-form.jsx
- diagnosis-utils.js
- dependencies
- supabase-storage.js
- practice-studio.jsx
- diagnostic-create.jsx
- Homework
- Comprehensive Audit Report (2026-08-23)
- Diagnosis
- exercise-player.jsx
- Student
- call_api.py
- devDependencies
- calendar.jsx
- Submission
- gen_met_node.mjs
- shared.jsx
- Session
- bootstrap.ts
- submission-review.jsx
- server.ts
- Cohort
- exercise-types.js
- api/save-submission.js
- compilerOptions
- exercise-editor.jsx
- Message
- Feedback
- ClassEvent
- callAI
- Report
- MET (Michigan English Test)
- TargetProfile
- HomeworkId
- unit-bank.js
- compilerOptions
- met-grammar-bank.js
- Michigan English Test (MET)
- SectionHeader
- ProgressNote
- TaskManagementDomain
- risk-dashboard.jsx
- ai.js
- Path
- student-profile.jsx
- MockTest
- met-scoring.test.js
- main.py
- markdown-exercise-bank.js
- HomeworkStatus
- auth-workflow.test.ts
- lifestyle-pack.js
- MockTestEngine.jsx
- settings.jsx
- MET Mastery Platform
- TaskManager
- teacher-dashboard.jsx
- domain-ui.jsx
- create_brand_identity_doc.py
- shared.js
- IMockTestRepository
- MockTestThanks.jsx
- SessionStatus
- StudentHomework
- utils.js
- API Server (Express / Vercel serverless)
- index.ts
- tasks.py
- ExercisePlayer.jsx
- TestSession
- spaced-repetition.js
- IDiagnosisRepository
- plugin.ts
- met-b2-multiple-choice-data.js
- evaluate-speaking.js
- MET Proficiency Mastery
- writing-practice.jsx
- MockTestType
- event-coordination.domain.ts
- ref_dotenv
- submissions.jsx
- error-logger.js
- index.ts
- generate-piper-dual.py
- MockTestStatus
- AggregateRoot
- webmcp-practice-tour.js
- landing-prototype.jsx
- send-invite.js
- updateClassEventStatus
- IClassEventRepository
- student-subjects.jsx
- CalendarPage
- classify-by-topic.mjs
- session.events.ts
- ref_shared_domain_value_object
- homework.jsx
- mock-test-results.jsx
- ShortAnswer.jsx
- ReadingSection.jsx
- StudentResources.jsx
- mock-test.entity.ts
- report-generator.service.ts
- tts-utils.js
- create-student-account.test.js
- scripts
- lifecycle.events.ts
- test-file-search.test.js
- MockTestCompletedEvent
- types.ts
- 50-item MET B2 exercise pack
- playwright_sync_api
- AnswerStorage
- SessionId
- ref_shared_types_plugin
- EventCoordinationDomain
- AlertManager
- index.ts
- BandLevelVO
- ai-model-env.test.js
- analyze_text.py
- layout.tsx
- package.json
- tokens.js
- met-harden.js
- tokens.js
- met-harden.js
- __harness.jsx
- health-monitoring.events.ts
- CommandPalette.jsx
- CohortId
- met-vocab-addon-exercises.js
- StudentsPage
- calc.py
- add-grammar-pack.mjs
- token-lint.mjs
- InMemoryDomainEventBus
- student-speaking.jsx
- student-writing.jsx
- workflow-seeds.js
- tts.js
- Speaking section (5 tasks, ~10 min)
- auth.js
- server.json
- server-card.json
- AcademicProgressChart.jsx
- FillBlank.jsx
- OrderSentences
- exercise-bank.js
- student-vocabulary-foundations.jsx
- MET Proficiency Platform (README)
- MET Mastery (platform)
- create-practice-studio-balance.py
- students.jsx
- SectionShell.jsx
- tweaks-panel.jsx
- student-reading.jsx
- React + Vite + Supabase stack
- Listening
- ReadExercise.jsx
- NotificationId
- .registerDependencies
- toast-provider.jsx
- landing.jsx
- MemStorage
- _supabase-auth-legacy.js
- GitHub Actions → Netlify CI/CD pipeline
- Diagnose → homework → feedback loop
- eslint.config.mjs
- vercel-fastapi-starter
- server-minimal.cjs
- LocalStorageRepository
- ResourcePicker
- learning-loop.js
- Brand section-coding (reading/listening/speaking colors)
- eslint.config.js
- opencode.json
- Frontend audit + cleanup pass (2026-09-02)
- generate-audio.ps1
- vite.config.js
- DialoguePlayer
- LevelUp
- SynonymSwap
- error-bank-profiles.js
- res
- vercel.json
- page.tsx
- vercel.json
- server-raw.ts
- Dialogue.jsx
- ErrorCorrection
- ShortAnswer
- Answer
- SimpleBarChart.jsx
- color-utils.js
- vite-env.d.ts
- express
- @google/genai
- gsap
- .mcp.json
- mime
- postcss.config.mjs
- nanoid
- next-auth
- react-dom
- shadcn
- supabase
- @supabase/server
- @vercel/connect
- @vercel/sandbox
- workflow
- test-output.txt (platform test log, binary/unreadable)
- Exercise Distribution (25 Reading / 25 Listening / 25 Writing / 25 Speaking)
- Suggested Platform Sequence (B2 foundation → B2+ production)
- Stitch by Google (MCP docs)
- SurveyHeart (form builder)

## God Nodes (most connected - your core abstractions)
1. `Icon` - 75 edges
2. `save()` - 56 edges
3. `Button()` - 54 edges
4. `Homework` - 51 edges
5. `load()` - 50 edges
6. `Diagnosis` - 48 edges
7. `dbReady()` - 46 edges
8. `dbUpsert()` - 45 edges
9. `getDbContext()` - 43 edges
10. `getDiagnoses()` - 42 edges
11. `ClassEvent` - 41 edges
12. `MockTest` - 40 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- 3-file cycle: `src/components/ImprovementMatrix.jsx -> src/components/shared.jsx -> src/components/domain-ui.jsx -> src/components/ImprovementMatrix.jsx`

## Communities (247 total, 63 thin omitted)

### Community 0 - "workflow.js"
Cohesion: 0.11
Nodes (90): deleteClassEvent(), deleteProgressNote(), deleteTargetProfile(), deleteVocabularyEntry(), getClassEvidence(), getProgressNotes(), getVocabularyBank(), saveClassEvent() (+82 more)

### Community 1 - "student-home.jsx"
Cohesion: 0.07
Nodes (63): recharts, ref_react_joyride, ref_recharts, ActionOrientedEvidenceCards(), CefrSkillGapFlags(), getCefrBandInfo(), MetProgressPathGraph(), MetProgressTooltip() (+55 more)

### Community 2 - "vocab-homework-bank.js"
Cohesion: 0.05
Nodes (63): met_26_conversations, met_listening_section_76_100, load(), loadTopics(), src_data_exercises_listening_practice_studio_listening, src_data_exercises_reading_reading_23_met_subjects_77, src_data_exercises_reading_reading_23_trees_77, IMAGE_DESCRIPTION_EXERCISES (+55 more)

### Community 3 - "ref_node_assert_strict"
Cohesion: 0.05
Nodes (38): dir, exercises, groups, topics, ref_node_assert_strict, ref_node_fs, ref_node_fs_promises, ref_node_path (+30 more)

### Community 4 - "ref_react"
Cohesion: 0.07
Nodes (30): ref_react, MockTestEngine(), MockTestTeacherDashboard(), src_components_shared_icon, btnMuted, btnTool, parseTopicContent(), renderBold() (+22 more)

### Community 5 - "met-shell.js"
Cohesion: 0.08
Nodes (55): _advanceNext(), _autoPlayAudio(), _bindId(), _boot(), _checkScrollToast(), _checkWritingMinWords(), _deriveSectionId(), _doFinishSection() (+47 more)

### Community 6 - "parseSkillMd"
Cohesion: 0.06
Nodes (40): ref_skills_ai_learning_science_ai_feedback_design_principles_skill_md_raw, ref_skills_curriculum_assessment_criterion_referenced_rubric_generator_skill_md_raw, ref_skills_curriculum_assessment_differentiation_adapter_skill_md_raw, ref_skills_curriculum_assessment_gap_analysis_from_student_work_skill_md_raw, ref_skills_curriculum_assessment_learning_progression_builder_skill_md_raw, ref_skills_eal_language_development_scaffolded_task_modifier_skill_md_raw, ref_skills_explicit_instruction_practice_problem_sequence_designer_skill_md_raw, ref_skills_memory_learning_science_elaborative_interrogation_generator_skill_md_raw (+32 more)

### Community 7 - "App.jsx"
Cohesion: 0.04
Nodes (40): ref_grapesjs_studio_sdk, ref_grapesjs_studio_sdk_dist_style_css, ClassRecord, DiagnosticCreate, DiagnosticsPage, ErrorBankPage, ExercisesPage, HomeworkCreate (+32 more)

### Community 8 - "met-shell.js"
Cohesion: 0.09
Nodes (48): _advanceNext(), _autoPlayAudio(), _bindId(), _boot(), _checkScrollToast(), _deriveSectionId(), _doFinishSection(), _drawWaveform() (+40 more)

### Community 9 - "METShell Controller"
Cohesion: 0.06
Nodes (50): 10 MET Homework Sessions, 10 B2+ Grammar Questions, 50 Collocations, MET B2/B2+ Homework & Vocabulary Bank, 50 Idioms, Workplace Inventory Mgmt Dialogue, 50 Phrasal Verbs, Platform Review Prompt (+42 more)

### Community 10 - "supabase-db.js"
Cohesion: 0.11
Nodes (38): addListeningExercise(), claimStudentByEmail(), getDbContext(), createSignedAudioUrlFromBucket(), dbGet(), deleteTeacherResource(), ENTITIES, getAllStudentSettings() (+30 more)

### Community 11 - "devDependencies"
Cohesion: 0.04
Nodes (45): concurrently, esbuild, eslint-formatter-compact, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, concurrently (+37 more)

### Community 12 - "PracticeAssignment"
Cohesion: 0.08
Nodes (5): PracticeAssignment, PracticeAssignmentProps, LocalPracticeAssignmentRepository, IPracticeAssignmentRepository, PracticeAssignmentId

### Community 13 - "ClaudeFlowKernel"
Cohesion: 0.06
Nodes (11): ref_types_plugin, ClaudeFlowKernel, DomainEvent, KernelConfig, BaseDomain, src_core_kernel_domain_basedomain_registerdependencies, Domain, DomainModuleConfig (+3 more)

### Community 14 - "prompt-builders.js"
Cohesion: 0.11
Nodes (37): FormativeWrapper(), getSkillsForTask(), loadToggleState(), withSkills(), parseAiJson(), AI_EXERCISE_PROMPTS, arr(), buildDiagnosticPrompt() (+29 more)

### Community 15 - "quick-practice.jsx"
Cohesion: 0.06
Nodes (27): ExercisePlayer(), src_data_exercises_grammar_b2_grammar, grammarMCQs, src_data_exercises_listening_b2_listening, src_data_exercises_listening_met_listening_parts_bank, src_data_exercises_listening_met_listening_skills_bank, src_data_exercises_reading_b2_reading, src_data_exercises_reading_b2_reading_50_more (+19 more)

### Community 16 - "homework-create.jsx"
Cohesion: 0.10
Nodes (35): HomeworkSetWizard(), contentHash(), deleteLibraryExercise(), deriveFolder(), deriveTitle(), ensureFolder(), getLibraryExercises(), incrementUsage() (+27 more)

### Community 17 - "homework-form.jsx"
Cohesion: 0.08
Nodes (32): arrowBtnStyle(), ExerciseCard(), PreviewExercise(), src_data_exercises_listening_dialogue_bank, dialogueModules, getDialogueModules(), getHomeworkCognitiveSufficiencyWarning(), EX_TYPES (+24 more)

### Community 18 - "diagnosis-utils.js"
Cohesion: 0.08
Nodes (31): aiText(), buildSnapshot(), friendlyAiError(), generateDiagnosisJson(), hasUsefulDiagnosis(), normalizeDiagnosisJson(), normalizeErrorTargets(), normalizeEvidenceCounts() (+23 more)

### Community 19 - "dependencies"
Cohesion: 0.05
Nodes (39): ai, @ai-sdk/perplexity, @auth/core, class-variance-authority, clsx, cn, dotenv, es-toolkit (+31 more)

### Community 20 - "supabase-storage.js"
Cohesion: 0.11
Nodes (30): App(), handleHash(), handlePKCE(), refreshPending(), restoreSession(), LoginScreen, SupabaseRepository, fetchResults() (+22 more)

### Community 21 - "practice-studio.jsx"
Cohesion: 0.13
Nodes (29): ref_gsap, ref_gsap_react, FadingBanner(), KIND_OPTIONS, MODE_LABELS, MODE_SUBTITLES, PracticeSession(), handleSessionComplete() (+21 more)

### Community 22 - "diagnostic-create.jsx"
Cohesion: 0.09
Nodes (26): ref_clsx, InboxPage, StudentFeedbackView(), Card(), DIAGNOSIS_STEPS, DiagnosisGeneratingProgress(), DiagnosisSavedActions(), DiagnosisStepBar() (+18 more)

### Community 23 - "Homework"
Cohesion: 0.09
Nodes (4): Homework, IHomeworkRepository, LocalHomeworkRepository, HomeworkScheduler

### Community 24 - "Comprehensive Audit Report (2026-08-23)"
Cohesion: 0.10
Nodes (36): api/ai.js (AI proxy), Audit Report 2026-08-10 (Security/Secrets), Impeccable UI Audit 2026-08-17 (10/20), Impeccable UI Audit 2026-08-18 (12/20), Impeccable UI Audit Backup 2026-08-19, Impeccable UI Audit 2026-08-19 (17/20), Comprehensive Audit Report (2026-08-23), Brand Guardian Landing Audit (2026-09-04) (+28 more)

### Community 26 - "exercise-player.jsx"
Cohesion: 0.09
Nodes (25): ref_motion_react, ExTypeBadge(), src_components_exercise_editor_extypebadge, BlankPlayer(), CONFIDENCE_LEVELS, ExercisePlayer(), FlashPlayer(), MET_TASK_LABELS (+17 more)

### Community 27 - "Student"
Cohesion: 0.07
Nodes (3): Student, IStudentRepository, BandLevel

### Community 28 - "call_api.py"
Cohesion: 0.09
Nodes (31): build_url_from_spec(), fetch_openapi_spec(), find_operation(), main(), make_request(), _parse_json_argument(), _print_json(), Fetch and parse an OpenAPI spec. (+23 more)

### Community 29 - "devDependencies"
Cohesion: 0.06
Nodes (32): eslint-config-next, dependencies, next, react, react-dom, devDependencies, eslint, eslint-config-next (+24 more)

### Community 30 - "calendar.jsx"
Cohesion: 0.08
Nodes (23): CalendarPage, CohortsPage, ReportsPage, Avatar(), AVATAR_PALETTES, pickColor(), SIZE_MAP, Pill() (+15 more)

### Community 31 - "Submission"
Cohesion: 0.07
Nodes (4): HomeworkStepThrough(), handleSubmitClick(), Submission, ISubmissionRepository

### Community 32 - "gen_met_node.mjs"
Cohesion: 0.07
Nodes (25): files, fs, path, ref_fs, ref_path, ref_url, key, md (+17 more)

### Community 33 - "shared.jsx"
Cohesion: 0.11
Nodes (15): RUBRIC_CATEGORIES, COLORS, GRADIENTS, LEGACY_NAV_SECTIONS, NEW_NAV_SECTIONS, Bezel(), Breadcrumb(), EmptyState() (+7 more)

### Community 34 - "Session"
Cohesion: 0.10
Nodes (3): Session, LocalSessionRepository, ISessionRepository

### Community 35 - "bootstrap.ts"
Cohesion: 0.08
Nodes (9): c_users_vviei_platform0_3_platform0_3_src_core_domains_mock_test_mock_test_domain, ref_domains_mock_test_mock_test_domain, ref_kernel_claude_flow_kernel, ref_mock_test_mock_test_domain, ref_plugins_swarm_coordination_plugin, bootstrapKernel(), HealthMonitoringDomain, LifecycleManagementDomain (+1 more)

### Community 36 - "submission-review.jsx"
Cohesion: 0.11
Nodes (22): SubmissionReview, fmtTime(), inject(), MessageTeacherDock(), StudentInbox(), getInbox(), markRead(), sendMessage() (+14 more)

### Community 37 - "server.ts"
Cohesion: 0.15
Nodes (22): handler(), handler(), developerGuidance(), error(), handleMessage(), handler(), productInfo(), protocolVersion() (+14 more)

### Community 39 - "exercise-types.js"
Cohesion: 0.13
Nodes (26): applyAiTaskToExercise(), buildCompleteExercises(), buildExercisesFromAiTasks(), createCompleteExercise(), createExerciseFromAiTask(), fillSelectedExercisesWithAi(), isStructuredAiExerciseComplete(), mapAiType() (+18 more)

### Community 40 - "api/save-submission.js"
Cohesion: 0.19
Nodes (23): allowedTeacherEmails(), getServiceKey(), getSupabaseUrl(), isSameOrigin(), requireServiceKey(), handler(), messageFrom(), removeProvisionedUser() (+15 more)

### Community 41 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 42 - "exercise-editor.jsx"
Cohesion: 0.10
Nodes (20): DialogueEditor(), dlId(), ExerciseEditor(), ExerciseTypePicker(), fieldLabel, fieldWrap, hintText, ListenEditor() (+12 more)

### Community 44 - "Feedback"
Cohesion: 0.10
Nodes (3): Feedback, IFeedbackRepository, ReportGenerator

### Community 46 - "callAI"
Cohesion: 0.13
Nodes (20): MockTestEvalPage, generateScript(), generateTalkAudio(), ListeningSection(), PART3_VOICE_MAP, utterancesFromScript(), getPoints(), LISTENING_PART1 (+12 more)

### Community 47 - "Report"
Cohesion: 0.10
Nodes (4): Report, ReportProps, IReportRepository, ReportId

### Community 48 - "MET (Michigan English Test)"
Cohesion: 0.11
Nodes (27): MET Core Competencies Framework (elaboration), prompts.js (diagnostic scoring system), B2 MET Homework Bank, 12 MET Homework Exercise Types, Platform Generation Notes, MET B2 Mini Mock Test (explanation guide), Use of English section, Aura 2 TTS Voices (+19 more)

### Community 50 - "HomeworkId"
Cohesion: 0.16
Nodes (4): SubmissionProps, HomeworkId, HomeworkStatusType, SubmissionId

### Community 51 - "unit-bank.js"
Cohesion: 0.14
Nodes (21): UNITS_1_TO_5, UNITS_6_TO_10, GRAMMAR_DOCTOR_DATA, LEVEL_UP_DATA, VOCABULARY_SWAPPER_DATA, fromDialogue(), fromGrammarDoctor(), fromGrammarItem() (+13 more)

### Community 52 - "compilerOptions"
Cohesion: 0.08
Nodes (25): api, **/core/**, dist, dist-build, node, src, src/core, compilerOptions (+17 more)

### Community 53 - "met-grammar-bank.js"
Cohesion: 0.08
Nodes (24): ADVERBS, ARTICLES, COMMON_MISTAKES, COMPARATIVES, CONDITIONALS, CONNECTORS, DEMONSTRATIVES, GERUNDS_INFINITIVES (+16 more)

### Community 54 - "Michigan English Test (MET)"
Cohesion: 0.12
Nodes (25): Recommended Exercise Data Model, Exercise Bank by Format (38 formats), CEFR Bands A2-C1 (0-80 scaled), MET Mock Test CEFR Grade Scale, History of Coffee (Reading Topic), B2 Student 30-Day Journey Map (Ambitious Alex), Diagnose-Homework-Feedback Learning Loop, MET B1 Explanatory Materials (12 units) (+17 more)

### Community 55 - "SectionHeader"
Cohesion: 0.10
Nodes (19): PerspectiveDesigner, SpeakingEvalPage, TeacherEvaluationPage, SectionHeader(), buildTeacherSelfEvaluationReviewPrompt(), getTaskTypeLabel(), MET_CRITERIA, MOCK_TESTS (+11 more)

### Community 56 - "ProgressNote"
Cohesion: 0.12
Nodes (4): ProgressNote, ProgressNoteProps, IProgressNoteRepository, ProgressNoteId

### Community 57 - "TaskManagementDomain"
Cohesion: 0.14
Nodes (11): HomeworkAssignedEvent(), HomeworkCompletedEvent(), HomeworkCorrectedEvent(), HomeworkReviewedEvent(), HomeworkSubmittedEvent(), PracticeAssignmentCreatedEvent(), PracticeSubmissionSubmittedEvent(), HomeworkScheduler (+3 more)

### Community 58 - "risk-dashboard.jsx"
Cohesion: 0.14
Nodes (21): getErrorBank(), getCohorts(), getStudents(), buildCohortComparison(), buildRiskScore(), getAllSubmissions(), CohortsPage(), load() (+13 more)

### Community 59 - "ai.js"
Cohesion: 0.13
Nodes (22): AI_ATTEMPT_TIMEOUT_MS, AI_REQUEST_TIMEOUT_MS, allowedOrigin(), checkRateLimit(), configuredGeminiModels, env(), fetchT(), GEMINI_DEFAULT_MODELS (+14 more)

### Community 60 - "Path"
Cohesion: 0.12
Nodes (17): Path, pathlib, load(), Merge incoming practice packs (writing/speaking/vocabulary) into current/.…, refresh_plain_index(), save(), Scan bank masters for humanizer patterns. Reports hits, changes nothing., load() (+9 more)

### Community 61 - "student-profile.jsx"
Cohesion: 0.12
Nodes (20): src_components_shared_pillnav, getActiveTargetProfile(), getTargetProfiles(), saveProgressNote(), saveTargetProfile(), setActiveTargetProfile(), TARGET_PROFILE_PRESETS, buildTranscriptTimeline() (+12 more)

### Community 62 - "MockTest"
Cohesion: 0.12
Nodes (3): MockTest, InMemoryMockTestRepository, SupabaseMockTestRepository

### Community 63 - "met-scoring.test.js"
Cohesion: 0.19
Nodes (18): CEFR_BANDS, computeScaledScores(), distanceFromTarget(), getCefrInfo(), getCefrLevelFromPercent(), percentToScaled(), rawToScaled(), ScaledScores (+10 more)

### Community 64 - "main.py"
Cohesion: 0.11
Nodes (16): BaseSettings, datetime, fastapi, get_timestamp(), Return the current UTC timestamp in ISO 8601 format., get, read_item(), read_items() (+8 more)

### Community 65 - "markdown-exercise-bank.js"
Cohesion: 0.24
Nodes (19): ref_banco_de_100_exercícios_b2_prática_original_no_estilo_met_md_raw, answerIndex(), answerLetters(), cleanMarkdown(), convertSection(), firstMatch(), humanTimeToSeconds(), makeBlank() (+11 more)

### Community 67 - "auth-workflow.test.ts"
Cohesion: 0.11
Nodes (12): ref_playwright_test, openStudentDashboard(), openTeacherDashboard(), seedAuthenticatedSession(), storedSession(), STUDENT, TEACHER, TestUser (+4 more)

### Community 68 - "lifestyle-pack.js"
Cohesion: 0.16
Nodes (20): ref_components_exercises_lifestyle_b1_b2_printable_pack_md_raw, src_components_exercises_lifestyle_b1_b2_platform_pack, answerToIndex(), buildListeningOptions(), CONVERTERS, convertGrammar(), convertListening(), convertReading() (+12 more)

### Community 69 - "MockTestEngine.jsx"
Cohesion: 0.18
Nodes (15): MOCK_TEST_2_DATA, TEST_CONFIGS, SpeakingSection(), LISTENING_PART1, LISTENING_PART2, LISTENING_PART3, READING_PART1, READING_PART2 (+7 more)

### Community 70 - "settings.jsx"
Cohesion: 0.12
Nodes (14): setTeacherSetting(), updateUserPassword(), SENSITIVE_LOCAL_KEYS, SettingsPage(), collectPlatformData(), handleClearAll(), handleExportData(), handleSaveSkillToggles() (+6 more)

### Community 71 - "MET Mastery Platform"
Cohesion: 0.16
Nodes (20): CASEL Five-Domain SEL Framework, MET Mastery Design Token System / Palette, Developmental Bands A-F (ages 5-17), Dispositional Knowledge Assessment Designer, Feedback Theory (Hattie & Timperley), Impeccable src/app.jsx Critique (28/40), Impeccable Landing Page Critique (20/32), Impeccable Whole-Platform Critique (src, 24/40) (+12 more)

### Community 72 - "TaskManager"
Cohesion: 0.10
Nodes (9): Manages tasks with file-backed state., Initialize TaskManager with file-backed state. Args: state: State dict…, Add multiple tasks (semicolon or newline separated). Clears existing tasks…, Mark a task as in_progress., Mark a task as completed., List all tasks grouped by status., Get the next pending or in_progress task., TaskManager (+1 more)

### Community 73 - "teacher-dashboard.jsx"
Cohesion: 0.13
Nodes (8): TeacherDashboard, AssignMockTestModal(), IlloNoClasses(), Reveal(), SEEDS_STAGE_ORDER, SEEDS_STAGES, STAGE_CONFIG, URGENCY_ORDER

### Community 74 - "domain-ui.jsx"
Cohesion: 0.15
Nodes (9): STATUS_LABEL, STATUS_TONE, STUDENT_FLOW, WORKFLOW_STAGES, WorkflowStageStrip(), buildImprovementEntries(), ImprovementMatrix(), isPlaceholder() (+1 more)

### Community 75 - "create_brand_identity_doc.py"
Cohesion: 0.21
Nodes (18): add_bullet(), add_color_swatch(), add_heading(), add_table(), add_text(), set_cell_border(), set_cell_margins(), set_cell_width() (+10 more)

### Community 76 - "shared.js"
Cohesion: 0.15
Nodes (10): MET_SECTION_CONFIG, MultipleChoice(), getOptionStyle(), optionBase(), Reading(), getOptionStyle(), MET_SECTION_STYLES, NAVY (+2 more)

### Community 77 - "IMockTestRepository"
Cohesion: 0.16
Nodes (5): V3MockTestAdapter, StartMockTestUseCase, SubmitMockTestUseCase, IMockTestRepository, MockTestScoringService

### Community 78 - "MockTestThanks.jsx"
Cohesion: 0.19
Nodes (13): CEFR_CONFIG, getCefrColor(), getCefrDescription(), getCefrLongLabel(), TIMER_CONFIG, MockTestThanks(), SkillCard(), TEST_META (+5 more)

### Community 80 - "StudentHomework"
Cohesion: 0.18
Nodes (18): buildPrintableHomeworkHtml(), esc(), exerciseHtml(), lines(), printHomework(), StudentHomework(), exerciseDraftKey(), getSelfChecks() (+10 more)

### Community 81 - "utils.js"
Cohesion: 0.18
Nodes (13): getSavedTopics(), getTopicBankKey(), loadBank(), removeSavedTopic(), saveBank(), saveTopicToBank(), canRefreshForLazyImport(), generateId() (+5 more)

### Community 82 - "API Server (Express / Vercel serverless)"
Cohesion: 0.18
Nodes (18): AI Orchestration (/api/ai), Speaking Evaluation (/api/evaluate-speaking), API Server (Express / Vercel serverless), Image Generation (/api/generate-image), MET English Proficiency Platform (system), AI & Speech Providers (LLM + TTS + STT vendors), Resend (Transactional email), Submissions & Invites (/api/save·get·send-invite) (+10 more)

### Community 83 - "index.ts"
Cohesion: 0.18
Nodes (5): c_users_vviei_platform0_3_platform0_3_src_core_domains_session_management_services_session_scheduler_service, c_users_vviei_platform0_3_platform0_3_src_core_domains_session_management_services_session_validator_service, ClassEventProps, ClassEventValidator, ClassEventId

### Community 84 - "tasks.py"
Cohesion: 0.16
Nodes (17): _execute_operation(), format_result(), handle_operation(), _load_state(), main(), _parse_args(), Resolve the task list state file path. Priority: 1. TASK_LIST_STATE_PATH env…, Format result for human-readable output. (+9 more)

### Community 85 - "ExercisePlayer.jsx"
Cohesion: 0.16
Nodes (10): ERROR_TYPES, ErrorDiagnosisGate(), EmbeddedLesson(), ExerciseCard(), TYPE_LABELS, useAIPoweredHints(), loadExercises(), validateExercise() (+2 more)

### Community 86 - "TestSession"
Cohesion: 0.14
Nodes (3): MockTestUseCase, Section, TestSession

### Community 87 - "spaced-repetition.js"
Cohesion: 0.23
Nodes (16): ReviewSession(), enableSync(), getAllEntries(), getDueItems(), initSchedule(), load(), markSRMastered(), maybeSync() (+8 more)

### Community 88 - "IDiagnosisRepository"
Cohesion: 0.17
Nodes (4): DiagnosisProps, IDiagnosisRepository, Alert, DiagnosisId

### Community 89 - "plugin.ts"
Cohesion: 0.13
Nodes (8): HomeworkAssignedEvent, HomeworkReviewedEvent, HomeworkSubmittedEvent, src_core_shared_types_plugin_domainevent, src_core_shared_types_plugin_domaineventbus, DomainPlugin, src_core_shared_types_plugin_eventhandler, PluginModuleConfig

### Community 90 - "met-b2-multiple-choice-data.js"
Cohesion: 0.14
Nodes (13): platform02SkillsPack, getMetB2MultipleChoice(), GRAMMAR, LISTENING, listeningDialogue1, listeningDialogue2, listeningDialogue3, MET_B2_MULTIPLE_CHOICE (+5 more)

### Community 91 - "evaluate-speaking.js"
Cohesion: 0.24
Nodes (15): ALLOWED_AUDIO_BUCKETS, env(), fetchStoredAudio(), fetchWithTimeout(), handler(), normalizeStoragePath(), pauseStats(), SUPABASE_URL (+7 more)

### Community 92 - "MET Proficiency Mastery"
Cohesion: 0.15
Nodes (17): met-proficiency (Vercel project), Vercel (deployment platform), vvieira-met-fluency-mastery (Vercel team), Google authentication / SSO, SurveyHeart (form/test tool), Brazilian Nurse US Credentialing Service, nurseusabrazil (Instagram account), Ana Silva (sample student, B1 to B2) (+9 more)

### Community 93 - "writing-practice.jsx"
Cohesion: 0.12
Nodes (12): WritingPracticePage, boxStyle, EXERCISE_SECTIONS, promptBoxStyle, SCORING_CRITERIA, SELF_CHECK, TABS, TAGS (+4 more)

### Community 95 - "event-coordination.domain.ts"
Cohesion: 0.21
Nodes (4): MessageProps, MessageReadEvent(), MessageSentEvent(), MessageId

### Community 96 - "ref_dotenv"
Cohesion: 0.15
Nodes (11): ref_dotenv, ref_express, ref_prisma_config, app, server, app, server, app (+3 more)

### Community 97 - "submissions.jsx"
Cohesion: 0.18
Nodes (9): ref_react_dom, SubmissionsPage, BASELINE_QUESTIONS, BaselineDiagnosticModal(), FilterChip(), BulkActionModal(), ConfirmModal(), Modal() (+1 more)

### Community 98 - "error-logger.js"
Cohesion: 0.19
Nodes (8): ErrorBoundary, buildEntry(), isIgnorableError(), logError(), logToStorage(), logToSupabase(), refreshContext(), parseJwtClaims()

### Community 99 - "index.ts"
Cohesion: 0.30
Nodes (13): getAuthConfig(), isConfigured(), verifySupabaseSession(), asRole(), AuthContext, AuthRequestLike, AuthUser, buildContext() (+5 more)

### Community 100 - "generate-piper-dual.py"
Cohesion: 0.14
Nodes (6): os, clean_text(), get_segments(), subprocess, tempfile, wave

### Community 101 - "MockTestStatus"
Cohesion: 0.15
Nodes (4): MockTestProps, MockTestStatus, MockTestStatusType, ValueObject

### Community 102 - "AggregateRoot"
Cohesion: 0.16
Nodes (4): AggregateRoot, DomainEvent, DomainEvent, Entity

### Community 103 - "webmcp-practice-tour.js"
Cohesion: 0.18
Nodes (12): createTools(), EMPTY_SCHEMA, getModelContext(), getRegistry(), PRACTICE_TOUR_TARGETS, PRACTICE_TOUR_WORKFLOW, result(), targetVisibility() (+4 more)

### Community 104 - "landing-prototype.jsx"
Cohesion: 0.15
Nodes (10): features, G_LEVELS, GRAMMAR_BANK, grammarBand(), pickGrammar(), SC_LISTENING, SC_READING, SelfCheck() (+2 more)

### Community 105 - "send-invite.js"
Cohesion: 0.29
Nodes (13): buildICS(), env(), escapeAttr(), escapeHtml(), foldLine(), handler(), icsText(), pad() (+5 more)

### Community 106 - "updateClassEventStatus"
Cohesion: 0.18
Nodes (11): LiveClassSchedulingGuardrails(), getClassEvent(), getStudent(), updateClassEventStatus(), ClassRecord(), handleSave(), load(), normalizeEvidenceCounts() (+3 more)

### Community 108 - "student-subjects.jsx"
Cohesion: 0.19
Nodes (6): STUDY_TIPS, GRAMMAR_SUBJECT, LISTENING_SUBJECT, StudentSubjects, SUBJECTS, TOTAL_TOPICS

### Community 109 - "CalendarPage"
Cohesion: 0.20
Nodes (11): getSessionToken(), getZoomUrl(), sendClassInvite(), TEACHER_NAME_KEY, ZOOM_URL_KEY, CalendarPage(), handleDelete(), handleMarkComplete() (+3 more)

### Community 110 - "classify-by-topic.mjs"
Cohesion: 0.24
Nodes (11): classify(), classifyFile(), currentRoot, currentSkills, extract(), has(), incomingRoot, readJson() (+3 more)

### Community 111 - "session.events.ts"
Cohesion: 0.19
Nodes (5): ref_services_session_scheduler_service, ref_services_session_validator_service, SessionCompletedEvent(), SessionCreatedEvent(), SessionStartedEvent()

### Community 112 - "ref_shared_domain_value_object"
Cohesion: 0.22
Nodes (4): ref_shared_domain_aggregate_root, ref_shared_domain_value_object, StudentProps, StudentId

### Community 113 - "homework.jsx"
Cohesion: 0.23
Nodes (12): HomeworkPage, activityLabel(), formatDate(), HomeworkPage(), handleDelete(), KIND_ORDER, LEVEL_ORDER, normalizeKind() (+4 more)

### Community 114 - "mock-test-results.jsx"
Cohesion: 0.19
Nodes (10): MockTestResults, getCefrColor, SPEAKING_TASKS, getMockTestAudioUrl(), LABELS, LISTENING_QS, MockTestResults(), Q_LOOKUP (+2 more)

### Community 115 - "ShortAnswer.jsx"
Cohesion: 0.19
Nodes (11): SpeakPlayer(), DEFAULT_CHECKS, SCORE_DESCRIPTORS, SpeakingRecorder(), beginRecording(), requestAiScore(), startPreparation(), createSignedAudioUrl() (+3 more)

### Community 116 - "ReadingSection.jsx"
Cohesion: 0.24
Nodes (8): STORAGE_KEYS, NavButtons(), OptionButton(), ReadingSection(), WritingSection(), READING_PART1, READING_PART2, READING_PART3

### Community 117 - "StudentResources.jsx"
Cohesion: 0.23
Nodes (9): CURATED_LINK_RESOURCES, CURATED_PDF_MATERIALS, downloadResourceDocument(), StudentResources(), CATEGORIES, RESOURCE_TYPES, RESOURCES, StudentResources (+1 more)

### Community 120 - "tts-utils.js"
Cohesion: 0.33
Nodes (12): audioBufferToWav(), concatenateAudioBlobs(), fetchAudio(), fetchAudioWithGender(), fetchConversationAudio(), fetchPiperAudio(), fetchServerAudio(), getPiperUrl() (+4 more)

### Community 121 - "create-student-account.test.js"
Cohesion: 0.17
Nodes (9): authUser, calls, ENV_KEYS, installFetch(), makeRes(), res, response(), rosterStudent (+1 more)

### Community 122 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, lint, lint:fix, lint:tokens, postinstall, preview (+4 more)

### Community 123 - "lifecycle.events.ts"
Cohesion: 0.20
Nodes (3): ref_kernel_domain, StudentCreatedEvent(), StudentUpdatedEvent()

### Community 124 - "test-file-search.test.js"
Cohesion: 0.33
Nodes (9): HighlightedText(), TestFileSearch(), DEFAULT_TEST_FILES, filterTestFiles(), getTagTheme(), highlightSegments(), componentSource, MOCK_FILES (+1 more)

### Community 125 - "MockTestCompletedEvent"
Cohesion: 0.24
Nodes (3): MockTestCompletedEvent, MockTestStartedEvent, DomainEvent

### Community 126 - "types.ts"
Cohesion: 0.18
Nodes (10): c_users_vviei_platform0_3_platform0_3_domains_mock_tests_types, c_users_vviei_platform0_3_platform0_3_domains_practice_types, c_users_vviei_platform0_3_platform0_3_domains_shared_types, c_users_vviei_platform0_3_platform0_3_domains_student_types, c_users_vviei_platform0_3_platform0_3_domains_teacher_types, ref_domains_mock_tests_types, ref_domains_practice_types, ref_domains_shared_types (+2 more)

### Community 127 - "50-item MET B2 exercise pack"
Cohesion: 0.18
Nodes (11): CEFR B2 alignment (53–63 scale), Council of Europe / CEFR Companion Volume (citation), 50-item MET B2 exercise pack, Grammar extension bank (10 types), Listening section (3 parts, 50 Q), MET official format (155 min, 4 skills), Michigan Language Assessment (citation), Reading section (3 parts, 50 Q) (+3 more)

### Community 128 - "playwright_sync_api"
Cohesion: 0.18
Nodes (4): playwright_sync_api, Authenticated Playwright flow for the MET Proficiency Platform. Works WITHOUT…, Card-alignment test for the MET Proficiency Platform. Real facts (verified in…, Card-alignment test for the MET Proficiency Platform dashboards. Real facts…

### Community 130 - "SessionId"
Cohesion: 0.31
Nodes (3): ref_lib_workflow_core_js, SessionProps, SessionId

### Community 131 - "ref_shared_types_plugin"
Cohesion: 0.20
Nodes (5): ref_session_management_session_management_domain, ref_shared_types_plugin, ref_task_management_task_management_domain, SwarmCoordinationPlugin, SwarmCoordinator

### Community 134 - "index.ts"
Cohesion: 0.29
Nodes (3): TargetProfileProps, TargetProfileType, TargetProfileId

### Community 137 - "analyze_text.py"
Cohesion: 0.27
Nodes (8): argparse, main(), Return an action-item summary for a note., summarize(), analyze(), format_report(), main(), collections

### Community 138 - "layout.tsx"
Cohesion: 0.20
Nodes (7): my_app_app_globals, geistMono, geistSans, metadata, nextConfig, ref_next, ref_next_font_google

### Community 139 - "package.json"
Cohesion: 0.20
Nodes (9): engines, node, npm, name, overrides, qs, private, type (+1 more)

### Community 140 - "tokens.js"
Cohesion: 0.20
Nodes (9): metColor, metFont, metFontHeight, metFontSize, metLayout, metMotion, metRadius, metShell (+1 more)

### Community 141 - "met-harden.js"
Cohesion: 0.27
Nodes (4): focusFirstDescendant(), getFocusable(), trapModal(), keyHandler()

### Community 142 - "tokens.js"
Cohesion: 0.20
Nodes (9): metColor, metFont, metFontHeight, metFontSize, metLayout, metMotion, metRadius, metShell (+1 more)

### Community 143 - "met-harden.js"
Cohesion: 0.27
Nodes (4): focusFirstDescendant(), getFocusable(), trapModal(), keyHandler()

### Community 144 - "__harness.jsx"
Cohesion: 0.24
Nodes (5): ref_react_dom_client, RETIRED_STORAGE_KEYS, StudentSubjects(), src_styles_system, src_styles_tailwind

### Community 145 - "health-monitoring.events.ts"
Cohesion: 0.27
Nodes (4): ref_shared_domain_events_domain_event_bus, DiagnosisCreatedEvent(), FeedbackCreatedEvent(), ReportGeneratedEvent()

### Community 146 - "CommandPalette.jsx"
Cohesion: 0.24
Nodes (5): ref_src_components_shared_jsx, CommandPalette(), HelpPaletteSection(), HelpTrigger(), HELP_CONTENT

### Community 148 - "met-vocab-addon-exercises.js"
Cohesion: 0.27
Nodes (5): addonExercises, base, speakingAddon, vocabAddon, writingAddon

### Community 149 - "StudentsPage"
Cohesion: 0.27
Nodes (8): genPassword(), StudentsPage(), createStudentAccount(), handleCreateAccount(), handleDelete(), handleResetPassword(), handleSave(), openSetup()

### Community 150 - "calc.py"
Cohesion: 0.31
Nodes (8): ast, main(), Evaluate arithmetic expression using AST — no eval()., safe_eval(), try_conversion(), try_percentage(), operator, re

### Community 151 - "add-grammar-pack.mjs"
Cohesion: 0.22
Nodes (6): currentSkills, currentTopics, data, groups, incomingTopics, source

### Community 152 - "token-lint.mjs"
Cohesion: 0.28
Nodes (8): BANNED, EXCLUDE, isExcluded(), main(), ROOT, SCAN_EXT, SRC, walk()

### Community 156 - "workflow-seeds.js"
Cohesion: 0.36
Nodes (8): requestInboxNotificationPermission(), getSeedsStages(), getStudentSeedsStage(), migrateFromObjectToArray(), setStudentSeedsStage(), getTodayPriority(), TeacherDashboard(), timeOfDay()

### Community 157 - "tts.js"
Cohesion: 0.54
Nodes (7): env(), handler(), tryDeepgram(), tryElevenLabs(), tryGemini(), tryOpenAI(), VOICES

### Community 158 - "Speaking section (5 tasks, ~10 min)"
Cohesion: 0.25
Nodes (8): Speaking section (5 tasks, ~10 min), Timer components (ExercisePlayer/ShortAnswer/SpeakingRecorder), Speaking countdown timer coverage (177/178), Build PASS (1322 modules), 178 speaking exercises + countdown, Student onboarding diagnostic, Accessibility features (focus/reduced-motion), Picture Description & Speaking Simulator

### Community 159 - "auth.js"
Cohesion: 0.36
Nodes (6): loadIdentity(), refreshUser(), setButtonState(), setStatus(), userLabel(), ref_https_esm_sh_netlify_identity

### Community 160 - "server.json"
Cohesion: 0.25
Nodes (7): description, name, remotes, $schema, title, version, websiteUrl

### Community 161 - "server-card.json"
Cohesion: 0.25
Nodes (7): description, name, remotes, $schema, title, version, websiteUrl

### Community 162 - "AcademicProgressChart.jsx"
Cohesion: 0.25
Nodes (5): AcademicProgressChart(), DATA, TODO: replace with real per-student weekly data., SERIES, WEEKLY_SCORES

### Community 163 - "FillBlank.jsx"
Cohesion: 0.46
Nodes (7): FillBlank(), handleSubmit(), renderBlankInput(), setValue(), textInputStyle(), isChoiceBlank(), normalize()

### Community 164 - "OrderSentences"
Cohesion: 0.32
Nodes (4): MET_ORDER_CONFIG, OrderSentences(), handleReset(), shuffle()

### Community 165 - "exercise-bank.js"
Cohesion: 0.32
Nodes (5): src_data_exercises_vocabulary_met_vocab_bank, bankMeta, convertExercise(), exId(), getModuleExercises()

### Community 167 - "MET Proficiency Platform (README)"
Cohesion: 0.29
Nodes (7): Architecture diagram screenshots, Archify visual-check page, AI as assistant, not replacement, Product principles (5), Multi-provider AI cascade, Express server (server.ts), MET Proficiency Platform (README)

### Community 168 - "MET Mastery (platform)"
Cohesion: 0.29
Nodes (7): Test harness page (__harness.html), Landing page (index.html), SEO / schema.org JSON-LD metadata, Playwright DOM snapshot (met-mastery), MET Mastery (platform), Single teacher (product owner), Playwright DOM snapshot (Vercel deploy)

### Community 169 - "create-practice-studio-balance.py"
Cohesion: 0.29
Nodes (3): openpyxl, openpyxl_styles, openpyxl_utils

### Community 170 - "students.jsx"
Cohesion: 0.33
Nodes (5): StudentsPage, copyText(), EMPTY_FORM, LEVELS, StudentRow()

### Community 171 - "SectionShell.jsx"
Cohesion: 0.38
Nodes (4): src_components_mock_test_mocktestheader, MockTestTimer(), QuestionNav(), SectionShell()

### Community 174 - "React + Vite + Supabase stack"
Cohesion: 0.33
Nodes (6): P0 security ship-blockers (#1–#4), Service-role key rotation, verifySupabaseSession (JWT validation), GitHub / Netlify secrets, React + Vite + Supabase stack, PWA via vite-plugin-pwa

### Community 176 - "ReadExercise.jsx"
Cohesion: 0.33
Nodes (3): MET_READING_CONFIG, ReadExercise(), handleSubmit()

### Community 180 - "landing.jsx"
Cohesion: 0.33
Nodes (4): faqs, featuresList, navLinks, processSteps

### Community 183 - "_supabase-auth-legacy.js"
Cohesion: 0.40
Nodes (3): verifySupabaseSession_legacy, c_users_vviei_platform0_3_platform0_3_lib_auth_index_ts, ref_lib_auth_index_ts

### Community 184 - "GitHub Actions → Netlify CI/CD pipeline"
Cohesion: 0.40
Nodes (5): Branch protection rules, GitHub Actions → Netlify CI/CD pipeline, Netlify CDN deploy, Observability (Sentry / UptimeRobot), Rollback procedure

### Community 185 - "Diagnose → homework → feedback loop"
Cohesion: 0.50
Nodes (5): Teacher KPI cards (24/3/5/8), Teacher 'Today' dashboard preview, Mock tests (full MET simulations), Spaced repetition error bank, Diagnose → homework → feedback loop

### Community 186 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): eslintConfig, ref_eslint_config, ref_eslint_config_next_core_web_vitals, ref_eslint_config_next_typescript

### Community 187 - "vercel-fastapi-starter"
Cohesion: 0.40
Nodes (5): pkg_fastapi, pkg_jinja2, pkg_pydantic_settings, pkg_uvicorn, vercel-fastapi-starter

### Community 188 - "server-minimal.cjs"
Cohesion: 0.40
Nodes (4): app, server, dotenv_1, express_1

### Community 190 - "ResourcePicker"
Cohesion: 0.60
Nodes (5): ResourcePicker(), handleDelete(), handleUpload(), loadItems(), switchTab()

### Community 191 - "learning-loop.js"
Cohesion: 0.40
Nodes (3): LEARNING_LOOP, STUDENT_NAV_GROUPS, TEACHER_NAV_GROUPS

### Community 192 - "Brand section-coding (reading/listening/speaking colors)"
Cohesion: 0.50
Nodes (4): Chart.js line chart, Brand section-coding (reading/listening/speaking colors), Academic Progress widget, Brand commitments (name/logo/fonts/color)

### Community 193 - "eslint.config.js"
Cohesion: 0.50
Nodes (3): ref_eslint_js, ref_eslint_plugin_react_hooks, ref_eslint_plugin_react_refresh

### Community 194 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, list

### Community 195 - "Frontend audit + cleanup pass (2026-09-02)"
Cohesion: 0.50
Nodes (4): Frontend audit + cleanup pass (2026-09-02), .card-row hidden-bug CSS fix, Audit findings by severity, use-body-scroll-lock hook

### Community 196 - "generate-audio.ps1"
Cohesion: 0.83
Nodes (3): Get-VoiceId(), Get-VoiceName(), Invoke-GenerateAudio()

### Community 198 - "DialoguePlayer"
Cohesion: 0.67
Nodes (3): DialoguePlayer(), playAll(), stopTTS()

### Community 203 - "vercel.json"
Cohesion: 0.50
Nodes (3): headers, rewrites, $schema

### Community 208 - "ErrorCorrection"
Cohesion: 1.00
Nodes (3): ErrorCorrection(), handleSubmit(), normalize()

## Ambiguous Edges - Review These
- `test-results.txt (platform test log, binary/unreadable)` → `test-output.txt (platform test log, binary/unreadable)`  [AMBIGUOUS]
  test-output.txt · relation: conceptually_related_to
- `Manus Webdev Static Template README` → `V3 Swarm Coordination Spec Audit (2026-08-23)`  [AMBIGUOUS]
  V3-SWARM-AUDIT-2026-08-23.md · relation: conceptually_related_to

## Knowledge Gaps
- **624 isolated node(s):** `supabase`, `$schema`, `list`, `source`, `data` (+619 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `test-results.txt (platform test log, binary/unreadable)` and `test-output.txt (platform test log, binary/unreadable)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Manus Webdev Static Template README` and `V3 Swarm Coordination Spec Audit (2026-08-23)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Diagnosis` connect `Diagnosis` to `AlertManager`, `updateClassEventStatus`, `Feedback`, `diagnosis-utils.js`, `report-generator.service.ts`, `IDiagnosisRepository`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Why does `load()` connect `updateClassEventStatus` to `workflow.js`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `handleSave()` connect `updateClassEventStatus` to `workflow.js`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **What connects `supabase`, `$schema`, `list` to the rest of the system?**
  _624 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workflow.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10533910533910534 - nodes in this community are weakly interconnected._