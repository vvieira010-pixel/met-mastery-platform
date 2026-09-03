import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

export default function StudentOnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour if the student hasn't completed it yet
    const hasSeenTour = localStorage.getItem('met_student_tour_completed');
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  const steps = [
    {
      target: '.dashboard-overview',
      content: 'Welcome to your learning workspace! Here you can track your current scaled score and CEFR readiness band.',
      disableBeacon: true,
    },
    {
      target: '.upcoming-tasks',
      content: 'Your assigned homework, error bank reviews, and scheduled live classes appear here. Keep an eye on those due dates.',
    },
    {
      target: '.recent-feedback',
      content: 'Access recent teacher evaluations quickly. You can mark feedback as understood or ask direct questions right from this panel.',
    },
    {
      target: '.tab-resources',
      content: 'Switch to the Resources tab anytime to download PDF study materials and high-yield vocabulary banks.',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    // Stop the tour and save completion status when finished or skipped
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('met_student_tour_completed', 'true');
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          primaryColor: '#2D7A8C', // Simple blue tone to match the platform aesthetics
          textColor: '#2B454E',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
        },
        buttonNext: {
          borderRadius: '6px',
          fontWeight: 600,
          padding: '8px 16px',
        },
        buttonSkip: {
          color: '#6B7C80',
        },
        tooltip: {
          borderRadius: '8px',
          padding: '20px',
        }
      }}
    />
  );
}
