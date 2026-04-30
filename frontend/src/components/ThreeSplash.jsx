import React from 'react'

function ThreeSplash({ projectName = 'PrepTrack AI' }) {
  return (
    <div className="three-splash" aria-hidden="true">
      <div className="three-splash-orbit three-splash-orbit-left" />
      <div className="three-splash-orbit three-splash-orbit-right" />

      <div className="three-splash-stage">
        <span className="three-splash-kicker">Before you log in</span>
        <div className="three-splash-inner">
          <span className="three-splash-shadow">{projectName}</span>
          <span className="three-splash-text">{projectName}</span>
          <span className="three-splash-reflection">{projectName}</span>
        </div>
        <p className="three-splash-subtitle">Track checklist progress, generate practice tests, and keep your prep momentum visible.</p>
      </div>
    </div>
  )
}

export default ThreeSplash
