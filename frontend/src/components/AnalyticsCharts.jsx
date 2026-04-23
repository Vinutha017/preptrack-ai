import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function AnalyticsCharts({ analyticsCharts }) {
  return (
    <section className="analytics-grid">
      <article className="analytics-card">
        <div className="analytics-head">
          <div>
            <p className="project-tag">Weekly progress</p>
            <h3>Last 7 tests</h3>
          </div>
        </div>
        {analyticsCharts.weeklyTrendData.length ? (
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsCharts.weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis domain={[0, 100]} stroke="#64748b" />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'accuracy' ? `${value}%` : value,
                    name === 'accuracy' ? 'Accuracy' : 'Tests Taken',
                  ]}
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(148, 163, 184, 0.3)' }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#5b8def"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={700}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="hint-text">Complete tests to see weekly progress.</p>
        )}
      </article>

      <article className="analytics-card">
        <div className="analytics-head">
          <div>
            <p className="project-tag">Subject accuracy</p>
            <h3>Accuracy by phase</h3>
          </div>
        </div>
        {analyticsCharts.phaseAccuracyData.length ? (
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsCharts.phaseAccuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
                <XAxis dataKey="phase" stroke="#64748b" />
                <YAxis domain={[0, 100]} stroke="#64748b" />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'accuracy' ? `${value}%` : value,
                    name === 'accuracy' ? 'Accuracy' : 'Tests Taken',
                  ]}
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(148, 163, 184, 0.3)' }}
                />
                <Bar dataKey="accuracy" fill="#61b9a8" radius={[8, 8, 0, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="hint-text">Take at least one test to see subject accuracy.</p>
        )}
      </article>
    </section>
  )
}

export default AnalyticsCharts
