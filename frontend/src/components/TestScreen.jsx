import ProjectLogo from './ProjectLogo.jsx'

function TestScreen({
  projectName,
  selectedPhase,
  goToDashboard,
  handleLogout,
  answeredCount,
  generatedTest,
  testTimer,
  formatTime,
  handleSubmitTest,
  testState,
  retakeState,
  handleRetakeWrongQuestions,
  openResultModal,
  studySavingId,
  studyMap,
  studyDrafts,
  upsertStudyItem,
  answers,
  setAnswers,
  reviewByQuestionId,
  setStudyDrafts,
  removeStudyItem,
}) {
  return (
    <main className="test-page">
      <header className="test-topbar">
        <button className="back-button" onClick={goToDashboard}>Back to dashboard</button>
        <div className="page-brand-block">
          <ProjectLogo compact />
          <p className="project-tag">{projectName}</p>
          <h1>{selectedPhase} Test</h1>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <section className="test-section">
        <div className="test-header">
          <div>
            <h3>{selectedPhase} questions</h3>
            <p className="progress-text">Answered {answeredCount}/{generatedTest.length || 0}</p>
          </div>
          <div className="test-header-actions">
            <p className={`timer-pill ${testTimer <= 60 ? 'timer-danger' : ''}`}>Time left: {formatTime(testTimer)}</p>
            <button onClick={handleSubmitTest} disabled={!generatedTest.length || testState.loading}>
              {testState.loading ? 'Submitting...' : 'Submit test'}
            </button>
          </div>
        </div>

        {generatedTest.length ? (
          <div className="phase-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((answeredCount / generatedTest.length) * 100)} aria-label="Test answer completion">
            <span style={{ width: `${Math.round((answeredCount / generatedTest.length) * 100)}%` }} />
          </div>
        ) : null}

        {testState.result ? (
          <button className="take-test" onClick={openResultModal}>
            View detailed result
          </button>
        ) : null}

        {testState.result && retakeState.questionIds.length ? (
          <button className="take-test" onClick={handleRetakeWrongQuestions}>
            Reattempt wrong questions ({retakeState.questionIds.length})
          </button>
        ) : null}

        {generatedTest.length ? (
          <div className="question-list">
            {generatedTest.map((question, index) => (
              <article key={question._id} className="question-card">
                {question.isInterviewFavorite ? <p className="interview-badge">Most Asked Interview Pattern</p> : null}
                <div className="question-card-head">
                  <p className="question-title">Q{index + 1}. {question.question}</p>
                  <button
                    className="bookmark-button"
                    disabled={studySavingId === String(question._id)}
                    onClick={() => {
                      const existing = studyMap.get(String(question._id))
                      void upsertStudyItem({
                        questionId: question._id,
                        phase: question.phase,
                        topic: question.topic,
                        bookmarked: !(existing?.bookmarked ?? false),
                        note: existing?.note ?? studyDrafts[question._id] ?? '',
                      })
                    }}
                  >
                    {studySavingId === String(question._id)
                      ? 'Updating...'
                      : studyMap.get(String(question._id))?.bookmarked
                        ? 'Bookmarked'
                        : 'Bookmark'}
                  </button>
                </div>
                <div className="option-list">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className={
                        testState.result
                          ? option === reviewByQuestionId.get(String(question._id))?.correctAnswer
                            ? 'answer-correct'
                            : option === reviewByQuestionId.get(String(question._id))?.selectedAnswer
                              ? 'answer-wrong'
                              : ''
                          : ''
                      }
                    >
                      <input
                        type="radio"
                        name={question._id}
                        checked={answers[question._id] === option}
                        disabled={Boolean(testState.result)}
                        onChange={() => setAnswers((current) => ({ ...current, [question._id]: option }))}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                {testState.result ? (
                  <p className={`answer-summary ${reviewByQuestionId.get(String(question._id))?.isCorrect ? 'answer-summary-correct' : 'answer-summary-wrong'}`}>
                    Your answer: {reviewByQuestionId.get(String(question._id))?.selectedAnswer || 'No answer'} | Correct answer: {reviewByQuestionId.get(String(question._id))?.correctAnswer || 'N/A'}
                  </p>
                ) : null}

                <label className="note-field">
                  <span>My note</span>
                  <textarea
                    rows="3"
                    value={studyDrafts[question._id] ?? studyMap.get(String(question._id))?.note ?? ''}
                    disabled={studySavingId === String(question._id)}
                    onChange={(event) => setStudyDrafts((current) => ({ ...current, [question._id]: event.target.value }))}
                    placeholder="Write a quick revision note"
                  />
                </label>

                <div className="question-actions">
                  <button
                    className="take-test"
                    disabled={studySavingId === String(question._id)}
                    onClick={() => {
                      const existing = studyMap.get(String(question._id))
                      void upsertStudyItem({
                        questionId: question._id,
                        phase: question.phase,
                        topic: question.topic,
                        bookmarked: existing?.bookmarked ?? false,
                        note: studyDrafts[question._id] ?? existing?.note ?? '',
                      })
                    }}
                  >
                    {studySavingId === String(question._id) ? 'Saving...' : 'Save note'}
                  </button>
                  {studyMap.get(String(question._id)) ? (
                    <button
                      className="danger-button"
                      disabled={studySavingId === String(question._id)}
                      onClick={() => void removeStudyItem(question._id)}
                    >
                      {studySavingId === String(question._id) ? 'Updating...' : 'Remove saved item'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : testState.loading ? (
          <p className="hint-text">Preparing your test. If this takes long, go back and start again.</p>
        ) : null}

        {generatedTest.length ? (
          <div className="test-footer-actions">
            <button className="take-test" onClick={handleSubmitTest} disabled={testState.loading}>
              {testState.loading ? 'Submitting...' : 'Submit test'}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default TestScreen
