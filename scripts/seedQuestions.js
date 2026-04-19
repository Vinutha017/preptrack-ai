const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Question = require("../src/models/Question");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/preptrack_ai";
const TARGET_QUESTIONS_PER_PHASE = 30;
const PHASES = ["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS"];

const q = (phase, topic, difficulty, interviewWeight, question, options, answerIndex) => ({
  phase,
  topic,
  difficulty,
  interviewWeight,
  isInterviewFavorite: true,
  question,
  options,
  answer: options[answerIndex],
});

const INTERVIEW_QUESTION_BANK = [
  q("DSA", "Arrays", "medium", 10, "Which algorithm finds the maximum sum subarray in O(n)?", ["Merge Sort", "Kadane's Algorithm", "Binary Search", "Dijkstra's Algorithm"], 1),
  q("DSA", "Trees", "easy", 8, "In a Binary Search Tree, where are values smaller than a node stored?", ["Left subtree", "Right subtree", "Both sides randomly", "Only in leaves"], 0),
  q("DSA", "Linked List", "medium", 9, "What is the time complexity to insert at the head of a singly linked list?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 0),
  q("DSA", "Graphs", "medium", 9, "Which traversal finds shortest path in an unweighted graph?", ["DFS", "BFS", "Inorder", "Prim"], 1),
  q("DSA", "Dynamic Programming", "hard", 8, "What is the key idea of dynamic programming?", ["Randomization", "Greedy local choices only", "Store overlapping subproblem results", "Use only recursion"], 2),
  q("DSA", "Hashing", "easy", 7, "Expected average lookup time in a hash table is:", ["O(1)", "O(log n)", "O(n)", "O(n^2)"], 0),
  q("DSA", "Stack", "easy", 7, "Which data structure is used for function call management in most languages?", ["Queue", "Stack", "Heap", "Graph"], 1),
  q("DSA", "Queue", "easy", 7, "A queue follows which order?", ["LIFO", "FIFO", "Sorted order", "Random order"], 1),
  q("DSA", "Recursion", "medium", 8, "What must every recursive function have to avoid infinite calls?", ["A loop", "A base case", "A queue", "A hash map"], 1),
  q("DSA", "Sorting", "medium", 8, "Which sort is stable by default in its common implementation?", ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"], 2),

  q("DBMS", "Normalization", "medium", 10, "A table is in 3NF if it is in 2NF and has no:", ["Foreign keys", "Candidate keys", "Transitive dependency", "Primary key"], 2),
  q("DBMS", "SQL", "easy", 8, "Which SQL clause is used to filter grouped records?", ["WHERE", "HAVING", "ORDER BY", "DISTINCT"], 1),
  q("DBMS", "Joins", "medium", 9, "Which join returns only matching rows from both tables?", ["LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "INNER JOIN"], 3),
  q("DBMS", "Transactions", "medium", 9, "Which ACID property ensures completed transaction changes are permanent?", ["Atomicity", "Consistency", "Isolation", "Durability"], 3),
  q("DBMS", "Indexing", "medium", 8, "Primary purpose of an index is to:", ["Reduce storage", "Speed up data retrieval", "Enforce foreign key", "Encrypt records"], 1),
  q("DBMS", "Keys", "easy", 7, "A foreign key is used to:", ["Uniquely identify each row in same table", "Create relation between two tables", "Sort rows alphabetically", "Compress table data"], 1),
  q("DBMS", "Transactions", "hard", 8, "Dirty read occurs when a transaction reads:", ["Only committed data", "Uncommitted data from another transaction", "Its own old snapshot", "Data after checkpoint only"], 1),
  q("DBMS", "Views", "easy", 7, "A SQL view is best described as:", ["A physical table copy", "A virtual table based on a query", "An index structure", "A transaction log"], 1),
  q("DBMS", "Joins", "medium", 8, "Which join keeps all rows from left table and matched rows from right table?", ["LEFT JOIN", "INNER JOIN", "CROSS JOIN", "SELF JOIN"], 0),
  q("DBMS", "Constraints", "easy", 7, "Which constraint prevents NULL values in a column?", ["UNIQUE", "CHECK", "NOT NULL", "DEFAULT"], 2),

  q("OS", "Processes", "easy", 8, "A process is:", ["A program in execution", "Only source code file", "A CPU core", "A system call"], 0),
  q("OS", "Threads", "medium", 8, "Threads of same process share:", ["Different address spaces", "Code and heap memory", "Only CPU registers", "Different file descriptors always"], 1),
  q("OS", "Scheduling", "medium", 9, "Which scheduling algorithm can cause starvation?", ["Round Robin", "FCFS", "SJF", "FIFO with quantum"], 2),
  q("OS", "Deadlocks", "medium", 10, "Which is NOT a Coffman deadlock condition?", ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], 2),
  q("OS", "Memory Management", "medium", 8, "Paging helps to:", ["Eliminate process creation", "Implement virtual memory", "Avoid CPU scheduling", "Remove context switches"], 1),
  q("OS", "Synchronization", "medium", 8, "Semaphore is mainly used for:", ["Memory allocation", "Process/thread synchronization", "File compression", "Network routing"], 1),
  q("OS", "Scheduling", "easy", 7, "Round Robin scheduling is best for:", ["Batch jobs only", "Time-sharing systems", "No preemption scenarios", "Single process systems"], 1),
  q("OS", "Virtual Memory", "medium", 8, "Page fault occurs when:", ["CPU is overheated", "Required page is not in RAM", "Disk is full", "Compiler finds error"], 1),
  q("OS", "Deadlocks", "hard", 8, "Banker's algorithm is used for:", ["Deadlock prevention", "Deadlock avoidance", "Deadlock detection only", "CPU allocation"], 1),
  q("OS", "Disk Scheduling", "medium", 7, "Which algorithm serves request closest to current head first?", ["FCFS", "SSTF", "SCAN", "C-SCAN"], 1),

  q("CN", "OSI Model", "easy", 8, "Routing is primarily handled at which OSI layer?", ["Transport", "Network", "Session", "Data Link"], 1),
  q("CN", "TCP", "medium", 10, "Why is TCP called connection-oriented?", ["It broadcasts by default", "It establishes session before transfer", "It never checks errors", "It only works on LAN"], 1),
  q("CN", "UDP", "easy", 8, "UDP is preferred for real-time streaming mainly because it:", ["Guarantees delivery", "Has lower overhead", "Uses 3-way handshake", "Provides congestion window"], 1),
  q("CN", "IP Addressing", "medium", 8, "IPv4 address length is:", ["32 bits", "64 bits", "128 bits", "16 bits"], 0),
  q("CN", "DNS", "easy", 7, "DNS translates:", ["IP to MAC", "Domain names to IP addresses", "HTTP to HTTPS", "TCP to UDP"], 1),
  q("CN", "HTTP/HTTPS", "easy", 7, "HTTPS adds which security feature over HTTP?", ["Compression", "Encryption using TLS", "Faster DNS", "Lower latency always"], 1),
  q("CN", "Congestion Control", "medium", 8, "TCP slow start primarily helps to:", ["Increase congestion immediately", "Avoid sudden network overload", "Disable acknowledgements", "Replace retransmission"], 1),
  q("CN", "Routing", "medium", 8, "Which protocol is interior gateway routing protocol?", ["BGP", "RIP", "ARP", "ICMP"], 1),
  q("CN", "Subnetting", "medium", 8, "Subnet mask determines:", ["Transport protocol", "Network and host portions", "DNS server speed", "Port number range"], 1),
  q("CN", "TCP", "medium", 9, "TCP three-way handshake sequence is:", ["SYN, SYN-ACK, ACK", "ACK, SYN, FIN", "SYN, ACK, FIN", "FIN, FIN-ACK, ACK"], 0),

  q("VOCAB", "Synonyms", "easy", 9, "Choose the synonym of 'abundant'.", ["scarce", "plentiful", "fragile", "narrow"], 1),
  q("VOCAB", "Antonyms", "easy", 9, "Choose the antonym of 'optimistic'.", ["hopeful", "confident", "pessimistic", "energetic"], 2),
  q("VOCAB", "Idioms", "easy", 8, "'Break the ice' means:", ["Damage friendship", "Start a friendly interaction", "Stop talking", "Win the debate"], 1),
  q("VOCAB", "Phrasal Verbs", "medium", 8, "'Look up to' someone means:", ["Search online", "Respect and admire", "Ignore intentionally", "Challenge openly"], 1),
  q("VOCAB", "Contextual Usage", "medium", 9, "Fill in the blank: 'Her explanation was so ___ that everyone understood it quickly.'", ["vague", "lucid", "confusing", "ambiguous"], 1),
  q("VOCAB", "Synonyms", "easy", 8, "Choose the synonym of 'brief'.", ["short", "ancient", "careless", "massive"], 0),
  q("VOCAB", "Antonyms", "easy", 8, "Choose the antonym of 'expand'.", ["enlarge", "stretch", "contract", "extend"], 2),
  q("VOCAB", "Contextual Usage", "medium", 8, "Fill in the blank: 'The manager gave a ___ response, leaving no room for doubt.'", ["decisive", "hesitant", "vague", "casual"], 0),
  q("VOCAB", "Idioms", "easy", 7, "'Hit the sack' means:", ["Go to sleep", "Start exercise", "Pack luggage", "Quit job"], 0),
  q("VOCAB", "Phrasal Verbs", "medium", 8, "'Carry out a plan' means to:", ["Postpone it", "Execute it", "Ignore it", "Rewrite it"], 1),

  q("OOPS", "Classes and Objects", "easy", 8, "An object is:", ["Blueprint of a class", "Instance of a class", "Only a method", "Only an interface"], 1),
  q("OOPS", "Encapsulation", "medium", 9, "Encapsulation is best described as:", ["Combining data and methods with restricted access", "Multiple inheritance", "Only function overriding", "Direct global access to all fields"], 0),
  q("OOPS", "Inheritance", "easy", 8, "Inheritance allows a class to:", ["Hide all methods", "Acquire properties of another class", "Avoid object creation", "Disable polymorphism"], 1),
  q("OOPS", "Polymorphism", "medium", 10, "Method overriding demonstrates:", ["Compile-time polymorphism", "Run-time polymorphism", "No polymorphism", "Data hiding only"], 1),
  q("OOPS", "Abstraction", "medium", 8, "Abstraction means:", ["Showing only essential details", "Exposing all internal details", "Avoiding classes", "Removing constructors"], 0),
  q("OOPS", "Access Specifiers", "easy", 7, "Which access modifier gives the most restricted visibility?", ["public", "protected", "private", "default"], 2),
  q("OOPS", "Interfaces", "medium", 8, "An interface is primarily used to:", ["Store object state", "Define a contract of methods", "Replace constructors", "Create private inheritance"], 1),
  q("OOPS", "Constructors", "easy", 7, "Constructor is called when:", ["Object is created", "Object is deleted", "Method is overridden", "Exception is thrown"], 0),
  q("OOPS", "Polymorphism", "medium", 8, "Method overloading is an example of:", ["Run-time polymorphism", "Compile-time polymorphism", "Encapsulation", "Abstraction only"], 1),
  q("OOPS", "Dynamic Binding", "hard", 8, "Dynamic binding resolves method call at:", ["Compile time", "Run time", "Preprocessing time", "Link time only"], 1),
];

const buildQuestionVariant = (question, setNumber) => ({
  ...question,
  question: `${question.question} (Practice Set ${setNumber})`,
  // Keep favorites weighted high while introducing slightly varied priorities for generated sets.
  interviewWeight: Math.max(1, (question.interviewWeight || 1) - ((setNumber - 1) % 2)),
});

const buildPhaseDataset = (phase) => {
  const base = INTERVIEW_QUESTION_BANK.filter((item) => item.phase === phase);
  const output = [...base];

  if (!base.length) {
    return output;
  }

  let setNumber = 2;
  let index = 0;

  while (output.length < TARGET_QUESTIONS_PER_PHASE) {
    const source = base[index % base.length];
    output.push(buildQuestionVariant(source, setNumber));
    index += 1;

    if (index % base.length === 0) {
      setNumber += 1;
    }
  }

  return output;
};

const generateDataset = () => PHASES.flatMap((phase) => buildPhaseDataset(phase));

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding");

    const questions = generateDataset();
    await Question.deleteMany({});
    await Question.insertMany(questions);

    console.log(`Inserted ${questions.length} questions`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
})();
