import { Suspense, lazy } from 'react'
import DsaPracticePanel from './DsaPracticePanel.jsx'

const AnalyticsCharts = lazy(() => import('./AnalyticsCharts.jsx'))

function DashboardScreen({
  projectName,
  user,
  handleLogout,
  overallPercent,
  progress,
  handleResetProgress,
  resettingProgress,
  dashboardMessage,
  aiSummary,
  analyticsCharts,
  studyItems,
  orderedPhases,
  getPhaseProgress,
  isPhaseTestUnlocked,
  selectedPhase,
  setChecklistQuery,
  setSelectedPhase,
  handleTakeTest,
  checklistTopics,
  phaseDetailsMap,
  checklistQuery,
  customChecklistDrafts,
  setCustomChecklistDrafts,
  handleAddCustomChecklistItem,
  customChecklistSavingPhase,
  handleChecklistToggle,
  checklistSavingKey,
  completedSet,
  handleRemoveCustomChecklistItem,
  dsaPracticeLinks,
}) {
  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="project-tag">Welcome to {projectName}</p>
          <h1>Hello {user?.name}, choose your phase</h1>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <section className="overall-progress-card">
        <h3>Total completion</h3>
        <p className="overall-percent">{overallPercent}%</p>
        <p className="progress-text">
          {progress ? `${progress.totalCompleted}/${progress.totalItems} checklist items completed` : 'No progress yet'}
        </p>
        <button className="danger-button" onClick={handleResetProgress} disabled={resettingProgress}>
          {resettingProgress ? 'Resetting...' : 'Reset all checklist progress'}
        </button>
        {dashboardMessage ? <p className="status-text">{dashboardMessage}</p> : null}
      </section>

      {aiSummary ? (
        <section className="ai-summary-card">
          <div className="ai-summary-head">
            <div>
              <p className="project-tag">AI readiness</p>
              <h3>{aiSummary.readinessLabel}</h3>
            </div>
            <p className="ai-score">{aiSummary.readinessScore}%</p>
          </div>

          <p className="progress-text">You are {aiSummary.readinessScore}% ready for interviews based on progress, accuracy, and consistency.</p>

          {aiSummary.nextTopics.length ? (
            <div className="ai-next-topics">
              {aiSummary.nextTopics.map((item) => (
                <div key={item.topic} className="ai-topic-pill">
                  <strong>{item.topic}</strong>
                  <span>{item.advice}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="hint-text">Finish a few tests to get personalized topic recommendations.</p>
          )}
        </section>
      ) : null}

      {analyticsCharts ? (
        <Suspense fallback={<p className="hint-text">Loading analytics charts...</p>}>
          <AnalyticsCharts analyticsCharts={analyticsCharts} />
        </Suspense>
      ) : null}

      <section className="saved-study-card">
        <div className="analytics-head">
          <div>
            <p className="project-tag">Saved study items</p>
            <h3>Bookmarks and notes</h3>
          </div>
        </div>

        {studyItems.length ? (
          <div className="saved-study-list">
            {studyItems.slice(0, 5).map((item) => (
              <article key={String(item.questionId)} className="saved-study-item">
                <div className="saved-study-top">
                  <strong>{item.topic}</strong>
                  {item.bookmarked ? <span className="bookmark-tag">Bookmarked</span> : null}
                </div>
                <p>{item.note || 'No note added yet.'}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="hint-text">Bookmark a question or add a note during a test to save it here.</p>
        )}
      </section>

      <section className="phase-grid">
        {orderedPhases.map((phase) => {
          const phaseProgress = getPhaseProgress(phase.code)
          const canTakeTest = isPhaseTestUnlocked(phase.code)
          const isOpen = selectedPhase === phase.code
          const baseTopics = checklistTopics[phase.code] ?? []
          const customTopics = (phaseDetailsMap.get(phase.code)?.customItems ?? []).map((item) => ({
            id: item.itemId,
            label: item.label,
            isCustom: true,
          }))
          const phaseTopics = [...baseTopics, ...customTopics]
          const phaseFilteredTopics = phaseTopics.filter((topic) =>
            topic.label.toLowerCase().includes(checklistQuery.trim().toLowerCase())
          )
          return (
            <article key={phase.code} className={`phase-card ${isOpen ? 'active' : ''}`}>
              <h2>{phase.code}</h2>
              <p>{phase.title}</p>
              <p className="progress-text">
                {phaseProgress ? `${phaseProgress.completed}/${phaseProgress.total} completed` : 'No progress yet'}
              </p>
              <p className="phase-percent">
                {phaseProgress ? `${phaseProgress.percent}% complete` : '0% complete'}
              </p>
              <div className="phase-actions">
                <button
                  onClick={() => {
                    setChecklistQuery('')
                    setSelectedPhase((current) => (current === phase.code ? '' : phase.code))
                  }}
                >
                  {isOpen ? 'Close checklist' : 'Open checklist'}
                </button>
                <button className="take-test" onClick={() => handleTakeTest(phase.code)} disabled={!canTakeTest}>
                  Open test screen
                </button>
              </div>
              {!canTakeTest ? <p className="hint-text">Finish all checklist topics to unlock this test.</p> : null}

              {isOpen ? (
                <section className="phase-checklist-section">
                  <div className="checklist-head">
                    <div>
                      <h3>{phase.code} checklist</h3>
                      <p className="progress-text">
                        {phaseProgress?.completed ?? 0}/{phaseProgress?.total ?? phaseTopics.length} completed ({phaseProgress?.percent ?? 0}%)
                      </p>
                    </div>
                    <label className="checklist-search">
                      <span>Search topics</span>
                      <input
                        type="text"
                        value={checklistQuery}
                        onChange={(event) => setChecklistQuery(event.target.value)}
                        placeholder="Type topic name"
                      />
                    </label>
                  </div>

                  <div className="custom-checklist-add">
                    <label>
                      <span>Add your own checklist topic</span>
                      <input
                        type="text"
                        value={customChecklistDrafts[phase.code] ?? ''}
                        onChange={(event) =>
                          setCustomChecklistDrafts((current) => ({
                            ...current,
                            [phase.code]: event.target.value,
                          }))
                        }
                        placeholder="Example: OS IPC interview notes"
                      />
                    </label>
                    <button
                      className="take-test"
                      onClick={() => void handleAddCustomChecklistItem(phase.code)}
                      disabled={customChecklistSavingPhase === phase.code}
                    >
                      {customChecklistSavingPhase === phase.code ? 'Adding...' : 'Add topic'}
                    </button>
                  </div>

                  <div
                    className="phase-progress-bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Number(phaseProgress?.percent) || 0}
                    aria-label={`${phase.code} progress`}
                  >
                    <span style={{ width: `${Math.max(0, Math.min(100, Number(phaseProgress?.percent) || 0))}%` }} />
                  </div>

                  <p className="progress-text">Showing {phaseFilteredTopics.length} of {phaseTopics.length} topics</p>

                  {phase.code === 'DSA' ? (
                    <DsaPracticePanel baseTopics={baseTopics} dsaPracticeLinks={dsaPracticeLinks} />
                  ) : null}

                  <div className="checklist-grid">
                    {phaseFilteredTopics.map((topic) => {
                      const checked = completedSet.has(topic.id)
                      const saving = checklistSavingKey === `${phase.code}:${topic.id}`

                      return (
                        <div className={`check-item ${checked ? 'checked' : ''}`} key={topic.id}>
                          <label className="check-item-main">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={saving}
                              onChange={(event) => handleChecklistToggle(phase.code, topic.id, event.target.checked)}
                            />
                            <span>{topic.label}</span>
                          </label>
                          {topic.isCustom ? (
                            <button
                              type="button"
                              className="mini-danger"
                              disabled={saving}
                              onClick={() => void handleRemoveCustomChecklistItem(phase.code, topic.id)}
                            >
                              {saving ? 'Removing...' : 'Remove'}
                            </button>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                  {!phaseFilteredTopics.length ? <p className="hint-text">No checklist topics match your search.</p> : null}
                </section>
              ) : null}
            </article>
          )
        })}
      </section>
    </main>
  )
}

export default DashboardScreen
