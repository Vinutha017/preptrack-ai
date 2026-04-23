function DsaPracticePanel({ baseTopics, dsaPracticeLinks }) {
  return (
    <section className="dsa-practice-panel">
      <p className="dsa-quote">
        "You do not learn DSA by watching - you learn it by failing, fixing, and coding again."
      </p>
      <div className="dsa-links-grid">
        {baseTopics.map((topic) => (
          <a
            key={`dsa-link-${topic.id}`}
            className="dsa-link-chip"
            href={dsaPracticeLinks[topic.id]}
            target="_blank"
            rel="noreferrer"
          >
            {topic.label}
          </a>
        ))}
      </div>
    </section>
  )
}

export default DsaPracticePanel
