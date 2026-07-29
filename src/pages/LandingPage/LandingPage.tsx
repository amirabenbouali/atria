import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { routes } from '../../app/routes';
import { useSettingsStore } from '../../features/settings/store/settings.store';
import Button from '../../shared/components/Button/Button';
import styles from './LandingPage.module.css';

type AuthMode = 'login' | 'register';
type ModalView = 'auth' | 'onboarding' | 'success';

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
      ['Midnight', ''],
      ['Rose', ''],
      ['Aurora', ''],
      ['Eclipse', ''],
    ],
  },
] as const;

function BrandMark() {
  return (
    <span className={styles.logo} aria-hidden="true">
      <span />
    </span>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const defaultView = useSettingsStore((state) => state.preferences.defaultView);
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [modalView, setModalView] = useState<ModalView>('auth');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<Record<number, string[]>>({
    0: ['Everything'],
    1: ['Calendar'],
    2: ['Midnight'],
  });

  const enterWorkspace = () => {
    navigate(defaultViewRoutes[defaultView] ?? routes.calendar);
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setModalView('auth');
    setStepIndex(0);
    setIsModalOpen(true);
  };

  const closeAuth = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAuth();
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

  const handleNextStep = () => {
    if (stepIndex < onboardingSteps.length - 1) {
      setStepIndex((index) => index + 1);
      return;
    }

    setModalView('success');
  };

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (authMode === 'register') {
      setModalView('onboarding');
      return;
    }

    setModalView('success');
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
          <button className={styles.ghostButton} type="button" onClick={() => openAuth('login')}>
            Sign in
          </button>
          <button className={styles.primaryButton} type="button" onClick={() => openAuth('register')}>
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
              <button className={styles.primaryButton} type="button" onClick={() => openAuth('register')}>
                Create your orbit
              </button>
              <button className={styles.textButton} type="button" onClick={() => openAuth('login')}>
                Already have an account? Sign in <ArrowRight size={17} aria-hidden="true" />
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
          <button className={styles.primaryButton} type="button" onClick={() => openAuth('register')}>
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
            onMouseDown={closeAuth}
          >
            <motion.div
              className={styles.authPanel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="landing-auth-title"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              {modalView !== 'success' ? (
                <div className={styles.authHeader}>
                  <div>
                    <h2 id="landing-auth-title">
                      {modalView === 'onboarding'
                        ? 'Create your orbit.'
                        : authMode === 'login'
                          ? 'Welcome back.'
                          : 'Create your orbit.'}
                    </h2>
                    <p>
                      {modalView === 'onboarding'
                        ? 'Start with a calm space built around your week.'
                        : authMode === 'login'
                          ? 'Return to your workspace.'
                          : 'Start with a calm space built around your week.'}
                    </p>
                  </div>
                  <Button variant="icon" onClick={closeAuth} aria-label="Close front-page modal">
                    <X size={17} aria-hidden="true" />
                  </Button>
                </div>
              ) : null}

              {modalView === 'auth' ? (
                <>
                  <div className={styles.tabs} role="tablist" aria-label="Authentication mode">
                    <button className={authMode === 'login' ? styles.activeTab : ''} type="button" onClick={() => setAuthMode('login')}>
                      Sign in
                    </button>
                    <button className={authMode === 'register' ? styles.activeTab : ''} type="button" onClick={() => setAuthMode('register')}>
                      Register
                    </button>
                  </div>
                  <form className={styles.authForm} onSubmit={handleAuthSubmit}>
                    {authMode === 'register' ? (
                      <label>
                        Name
                        <input autoComplete="name" placeholder="Your name" required />
                      </label>
                    ) : null}
                    <label>
                      Email
                      <input autoComplete="email" placeholder="you@example.com" required type="email" />
                    </label>
                    <label>
                      Password
                      <input
                        autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                        placeholder={authMode === 'login' ? 'Password' : 'Create a password'}
                        required
                        type="password"
                      />
                    </label>
                    {authMode === 'login' ? (
                      <button className={styles.forgotButton} type="button">Forgot password?</button>
                    ) : null}
                    <button className={styles.submitButton} type="submit">
                      {authMode === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                    <div className={styles.divider}>or continue with</div>
                    <div className={styles.socials}>
                      <button type="button">Google</button>
                      <button type="button">Apple</button>
                    </div>
                    {authMode === 'register' ? (
                      <p className={styles.legal}>By creating an account, you agree to Atria's Terms and Privacy Policy.</p>
                    ) : null}
                  </form>
                </>
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
                  <h2 id="landing-auth-title">{authMode === 'login' ? 'Welcome back.' : 'Your orbit is ready.'}</h2>
                  <p>
                    {authMode === 'login'
                      ? 'Your Atria workspace is ready to continue.'
                      : 'Atria has created a calm starting space around the way you work.'}
                  </p>
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
