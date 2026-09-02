export function buildRiskScore(studentId, allData) {
  const { diagnoses, homework, submissions, errorBanks, srDues, students } = allData;
  const factors = [];
  const student = (students || []).find(s => s.id === studentId);

  // 1. Days since last diagnosis
  const studentDx = (diagnoses || []).filter(d => d.studentId === studentId && d.status === 'approved')
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const latestDx = studentDx[0];
  const daysSinceDx = latestDx
    ? Math.round((Date.now() - new Date(latestDx.createdAt).getTime()) / 86400000)
    : null;

  // 2. Homework completion rate
  const studentHw = (homework || []).filter(h => h.studentId === studentId);
  const totalHw = studentHw.length;
  const doneHw = studentHw.filter(h => ['submitted', 'reviewed', 'completed', 'corrected'].includes(h.status)).length;
  const hwCompletionRate = totalHw > 0 ? Math.round((doneHw / totalHw) * 100) : null;

  // 3. Late homework count
  const lateHw = studentHw.filter(h => {
    if (['submitted', 'reviewed', 'completed', 'corrected'].includes(h.status)) return false;
    if (!h.dueDate) return false;
    return new Date(h.dueDate) < new Date();
  }).length;

  // 4. Pending submissions (submitted but not reviewed)
  const pendingSubs = (submissions || []).filter(s => s.studentId === studentId && s.status === 'submitted').length;

  // 5. Error bank — active errors
  const errors = (errorBanks || {})[studentId] || [];
  const activeErrors = errors.filter(e => e.status !== 'solved').length;
  const solvedErrors = errors.filter(e => e.status === 'solved').length;
  const totalErrors = errors.length;

  // 6. SR due count
  const dueCount = (srDues || {})[studentId] || 0;

  // 7. No diagnosis ever
  const hasNoDiagnosis = studentDx.length === 0;

  let score = 100;

  if (hasNoDiagnosis) {
    factors.push({ label: 'No diagnosis recorded', weight: -20 });
    score -= 20;
  } else if (daysSinceDx != null) {
    if (daysSinceDx > 60) { factors.push({ label: `No diagnosis in ${daysSinceDx} days`, weight: -15 }); score -= 15; }
    else if (daysSinceDx > 30) { factors.push({ label: `${daysSinceDx} days since last diagnosis`, weight: -8 }); score -= 8; }
  }

  if (hwCompletionRate != null) {
    if (hwCompletionRate < 30) { factors.push({ label: `Homework completion ${hwCompletionRate}%`, weight: -20 }); score -= 20; }
    else if (hwCompletionRate < 60) { factors.push({ label: `Homework completion ${hwCompletionRate}%`, weight: -10 }); score -= 10; }
    else if (hwCompletionRate >= 80) { factors.push({ label: `Homework completion ${hwCompletionRate}%`, weight: 5 }); score += 5; }
  }

  if (lateHw > 0) {
    const penalty = Math.min(lateHw * 5, 20);
    factors.push({ label: `${lateHw} overdue homework`, weight: -penalty });
    score -= penalty;
  }

  if (pendingSubs > 0) {
    const penalty = Math.min(pendingSubs * 3, 10);
    factors.push({ label: `${pendingSubs} submissions pending review`, weight: -penalty });
    score -= penalty;
  }

  if (activeErrors > 5) { factors.push({ label: `${activeErrors} active errors`, weight: -10 }); score -= 10; }
  else if (activeErrors > 2) { factors.push({ label: `${activeErrors} active errors`, weight: -5 }); score -= 5; }

  if (dueCount > 10) { factors.push({ label: `${dueCount} review items due`, weight: -10 }); score -= 10; }
  else if (dueCount > 3) { factors.push({ label: `${dueCount} review items due`, weight: -5 }); score -= 5; }

  if (totalErrors > 0 && solvedErrors / totalErrors > 0.5) {
    factors.push({ label: 'Good error resolution rate', weight: 10 });
    score += 10;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    level: score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high',
    factors,
    meta: { daysSinceDx, hwCompletionRate, lateHw, pendingSubs, activeErrors, solvedErrors, totalErrors, dueCount, hasNoDiagnosis },
  };
}

