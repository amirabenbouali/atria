import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Download, LogIn, Plus, X } from 'lucide-react';
import { routes } from '../../app/routes';
import { useSettingsStore } from '../../features/settings/store/settings.store';
import Button from '../../shared/components/Button/Button';
import styles from './LandingPage.module.css';

type ModalView = 'workspace' | 'onboarding' | 'success';

const defaultViewRoutes = {
  calendar: routes.calendar,
  today: routes.today,
  insights: routes.insights,
} as const;

const onboardingSteps = [
  {
    title: 'What are you planning most?',
    description: 'This helps Atria shape your starting workspace.',
    multi: false,
    options: [
      ['Personal', 'Life, routines and appointments'],
      ['University', 'Courses, deadlines and study blocks'],
      ['Work', 'Projects, meetings and focus time'],
      ['Everything', 'One space for your whole week'],
    ],
  },
  {
    title: 'What belongs in your orbit?',
    description: 'Choose as many as you need.',
    multi: true,
    options: [
      ['Calendar', 'Events and time blocks'],
      ['Projects', 'Milestones and ongoing work'],
      ['Habits', 'Small routines worth repeating'],
      ['Goals', 'Longer-term direction'],
    ],
  },
  {
    title: 'Choose your atmosphere.',
    description: 'You can change this later in Settings.',
    multi: false,
    options: [
      ['Midnight', 'Deep black glass and quiet contrast'],
      ['Rose', 'Soft blush light and warm focus'],
      ['Aurora', 'Violet glow with a little more motion'],
      ['Eclipse', 'Warm noir with low visual pressure'],
    ],
  },
] as const;

const atmosphereByChoice = {
  Midnight: 'midnight',
  Rose: 'dawn',
  Aurora: 'twilight',
  Eclipse: 'midnight',
} as const;

const defaultViewByPlanningChoice = {
  Personal: 'today',
  University: 'calendar',
  Work: 'calendar',
  Everything: 'calendar',
} as const;

