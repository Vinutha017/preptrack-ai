import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
const TOKEN_KEY = 'preptrack_token'
const PROJECT_NAME = 'PrepTrack AI'
const PHASE_TEST_QUESTION_COUNT = 30

const PHASES = [
  { code: 'DSA', title: 'Data Structures' },
  { code: 'DBMS', title: 'Database Systems' },
  { code: 'OS', title: 'Operating Systems' },
  { code: 'CN', title: 'Computer Networks' },
  { code: 'VOCAB', title: 'Technical Vocabulary' },
  { code: 'OOPS', title: 'Object-Oriented Programming' },
]

const ORDERED_PHASES = [...PHASES].sort((a, b) => a.title.localeCompare(b.title))

const CHECKLIST_TOPICS = {
  DSA: [
    { id: 'dsa-time-space-complexity', label: 'Time & Space Complexity' },
    { id: 'dsa-arrays', label: 'Arrays' },
    { id: 'dsa-strings', label: 'Strings' },
    { id: 'dsa-hashing', label: 'Hashing' },
    { id: 'dsa-linked-list', label: 'Linked List' },
    { id: 'dsa-stack', label: 'Stack' },
    { id: 'dsa-queue', label: 'Queue' },
    { id: 'dsa-recursion', label: 'Recursion' },
    { id: 'dsa-binary-search', label: 'Binary Search' },
    { id: 'dsa-trees-bst', label: 'Trees (Binary Trees & BST)' },
    { id: 'dsa-heaps', label: 'Heaps (Priority Queue)' },
    { id: 'dsa-graphs', label: 'Graphs' },
    { id: 'dsa-backtracking', label: 'Backtracking' },
    { id: 'dsa-dynamic-programming', label: 'Dynamic Programming' },
  ],
  DBMS: [
    { id: 'dbms-vs-rdbms', label: 'DBMS vs RDBMS' },
    { id: 'dbms-data-models', label: 'Data Models' },
    { id: 'dbms-schema-vs-instance', label: 'Schema vs Instance' },
    { id: 'dbms-keys', label: 'Keys (Primary, Foreign, Candidate, Super)' },
    { id: 'dbms-er-model', label: 'ER Model' },
    { id: 'dbms-er-diagram', label: 'ER Diagram' },
    { id: 'dbms-er-to-relational', label: 'Mapping ER to Relational Model' },
    { id: 'dbms-cardinality-participation', label: 'Cardinality & Participation' },
    { id: 'dbms-sql-basics', label: 'SQL Basics' },
    { id: 'dbms-joins', label: 'Joins' },
    { id: 'dbms-subqueries', label: 'Subqueries' },
    { id: 'dbms-aggregate-functions', label: 'Aggregate Functions' },
    { id: 'dbms-group-by-having', label: 'GROUP BY & HAVING' },
    { id: 'dbms-views', label: 'Views' },
    { id: 'dbms-indexes', label: 'Indexes' },
    { id: 'dbms-triggers', label: 'Triggers' },
    { id: 'dbms-functional-dependency', label: 'Functional Dependency' },
    { id: 'dbms-normalization', label: 'Normalization' },
    { id: 'dbms-normal-forms', label: 'Normal Forms (1NF, 2NF, 3NF, BCNF)' },
    { id: 'dbms-denormalization', label: 'Denormalization' },
    { id: 'dbms-acid-properties', label: 'ACID Properties' },
    { id: 'dbms-transactions', label: 'Transactions' },
    { id: 'dbms-transaction-states', label: 'Transaction States' },
    { id: 'dbms-serializability', label: 'Serializability' },
    { id: 'dbms-locking-2pl', label: 'Locking (2PL)' },
    { id: 'dbms-deadlocks', label: 'Deadlocks' },
    { id: 'dbms-indexing', label: 'Indexing' },
    { id: 'dbms-b-plus-trees', label: 'B+ Trees' },
    { id: 'dbms-hashing', label: 'Hashing' },
    { id: 'dbms-query-processing', label: 'Query Processing' },
    { id: 'dbms-query-optimization', label: 'Query Optimization' },
    { id: 'dbms-recovery-techniques', label: 'Recovery Techniques' },
    { id: 'dbms-log-based-recovery', label: 'Log-based Recovery' },
    { id: 'dbms-checkpoints', label: 'Checkpoints' },
    { id: 'dbms-cap-theorem', label: 'CAP Theorem' },
    { id: 'dbms-nosql-vs-sql', label: 'NoSQL vs SQL' },
    { id: 'dbms-distributed-databases', label: 'Distributed Databases' },
  ],
  OS: [
    { id: 'os-basics', label: 'OS Basics' },
    { id: 'os-types', label: 'Types of Operating Systems' },
    { id: 'os-process', label: 'Process' },
    { id: 'os-process-states', label: 'Process States' },
    { id: 'os-pcb', label: 'Process Control Block (PCB)' },
    { id: 'os-context-switching', label: 'Context Switching' },
    { id: 'os-threads', label: 'Threads' },
    { id: 'os-multithreading', label: 'Multithreading' },
    { id: 'os-cpu-scheduling-algorithms', label: 'CPU Scheduling Algorithms' },
    { id: 'os-fcfs', label: 'FCFS' },
    { id: 'os-sjf', label: 'SJF' },
    { id: 'os-priority-scheduling', label: 'Priority Scheduling' },
    { id: 'os-round-robin', label: 'Round Robin' },
    { id: 'os-process-synchronization', label: 'Process Synchronization' },
    { id: 'os-critical-section', label: 'Critical Section Problem' },
    { id: 'os-semaphores', label: 'Semaphores' },
    { id: 'os-mutex', label: 'Mutex' },
    { id: 'os-deadlocks', label: 'Deadlocks' },
    { id: 'os-deadlock-prevention', label: 'Deadlock Prevention' },
    { id: 'os-deadlock-avoidance', label: 'Deadlock Avoidance' },
    { id: 'os-deadlock-detection', label: 'Deadlock Detection' },
    { id: 'os-memory-management', label: 'Memory Management' },
    { id: 'os-paging', label: 'Paging' },
    { id: 'os-segmentation', label: 'Segmentation' },
    { id: 'os-virtual-memory', label: 'Virtual Memory' },
    { id: 'os-page-replacement', label: 'Page Replacement Algorithms' },
    { id: 'os-fifo', label: 'FIFO' },
    { id: 'os-lru', label: 'LRU' },
    { id: 'os-optimal', label: 'Optimal' },
    { id: 'os-disk-scheduling', label: 'Disk Scheduling' },
    { id: 'os-sstf', label: 'SSTF' },
    { id: 'os-scan', label: 'SCAN' },
    { id: 'os-c-scan', label: 'C-SCAN' },
    { id: 'os-file-system', label: 'File System' },
    { id: 'os-file-allocation', label: 'File Allocation Methods' },
    { id: 'os-directory-structure', label: 'Directory Structure' },
    { id: 'os-io-management', label: 'I/O Management' },
  ],
  CN: [
    { id: 'cn-osi-model', label: 'OSI Model' },
    { id: 'cn-tcp-ip-model', label: 'TCP/IP Model' },
    { id: 'cn-osi-vs-tcpip', label: 'OSI vs TCP/IP' },
    { id: 'cn-physical-layer', label: 'Physical Layer Basics' },
    { id: 'cn-transmission-media', label: 'Transmission Media' },
    { id: 'cn-data-link-layer', label: 'Data Link Layer' },
    { id: 'cn-error-detection', label: 'Error Detection & Correction' },
    { id: 'cn-flow-control', label: 'Flow Control' },
    { id: 'cn-arq-protocols', label: 'ARQ Protocols' },
    { id: 'cn-network-layer', label: 'Network Layer' },
    { id: 'cn-ip-addressing', label: 'IP Addressing (IPv4, IPv6)' },
    { id: 'cn-subnetting', label: 'Subnetting' },
    { id: 'cn-routing-algorithms', label: 'Routing Algorithms' },
    { id: 'cn-transport-layer', label: 'Transport Layer' },
    { id: 'cn-tcp', label: 'TCP' },
    { id: 'cn-udp', label: 'UDP' },
    { id: 'cn-tcp-vs-udp', label: 'TCP vs UDP' },
    { id: 'cn-flow-congestion-control', label: 'Flow Control & Congestion Control' },
    { id: 'cn-application-layer-protocols', label: 'Application Layer Protocols' },
    { id: 'cn-http-https', label: 'HTTP/HTTPS' },
    { id: 'cn-ftp', label: 'FTP' },
    { id: 'cn-smtp', label: 'SMTP' },
    { id: 'cn-dns', label: 'DNS' },
    { id: 'cn-switching-techniques', label: 'Switching Techniques' },
    { id: 'cn-circuit-switching', label: 'Circuit Switching' },
    { id: 'cn-packet-switching', label: 'Packet Switching' },
    { id: 'cn-network-devices', label: 'Network Devices' },
    { id: 'cn-router', label: 'Router' },
    { id: 'cn-switch', label: 'Switch' },
    { id: 'cn-hub', label: 'Hub' },
    { id: 'cn-bridge', label: 'Bridge' },
    { id: 'cn-congestion-control', label: 'Congestion Control' },
    { id: 'cn-qos-basics', label: 'QoS Basics' },
    { id: 'cn-network-security-basics', label: 'Network Security Basics' },
    { id: 'cn-firewall', label: 'Firewall' },
    { id: 'cn-encryption', label: 'Encryption' },
    { id: 'cn-ssl-tls', label: 'SSL/TLS' },
    { id: 'cn-miscellaneous', label: 'Miscellaneous' },
    { id: 'cn-nat', label: 'NAT' },
    { id: 'cn-dhcp', label: 'DHCP' },
    { id: 'cn-arp', label: 'ARP' },
    { id: 'cn-icmp', label: 'ICMP' },
  ],
  VOCAB: [
    { id: 'vocab-synonyms', label: 'Synonyms' },
    { id: 'vocab-antonyms', label: 'Antonyms' },
    { id: 'vocab-one-word-substitution', label: 'One Word Substitution' },
    { id: 'vocab-idioms-phrases', label: 'Idioms & Phrases' },
    { id: 'vocab-phrasal-verbs', label: 'Phrasal Verbs' },
    { id: 'vocab-word-meanings', label: 'Word Meanings (High-frequency words)' },
    { id: 'vocab-context-based-vocabulary', label: 'Context-based Vocabulary' },
    { id: 'vocab-sentence-completion', label: 'Sentence Completion' },
    { id: 'vocab-fill-in-blanks', label: 'Fill in the Blanks' },
    { id: 'vocab-error-detection', label: 'Error Detection (Grammar-based vocab)' },
    { id: 'vocab-sentence-improvement', label: 'Sentence Improvement' },
    { id: 'vocab-reading-comprehension', label: 'Reading Comprehension Vocabulary' },
    { id: 'vocab-root-prefix-suffix', label: 'Root Words, Prefix, Suffix' },
    { id: 'vocab-confused-words', label: 'Commonly Confused Words' },
    { id: 'vocab-homonyms-homophones', label: 'Homonyms & Homophones' },
    { id: 'vocab-word-usage', label: 'Word Usage in Sentences' },
  ],
  OOPS: [
    { id: 'oops-basics', label: 'Object-Oriented Programming Basics' },
    { id: 'oops-class-object', label: 'Class & Object' },
    { id: 'oops-encapsulation', label: 'Encapsulation' },
    { id: 'oops-abstraction', label: 'Abstraction' },
    { id: 'oops-inheritance', label: 'Inheritance' },
    { id: 'oops-polymorphism', label: 'Polymorphism (Compile-time & Runtime)' },
    { id: 'oops-constructors', label: 'Constructors' },
    { id: 'oops-destructors', label: 'Destructors' },
    { id: 'oops-this-pointer', label: 'this Pointer' },
    { id: 'oops-static-keyword', label: 'Static Keyword' },
    { id: 'oops-method-overloading', label: 'Method Overloading' },
    { id: 'oops-method-overriding', label: 'Method Overriding' },
    { id: 'oops-operator-overloading', label: 'Operator Overloading' },
    { id: 'oops-access-specifiers', label: 'Access Specifiers (Public, Private, Protected)' },
    { id: 'oops-virtual-functions', label: 'Virtual Functions' },
    { id: 'oops-pure-virtual-functions', label: 'Pure Virtual Functions' },
    { id: 'oops-abstract-classes', label: 'Abstract Classes' },
    { id: 'oops-interfaces', label: 'Interfaces' },
    { id: 'oops-friend-function', label: 'Friend Function' },
    { id: 'oops-inline-function', label: 'Inline Function' },
    { id: 'oops-dynamic-binding', label: 'Dynamic Binding' },
    { id: 'oops-message-passing', label: 'Message Passing' },
  ],
}

