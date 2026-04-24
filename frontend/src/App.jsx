import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const AuthScreen = lazy(() => import('./components/AuthScreen.jsx'))
const TestScreen = lazy(() => import('./components/TestScreen.jsx'))
const DashboardScreen = lazy(() => import('./components/DashboardScreen.jsx'))

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
const TOKEN_KEY = 'preptrack_token'
const PROJECT_NAME = 'PrepTrack AI'
const PHASE_TEST_QUESTION_COUNT = 10

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

const DSA_PRACTICE_LINKS = {
  'dsa-time-space-complexity': 'https://leetcode.com/problem-list/oizxjoit/',
  'dsa-arrays': 'https://leetcode.com/tag/array/',
  'dsa-strings': 'https://leetcode.com/tag/string/',
  'dsa-hashing': 'https://leetcode.com/tag/hash-table/',
  'dsa-linked-list': 'https://leetcode.com/tag/linked-list/',
  'dsa-stack': 'https://leetcode.com/tag/stack/',
  'dsa-queue': 'https://leetcode.com/tag/queue/',
  'dsa-recursion': 'https://leetcode.com/tag/recursion/',
  'dsa-binary-search': 'https://leetcode.com/tag/binary-search/',
  'dsa-trees-bst': 'https://leetcode.com/tag/tree/',
  'dsa-heaps': 'https://leetcode.com/tag/heap-priority-queue/',
  'dsa-graphs': 'https://leetcode.com/tag/graph/',
  'dsa-backtracking': 'https://leetcode.com/tag/backtracking/',
  'dsa-dynamic-programming': 'https://leetcode.com/tag/dynamic-programming/',
}

const defaultAuth = { name: '', email: '', password: '' }

const stripPracticeSetSuffix = (value) =>
  String(value || '').replace(/\s*\(\s*practice\s*set\s*\d+\s*\)\s*$/i, '')