function BrandMark() {
  return (
    <span className={styles.logo} aria-hidden="true">
      <span />
    </span>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const preferences = useSettingsStore((state) => state.preferences);
  const updatePreferences = useSettingsStore((state) => state.updatePreferences);
  const signInLocalWorkspace = useSettingsStore((state) => state.signInLocalWorkspace);
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);
  const defaultView = preferences.planningDefaults.defaultView;
  const [modalView, setModalView] = useState<ModalView>('workspace');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [workspaceName, setWorkspaceName] = useState(preferences.profile.displayName === 'Atria user' ? '' : preferences.profile.displayName);
  const [workspaceFocus, setWorkspaceFocus] = useState(preferences.profile.roleOrFocus ?? '');
  const [selectedChoices, setSelectedChoices] = useState<Record<number, string[]>>({
    0: ['Everything'],
    1: ['Calendar'],
    2: ['Rose'],
  });

  const enterWorkspace = () => {
    signInLocalWorkspace();
    navigate(defaultViewRoutes[defaultView] ?? routes.calendar);
  };

  const openImportSettings = () => {
    signInLocalWorkspace();
    navigate(routes.settings);
  };

  const openWorkspaceModal = () => {
    setModalView('workspace');
    setStepIndex(0);
    setIsModalOpen(true);
  };

  const openOnboardingModal = () => {
    setModalView('onboarding');
    setStepIndex(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const toggleChoice = (choice: string) => {
    const step = onboardingSteps[stepIndex];

    setSelectedChoices((state) => {
      const currentChoices = state[stepIndex] ?? [];
      const nextChoices = step.multi
        ? currentChoices.includes(choice)
          ? currentChoices.filter((item) => item !== choice)
          : [...currentChoices, choice]
        : [choice];

      return {
        ...state,
        [stepIndex]: nextChoices,
      };
    });
  };

  const createLocalWorkspace = () => {
    const planningChoice = selectedChoices[0]?.[0] ?? 'Everything';
    const atmosphereChoice = selectedChoices[2]?.[0] ?? 'Rose';
    const displayName = workspaceName.trim() || 'Atria user';
    const roleOrFocus = workspaceFocus.trim() || `${planningChoice} planning`;

    updatePreferences({
      profile: {
        ...preferences.profile,
        displayName,
        roleOrFocus,
      },
      appearance: {
        ...preferences.appearance,
        atmosphere: atmosphereByChoice[atmosphereChoice as keyof typeof atmosphereByChoice] ?? preferences.appearance.atmosphere,
      },
      planningDefaults: {
        ...preferences.planningDefaults,
        defaultView: defaultViewByPlanningChoice[planningChoice as keyof typeof defaultViewByPlanningChoice] ?? 'calendar',
      },
    });
    completeOnboarding();
    setModalView('success');
  };

  const handleNextStep = () => {
    if (stepIndex < onboardingSteps.length - 1) {
      setStepIndex((index) => index + 1);
      return;
    }

    createLocalWorkspace();
  };

  const activeStep = onboardingSteps[stepIndex];

  return (
    <div className={styles.landingPage}>
      <div className={styles.stars} />
      <nav className={styles.nav} aria-label="Landing navigation">
        <button className={styles.brand} type="button" onClick={enterWorkspace}>
          <BrandMark />
          <span>Atria</span>
        </button>
        <div className={styles.actions}>
          <button className={styles.ghostButton} type="button" onClick={openWorkspaceModal}>
            Open workspace
          </button>
          <button className={styles.primaryButton} type="button" onClick={openOnboardingModal}>
            Get started
          </button>
        </div>
      </nav>

      <main>
        <section className={`${styles.section} ${styles.heroSection}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Quiet software for focused lives</p>
            <h1>
              Your life,
              <span>in perfect orbit.</span>
            </h1>
            <p>A calmer way to plan projects, routines and time, without turning your life into another noisy dashboard.</p>
            <div className={styles.heroActions}>
              <button className={styles.primaryButton} type="button" onClick={openOnboardingModal}>
                Create your orbit
              </button>
              <button className={styles.textButton} type="button" onClick={openWorkspaceModal}>
                Already using Atria? Open local workspace <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
            <div className={styles.metaLine}>
              <span>Designed for deep work</span>
              <span>Built around your week</span>
              <span>No clutter</span>
            </div>
          </div>

          <div className={styles.visual} aria-label="Atria orbit preview">
            <div className={styles.orbitSystem}>
              <div className={`${styles.orbit} ${styles.orbitOne}`}><span /></div>
              <div className={`${styles.orbit} ${styles.orbitTwo}`}><span /></div>
              <div className={`${styles.orbit} ${styles.orbitThree}`}><span /></div>
              <div className={styles.previewCard}>
                <div className={styles.previewTop}>
                  <small>Today · Tuesday</small>
                  <span />
                </div>
                <h2>Your orbit</h2>
                <p>Two focused blocks. A quiet afternoon.</p>
                <div className={styles.previewRow}>
                  <span>09:00</span>
                  <article>
                    <strong>Product planning</strong>
                    <em>09:00-10:00 · Foundry</em>
                  </article>
                </div>
                <div className={styles.previewRow}>
                  <span>11:00</span>
                  <article className={styles.blueEvent}>
                    <strong>Deep work</strong>
                    <em>11:00-12:30 · Portfolio</em>
                  </article>
                </div>
                <div className={styles.previewRow}>
                  <span>14:00</span>
                  <article className={styles.openEvent}>
                    <strong>Open schedule</strong>
                    <em>Time is clear</em>
                  </article>
                </div>
              </div>
              <div className={`${styles.floatBadge} ${styles.floatA}`}>82% weekly focus</div>
              <div className={`${styles.floatBadge} ${styles.floatB}`}>Next: design review · 16:00</div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.featureSection}`}>
          <div>
            <p className={styles.eyebrow}>One system</p>
            <h2>Time.<br />Not noise.</h2>
            <p>Atria brings your calendar, projects, habits and goals into one quiet workspace, with just enough structure to keep you moving.</p>
          </div>
          <div className={styles.features}>
            <article>
              <small>Calendar</small>
              <h3>See the shape of your week</h3>
              <p>Plan around energy, focus and real time, not an endless list of boxes to tick.</p>
            </article>
            <article>
              <small>Projects</small>
              <h3>Keep important work in view</h3>
              <p>Connect events, tasks and milestones without losing the wider picture.</p>
            </article>
            <article>
              <small>Insights</small>
              <h3>Notice your patterns</h3>
              <p>Understand where your time goes and which routines actually support you.</p>
            </article>
          </div>
        </section>

        <section className={`${styles.section} ${styles.quoteSection}`}>
          <p className={styles.eyebrow}>A different kind of productivity</p>
          <h2>Built for people who like quiet software.</h2>
          <p>Less pressure. Less visual noise. A clear place to decide what matters and give it time.</p>
          <button className={styles.primaryButton} type="button" onClick={openOnboardingModal}>
            Enter Atria
          </button>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© 2026 Atria</span>
        <span>Privacy · Terms · Status</span>
      </footer>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            className={styles.modalBackdrop}
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={closeModal}
          >
            <motion.div
              className={styles.workspacePanel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="landing-workspace-title"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              {modalView !== 'success' ? (
                <div className={styles.workspaceHeader}>
                  <div>
                    <h2 id="landing-workspace-title">
                      {modalView === 'onboarding'
                        ? 'Create your orbit.'
                        : 'Open or create an Atria workspace.'}
                    </h2>
                    <p>
                      {modalView === 'onboarding'
                        ? 'Start with a calm space built around your week.'
                        : 'This MVP uses a local workspace on this browser. Signing out hides it, but does not delete your data.'}
                    </p>
                  </div>
                  <Button variant="icon" onClick={closeModal} aria-label="Close front-page modal">
                    <X size={17} aria-hidden="true" />
                  </Button>
                </div>
              ) : null}

              {modalView === 'workspace' ? (
                <div className={styles.localAccountPanel}>
                  <article>
                    <LogIn size={18} aria-hidden="true" />
                    <div>
                      <strong>Open local workspace</strong>
                      <span>Use the Atria data already stored on this device.</span>
                    </div>
                    <button className={styles.cardAction} type="button" onClick={enterWorkspace}>
                      Open
                    </button>
                  </article>
                  <article>
                    <Plus size={18} aria-hidden="true" />
                    <div>
                      <strong>Create workspace</strong>
                      <span>Set up a calm planning space with your name, focus, and atmosphere.</span>
                    </div>
                    <button className={styles.cardAction} type="button" onClick={openOnboardingModal}>
                      Create
                    </button>
                  </article>
                  <article>
                    <Download size={18} aria-hidden="true" />
                    <div>
                      <strong>Restore from backup</strong>
                      <span>Open Settings to import an Atria JSON file into this browser.</span>
                    </div>
                    <button className={styles.cardAction} type="button" onClick={openImportSettings}>
                      Import
                    </button>
                  </article>
                  <p className={styles.localAccountNote}>
                    No cloud account yet. For privacy, use export/import when moving between devices.
                  </p>
                </div>
              ) : null}

              {modalView === 'onboarding' ? (
                <div className={styles.onboarding}>
                  <div className={styles.progressDots} aria-label={`Step ${stepIndex + 1} of ${onboardingSteps.length}`}>
                    {onboardingSteps.map((step) => (
                      <span className={onboardingSteps.indexOf(step) <= stepIndex ? styles.activeProgress : ''} key={step.title} />
                    ))}
                  </div>
                  <section className={styles.stepPanel}>
                    <h3>{activeStep.title}</h3>
                    <p>{activeStep.description}</p>
                    {stepIndex === 0 ? (
                      <div className={styles.workspaceFields}>
                        <label>
                          Workspace name
                          <input
                            value={workspaceName}
                            maxLength={36}
                            onChange={(event) => setWorkspaceName(event.target.value)}
                            placeholder="Your name"
                          />
                        </label>
                        <label>
                          Current focus
                          <input
                            value={workspaceFocus}
                            maxLength={72}
                            onChange={(event) => setWorkspaceFocus(event.target.value)}
                            placeholder="Portfolio, study, health, work..."
                          />
                        </label>
                      </div>
                    ) : null}
                    <div className={styles.choices}>
                      {activeStep.options.map(([label, description]) => {
                        const selected = selectedChoices[stepIndex]?.includes(label) ?? false;

                        return (
                          <button
                            className={selected ? styles.selectedChoice : ''}
                            key={label}
                            type="button"
                            onClick={() => toggleChoice(label)}
                          >
                            {stepIndex === 2 ? <span className={`${styles.themeDot} ${styles[label.toLowerCase()]}`} aria-hidden="true" /> : null}
                            <strong>{label}</strong>
                            {description ? <span>{description}</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                  <div className={styles.stepActions}>
                    <button className={styles.ghostButton} disabled={stepIndex === 0} type="button" onClick={() => setStepIndex((index) => Math.max(0, index - 1))}>
                      Back
                    </button>
                    <button className={styles.primaryButton} type="button" onClick={handleNextStep}>
                      {stepIndex === onboardingSteps.length - 1 ? 'Create workspace' : 'Continue'}
                    </button>
                  </div>
                </div>
              ) : null}

              {modalView === 'success' ? (
                <div className={styles.successPanel}>
                  <div className={styles.successOrbit} aria-hidden="true" />
                  <h2 id="landing-workspace-title">Your orbit is ready.</h2>
                  <p>Atria has created a local workspace around the way you want to plan. You can tune it anytime in Settings.</p>
                  <button className={styles.primaryButton} type="button" onClick={enterWorkspace}>
                    Enter workspace
                  </button>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