export function buildTranscriptTimeline(studentId, allData) {
  const { diagnoses, homework, submissions, reviews, errorBanks } = allData;
  const events = [];

  (diagnoses || []).filter(d => d.studentId === studentId).forEach(d => {
    events.push({
      date: d.createdAt,
      type: 'diagnosis',
      label: d.isBaseline ? 'Baseline diagnosis' : 'Diagnosis',
      status: d.status,
      detail: `${d.content?.overall_result || ''} ${d.strengths?.length || 0} strengths, ${d.weaknesses?.length || 0} weaknesses`,
      id: d.id,
      data: d,
    });
  });

  (homework || []).filter(h => h.studentId === studentId).forEach(h => {
    events.push({
      date: h.assignedAt || h.createdAt,
      type: 'homework',
      label: h.title || 'Homework',
      status: h.status,
      detail: `${h.activities?.length || 0} activities`,
      id: h.id,
      data: h,
    });
  });

  (submissions || []).filter(s => s.studentId === studentId).forEach(s => {
    events.push({
      date: s.submittedAt,
      type: 'submission',
      label: 'Submission',
      status: s.status,
      detail: '',
      id: s.id,
      data: s,
    });
  });

  (reviews || []).filter(r => r.studentId === studentId).forEach(r => {
    events.push({
      date: r.reviewedAt || r.createdAt,
      type: 'review',
      label: 'Review',
      status: 'completed',
      detail: `Score: ${r.score != null ? r.score : 'N/A'} — ${r.overallNote ? r.overallNote.slice(0, 80) : ''}`,
      id: r.id,
      data: r,
    });
  });

  const errs = (errorBanks || {})[studentId] || [];
  errs.filter(e => e.status === 'solved').forEach(e => {
    events.push({
      date: e.lastPracticed || e.createdAt,
      type: 'error-solved',
      label: 'Error solved',
      status: 'solved',
      detail: e.error,
      id: e.id,
      data: e,
    });
  });

  events.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  return events;
}

export function getCohortPercentile(studentId, cohortStudentIds, metricFn) {
  const scores = cohortStudentIds.map(id => ({ id, score: metricFn(id) }));
  const validScores = scores.filter(s => s.score != null).sort((a, b) => b.score - a.score);
  if (validScores.length === 0) return null;
  const idx = validScores.findIndex(s => s.id === studentId);
  if (idx < 0) return null;
  return Math.round((1 - idx / validScores.length) * 100);
}

export function buildCohortComparison(cohortName, cohortStudentIds, allData) {
  const students = (allData.students || []).filter(s => cohortStudentIds.includes(s.id));
  const riskScores = students.map(s => {
    const risk = buildRiskScore(s.id, allData);
    return { studentId: s.id, name: s.name, ...risk };
  });

  const avgScore = riskScores.length > 0
    ? Math.round(riskScores.reduce((sum, r) => sum + r.score, 0) / riskScores.length)
    : null;

  const distribution = { low: 0, medium: 0, high: 0 };
  riskScores.forEach(r => { distribution[r.level]++; });

  const hwCompletionRates = students.map(s => {
    const hw = (allData.homework || []).filter(h => h.studentId === s.id);
    const total = hw.length;
    const done = hw.filter(h => ['submitted', 'reviewed', 'completed', 'corrected'].includes(h.status)).length;
    return total > 0 ? Math.round((done / total) * 100) : null;
  }).filter(r => r != null);

  const avgHwRate = hwCompletionRates.length > 0
    ? Math.round(hwCompletionRates.reduce((a, b) => a + b, 0) / hwCompletionRates.length)
    : null;

  return {
    cohortName,
    studentCount: students.length,
    avgRiskScore: avgScore,
    riskDistribution: distribution,
    avgHomeworkRate: avgHwRate,
    students: riskScores.sort((a, b) => a.score - b.score),
  };
}
