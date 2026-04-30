function ProjectLogo({ compact = false }) {
  return (
    <div className={`project-logo ${compact ? 'project-logo-compact' : ''}`} aria-hidden="true">
      <svg className="project-logo-mark" viewBox="0 0 64 64" role="presentation" focusable="false">
        <defs>
          <linearGradient id="projectLogoGradient" x1="12" y1="10" x2="52" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="55%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>
        <rect x="7" y="7" width="50" height="50" rx="16" fill="url(#projectLogoGradient)" />
        <path
          d="M20 18.5C20 17.1193 21.1193 16 22.5 16H33.7C35.6659 16 37.5494 16.7818 38.9393 18.1716L42.8284 22.0607C43.5786 22.8109 44 23.8283 44 24.8893V45.5C44 46.8807 42.8807 48 41.5 48H22.5C21.1193 48 20 46.8807 20 45.5V18.5Z"
          fill="rgba(255,255,255,0.14)"
        />
        <path
          d="M24 18H33.8C35.157 18 36.4574 18.539 37.4142 19.4958L41.2042 23.2858C42.1152 24.1968 42.6286 25.4316 42.6286 26.7191V45C42.6286 46.1046 41.7332 47 40.6286 47H24C22.3431 47 21 45.6569 21 44V21C21 19.3431 22.3431 18 24 18Z"
          fill="#ffffff"
          opacity="0.14"
        />
        <path
          d="M24.5 19.5H33.4C34.478 19.5 35.5119 19.9281 36.2735 20.6897L39.8103 24.2265C40.4753 24.8915 40.8484 25.7935 40.8484 26.7341V44C40.8484 45.1046 39.953 46 38.8484 46H24.5C23.3954 46 22.5 45.1046 22.5 44V21.5C22.5 20.3954 23.3954 19.5 24.5 19.5Z"
          fill="#ffffff"
        />
        <path d="M29.1 22.5H35.6L38.3 25.2H29.1V22.5Z" fill="rgba(37,99,235,0.18)" />
        <path d="M27.2 27.2H38.8" stroke="#dbeafe" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M27.2 31.2H38.8" stroke="#dbeafe" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M27.2 35.2H36.2" stroke="#dbeafe" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M23.8 19.6C22.8 21.3 22.2 23.2 22.2 25.2V45" stroke="rgba(15,23,42,0.16)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {!compact ? (
        <div className="project-logo-copy">
          <strong>PrepTrack AI</strong>
          <span>Plan. Practice. Progress.</span>
        </div>
      ) : null}
    </div>
  )
}

export default ProjectLogo