const defaultAuth = { name: '', email: '', password: '' }

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with ${response.status}`)
  }
  return payload
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(defaultAuth)
  const [authMessage, setAuthMessage] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [booting, setBooting] = useState(Boolean(token))

  const [progress, setProgress] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [studyItems, setStudyItems] = useState([])
  const [studyDrafts, setStudyDrafts] = useState({})
  const [studyMessage, setStudyMessage] = useState('')
  const [studySavingId, setStudySavingId] = useState('')
  const [selectedPhase, setSelectedPhase] = useState(ORDERED_PHASES[0]?.code ?? '')
  const [checklistQuery, setChecklistQuery] = useState('')
  const [checklistSavingKey, setChecklistSavingKey] = useState('')
  const [customChecklistDrafts, setCustomChecklistDrafts] = useState({})
  const [customChecklistSavingPhase, setCustomChecklistSavingPhase] = useState('')
  const [resettingProgress, setResettingProgress] = useState(false)
  const [dashboardMessage, setDashboardMessage] = useState('')
  const [activeView, setActiveView] = useState('dashboard')

  const [generatedTest, setGeneratedTest] = useState([])
  const [answers, setAnswers] = useState({})
  const [testState, setTestState] = useState({ loading: false, message: '', result: null })
  const [testTimer, setTestTimer] = useState(0)
  const [retakeState, setRetakeState] = useState({ questionIds: [], phase: '' })

  const signedIn = Boolean(token && user)
  const overallPercent = progress?.overallPercent ?? 0
  const answeredCount = useMemo(() => {
    return generatedTest.reduce((count, question) => (answers[question._id] ? count + 1 : count), 0)
  }, [answers, generatedTest])

  const getPhaseProgress = (phaseCode) => {
    return progress?.phaseWise?.find((item) => item.phase === phaseCode)
  }

  const isPhaseTestUnlocked = (phaseCode) => {
    const phaseProgress = getPhaseProgress(phaseCode)
    return Boolean(phaseProgress?.isComplete)
  }

  const completedSet = useMemo(() => {
    const details = progress?.phaseDetails ?? []
    const phaseDetails = details.find((item) => item.phase === selectedPhase)
    return new Set(phaseDetails?.completedItems ?? [])
  }, [progress, selectedPhase])

  const phaseDetailsMap = useMemo(() => {
    const details = progress?.phaseDetails ?? []
    return new Map(details.map((item) => [item.phase, item]))
  }, [progress])

  const aiSummary = useMemo(() => {
    if (!analytics) return null

    return {
      readinessScore: analytics.readinessScore ?? 0,
      readinessLabel: analytics.readinessLabel ?? 'Building momentum',
      nextTopics: analytics.nextTopics ?? [],
    }
  }, [analytics])

  const studyMap = useMemo(() => {
    return new Map(studyItems.map((item) => [String(item.questionId), item]))
  }, [studyItems])

  useEffect(() => {
    if (activeView !== 'test' || !generatedTest.length || testState.result) return undefined

    if (!testTimer) {
      setTestTimer(generatedTest.length * 90)
    }

    const interval = window.setInterval(() => {
      setTestTimer((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [activeView, generatedTest.length, testState.result, testTimer])

  useEffect(() => {
    if (activeView !== 'test' || testTimer !== 0 || !generatedTest.length || testState.result) return

    setTestState((current) => ({
      ...current,
      loading: false,
      message: 'Time is up. Submit what you answered or try a retake.',
    }))
  }, [activeView, generatedTest.length, testState.result, testTimer])

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds)
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0')
    const remaining = String(safeSeconds % 60).padStart(2, '0')
    return `${minutes}:${remaining}`
  }

  const analyticsCharts = useMemo(() => {
    if (!analytics) return null

    const weeklyTrend = (analytics.trend ?? []).slice(-7)
    const maxWeekly = Math.max(...weeklyTrend.map((item) => item.accuracy || 0), 100)
    const weeklyBars = weeklyTrend.map((item) => ({
      label: new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' }),
      value: item.accuracy,
      height: `${Math.max(12, Math.round(((item.accuracy || 0) / maxWeekly) * 100))}%`,
    }))

    const phaseAccuracy = (analytics.phaseAccuracy ?? []).map((item) => ({
      label: item.phase,
      value: item.accuracy,
      height: `${Math.max(12, Math.round((item.accuracy / 100) * 100))}%`,
    }))

    return { weeklyBars, phaseAccuracy }
  }, [analytics])

  const derivedResult = useMemo(() => {
    const result = testState.result
    if (!result) return null

    const sourceTopics = Array.isArray(result.improvementAreas)
      ? result.improvementAreas
      : (result.topicBreakdown ?? []).map((item) => ({
          topic: item.topic,
          accuracy: item.accuracy,
          correct: item.correct,
          total: item.total,
        }))

    const orderedTopics = [...sourceTopics].sort((a, b) => Number(a.accuracy) - Number(b.accuracy))
    const weakAreas = Array.isArray(result.weakAreas)
      ? result.weakAreas
      : orderedTopics.filter((item) => Number(item.accuracy) < 60).slice(0, 5)

    return {
      score: result.score,
      total: result.total,
      accuracy: result.accuracy,
      improvementAreas: orderedTopics,
      weakAreas,
    }
  }, [testState.result])

  const loadProfile = async (authToken) => {
    const [me, progressData, overviewData] = await Promise.all([
      request('/auth/me', { token: authToken }),
      request('/progress', { token: authToken }),
      request('/analytics/overview', { token: authToken }),
    ])

    setUser(me.user)
    setProgress(progressData)
    setAnalytics(overviewData)
  }

  const loadStudyItems = async (authToken, questionIds = []) => {
    const query = questionIds.length ? `?questionIds=${questionIds.join(',')}` : ''
    const data = await request(`/study${query}`, { token: authToken })
    setStudyItems(data.items ?? [])
  }

  const upsertStudyItem = async ({ questionId, phase, topic, bookmarked, note }) => {
    if (!token) return

    setStudyMessage('')
    setStudySavingId(String(questionId))

    try {
      const data = await request('/study', {
        method: 'POST',
        token,
        body: { questionId, phase, topic, bookmarked, note },
      })

      setStudyItems((current) => {
        const filtered = current.filter((item) => String(item.questionId) !== String(questionId))
        return [data.item, ...filtered]
      })
    } catch (error) {
      setStudyMessage(error.message)
    } finally {
      setStudySavingId('')
    }
  }

  const removeStudyItem = async (questionId) => {
    if (!token) return

    setStudySavingId(String(questionId))

    try {
      await request(`/study/${questionId}`, { method: 'DELETE', token })
      setStudyItems((current) => current.filter((item) => String(item.questionId) !== String(questionId)))
      setStudyDrafts((current) => {
        const next = { ...current }
        delete next[questionId]
        return next
      })
    } catch (error) {
      setStudyMessage(error.message)
    } finally {
      setStudySavingId('')
    }
  }

  useEffect(() => {
    if (!token) {
      setBooting(false)
      return
    }

    let active = true
    const bootstrap = async () => {
      try {
        await loadProfile(token)
        await loadStudyItems(token)
      } catch (error) {
        if (!active) return
        localStorage.removeItem(TOKEN_KEY)
        setToken('')
        setUser(null)
        setProgress(null)
        setAuthMessage(error.message)
      } finally {
        if (active) setBooting(false)
      }
    }

    void bootstrap()
    return () => {
      active = false
    }
  }, [token])

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthMessage('')

    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login'
      const payload = { email: authForm.email, password: authForm.password }
      if (authMode === 'register') payload.name = authForm.name

      const data = await request(endpoint, { method: 'POST', body: payload })
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      await loadProfile(data.token)
      await loadStudyItems(data.token)
      setAuthMessage(authMode === 'register' ? 'Account created successfully.' : 'Logged in successfully.')
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setUser(null)
    setProgress(null)
    setActiveView('dashboard')
    setGeneratedTest([])
    setAnswers({})
    setTestState({ loading: false, message: '', result: null })
    setStudyMessage('')
  }

  const handleChecklistToggle = async (phase, itemId, completed) => {
    if (!token) return
    const key = `${phase}:${itemId}`
    setChecklistSavingKey(key)

    try {
      await request(`/progress/${phase}/item`, {
        method: 'PATCH',
        token,
        body: { itemId, completed },
      })
      await request('/progress/daily-checkin', { method: 'POST', token })
      await loadProfile(token)
    } catch (error) {
      setTestState((current) => ({ ...current, message: error.message }))
    } finally {
      setChecklistSavingKey('')
    }
  }

  const handleResetProgress = async () => {
    if (!token || resettingProgress) return

    const shouldReset = window.confirm('Reset all checklist progress across every phase?')
    if (!shouldReset) return

    setResettingProgress(true)
    setDashboardMessage('')

    try {
      await request('/progress/reset', {
        method: 'POST',
        token,
      })
      await loadProfile(token)
      setDashboardMessage('All checklist progress has been reset.')
      setGeneratedTest([])
      setAnswers({})
      setTestState({ loading: false, message: '', result: null })
    } catch (error) {
      setDashboardMessage(error.message)
    } finally {
      setResettingProgress(false)
    }
  }

  const handleAddCustomChecklistItem = async (phase) => {
    if (!token) return

    const label = String(customChecklistDrafts[phase] ?? '').trim()
    if (!label) {
      setDashboardMessage('Enter a topic name before adding a custom checklist item.')
      return
    }

    setCustomChecklistSavingPhase(phase)
    setDashboardMessage('')

    try {
      await request(`/progress/${phase}/custom-item`, {
        method: 'POST',
        token,
        body: { label },
      })
      await request('/progress/daily-checkin', { method: 'POST', token })
      await loadProfile(token)
      setCustomChecklistDrafts((current) => ({ ...current, [phase]: '' }))
      setDashboardMessage(`Added custom checklist topic to ${phase}.`)
    } catch (error) {
      setDashboardMessage(error.message)
    } finally {
      setCustomChecklistSavingPhase('')
    }
  }

  const handleRemoveCustomChecklistItem = async (phase, itemId) => {
    if (!token) return

    const key = `${phase}:${itemId}`
    setChecklistSavingKey(key)
    setDashboardMessage('')

    try {
      await request(`/progress/${phase}/custom-item/${itemId}`, {
        method: 'DELETE',
        token,
      })
      await request('/progress/daily-checkin', { method: 'POST', token })
      await loadProfile(token)
      setDashboardMessage('Removed custom checklist topic.')
    } catch (error) {
      setDashboardMessage(error.message)
    } finally {
      setChecklistSavingKey('')
    }
  }

  const handleTakeTest = async (phase) => {
    if (!token) return

    if (!isPhaseTestUnlocked(phase)) {
      setTestState({
        loading: false,
        message: `Complete all checklist items for ${phase} before taking its test.`,
        result: null,
      })
      return
    }

    setActiveView('test')
    setSelectedPhase(phase)
    setGeneratedTest([])
    setAnswers({})
    setRetakeState({ questionIds: [], phase })
    setTestTimer(0)
    setTestState({ loading: true, message: `Generating ${phase} test...`, result: null })

    try {
      const data = await request('/tests/generate', {
        method: 'POST',
        token,
        body: { phase, limit: PHASE_TEST_QUESTION_COUNT, adaptive: false, difficulty: null },
      })

      setGeneratedTest(data.questions ?? [])
      setTestTimer((data.questions?.length ?? PHASE_TEST_QUESTION_COUNT) * 90)
      setTestState({ loading: false, message: `${data.count} questions loaded for ${phase}.`, result: null })
      await loadStudyItems(token, (data.questions ?? []).map((question) => question._id))
    } catch (error) {
      setTestState({ loading: false, message: error.message, result: null })
    }
  }

  const handleRetakeWrongQuestions = async () => {
    if (!token || !retakeState.questionIds.length) return

    setActiveView('test')
    setSelectedPhase(retakeState.phase || selectedPhase)
    setGeneratedTest([])
    setAnswers({})
    setTestTimer(0)
    setTestState({ loading: true, message: 'Preparing wrong-question retake...', result: null })

    try {
      const data = await request('/tests/generate', {
        method: 'POST',
        token,
        body: {
          phase: retakeState.phase || selectedPhase,
          limit: retakeState.questionIds.length,
          adaptive: false,
          retakeQuestionIds: retakeState.questionIds,
        },
      })

      setGeneratedTest(data.questions ?? [])
      setTestTimer((data.questions?.length ?? retakeState.questionIds.length) * 90)
      setTestState({ loading: false, message: 'Retake loaded with wrong questions.', result: null })
    } catch (error) {
      setTestState({ loading: false, message: error.message, result: null })
    }
  }

  const goToDashboard = () => {
    setActiveView('dashboard')
  }

  const handleSubmitTest = async () => {
    if (!token || !generatedTest.length) return

    const answerList = generatedTest.map((question) => ({
      questionId: question._id,
      selectedAnswer: answers[question._id] ?? '',
    }))

    if (answerList.some((item) => !item.selectedAnswer)) {
      setTestState((current) => ({ ...current, message: 'Please answer all questions before submitting.' }))
      return
    }

    setTestState((current) => ({ ...current, loading: true, message: 'Submitting test...' }))

    try {
      const data = await request('/tests/submit', {
        method: 'POST',
        token,
        body: {
          phase: selectedPhase,
          questionIds: generatedTest.map((item) => item._id),
          answers: answerList,
        },
      })

      setTestState({
        loading: false,
        message: 'Test submitted successfully.',
        result: data,
      })
      setRetakeState({
        phase: selectedPhase,
        questionIds: data.wrongQuestionIds ?? [],
      })
      await loadStudyItems(token, generatedTest.map((question) => question._id))
      await loadProfile(token)
    } catch (error) {
      setTestState({ loading: false, message: error.message, result: null })
    }
  }

  if (signedIn && booting) {
    return (
      <main className="dashboard-page">
        <section className="overall-progress-card loading-card">
          <p className="project-tag">{PROJECT_NAME}</p>
          <h1>Loading your dashboard</h1>
          <p className="hint-text">Fetching progress, analytics, and saved study items.</p>
        </section>
      </main>
    )
  }

  if (!signedIn) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="project-tag">Welcome to {PROJECT_NAME}</p>
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

          <button className="switch-mode" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
            {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>

          {authMessage ? <p className="status-text">{authMessage}</p> : null}
        </section>
      </main>
    )
  }

  if (activeView === 'test') {
    return (
      <main className="test-page">
        <header className="test-topbar">
          <button className="back-button" onClick={goToDashboard}>Back to dashboard</button>
          <div>
            <p className="project-tag">{PROJECT_NAME}</p>
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

          {testState.message ? <p className="status-text">{testState.message}</p> : null}

          {derivedResult ? (
            <section className="result-section">
              <p className="result-text">
                Score: {derivedResult.score}/{derivedResult.total} ({derivedResult.accuracy}%)
              </p>

              <div className="improvement-box">
                <h3>Sections to improve</h3>
                {derivedResult.weakAreas.length ? (
                  <ul className="improvement-list">
                    {derivedResult.weakAreas.slice(0, 3).map((item) => (
                      <li key={`weak-${item.topic}`}>
                        {item.topic}: {item.correct}/{item.total} correct ({item.accuracy}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="hint-text">Great work. No weak section found below 60% in this test.</p>
                )}
              </div>
            </section>
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
                      <label key={option}>
                        <input
                          type="radio"
                          name={question._id}
                          checked={answers[question._id] === option}
                          onChange={() => setAnswers((current) => ({ ...current, [question._id]: option }))}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>

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
          ) : (
            <p className="hint-text">Preparing your test. If this takes long, go back and start again.</p>
          )}

          {studyMessage ? <p className="status-text">{studyMessage}</p> : null}

        </section>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="project-tag">Welcome to {PROJECT_NAME}</p>
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
        <section className="analytics-grid">
          <article className="analytics-card">
            <div className="analytics-head">
              <div>
                <p className="project-tag">Weekly progress</p>
                <h3>Last 7 tests</h3>
              </div>
            </div>
            <div className="bar-chart">
              {analyticsCharts.weeklyBars.length ? analyticsCharts.weeklyBars.map((bar) => (
                <div key={`${bar.label}-${bar.value}`} className="bar-item">
                  <div className="bar-track">
                    <span style={{ height: bar.height }} />
                  </div>
                  <strong>{bar.value}%</strong>
                  <span>{bar.label}</span>
                </div>
              )) : <p className="hint-text">Complete tests to see weekly progress.</p>}
            </div>
          </article>

          <article className="analytics-card">
            <div className="analytics-head">
              <div>
                <p className="project-tag">Subject accuracy</p>
                <h3>Accuracy by phase</h3>
              </div>
            </div>
            <div className="bar-chart subject-chart">
              {analyticsCharts.phaseAccuracy.length ? analyticsCharts.phaseAccuracy.map((bar) => (
                <div key={bar.label} className="bar-item">
                  <div className="bar-track subject-track">
                    <span style={{ height: bar.height }} />
                  </div>
                  <strong>{bar.value}%</strong>
                  <span>{bar.label}</span>
                </div>
              )) : <p className="hint-text">Take at least one test to see subject accuracy.</p>}
            </div>
          </article>
        </section>
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
        {ORDERED_PHASES.map((phase) => {
          const phaseProgress = getPhaseProgress(phase.code)
          const canTakeTest = isPhaseTestUnlocked(phase.code)
          const isOpen = selectedPhase === phase.code
          const baseTopics = CHECKLIST_TOPICS[phase.code] ?? []
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

export default App
