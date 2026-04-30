import { Suspense, lazy, useMemo, useState } from 'react'
import DsaPracticePanel from './DsaPracticePanel.jsx'
import ProjectLogo from './ProjectLogo.jsx'

const AnalyticsCharts = lazy(() => import('./AnalyticsCharts.jsx'))

function DashboardScreen({
  projectName,
  user,
  handleLogout,
  overallPercent,
  progress,
  handleResetProgress,
  resettingProgress,
  aiSummary,
  analyticsCharts,
  studyItems,
  orderedPhases,
  getPhaseProgress,
  selectedPhase,
  setChecklistQuery,
  setSelectedPhase,
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
  handleTakeTest,
  isPhaseTestUnlocked,
}) {
  const [showAllSavedItems, setShowAllSavedItems] = useState(false)
  const [expandedChecklistPhases, setExpandedChecklistPhases] = useState({})
  const [phaseTab, setPhaseTab] = useState('ALL')
  const savedItemsToDisplay = showAllSavedItems ? studyItems : studyItems.slice(0, 5)
  const normalizedChecklistQuery = useMemo(() => checklistQuery.trim().toLowerCase(), [checklistQuery])
  const phaseTabs = useMemo(() => ['ALL', ...orderedPhases.map((phase) => phase.code)], [orderedPhases])
  const visiblePhases = useMemo(
    () => (phaseTab === 'ALL' ? orderedPhases : orderedPhases.filter((phase) => phase.code === phaseTab)),
    [orderedPhases, phaseTab]
  )

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="page-brand-block">
          <ProjectLogo compact />
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
          <>
            <div className="saved-study-list">
              {savedItemsToDisplay.map((item) => (
                <article key={String(item.questionId)} className="saved-study-item">
                  <div className="saved-study-top">
                    <strong>{item.topic}</strong>
                    {item.bookmarked ? <span className="bookmark-tag">Bookmarked</span> : null}
                  </div>
                  <p>{item.note || 'No note added yet.'}</p>
                </article>
              ))}
            </div>
            {studyItems.length > 5 ? (
              <button className="show-more-button" onClick={() => setShowAllSavedItems((current) => !current)}>
                {showAllSavedItems ? 'Show less' : `Show more (${studyItems.length - 5} more)`}
              </button>
            ) : null}
          </>
        ) : (
          <p className="hint-text">Bookmark important items and notes to save them here.</p>
        )}
      </section>

      <section className="phase-tabs" role="tablist" aria-label="Phase tabs">
        {phaseTabs.map((tabCode) => {
          const isActiveTab = phaseTab === tabCode
          return (
            <button
              key={tabCode}
              type="button"
              role="tab"
              aria-selected={isActiveTab}
              className={`phase-tab ${isActiveTab ? 'active' : ''}`}
              onClick={() => setPhaseTab(tabCode)}
            >
              {tabCode === 'ALL' ? 'All phases' : tabCode}
            </button>
          )
        })}
      </section>

      <section className="phase-grid">
        {visiblePhases.map((phase) => {
          const phaseProgress = getPhaseProgress(phase.code)
          const isOpen = selectedPhase === phase.code
          const baseTopics = checklistTopics[phase.code] ?? []
          const customTopics = (phaseDetailsMap.get(phase.code)?.customItems ?? []).map((item) => ({
            id: item.itemId,
            label: item.label,
            isCustom: true,
          }))
          const phaseTopics = [...baseTopics, ...customTopics]
          const coreFilteredTopics = baseTopics.filter((topic) => topic.label.toLowerCase().includes(normalizedChecklistQuery))
          const customFilteredTopics = customTopics.filter((topic) => topic.label.toLowerCase().includes(normalizedChecklistQuery))
          const phaseFilteredTopics = [...coreFilteredTopics, ...customFilteredTopics]
          const phaseKey = phase.code
          const coreExpandKey = `${phaseKey}:core`
          const customExpandKey = `${phaseKey}:custom`
          const showAllCoreItems = Boolean(expandedChecklistPhases[coreExpandKey])
          const showAllCustomItems = Boolean(expandedChecklistPhases[customExpandKey])
          const shouldTruncateCore = coreFilteredTopics.length > 10
          const shouldTruncateCustom = customFilteredTopics.length > 8
          const displayedCoreTopics = shouldTruncateCore && !showAllCoreItems ? coreFilteredTopics.slice(0, 10) : coreFilteredTopics
          const displayedCustomTopics = shouldTruncateCustom && !showAllCustomItems ? customFilteredTopics.slice(0, 8) : customFilteredTopics
          const displayedChecklistItems = [...displayedCoreTopics, ...displayedCustomTopics]

          return (
            <article key={phase.code} className={`phase-card ${isOpen ? 'active' : ''}`}>
              <h2>{phase.code}</h2>
              <p>{phase.title}</p>
              {phase.code !== 'RESUME' ? (
                <>
                  <p className="progress-text">
                    {phaseProgress ? `${phaseProgress.completed}/${phaseProgress.total} completed` : 'No progress yet'}
                  </p>
                  <p className="phase-percent">
                    {phaseProgress ? `${phaseProgress.percent}% complete` : '0% complete'}
                  </p>
                </>
              ) : (
                <p className="progress-text">{phaseTopics.length} points</p>
              )}
              <div className="phase-actions">
                <button
                  onClick={() => {
                    setChecklistQuery('')
                    setSelectedPhase((current) => (current === phase.code ? '' : phase.code))
                  }}
                >
                  {isOpen ? 'Close points' : 'Open points'}
                </button>
                {phase.code !== 'RESUME' ? (
                  <button
                    className="take-test"
                    onClick={() => handleTakeTest(phase.code)}
                  >
                    Take test
                  </button>
                ) : null}
              </div>

              {isOpen ? (
                <section className="phase-checklist-section">
                  <div className="checklist-head">
                    <div>
                      <h3>{phase.code} points</h3>
                      {phase.code !== 'RESUME' ? (
                        <p className="progress-text">
                          {phaseProgress?.completed ?? 0}/{phaseProgress?.total ?? phaseTopics.length} completed ({phaseProgress?.percent ?? 0}%)
                        </p>
                      ) : null}
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

                  {phase.code !== 'RESUME' ? (
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
                  ) : null}

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

                  {phase.code !== 'RESUME' ? (
                    <p className="progress-text">Showing {displayedChecklistItems.length} of {phaseTopics.length} topics</p>
                  ) : null}

                  {phase.code === 'RESUME' ? (
                    <div className="resume-section">
                      <h4>Resume points</h4>
                      <ul>
                        {baseTopics.map((item) => (
                          <li key={item.id}>{item.label}</li>
                        ))}
                      </ul>

                      <p className="hint-text">
                        Need an external checker?{' '}
                        <a href="https://www.jobscan.co/resume-scanner" target="_blank" rel="noreferrer">
                          Open Resume ATS checker
                        </a>
                      </p>

                    </div>
                  ) : null}

                  {phase.code === 'DSA' ? (
                    <DsaPracticePanel baseTopics={baseTopics} dsaPracticeLinks={dsaPracticeLinks} />
                  ) : null}

                  {phase.code !== 'RESUME' && displayedCoreTopics.length ? (
                    <div className="checklist-section-group">
                      <div className="checklist-group-head">
                        <h4>Core checklist</h4>
                        <span>{displayedCoreTopics.length}/{coreFilteredTopics.length}</span>
                      </div>
                      <div className="checklist-grid">
                        {displayedCoreTopics.map((topic) => {
                          const checked = completedSet.has(topic.id)
                          const saving = checklistSavingKey === `${phase.code}:${topic.id}`

                          return (
                            <div className={`check-item ${checked ? 'checked' : ''}`} key={topic.id}>
                              <label className="check-item-main">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) => handleChecklistToggle(phase.code, topic.id, event.target.checked)}
                                />
                                <span>{topic.label}</span>
                              </label>
                            </div>
                          )
                        })}
                      </div>
                      {shouldTruncateCore ? (
                        <button
                          className="show-more-button"
                          onClick={() =>
                            setExpandedChecklistPhases((current) => ({
                              ...current,
                              [coreExpandKey]: !showAllCoreItems,
                            }))
                          }
                        >
                          {showAllCoreItems
                            ? 'Show fewer core topics'
                            : `Show more core topics (${coreFilteredTopics.length - displayedCoreTopics.length} more)`}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {phase.code !== 'RESUME' ? (
                    <div className="checklist-section-group">
                      <div className="checklist-group-head">
                        <h4>Custom checklist</h4>
                        <span>{displayedCustomTopics.length}/{customFilteredTopics.length}</span>
                      </div>
                      {displayedCustomTopics.length ? (
                        <div className="checklist-grid">
                          {displayedCustomTopics.map((topic) => {
                            const checked = completedSet.has(topic.id)
                            const saving = checklistSavingKey === `${phase.code}:${topic.id}`

                            return (
                              <div className={`check-item ${checked ? 'checked' : ''}`} key={topic.id}>
                                <label className="check-item-main">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => handleChecklistToggle(phase.code, topic.id, event.target.checked)}
                                  />
                                  <span>{topic.label}</span>
                                </label>
                                <button
                                  type="button"
                                  className="mini-danger"
                                  disabled={saving}
                                  onClick={() => void handleRemoveCustomChecklistItem(phase.code, topic.id)}
                                >
                                  {saving ? 'Removing...' : 'Remove'}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="hint-text">No custom topics yet for this phase.</p>
                      )}
                      {shouldTruncateCustom ? (
                        <button
                          className="show-more-button"
                          onClick={() =>
                            setExpandedChecklistPhases((current) => ({
                              ...current,
                              [customExpandKey]: !showAllCustomItems,
                            }))
                          }
                        >
                          {showAllCustomItems
                            ? 'Show fewer custom topics'
                            : `Show more custom topics (${customFilteredTopics.length - displayedCustomTopics.length} more)`}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {phase.code !== 'RESUME' && !phaseFilteredTopics.length ? <p className="hint-text">No points match your search.</p> : null}
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