const normalizeQuestionText = (value) =>
  stripPracticeSetSuffix(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const uniqueQuestionsByText = (questions) => {
  const seen = new Set()
  return (questions ?? []).filter((question) => {
    const key = normalizeQuestionText(question?.question) || String(question?._id)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

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
  const [servedQuestionIdsByPhase, setServedQuestionIdsByPhase] = useState({})
  const [toasts, setToasts] = useState([])
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [showAllWeakAreas, setShowAllWeakAreas] = useState(false)
  const toastIdRef = useRef(0)
  const toastTimeoutsRef = useRef(new Map())

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

    const noMeasuredLearningYet =
      Number(analytics.progress?.overallPercent ?? 0) === 0 &&
      Number(analytics.accuracy?.overallAccuracy ?? 0) === 0

    const readinessScore = noMeasuredLearningYet ? 0 : analytics.readinessScore ?? 0

    return {
      readinessScore,
      readinessLabel: analytics.readinessLabel ?? 'Building momentum',
      nextTopics: analytics.nextTopics ?? [],
    }
  }, [analytics])

  const studyMap = useMemo(() => {
    return new Map(studyItems.map((item) => [String(item.questionId), item]))
  }, [studyItems])

  const scheduleToastRemoval = (id, timeoutMs = 4200) => {
    const existingTimeout = toastTimeoutsRef.current.get(id)
    if (existingTimeout) {
      window.clearTimeout(existingTimeout)
    }

    const timeoutId = window.setTimeout(() => {
      toastTimeoutsRef.current.delete(id)
      setToasts((current) => current.filter((item) => item.id !== id))
    }, timeoutMs)

    toastTimeoutsRef.current.set(id, timeoutId)
  }

  const clearToastTimer = (id) => {
    const timeoutId = toastTimeoutsRef.current.get(id)
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      toastTimeoutsRef.current.delete(id)
    }
  }

  const pushToast = (message, variant = 'info') => {
    if (!message) return

    const id = `toast-${Date.now()}-${toastIdRef.current++}`
    setToasts((current) => [...current, { id, message, variant }])
    scheduleToastRemoval(id, 4200)
  }

  const dismissToast = (id) => {
    clearToastTimer(id)
    setToasts((current) => current.filter((item) => item.id !== id))
  }

  const resetAuthForm = () => {
    setAuthForm(defaultAuth)
    setAuthMessage('')
    setAuthLoading(false)
  }

  const handleToastMouseEnter = (id) => {
    clearToastTimer(id)
  }

  const handleToastMouseLeave = (id) => {
    scheduleToastRemoval(id, 2200)
  }

  useEffect(() => {
    if (!authMessage) return
    pushToast(authMessage, /success|logged in|account created/i.test(authMessage) ? 'success' : 'error')
    setAuthMessage('')
  }, [authMessage])

  useEffect(() => {
    if (!dashboardMessage) return
    pushToast(dashboardMessage, /added|removed|reset/i.test(dashboardMessage) ? 'success' : 'error')
    setDashboardMessage('')
  }, [dashboardMessage])

  useEffect(() => {
    if (!studyMessage) return
    pushToast(studyMessage, 'error')
    setStudyMessage('')
  }, [studyMessage])

  useEffect(() => {
    if (!testState.message) return

    const message = testState.message
    const variant = /success|loaded|generating|preparing|submitting|time is up/i.test(message) ? 'info' : 'error'
    pushToast(message, variant)
    setTestState((current) => (current.message ? { ...current, message: '' } : current))
  }, [testState.message])

  useEffect(() => {
    // Whenever auth UI becomes active (new/ended session), start with a clean form.
    if (!signedIn && !booting) {
      resetAuthForm()
    }
  }, [signedIn, booting])

  useEffect(() => {
    return () => {
      toastTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
      toastTimeoutsRef.current.clear()
    }
  }, [])

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

    const weeklyTrendData = (analytics.trend ?? []).slice(-7).map((item) => ({
      day: new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' }),
      accuracy: Number(item.accuracy ?? 0),
      tests: Number(item.testsTaken ?? 0),
    }))

    const phaseAccuracyData = (analytics.phaseAccuracy ?? []).map((item) => ({
      phase: item.phase,
      accuracy: Number(item.accuracy ?? 0),
      tests: Number(item.testsTaken ?? 0),
    }))

    return { weeklyTrendData, phaseAccuracyData }
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
      questionReview: Array.isArray(result.questionReview) ? result.questionReview : [],
    }
  }, [testState.result])

  const reviewByQuestionId = useMemo(() => {
    if (!derivedResult?.questionReview?.length) return new Map()

    return new Map(
      derivedResult.questionReview.map((item) => [
        String(item.questionId),
        {
          selectedAnswer: item.selectedAnswer,
          correctAnswer: item.correctAnswer,
          isCorrect: Boolean(item.isCorrect),
        },
      ])
    )
  }, [derivedResult])

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

  const handleAuthModeChange = (nextMode) => {
    setAuthMode(nextMode)
    resetAuthForm()
  }

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setUser(null)
    setProgress(null)
    setAnalytics(null)
    setStudyItems([])
    setStudyDrafts({})
    setStudyMessage('')
    setStudySavingId('')
    setActiveView('dashboard')
    setGeneratedTest([])
    setAnswers({})
    setTestState({ loading: false, message: '', result: null })
    setRetakeState({ questionIds: [], phase: '' })
    setTestTimer(0)
    setDashboardMessage('')
    setAuthMode('login')
    resetAuthForm()
    setChecklistQuery('')
    setChecklistSavingKey('')
    setCustomChecklistDrafts({})
    setCustomChecklistSavingPhase('')
    setResettingProgress(false)
    setResetConfirmOpen(false)
    setResultModalOpen(false)
    setShowAllWeakAreas(false)
    setServedQuestionIdsByPhase({})
  }

  const handleChecklistToggle = async (phase, itemId, completed) => {
    if (!token) return
    const key = `${phase}:${itemId}`
    setChecklistSavingKey(key)

    const applyOptimisticProgress = (targetCompleted) => {
      setProgress((current) => {
        if (!current) return current

        const next = {
          ...current,
          phaseWise: [...(current.phaseWise ?? [])],
          phaseDetails: [...(current.phaseDetails ?? [])],
        }

        const detailIndex = next.phaseDetails.findIndex((item) => item.phase === phase)
        if (detailIndex === -1) return current

        const detail = { ...next.phaseDetails[detailIndex] }
        const completedItems = new Set(detail.completedItems ?? [])
        if (targetCompleted) completedItems.add(itemId)
        else completedItems.delete(itemId)
        detail.completedItems = [...completedItems]
        next.phaseDetails[detailIndex] = detail

        const phaseIndex = next.phaseWise.findIndex((item) => item.phase === phase)
        if (phaseIndex !== -1) {
          const phaseItem = { ...next.phaseWise[phaseIndex] }
          phaseItem.completed = detail.completedItems.length
          phaseItem.total = Number(phaseItem.total ?? detail.totalItems ?? 0)
          phaseItem.percent = phaseItem.total ? Number(((phaseItem.completed / phaseItem.total) * 100).toFixed(2)) : 0
          phaseItem.isComplete = phaseItem.total > 0 && phaseItem.completed >= phaseItem.total
          next.phaseWise[phaseIndex] = phaseItem
        }

        const totalCompleted = next.phaseWise.reduce((sum, item) => sum + Number(item.completed ?? 0), 0)
        const totalItems = next.phaseWise.reduce((sum, item) => sum + Number(item.total ?? 0), 0)

        next.totalCompleted = totalCompleted
        next.totalItems = totalItems
        next.overallPercent = totalItems ? Number(((totalCompleted / totalItems) * 100).toFixed(2)) : 0

        return next
      })
    }

    applyOptimisticProgress(completed)

    try {
      await Promise.all([
        request(`/progress/${phase}/item`, {
          method: 'PATCH',
          token,
          body: { itemId, completed },
        }),
        request('/progress/daily-checkin', { method: 'POST', token }),
      ])

      const refreshedProgress = await request('/progress', { token })
      setProgress(refreshedProgress)
    } catch (error) {
      applyOptimisticProgress(!completed)
      setTestState((current) => ({ ...current, message: error.message }))
    } finally {
      setChecklistSavingKey('')
    }
  }

  const handleResetProgress = async () => {
    if (!token || resettingProgress) return

    setResetConfirmOpen(true)
  }

  const confirmResetProgress = async () => {
    if (!token || resettingProgress) return

    setResettingProgress(true)
    setResetConfirmOpen(false)
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
      setResultModalOpen(false)
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
    setResultModalOpen(false)
    setShowAllWeakAreas(false)
    setGeneratedTest([])
    setAnswers({})
    setRetakeState({ questionIds: [], phase })
    setTestTimer(0)
    setTestState({ loading: true, message: `Generating ${phase} test...`, result: null })

    try {
      const data = await request('/tests/generate', {
        method: 'POST',
        token,
        body: {
          phase,
          limit: PHASE_TEST_QUESTION_COUNT,
          adaptive: false,
          difficulty: null,
          excludeQuestionIds: servedQuestionIdsByPhase[phase] ?? [],
        },
      })

      if (!(data.questions ?? []).length) {
        setTestState({
          loading: false,
          message: `No questions available for ${phase}. Please seed your database and try again.`,
          result: null,
        })
        return
      }

      const uniqueQuestions = uniqueQuestionsByText(data.questions ?? [])
      if (uniqueQuestions.length < PHASE_TEST_QUESTION_COUNT) {
        setTestState({
          loading: false,
          message: `Only ${uniqueQuestions.length} unique questions were returned for ${phase}. Please try again.`,
          result: null,
        })
        return
      }

      setGeneratedTest(uniqueQuestions)
      setServedQuestionIdsByPhase((current) => {
        const existing = current[phase] ?? []
        const next = new Set([...existing, ...uniqueQuestions.map((question) => String(question._id))])
        return { ...current, [phase]: [...next] }
      })
      setTestTimer((uniqueQuestions.length ?? PHASE_TEST_QUESTION_COUNT) * 90)
      setTestState({ loading: false, message: `${data.count} questions loaded for ${phase}.`, result: null })
      await loadStudyItems(token, uniqueQuestions.map((question) => question._id))
    } catch (error) {
      setTestState({ loading: false, message: error.message, result: null })
    }
  }

  const handleRetakeWrongQuestions = async () => {
    if (!token || !retakeState.questionIds.length) return

    setActiveView('test')
    setSelectedPhase(retakeState.phase || selectedPhase)
    setResultModalOpen(false)
    setShowAllWeakAreas(false)
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

      if (!(data.questions ?? []).length) {
        setTestState({
          loading: false,
          message: 'No questions available for retake right now. Please try a fresh test.',
          result: null,
        })
        return
      }

      const uniqueQuestions = uniqueQuestionsByText(data.questions ?? [])
      setGeneratedTest(uniqueQuestions)
      setTestTimer((uniqueQuestions.length ?? retakeState.questionIds.length) * 90)
      setTestState({ loading: false, message: 'Retake loaded with wrong questions.', result: null })
    } catch (error) {
      setTestState({ loading: false, message: error.message, result: null })
    }
  }

  const goToDashboard = () => {
    setActiveView('dashboard')
    setResultModalOpen(false)
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
      setResultModalOpen(true)
      setShowAllWeakAreas(false)
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

  const displayedWeakAreas =
    derivedResult?.weakAreas && !showAllWeakAreas
      ? derivedResult.weakAreas.slice(0, 3)
      : derivedResult?.weakAreas ?? []

  const overlays = (
    <>
      {resetConfirmOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="app-modal" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
            <h3 id="reset-modal-title">Reset Checklist Progress</h3>
            <p className="progress-text">This will remove completed checklist state across every phase. This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={() => setResetConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="danger-button" onClick={() => void confirmResetProgress()}>
                Yes, reset
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {resultModalOpen && derivedResult ? (
        <div className="modal-backdrop" role="presentation">
          <section className="app-modal result-modal" role="dialog" aria-modal="true" aria-labelledby="result-modal-title">
            <div className="modal-head">
              <h3 id="result-modal-title">Test result summary</h3>
              <button type="button" className="ghost-button" onClick={() => setResultModalOpen(false)}>
                Close
              </button>
            </div>

            <p className="result-text">
              Score: {derivedResult.score}/{derivedResult.total} ({derivedResult.accuracy}%)
            </p>

            <div className="improvement-box">
              <h3>Sections to improve</h3>
              {displayedWeakAreas.length ? (
                <ul className="improvement-list">
                  {displayedWeakAreas.map((item) => (
                    <li key={`modal-weak-${item.topic}`}>
                      {item.topic}: {item.correct}/{item.total} correct ({item.accuracy}%)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="hint-text">Great work. No weak section found below 60% in this test.</p>
              )}

              {derivedResult.weakAreas.length > 3 ? (
                <button className="show-more-button" onClick={() => setShowAllWeakAreas((current) => !current)}>
                  {showAllWeakAreas ? 'Show fewer sections' : `Show more (${derivedResult.weakAreas.length - 3} more)`}
                </button>
              ) : null}
            </div>

            <div className="modal-actions">
              {retakeState.questionIds.length ? (
                <button
                  type="button"
                  className="take-test"
                  onClick={() => {
                    setResultModalOpen(false)
                    void handleRetakeWrongQuestions()
                  }}
                >
                  Reattempt wrong questions ({retakeState.questionIds.length})
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {toasts.length ? (
        <section className="toast-stack" aria-live="polite" aria-label="Notifications">
          {toasts.map((toast) => (
            <article
              key={toast.id}
              className={`toast-item toast-${toast.variant}`}
              onMouseEnter={() => handleToastMouseEnter(toast.id)}
              onMouseLeave={() => handleToastMouseLeave(toast.id)}
            >
              <p>{toast.message}</p>
              <button type="button" className="toast-close" onClick={() => dismissToast(toast.id)}>
                Dismiss
              </button>
            </article>
          ))}
        </section>
      ) : null}
    </>
  )

  if (signedIn && booting) {
    return (
      <>
        <main className="dashboard-page">
          <section className="overall-progress-card loading-card">
            <p className="project-tag">{PROJECT_NAME}</p>
            <h1>Loading your dashboard</h1>
            <p className="hint-text">Fetching progress, analytics, and saved study items.</p>
          </section>
        </main>
        {overlays}
      </>
    )
  }

  if (!signedIn) {
    return (
      <>
        <Suspense fallback={<p className="hint-text">Loading sign-in screen...</p>}>
          <AuthScreen
            projectName={PROJECT_NAME}
            authMode={authMode}
            authForm={authForm}
            setAuthForm={setAuthForm}
            handleAuthSubmit={handleAuthSubmit}
            authLoading={authLoading}
            booting={booting}
            setAuthMode={handleAuthModeChange}
          />
        </Suspense>
        {overlays}
      </>
    )
  }

  if (activeView === 'test') {
    return (
      <>
        <Suspense fallback={<p className="hint-text">Loading test screen...</p>}>
          <TestScreen
            projectName={PROJECT_NAME}
            selectedPhase={selectedPhase}
            goToDashboard={goToDashboard}
            handleLogout={handleLogout}
            answeredCount={answeredCount}
            generatedTest={generatedTest}
            testTimer={testTimer}
            formatTime={formatTime}
            handleSubmitTest={handleSubmitTest}
            testState={testState}
            retakeState={retakeState}
            handleRetakeWrongQuestions={handleRetakeWrongQuestions}
            openResultModal={() => setResultModalOpen(true)}
            studySavingId={studySavingId}
            studyMap={studyMap}
            studyDrafts={studyDrafts}
            upsertStudyItem={upsertStudyItem}
            answers={answers}
            setAnswers={setAnswers}
            reviewByQuestionId={reviewByQuestionId}
            setStudyDrafts={setStudyDrafts}
            removeStudyItem={removeStudyItem}
          />
        </Suspense>
        {overlays}
      </>
    )
  }

  return (
    <>
      <Suspense fallback={<p className="hint-text">Loading dashboard...</p>}>
        <DashboardScreen
          projectName={PROJECT_NAME}
          user={user}
          handleLogout={handleLogout}
          overallPercent={overallPercent}
          progress={progress}
          handleResetProgress={handleResetProgress}
          resettingProgress={resettingProgress}
          aiSummary={aiSummary}
          analyticsCharts={analyticsCharts}
          studyItems={studyItems}
          orderedPhases={ORDERED_PHASES}
          getPhaseProgress={getPhaseProgress}
          isPhaseTestUnlocked={isPhaseTestUnlocked}
          selectedPhase={selectedPhase}
          setChecklistQuery={setChecklistQuery}
          setSelectedPhase={setSelectedPhase}
          handleTakeTest={handleTakeTest}
          checklistTopics={CHECKLIST_TOPICS}
          phaseDetailsMap={phaseDetailsMap}
          checklistQuery={checklistQuery}
          customChecklistDrafts={customChecklistDrafts}
          setCustomChecklistDrafts={setCustomChecklistDrafts}
          handleAddCustomChecklistItem={handleAddCustomChecklistItem}
          customChecklistSavingPhase={customChecklistSavingPhase}
          handleChecklistToggle={handleChecklistToggle}
          checklistSavingKey={checklistSavingKey}
          completedSet={completedSet}
          handleRemoveCustomChecklistItem={handleRemoveCustomChecklistItem}
          dsaPracticeLinks={DSA_PRACTICE_LINKS}
        />
      </Suspense>
      {overlays}
    </>
  )
}

export default App
