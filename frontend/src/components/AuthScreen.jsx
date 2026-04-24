function AuthScreen({ projectName, authMode, authForm, setAuthForm, handleAuthSubmit, authLoading, booting, setAuthMode }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="project-tag">Welcome to {projectName}</p>
        <h1>{authMode === 'login' ? 'Login' : 'Sign up'}</h1>
        <p className="hint-text">Sign in first, then choose one of 6 phases to update checklist and take tests.</p>

        <form className="auth-form" onSubmit={handleAuthSubmit}>
          {authMode === 'register' ? (
            <label>
              Name
              <input
                type="text"
                value={authForm.name}
                onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={authForm.email}
              onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>

          <button type="submit" disabled={authLoading || booting}>
            {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          className="switch-mode"
          onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        >
          {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
      </section>
    </main>
  )
}

export default AuthScreen
