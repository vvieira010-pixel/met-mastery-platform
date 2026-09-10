import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { Icon, Avatar } from "../components/shared.jsx";
import { getDiagnoses, getReviews } from "../lib/workflow.js";
import { hasVisibleApprovedStudentFeedback, asArray } from "./student-helpers.jsx";
import { getStudentSetting, setStudentSetting } from "../lib/supabase-db.js";
import StudentHome from "./student-home.jsx";
import StudentSettings from "./student-settings.jsx";
import MockTestPage from "./mock-test.jsx";
import { StudentInbox, MessageTeacherDock } from "../components/message-center.jsx";
import StudentOnboardingTour from "../components/StudentOnboardingTour.jsx";
import { useWebMcpPracticeTour } from "../lib/webmcp-practice-tour.js";
const StudentHomework = lazy(() => import("./student-homework.jsx"));
const StudentFeedback = lazy(() => import("./student-feedback.jsx"));
const StudentProgress = lazy(() => import("./student-progress.jsx"));
const StudentResources = lazy(() => import("../components/StudentResources.jsx"));
const PracticeStudio = lazy(() => import("./practice-studio.jsx"));
const StudentSubjects = lazy(() => import("./student-subjects.jsx"));
const PRIMARY_TABS = [
  { id: "home", label: "Home", icon: /* @__PURE__ */ jsx(Icon.home, { size: 16 }) },
  { id: "practice-studio", label: "Practice", icon: /* @__PURE__ */ jsx(Icon.spark, { size: 16 }) },
  { id: "subjects", label: "Subjects", icon: /* @__PURE__ */ jsx(Icon.book, { size: 16 }) },
  { id: "homework", label: "Homework", icon: /* @__PURE__ */ jsx(Icon.homework, { size: 16 }) },
  { id: "feedback", label: "Feedback", icon: /* @__PURE__ */ jsx(Icon.inbox, { size: 16 }), dotKey: "feedback" },
  { id: "progress", label: "Progress", icon: /* @__PURE__ */ jsx(Icon.progress, { size: 16 }), dotKey: "progress" },
  { id: "resources", label: "Resources", icon: /* @__PURE__ */ jsx(Icon.book, { size: 16 }) }
];
const MORE_TABS = [
  { id: "mock-test", label: "Mock Tests", icon: /* @__PURE__ */ jsx(Icon.practice, { size: 16 }) },
  { id: "messages", label: "Messages", icon: /* @__PURE__ */ jsx(Icon.feedback, { size: 16 }), dotKey: "messages" },
  { id: "settings", label: "Settings", icon: /* @__PURE__ */ jsx(Icon.settings, { size: 16 }) }
];
const BOTTOM_NAV_TABS = [
  { id: "home", label: "Home", icon: /* @__PURE__ */ jsx(Icon.home, { size: 18 }) },
  { id: "practice-studio", label: "Practice", icon: /* @__PURE__ */ jsx(Icon.spark, { size: 18 }) },
  { id: "subjects", label: "Subjects", icon: /* @__PURE__ */ jsx(Icon.book, { size: 18 }) },
  { id: "homework", label: "Homework", icon: /* @__PURE__ */ jsx(Icon.homework, { size: 18 }) },
  { id: "feedback", label: "Feedback", icon: /* @__PURE__ */ jsx(Icon.inbox, { size: 18 }) },
  { id: "progress", label: "Progress", icon: /* @__PURE__ */ jsx(Icon.progress, { size: 18 }) }
];
export default function StudentDashboard({ student, onSignOut, onSwitchRole, "data-testid": testId }) {
  const [activeTab, setActiveTab] = useState("home");
  const [dots, setDots] = useState({});
  const [moreOpen, setMoreOpen] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [lastVisited, setLastVisited] = useState({});
  useEffect(() => {
    if (!student?.id) return;
    getStudentSetting(student.id, "last_visited").then((data) => {
      if (data && typeof data === "object") setLastVisited(data);
    }).catch(() => {
    });
  }, [student?.id]);
  useEffect(() => {
    if (!student?.id) return;
    (async () => {
      const lv = lastVisited;
      const [diagnoses, reviews] = await Promise.all([getDiagnoses(student.id), getReviews(student.id)]);
      const next = {};
      const approvedDx = (diagnoses || []).filter(hasVisibleApprovedStudentFeedback).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      if (approvedDx.length > 0) {
        const newestAt = new Date(approvedDx[0].createdAt || 0);
        const seenAt = lv.feedback ? new Date(lv.feedback) : /* @__PURE__ */ new Date(0);
        if (newestAt > seenAt) next.feedback = true;
      }
      const newestReview = (reviews || []).sort((a, b) => new Date(b.reviewedAt || b.createdAt || 0) - new Date(a.reviewedAt || a.createdAt || 0))[0];
      if (newestReview) {
        const reviewedAt = new Date(newestReview.reviewedAt || newestReview.createdAt || 0);
        const seenAt = lv.homework ? new Date(lv.homework) : /* @__PURE__ */ new Date(0);
        if (reviewedAt > seenAt) next.homework = true;
      }
      const progressDx = (diagnoses || []).filter((d) => d.status === "approved").filter((d) => asArray(d.content?.section_snapshot).some((s) => Number(s.score_0_80) > 0)).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      if (progressDx.length > 0) {
        const newestAt = new Date(progressDx[0].createdAt || 0);
        const seenAt = lv.progress ? new Date(lv.progress) : /* @__PURE__ */ new Date(0);
        if (newestAt > seenAt) next.progress = true;
      }
      setDots(next);
    })();
  }, [student?.id, lastVisited]);
  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMoreOpen(false);
    const next = { ...lastVisited, [tabId]: (/* @__PURE__ */ new Date()).toISOString() };
    setLastVisited(next);
    setStudentSetting(student.id, "last_visited", next).catch(() => {
    });
  }
  const tab = activeTab;
  const activeTabLabel = [...PRIMARY_TABS, ...MORE_TABS].find((item) => item.id === tab)?.label || "Student dashboard";
  const tourRevision = [...PRIMARY_TABS, ...MORE_TABS].findIndex((item) => item.id === tab) + 1;
  const { highlight: practiceTourHighlight, dismissHighlight: dismissPracticeTourHighlight } = useWebMcpPracticeTour({
    state: {
      revision: tourRevision,
      activeTab: tab,
      practice: { screen: tab === "practice-studio" ? "skill-picker" : "not-visible" }
    }
  });
  if (!student) {
    return /* @__PURE__ */ jsx("div", { className: "student-loading", "data-testid": testId, children: /* @__PURE__ */ jsx("p", { children: "Loading your dashboard\u2026" }) });
  }
  const firstName = student.firstName || student.name?.split(" ")[0] || "there";
  return /* @__PURE__ */ jsxs("div", { className: "dash", children: [
    /* @__PURE__ */ jsx(StudentOnboardingTour, {}),
    practiceTourHighlight && /* @__PURE__ */ jsxs(
      "div",
      {
        role: "status",
        style: {
          position: "fixed",
          /* Was zIndex: 80 — which is BELOW the fixed bottom nav, and that
             nav sits at --z-fixed (1000, tokens.css:207). The bottom of
             this toast, including the Dismiss button, rendered behind the
             tab bar on every mobile width. --z-toast (3000) is the app's
             own top layer. */
          zIndex: "var(--z-toast, 3000)",
          right: 20,
          /* Clear the fixed bottom nav rather than sitting inside it.
             Pre-migration the shell token is absent, so the 70px fallback
             (~nav height + safe area) applies. */
          bottom: "calc(var(--mm-bottomnav-total, 70px) + 16px)",
          maxWidth: 340,
          padding: "14px 16px",
          borderRadius: "var(--radius-md)",
          background: "var(--surface)",
          border: "1px solid var(--accent)",
          boxShadow: "0 12px 30px rgba(11, 31, 58, .18)"
        },
        children: [
          /* @__PURE__ */ jsx("strong", { style: { display: "block", color: "var(--text)", marginBottom: 4 }, children: practiceTourHighlight.label }),
          /* @__PURE__ */ jsx("p", { style: { margin: 0, color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.5 }, children: practiceTourHighlight.visible ? practiceTourHighlight.description : "This target is not visible yet." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: dismissPracticeTourHighlight,
              style: { marginTop: 10, border: 0, background: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer", padding: 0 },
              children: "Dismiss highlight"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("header", { className: "dash-topbar", id: "student-main", tabIndex: -1, children: [
      /* @__PURE__ */ jsxs("button", { type: "button", className: "dash-brand", onClick: () => handleTabChange("home"), "aria-label": "MET Mastery student home", children: [
        /* @__PURE__ */ jsx("span", { className: "dash-brand-mark", "aria-hidden": "true", children: "M" }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("strong", { children: "MET Mastery" }),
          /* @__PURE__ */ jsx("small", { children: "Student space" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("nav", { className: "dash-top-nav", "aria-label": "Student navigation", children: [
        PRIMARY_TABS.map((item) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            id: `tab-${item.id}`,
            className: `dash-nav-btn tab-${item.id}${tab === item.id ? " active" : ""}`,
            "aria-current": tab === item.id ? "page" : void 0,
            "aria-controls": tab === item.id ? `panel-${item.id}` : void 0,
            "data-tour-target": item.id === "practice-studio" ? "practice-navigation" : void 0,
            onClick: () => handleTabChange(item.id),
            children: [
              item.icon,
              item.label,
              item.dotKey && dots[item.dotKey] && /* @__PURE__ */ jsx("span", { className: "dash-nav-dot", "aria-label": `${item.label} has new updates` })
            ]
          },
          item.id
        )),
        /* @__PURE__ */ jsxs("div", { className: "dash-more-menu", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `dash-nav-btn${MORE_TABS.some((item) => item.id === tab) ? " active" : ""}`,
              "aria-haspopup": "menu",
              "aria-expanded": moreOpen,
              onClick: () => setMoreOpen((open) => !open),
              children: "More"
            }
          ),
          moreOpen && /* @__PURE__ */ jsx("div", { className: "dash-more-popover", role: "menu", "aria-label": "More student options", children: MORE_TABS.map((item) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              id: `tab-${item.id}`,
              role: "menuitem",
              className: "dash-more-item",
              "aria-controls": `panel-${item.id}`,
              onClick: () => handleTabChange(item.id),
              children: [
                item.icon,
                /* @__PURE__ */ jsx("span", { children: item.label }),
                item.dotKey && dots[item.dotKey] && /* @__PURE__ */ jsx("span", { className: "dash-nav-dot", "aria-label": `${item.label} has new updates` })
              ]
            },
            item.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "dash-topbar-right", children: [
        onSwitchRole && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "dash-nav-btn",
            "data-testid": "student-switch-role-btn",
            "aria-label": "Switch to Teacher View",
            title: "Switch to Teacher View",
            onClick: onSwitchRole,
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 10px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              background: "var(--surface-sunken, rgba(0, 0, 0, 0.05))"
            },
            children: [
              /* @__PURE__ */ jsx(Icon.teacher, { size: 14 }),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Teacher View" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "dash-topbar-name", children: [
          "Hi, ",
          firstName
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "dash-nav-btn",
            "aria-label": "Sign out",
            title: "Sign out",
            onClick: onSignOut,
            children: /* @__PURE__ */ jsx(Icon.arrowL, { size: 14 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { id: "student-content", className: "dash-body", "aria-label": `${activeTabLabel} content`, children: [
      tab === "home" && /* @__PURE__ */ jsx(StudentHome, { student, onTab: handleTabChange }),
      /* @__PURE__ */ jsxs(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "student-suspense-fallback", children: "Loading\u2026" }), children: [
        tab === "practice-studio" && /* @__PURE__ */ jsx(PracticeStudio, { studentId: student.id, onBack: () => handleTabChange("home") }),
        tab === "subjects" && /* @__PURE__ */ jsx(StudentSubjects, {}),
        tab === "homework" && /* @__PURE__ */ jsx(StudentHomework, { student }),
        tab === "mock-test" && /* @__PURE__ */ jsx(MockTestPage, { student }),
        tab === "feedback" && /* @__PURE__ */ jsx(StudentFeedback, { student, onTab: handleTabChange }),
        tab === "progress" && /* @__PURE__ */ jsx(StudentProgress, { student }),
        tab === "resources" && /* @__PURE__ */ jsx(StudentResources, { student, onNavigate: handleTabChange }),
        tab === "messages" && /* @__PURE__ */ jsx(StudentInbox, { student }),
        tab === "settings" && /* @__PURE__ */ jsx(StudentSettings, { student, onSignOut, onNavigate: handleTabChange })
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "dash-bottom-nav", "aria-label": "Student navigation (mobile)", children: BOTTOM_NAV_TABS.map((item) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: `dash-nav-btn${tab === item.id ? " active" : ""}`,
        "aria-current": tab === item.id ? "page" : void 0,
        "data-tour-target": item.id === "practice-studio" ? "practice-navigation" : void 0,
        onClick: () => handleTabChange(item.id),
        children: [
          item.icon,
          /* @__PURE__ */ jsx("span", { className: "dash-nav-label", children: item.label })
        ]
      },
      item.id
    )) }),
    /* @__PURE__ */ jsx(MessageTeacherDock, { student, onSent: () => handleTabChange("messages") })
  ] });
}
