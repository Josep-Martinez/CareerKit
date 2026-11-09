import { PageHeading, EmptyState } from '../components/PagePrimitives.jsx'
import { SectionIcon } from '../components/SectionIcon.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import { invalidModuleStates, isKnownPopulated, pretty } from '../utils.js'

const progressCopy = s.homeProgress
const moduleKeys = ['profile', 'linkedin', 'cv']

function moduleStatus(key, data, states) {
  const state = states[key]
  if (!state) return 'checking'
  if (invalidModuleStates.includes(state) || state === 'Error') return 'review'
  return isKnownPopulated(key, data[key], state) ? 'ready' : 'empty'
}

function HomeProgressGuide({
  data,
  states,
  cvPromptPending,
  connected,
  fallbackConnected,
  onNavigate,
}) {
  const profileStatus = moduleStatus('profile', data, states)
  const linkedinStatus = moduleStatus('linkedin', data, states)
  const cvFileStatus = moduleStatus('cv', data, states)
  const sourcesReady = profileStatus === 'ready' && linkedinStatus === 'ready'
  const cvStatus =
    cvFileStatus === 'review'
      ? 'review'
      : sourcesReady && cvPromptPending
        ? 'update'
        : cvFileStatus === 'empty' && !sourcesReady
          ? 'waiting'
          : cvFileStatus
  const steps = [
    { key: 'profile', status: profileStatus },
    { key: 'linkedin', status: linkedinStatus },
    { key: 'cv', status: cvStatus },
  ]
  const reviewStep = steps.find((step) => step.status === 'review')
  const checkingStep = steps.find((step) => step.status === 'checking')
  let nextStep = null
  if (reviewStep) {
    nextStep = {
      status: 'review',
      key: reviewStep.key,
      title: progressCopy.nextReviewTitle,
      body: progressCopy.nextReviewBody,
      action: progressCopy.reviewActions[reviewStep.key],
      target: reviewStep.key,
    }
  } else if (checkingStep) {
    nextStep = {
      status: 'checking',
      key: checkingStep.key,
      title: progressCopy.nextCheckingTitle,
      body: progressCopy.nextCheckingBody,
      action: progressCopy.checkingAction,
      target: checkingStep.key,
    }
  } else if (profileStatus === 'empty') {
    nextStep = {
      status: 'priority',
      key: 'profile',
      title: progressCopy.nextProfileTitle,
      body: progressCopy.nextProfileBody,
      action: progressCopy.profileAction,
      target: 'profile',
    }
  } else if (linkedinStatus === 'empty') {
    nextStep = {
      status: 'priority',
      key: 'linkedin',
      title: progressCopy.nextLinkedinTitle,
      body: progressCopy.nextLinkedinBody,
      action: progressCopy.linkedinAction,
      target: 'linkedin',
    }
  } else if (sourcesReady && cvStatus === 'update') {
    nextStep = {
      status: 'update',
      key: 'cv',
      title: progressCopy.nextPromptTitle,
      body: progressCopy.nextPromptBody,
      action: progressCopy.promptAction,
      target: 'prompts',
    }
  } else if (sourcesReady && cvFileStatus === 'empty') {
    nextStep = {
      status: 'empty',
      key: 'cv',
      title: progressCopy.nextCvTitle,
      body: progressCopy.nextCvBody,
      action: progressCopy.cvAction,
      target: 'cv',
    }
  }
  const stepsWithContent = moduleKeys.filter((key) =>
    isKnownPopulated(key, data[key], states[key]),
  ).length
  const progressPercent = Math.round(
    (stepsWithContent / moduleKeys.length) * 100,
  )
  const hasAnyIssue = steps.some((step) => step.status === 'review')
  const isComplete = steps.every((step) => step.status === 'ready')
  const summary = hasAnyIssue
    ? progressCopy.progressNeedsReview
    : isComplete
      ? progressCopy.progressComplete
      : progressCopy.progressCount
          .replace('{count}', String(stepsWithContent))
          .replace('{total}', String(moduleKeys.length))

  return (
    <section
      className="home-progress-guide"
      aria-labelledby="home-progress-title"
    >
      <div className="home-progress-header">
        <div>
          <span className="eyebrow">{progressCopy.eyebrow}</span>
          <h2 id="home-progress-title">{progressCopy.title}</h2>
          <p>{progressCopy.subtitle}</p>
        </div>
        <div
          className={`home-progress-connection ${connected ? 'is-connected' : ''}`}
        >
          <span className="home-connected-mark" aria-hidden="true">
            {connected ? '✓' : '·'}
          </span>
          <span>
            <b>
              {fallbackConnected
                ? progressCopy.manualConnected
                : connected
                  ? progressCopy.connected
                  : progressCopy.disconnected}
            </b>
            <small>
              {fallbackConnected
                ? progressCopy.manualStorageNote
                : connected
                  ? progressCopy.localStorageNote
                  : progressCopy.connectNote}
            </small>
          </span>
        </div>
      </div>

      <div className="home-progress-overview">
        <div className="home-progress-meter">
          <span className="eyebrow">{progressCopy.progressLabel}</span>
          <strong>{summary}</strong>
          <div
            className="home-progress-track"
            role="progressbar"
            aria-label={progressCopy.progressLabel}
            aria-valuemin="0"
            aria-valuemax={moduleKeys.length}
            aria-valuenow={stepsWithContent}
          >
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        {nextStep ? (
          <div
            className={`home-next-action is-${nextStep.key} is-${nextStep.status}`}
          >
            <span className="eyebrow">
              {nextStep.status === 'priority'
                ? progressCopy.priorityLabel
                : progressCopy.nextLabel}
            </span>
            <h3>{nextStep.title}</h3>
            <p>{nextStep.body}</p>
            <button
              className="button primary"
              type="button"
              onClick={() => onNavigate(nextStep.target)}
            >
              {nextStep.action}
            </button>
          </div>
        ) : (
          <div className="home-next-action is-ready" role="status">
            <span className="eyebrow">{progressCopy.noUrgentLabel}</span>
            <h3>{progressCopy.allReadyTitle}</h3>
            <p>{progressCopy.allReadyBody}</p>
          </div>
        )}
      </div>

      <ol className="home-progress-steps">
        {steps.map(({ key, status }, index) => (
          <li
            aria-current={nextStep?.key === key ? 'step' : undefined}
            className={`home-progress-step is-${status}`}
            key={key}
          >
            <div className="home-step-heading">
              <span className="home-step-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{progressCopy.steps[key].title}</h3>
                <span className={`home-step-status is-${status}`}>
                  {status === 'empty' && key !== 'cv'
                    ? progressCopy.status.priority
                    : progressCopy.status[status]}
                </span>
              </div>
            </div>
            <p>{progressCopy.steps[key][status]}</p>
          </li>
        ))}
      </ol>

      <div className="home-vacancies-optional">
        <span>{progressCopy.optionalLabel}</span>
        <p>{progressCopy.optionalVacancies}</p>
        <button
          className="text-button"
          type="button"
          onClick={() => onNavigate('vacancies')}
        >
          {progressCopy.optionalAction} →
        </button>
      </div>
    </section>
  )
}

export function HomePage({
  data,
  connected,
  fallbackConnected,
  states,
  cvPromptPending,
  onNavigate,
  onVacancy,
}) {
  const vacancies = [...data.vacancies.items]
    .filter((item) => item.featured)
    .sort((a, b) => (a.preference || 999) - (b.preference || 999))
    .slice(0, 3)
  const priorities = [...data.priorities.items].sort(
    (a, b) =>
      (a.order || 999) - (b.order || 999) ||
      ({ alta: 0, media: 1, baja: 2 }[a.level] ?? 3) -
        ({ alta: 0, media: 1, baja: 2 }[b.level] ?? 3),
  )

  return (
    <>
      <PageHeading
        eyebrow={s.homePage.eyebrow}
        title={s.homePage.title}
        subtitle={s.homePage.subtitle}
      />
      <HomeProgressGuide
        data={data}
        states={states}
        cvPromptPending={cvPromptPending}
        connected={connected}
        fallbackConnected={fallbackConnected}
        onNavigate={onNavigate}
      />

      <div className="section-title-row">
        <div>
          <span className="eyebrow">{s.homePage.activityEyebrow}</span>
          <h2>{s.homePage.activityTitle}</h2>
        </div>
        <span className="muted">{s.homePage.registeredDates}</span>
      </div>
      <div className="activity-grid">
        <div className="activity-card cv-activity-card">
          <div className="activity-icon purple">
            <SectionIcon name="cv" />
          </div>
          <div className="cv-activity-copy">
            <span>{s.cvDates}</span>
            <small>
              <b>{s.cvEditor.spanishShort}</b> · {s.cvEditor.homeReview}:{' '}
              {pretty(data.cv.versions.spanish.lastReviewed)} ·{' '}
              {s.cvEditor.homeUpdated}:{' '}
              {pretty(data.cv.versions.spanish.lastUpdated)}
            </small>
            <small>
              <b>{s.cvEditor.englishShort}</b> · {s.cvEditor.homeReview}:{' '}
              {pretty(data.cv.versions.english.lastReviewed)} ·{' '}
              {s.cvEditor.homeUpdated}:{' '}
              {pretty(data.cv.versions.english.lastUpdated)}
            </small>
            {data.cv.previousVersion && (
              <small>
                {s.cvEditor.legacyShort} · {s.cvEditor.homeReview}:{' '}
                {pretty(data.cv.previousVersion.lastReviewed)} ·{' '}
                {s.cvEditor.homeUpdated}:{' '}
                {pretty(data.cv.previousVersion.lastUpdated)}
              </small>
            )}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('cv')}
            aria-label={s.cvEditor.openCV}
          >
            ↗
          </button>
        </div>
        <div className="activity-card">
          <div className="activity-icon green">
            <SectionIcon name="linkedin" />
          </div>
          <div>
            <span>{s.homePage.linkedinAudit}</span>
            <strong>{pretty(data.linkedin.audits.at(-1)?.date)}</strong>
            <small>
              {s.homePage.updatedLabel}: {pretty(data.linkedin.lastUpdated)}
            </small>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('linkedin')}
            aria-label={s.homePage.openLinkedin}
          >
            ↗
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel" aria-labelledby="home-vacancies-title">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">{s.homePage.vacanciesEyebrow}</span>
              <h2 id="home-vacancies-title">{s.featured}</h2>
            </div>
            <button
              className="arrow-link"
              type="button"
              onClick={() => onNavigate('vacancies')}
            >
              {s.homePage.viewAll} <span>→</span>
            </button>
          </div>
          {vacancies.length ? (
            vacancies.map((vacancy, index) => (
              <button
                className="vacancy-row"
                key={vacancy.id}
                type="button"
                onClick={() => onVacancy(vacancy)}
              >
                <span className="rank">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="vacancy-logo">
                  {(vacancy.company || '·').slice(0, 1).toUpperCase()}
                </span>
                <span className="vacancy-main">
                  <b>{vacancy.role || s.homePage.roleFallback}</b>
                  <small>
                    {vacancy.company || s.homePage.companyFallback} ·{' '}
                    {vacancy.location || s.homePage.locationFallback}
                  </small>
                </span>
                <span className="mode-tag">
                  {vacancy.modality || s.homePage.modalityFallback}
                </span>
                <span className="row-arrow">↗</span>
              </button>
            ))
          ) : (
            <EmptyState
              text={s.homePage.vacanciesEmpty}
              action={s.homePage.vacanciesAction}
              onClick={() => onNavigate('vacancies')}
            />
          )}
        </section>

        <section className="panel priorities-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">{s.homePage.prioritiesEyebrow}</span>
              <h2>{s.priorities}</h2>
            </div>
            <span className="tiny-icon" aria-hidden="true">
              ✳
            </span>
          </div>
          {priorities.length ? (
            priorities.map((priority) => (
              <button
                className="priority-row"
                key={priority.id}
                type="button"
                onClick={() => onNavigate(priority.section || 'profile')}
              >
                <span className={`priority-dot ${priority.level || 'media'}`} />
                <span>
                  <b>{priority.title || s.homePage.priorityTitleFallback}</b>
                  <small>
                    {priority.reason || s.homePage.priorityReasonFallback}
                  </small>
                  <small>{pretty(priority.date)}</small>
                </span>
                <span className="row-arrow">↗</span>
              </button>
            ))
          ) : (
            <div className="agent-note">
              <span aria-hidden="true">✳</span>
              <div>
                <b>{s.homePage.noPrioritiesTitle}</b>
                <p>{s.homePage.noPrioritiesBody}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
