"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import ResearchCertificate from "./components/ResearchCertificate";

type Agent = {
  name: string;
  role: string;
  icon: string;
  accent: string;
  description: string;
};

type EvidenceItem = {
  id: number;
  type: "NOTE" | "URL" | "FILE";
  title: string;
  content: string;
};

type Report = {
  title?: string;

  executiveSummary?: string;

  agents?: Array<{
    name: string;
    role: string;
    finding: string;
    evidence: string;
    concern: string;
  }>;

  metrics?: {
    evidence: number;
    feasibility: number;
    novelty: number;
    risk: number;
  };

  futureActions?: Array<{
    priority: string;
    action: string;
    reason: string;
    timeframe: string;
  }>;

  limitations?: string[];

  sources?: Array<{
    title: string;
    uri: string;
  }>;

  model?: string;
  provider?: string;
};

type AgentResearch =
  NonNullable<Report["agents"]>[number];

const agents: Agent[] = [
  {
    name: "Explorer",
    role: "Discovery",
    icon: "🔭",
    accent: "#7c3aed",
    description:
      "Discovers evidence, trends and relevant information.",
  },
  {
    name: "Scientist",
    role: "Evidence",
    icon: "🧪",
    accent: "#0891b2",
    description:
      "Tests claims and examines the quality of evidence.",
  },
  {
    name: "Engineer",
    role: "Systems",
    icon: "⚙️",
    accent: "#2563eb",
    description:
      "Breaks complex problems into systems and components.",
  },
  {
    name: "Critic",
    role: "Review",
    icon: "🔍",
    accent: "#dc2626",
    description:
      "Looks for weaknesses, contradictions and blind spots.",
  },
  {
    name: "Nova",
    role: "Synthesis",
    icon: "✦",
    accent: "#db2777",
    description:
      "Combines the team's research into a clear final brief.",
  },
];

const examples = [
  "How could humans build a sustainable Moon base?",
  "What are the biggest challenges in fusion energy?",
  "How will AI change scientific research?",
  "Could quantum computers transform drug discovery?",
];

/* =========================================================
   INSIGHT KEYWORDS
   ========================================================= */

function getInsightKeywords(
  item?: AgentResearch
): string[] {
  if (!item) return [];

  const stopWords = new Set([
    "about",
    "their",
    "there",
    "these",
    "those",
    "which",
    "would",
    "could",
    "should",
    "because",
    "through",
    "between",
    "where",
    "while",
    "using",
    "based",
    "research",
    "evidence",
    "analysis",
    "information",
    "important",
    "likely",
    "however",
    "without",
    "within",
    "across",
    "other",
    "might",
    "being",
    "after",
    "before",
    "under",
    "around",
    "against",
    "their",
    "first",
    "second",
    "still",
    "often",
    "also",
    "more",
    "most",
    "some",
    "many",
    "very",
    "than",
    "into",
    "from",
    "that",
    "this",
    "with",
    "have",
    "has",
    "will",
    "were",
    "been",
    "they",
    "them",
    "then",
    "when",
    "what",
    "where",
    "each",
    "only",
    "over",
    "such",
    "both",
    "does",
    "doesnt",
    "cannot",
    "can",
    "make",
    "made",
    "result",
    "results",
    "finding",
    "findings",
    "concern",
  ]);

  const text = [
    item.finding,
    item.evidence,
    item.concern,
  ].join(" ");

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 5 &&
        !stopWords.has(word)
    );

  const frequency = new Map<string, number>();

  words.forEach((word) => {
    frequency.set(
      word,
      (frequency.get(word) || 0) + 1
    );
  });

  return [...frequency.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0].localeCompare(b[0]);
    })
    .slice(0, 6)
    .map(
      ([word]) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    );
}


function getCertificateKeywords(value: string): string[] {
  const stopWords = new Set([
    "about", "could", "would", "should", "what", "how",
    "why", "when", "where", "which", "will", "can",
    "the", "and", "for", "with", "from", "into", "that",
    "this", "are", "is", "of", "to", "in", "on", "a", "an",
  ]);

  const words = value
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(
      (word) =>
        word.length >= 4 &&
        !stopWords.has(word.toLowerCase())
    );

  const unique: string[] = [];

  for (const word of words) {
    const formatted =
      word.charAt(0).toUpperCase() +
      word.slice(1);

    if (!unique.includes(formatted)) {
      unique.push(formatted);
    }

    if (unique.length === 5) break;
  }

  return unique.length > 0
    ? unique
    : [
        "Research",
        "Evidence",
        "Analysis",
        "Discovery",
      ];
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [userName, setUserName] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeAgent, setActiveAgent] = useState(0);
  const [report, setReport] =
    useState<Report | null>(null);
  const [error, setError] = useState("");

  const [sessionId, setSessionId] = useState("");

  function createSessionId() {
  const randomPart = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();

  const datePart = new Date()
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, "");

  return `ARL-${randomPart}-${datePart}`;
}

  const [musicOn, setMusicOn] = useState(true);
  const [welcomeStarted, setWelcomeStarted] =
    useState(false);

  const [evidenceText, setEvidenceText] =
    useState("");
  const [evidenceUrl, setEvidenceUrl] =
    useState("");
  const [evidenceItems, setEvidenceItems] =
    useState<EvidenceItem[]>([]);
  const [addingEvidence, setAddingEvidence] =
    useState(false);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  /* =========================================================
     AUDIO
     ========================================================= */

 useEffect(() => {
  const audio = audioRef.current;

  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
}, []);

useEffect(() => {
  const audio = audioRef.current;

  if (!audio) return;

  audio.pause();
}, [musicOn, welcomeStarted]);

  /* =========================================================
     RESEARCH PROGRESS
     ========================================================= */

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 94) return value;

        return value + Math.random() * 3.5;
      });
    }, 650);

    return () =>
      window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setActiveAgent(
        (value) => (value + 1) % agents.length
      );
    }, 1600);

    return () =>
      window.clearInterval(timer);
  }, [running]);

  /* =========================================================
     START RESEARCH
     ========================================================= */

  async function startResearch(
    overrideQuestion?: string
  ) {
    const trimmed = (
      overrideQuestion || question
    ).trim();

    if (!trimmed || running) return;

    const newSessionId = createSessionId();
    setSessionId(newSessionId);

    setRunning(true);
    setProgress(5);
    setActiveAgent(0);
    setReport(null);
    setError("");

    try {
      const response = await fetch(
        "/api/research",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: trimmed,

            evidence: evidenceItems.map(
              (item) => ({
                type: item.type,
                title: item.title,
                content: item.content,
              })
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const details = Array.isArray(
          data?.details
        )
          ? ` ${data.details.join(" ")}`
          : "";

        throw new Error(
          `${
            data?.error ||
            "Research request failed."
          }${details}`
        );
      }

      setProgress(100);
      setReport(data);

      setTimeout(() => {
        document
          .getElementById("research-output")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while researching."
      );
    } finally {
      setRunning(false);
    }
  }

  /* =========================================================
     WELCOME VIDEO
     ========================================================= */

  async function enterLab() {
    const video = videoRef.current;
    const audio = audioRef.current;

    setWelcomeStarted(true);

    if (video) {
      video.currentTime = 0;
      video.muted = false;
      video.volume = 1;
    }

    if (audio) {
      audio.currentTime = 0;
      audio.loop = true;
      audio.volume = musicOn ? 0.12 : 0;
    }

    try {
      await Promise.all([
        video?.play(),
        musicOn
          ? audio?.play()
          : Promise.resolve(),
      ]);
    } catch {
      // Browser audio restrictions are handled silently.
    }

    document
      .getElementById("research-lab")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  /* =========================================================
     EVIDENCE LAB
     ========================================================= */

  function addTextEvidence() {
    const value = evidenceText.trim();

    if (!value) return;

    setEvidenceItems((items) => [
      ...items,
      {
        id: Date.now(),
        type: "NOTE",
        title: "Research Note",
        content: value,
      },
    ]);

    setEvidenceText("");
    setAddingEvidence(false);
  }

  function addUrlEvidence() {
    const value = evidenceUrl.trim();

    if (!value) return;

    setEvidenceItems((items) => [
      ...items,
      {
        id: Date.now(),
        type: "URL",
        title: "External Research Source",
        content: value,
      },
    ]);

    setEvidenceUrl("");
    setAddingEvidence(false);
  }

  function removeEvidence(id: number) {
    setEvidenceItems((items) =>
      items.filter(
        (item) => item.id !== id
      )
    );
  }

  function handleFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const isTextLike =
      file.type.startsWith("text/") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".json");

    if (isTextLike) {
      const reader = new FileReader();

      reader.onload = () => {
        const content = String(
          reader.result || ""
        ).trim();

        if (!content) return;

        setEvidenceItems((items) => [
          ...items,
          {
            id: Date.now(),
            type: "FILE",
            title: file.name,
            content,
          },
        ]);
      };

      reader.readAsText(file);
    } else {
      setEvidenceItems((items) => [
        ...items,
        {
          id: Date.now(),
          type: "FILE",
          title: file.name,
          content:
            `Attached research file: ${file.name}. ` +
            `The file is registered for this research session.`,
        },
      ]);
    }

    event.target.value = "";
  }

  /* =========================================================
     SCORE HELPERS
     ========================================================= */

  function getAgentScore(
    index: number
  ): number | null {
    if (!report?.metrics) return null;

    const values = [
      report.metrics.evidence,
      report.metrics.feasibility,
      report.metrics.novelty,
      Math.max(
        0,
        100 - report.metrics.risk
      ),
    ];

    if (index < values.length) {
      return (
        Math.round(values[index] * 10) / 10
      );
    }

    return null;
  }

  function getOverallScore(): number | null {
    if (!report?.metrics) return null;

    const {
      evidence,
      feasibility,
      novelty,
      risk,
    } = report.metrics;

    const safetyAdjustedRisk = Math.max(
      0,
      100 - risk
    );

    return (
      Math.round(
        (
          evidence +
          feasibility +
          novelty +
          safetyAdjustedRisk
        ) /
          4 *
          10
      ) / 10
    );
  }

  return (
    <main className="lab">
      {/* =====================================================
          WELCOME VIDEO
          ===================================================== */}

      <section className="welcome">
        <div className="welcome-video-shell">
          <video
            ref={videoRef}
            className="welcome-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source
              src="/welcome-lab.mp4"
              type="video/mp4"
            />
          </video>

          <div className="welcome-overlay" />

          <div className="welcome-content">
            <div className="welcome-kicker">
              AI RESEARCH LAB
            </div>

            <h2>
              Welcome to the
              <br />
              <span>
                Research Intelligence Lab.
              </span>
            </h2>

            <p>
              Discover. Analyze. Challenge. Synthesize.
            </p>

            <button
              className="enter-lab"
              onClick={enterLab}
            >
              ENTER THE LAB
              <b>↓</b>
            </button>
          </div>

          <div className="welcome-status">
            <span />
            SYSTEMS ONLINE
          </div>
        </div>
      </section>

      <audio
        ref={audioRef}
        src="/audio/ambient-lab.mp3"
        preload="auto"
      />

      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="orb orb-three" />

      <div className="grid-background" />

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="header">
        <div className="brand">
          <div className="brand-symbol">
            <span />
            <span />
            <span />
          </div>

          <div>
            <div className="brand-title">
              AI RESEARCH LAB
            </div>

            <div className="brand-subtitle">
              Intelligence · Discovery · Impact
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="online">
            <span />
            Systems Online
          </div>

          <button
            className="music"
            onClick={() =>
              setMusicOn(
                (value) => !value
              )
            }
          >
            {musicOn
              ? "♫ Ambient"
              : "♫ Muted"}
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        className="hero"
        id="research-lab"
      >
        <div className="eyebrow">
          <span />
          MULTI-AGENT RESEARCH INTELLIGENCE
        </div>

        <h1>
          Ask a question.
          <br />
          <span>
            Launch an investigation.
          </span>
        </h1>

        <p className="hero-text">
          Five specialized AI agents collaborate to
          discover, analyze, challenge and synthesize
          research into one structured intelligence brief.
        </p>

        {/* RESEARCH BOX */}
<div className="research-box">

  <div className="research-label">
    YOUR NAME
  </div>

  <input
    type="text"
    value={userName}
    onChange={(event) =>
      setUserName(event.target.value)
    }
    placeholder="Enter your name"
    disabled={running}
  />

  <div className="research-label">
    RESEARCH QUESTION
  </div>

  <textarea
    value={question}
    onChange={(event) =>
      setQuestion(event.target.value)
    }
    placeholder="What should the research lab investigate?"
    rows={5}
    disabled={running}
  />

  <div className="research-bottom">

    <span className="character-count">
      {question.length > 0
        ? `${question.length} characters`
        : "Enter a question to begin"}
    </span>

    <button
      className="launch"
      onClick={() =>
        startResearch()
      }
      disabled={
        !question.trim() ||
        running
      }
    >
      {running ? (
        <>
          <span className="spinner" />
          Researching
        </>
      ) : (
        <>
          Start Research
          <b>→</b>
        </>
      )}
    </button>

  </div>

</div>

        {/* EXAMPLES */}

        <div className="examples">
          <div className="examples-title">
            EXAMPLE INVESTIGATIONS
          </div>

          <div className="chips">
            {examples.map((example) => (
              <button
                key={example}
                className="chip"
                onClick={() =>
                  setQuestion(example)
                }
                disabled={running}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          AGENTS
          ===================================================== */}

      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">
              THE RESEARCH TEAM
            </div>

            <h2>
              Five intelligences. One investigation.
            </h2>
          </div>

          <p>
            Each agent has a different responsibility in
            the research pipeline.
          </p>
        </div>

        <div className="agents">
          {agents.map(
            (agent, index) => (
              <div
                key={agent.name}
                className={`agent ${
                  running &&
                  activeAgent === index
                    ? "agent-working"
                    : ""
                }`}
                style={
                  {
                    "--accent":
                      agent.accent,
                  } as CSSProperties
                }
              >
                <div className="agent-top">
                  <span className="agent-index">
                    0{index + 1}
                  </span>

                  <span className="agent-status">
                    <i
                      className={
                        running &&
                        activeAgent ===
                          index
                          ? "working-dot"
                          : ""
                      }
                    />

                    {running &&
                    activeAgent === index
                      ? "Working"
                      : "Ready"}
                  </span>
                </div>

                <div className="agent-icon">
                  {agent.icon}
                </div>

                <div className="agent-role">
                  {agent.role}
                </div>

                <h3>{agent.name}</h3>

                <p>
                  {agent.description}
                </p>

                <div className="agent-line" />
              </div>
            )
          )}
        </div>
      </section>

      {/* =====================================================
          LIVE SESSION
          ===================================================== */}

      {running && (
        <section className="section">
          <div className="live-card">
            <div className="live-top">
              <div>
                <div className="section-kicker">
                  LIVE RESEARCH SESSION
                </div>

                <h2>
                  {
                    agents[activeAgent]
                      .icon
                  }{" "}
                  {
                    agents[activeAgent]
                      .name
                  }{" "}
                  is investigating
                </h2>
              </div>

              <strong>
                {Math.min(
                  100,
                  Math.round(progress)
                )}
                %
              </strong>
            </div>

            <div className="progress">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    progress
                  )}%`,
                }}
              />
            </div>

            <div className="live-meta">
              <span>
                Agent{" "}
                {activeAgent + 1} /{" "}
                {agents.length}
              </span>

              <span>
                Coordinating evidence and analysis
              </span>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <section className="section">
          <div className="error-card">
            <div className="error-symbol">
              !
            </div>

            <div>
              <div className="section-kicker">
                RESEARCH ERROR
              </div>

              <h2>
                Investigation could not complete.
              </h2>

              <p>{error}</p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          PREMIUM FINAL RESEARCH OUTPUT
          ===================================================== */}

      {report && (
        <section
          className="section final-output"
          id="research-output"
        >
          <div className="scorecard-shell">
            <div className="scorecard-top">
              <div>
                <div className="scorecard-kicker">
                  PREMIUM AI RESEARCH LAB
                </div>

                <h2>
                  FINAL AGENT SCORECARD
                </h2>

                <p>
                  {report.title ||
                    "Investigation complete."}
                </p>
              </div>

              <div className="scorecard-status">
                <span />
                RESEARCH COMPLETE
              </div>
            </div>

            <div className="scorecard-grid">
              {agents.map(
                (agent, index) => {
                  const finding =
                    report.agents?.find(
                      (item) =>
                        item.name.toLowerCase() ===
                        agent.name.toLowerCase()
                    );

                  const score =
                    getAgentScore(index);

                  const keywords =
                    getInsightKeywords(
                      finding
                    );

                  return (
                    <div
                      className="score-agent"
                      key={agent.name}
                      style={
                        {
                          "--accent":
                            agent.accent,
                        } as CSSProperties
                      }
                    >
                      <div className="score-agent-head">
                        <div>
                          <span className="score-agent-number">
                            AGENT{" "}
                            {index + 1}
                          </span>

                          <h3>
                            {agent.name}
                          </h3>

                          <small>
                            {agent.role}
                          </small>
                        </div>

                        <div className="score-agent-icon">
                          {agent.icon}
                        </div>
                      </div>

                      <div className="mini-chart">
                        <span
                          style={{
                            height: `${
                              35 +
                              index * 8
                            }%`,
                          }}
                        />

                        <span
                          style={{
                            height: `${
                              55 +
                              index * 5
                            }%`,
                          }}
                        />

                        <span
                          style={{
                            height: `${
                              45 +
                              index * 9
                            }%`,
                          }}
                        />

                        <span
                          style={{
                            height: `${
                              70 -
                              index * 4
                            }%`,
                          }}
                        />

                        <span
                          style={{
                            height: `${
                              62 +
                              index * 3
                            }%`,
                          }}
                        />

                        <span
                          style={{
                            height: `${
                              82 -
                              index * 5
                            }%`,
                          }}
                        />
                      </div>

                      <div className="score-metrics">
                        <div>
                          <span>
                            ANALYSIS
                          </span>

                          <strong>
                            {finding
                              ? "Complete"
                              : "Ready"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            EVIDENCE
                          </span>

                          <strong>
                            {finding
                              ? "Verified"
                              : "—"}
                          </strong>
                        </div>
                      </div>

                      {/* =================================================
                          COMPLETE AGENT INTELLIGENCE
                          ================================================= */}

                      <div className="score-intelligence">
                        <div className="score-block">
                          <span>
                            KEY FINDING
                          </span>

                          <p>
                            {finding?.finding ||
                              agent.description}
                          </p>
                        </div>

                        <div className="score-block">
                          <span>
                            EVIDENCE
                          </span>

                          <p>
                            {finding?.evidence ||
                              "No evidence summary available."}
                          </p>
                        </div>

                        <div className="score-block">
                          <span>
                            CONCERN
                          </span>

                          <p>
                            {finding?.concern ||
                              "No major concern reported."}
                          </p>
                        </div>

                        {finding &&
                          keywords.length >
                            0 && (
                            <div className="score-keywords">
                              <span className="keyword-label">
                                INSIGHT
                                KEYWORDS
                              </span>

                              <div className="keyword-list">
                                {keywords.map(
                                  (
                                    keyword
                                  ) => (
                                    <span
                                      className="score-keyword"
                                      key={
                                        keyword
                                      }
                                    >
                                      {
                                        keyword
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      <div className="final-score">
                        <span>
                          AGENT SCORE
                        </span>

                        <strong>
                          {score !==
                          null
                            ? score
                            : "—"}
                        </strong>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="overall-performance">
              <div>
                <span>
                  LAB OVERALL PERFORMANCE
                </span>

                <strong>
                  {getOverallScore() !==
                  null
                    ? `${getOverallScore()}%`
                    : "COMPLETE"}
                </strong>
              </div>

              <div className="performance-line">
                <span
                  style={{
                    width: `${
                      getOverallScore() ||
                      0
                    }%`,
                  }}
                />
              </div>

              <p>
                DATA REVIEWED · EVIDENCE ANALYZED ·
                MULTI-AGENT SYNTHESIS COMPLETE
              </p>
            </div>
          </div>

          {/* =================================================
              EXECUTIVE SUMMARY
              ================================================= */}

          <div className="output-section">
            <div className="output-section-title">
              EXECUTIVE RESEARCH SUMMARY
            </div>

            <div className="summary-card premium-card">
              <p>
                {report.executiveSummary ||
                  "The research team completed the investigation."}
              </p>
            </div>
          </div>

          {/* =================================================
              METRICS
              ================================================= */}

          {report.metrics && (
            <div className="output-section">
              <div className="output-section-title">
                RESEARCH METRICS
              </div>

              <div className="metrics">
                <div className="metric premium-card">
                  <div className="card-label">
                    EVIDENCE
                  </div>

                  <strong>
                    {
                      report.metrics
                        .evidence
                    }
                  </strong>

                  <small>
                    Evidence strength
                  </small>
                </div>

                <div className="metric premium-card">
                  <div className="card-label">
                    FEASIBILITY
                  </div>

                  <strong>
                    {
                      report.metrics
                        .feasibility
                    }
                  </strong>

                  <small>
                    Practical feasibility
                  </small>
                </div>

                <div className="metric premium-card">
                  <div className="card-label">
                    NOVELTY
                  </div>

                  <strong>
                    {
                      report.metrics
                        .novelty
                    }
                  </strong>

                  <small>
                    Research novelty
                  </small>
                </div>

                <div className="metric premium-card">
                  <div className="card-label">
                    RISK
                  </div>

                  <strong>
                    {report.metrics.risk}
                  </strong>

                  <small>
                    Risk assessment
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              AGENT INTELLIGENCE
              ================================================= */}

          {report.agents &&
            report.agents.length > 0 && (
              <div className="output-section">
                <div className="output-section-title">
                  AGENT INTELLIGENCE
                </div>

                <div className="briefs">
                  {report.agents.map(
                    (
                      agent,
                      index
                    ) => {
                      const visualAgent =
                        agents.find(
                          (item) =>
                            item.name.toLowerCase() ===
                            agent.name.toLowerCase()
                        );

                      return (
                        <div
                          className="brief premium-card"
                          key={index}
                          style={
                            {
                              "--accent":
                                visualAgent?.accent ||
                                "#2563eb",
                            } as CSSProperties
                          }
                        >
                          <div className="brief-header">
                            <div className="brief-icon">
                              {visualAgent?.icon ||
                                "✦"}
                            </div>

                            <div>
                              <div className="brief-name">
                                {
                                  agent.name
                                }
                              </div>

                              <div className="brief-role">
                                {
                                  agent.role
                                }
                              </div>
                            </div>
                          </div>

                          <p>
                            {
                              agent.finding
                            }
                          </p>

                          <div className="brief-section">
                            <span>
                              EVIDENCE
                            </span>

                            <small>
                              {
                                agent.evidence
                              }
                            </small>
                          </div>

                          <div className="brief-concern">
                            <span>
                              CONCERN
                            </span>

                            <p>
                              {
                                agent.concern
                              }
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

          {/* =================================================
              FUTURE ACTIONS
              ================================================= */}

          {report.futureActions &&
            report.futureActions.length >
              0 && (
              <div className="output-section">
                <div className="output-section-title">
                  NEXT RESEARCH ACTIONS
                </div>

                <div className="actions">
                  {report.futureActions.map(
                    (
                      action,
                      index
                    ) => (
                      <div
                        className="action premium-card"
                        key={index}
                      >
                        <div className="action-number">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="action-content">
                          <strong>
                            {
                              action.action
                            }
                          </strong>

                          <p>
                            {
                              action.reason
                            }
                          </p>

                          <div className="action-meta">
                            <span>
                              Priority:{" "}
                              {
                                action.priority
                              }
                            </span>

                            <span>
                              Timeframe:{" "}
                              {
                                action.timeframe
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* =================================================
              RESEARCH EVIDENCE LAB
              ================================================= */}

          <div className="evidence-lab">
            <div className="evidence-header">
              <div>
                <div className="section-kicker">
                  ADVANCED RESEARCH WORKSPACE
                </div>

                <h2>
                  Research Evidence Lab
                </h2>

                <p>
                  Add your existing evidence,
                  observations or external sources
                  and continue the investigation
                  with the AI research team.
                </p>
              </div>

              <div className="pro-badge">
                PRO RESEARCH MODE
              </div>
            </div>

            <div className="evidence-grid">
              <div className="evidence-input-card">
                <div className="evidence-tabs">
                  <span className="active">
                    NOTES
                  </span>

                  <span>URL</span>

                  <span>FILE</span>
                </div>

                <textarea
                  value={evidenceText}
                  onChange={(event) =>
                    setEvidenceText(
                      event.target.value
                    )
                  }
                  placeholder="Paste your existing evidence, observations, research notes, measurements or findings..."
                />

                <div className="evidence-actions">
                  <button
                    className="secondary-action"
                    onClick={
                      addTextEvidence
                    }
                    disabled={
                      !evidenceText.trim()
                    }
                  >
                    + Add Evidence
                  </button>

                  <label className="file-action">
                    + Attach File

                    <input
                      type="file"
                      accept=".txt,.md,.csv,.json,.pdf,.png,.jpg,.jpeg"
                      onChange={
                        handleFile
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="evidence-url-card">
                <div className="card-label">
                  EXTERNAL SOURCE
                </div>

                <input
                  value={evidenceUrl}
                  onChange={(event) =>
                    setEvidenceUrl(
                      event.target.value
                    )
                  }
                  placeholder="https://example.com/research"
                />

                <button
                  className="url-add"
                  onClick={
                    addUrlEvidence
                  }
                  disabled={
                    !evidenceUrl.trim()
                  }
                >
                  Add Source →
                </button>
              </div>
            </div>

            {/* EVIDENCE LIST */}

            {evidenceItems.length >
              0 && (
              <div className="evidence-list">
                <div className="evidence-list-header">
                  <div>
                    <span>
                      ACTIVE EVIDENCE
                    </span>

                    <strong>
                      {
                        evidenceItems.length
                      }{" "}
                      source
                      {evidenceItems.length !==
                      1
                        ? "s"
                        : ""}{" "}
                      connected
                    </strong>
                  </div>

                  <div className="evidence-secure">
                    ● CONTEXT READY
                  </div>
                </div>

                {evidenceItems.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      className="evidence-item"
                      key={item.id}
                    >
                      <div className="evidence-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="evidence-type">
                        {item.type}
                      </div>

                      <div className="evidence-content">
                        <strong>
                          {
                            item.title
                          }
                        </strong>

                        <p>
                          {item.content
                            .length >
                          180
                            ? `${item.content.slice(
                                0,
                                180
                              )}…`
                            : item.content}
                        </p>
                      </div>

                      <button
                        className="remove-evidence"
                        onClick={() =>
                          removeEvidence(
                            item.id
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="continue-research">
              <div>
                <span>
                  ITERATIVE RESEARCH
                </span>

                <p>
                  Previous findings + your evidence
                  + new analysis
                </p>
              </div>

              <button
                className="continue-button"
                disabled={
                  evidenceItems.length ===
                    0 ||
                  running
                }
                onClick={() =>
                  startResearch(
                    question.trim()
                  )
                }
              >
                {running
                  ? "Analyzing..."
                  : "Continue Research →"}
              </button>
            </div>
          </div>

          {/* =================================================
              LIMITATIONS
              ================================================= */}

          {report.limitations &&
            report.limitations.length >
              0 && (
              <div className="output-section">
                <div className="output-section-title">
                  LIMITATIONS
                </div>

                <div className="limitations premium-card">
                  {report.limitations.map(
                    (
                      item,
                      index
                    ) => (
                      <p key={index}>
                        <span>
                          •
                        </span>

                        {item}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}

          {/* =================================================
              SOURCES
              ================================================= */}

          {report.sources &&
            report.sources.length >
              0 && (
              <div className="output-section">
                <div className="output-section-title">
                  GROUNDED SOURCES
                </div>

                <div className="sources premium-card">
                  {report.sources.map(
                    (
                      source,
                      index
                    ) => (
                      <a
                        key={index}
                        href={
                          source.uri
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <b>
                          {
                            source.title
                          }
                        </b>

                        <em>
                          ↗
                        </em>
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

          {/* =================================================
              BRANDING
              ================================================= */}

          <div className="provider-info">
            <span>
              TEAM · TECHTITANS
            </span>

            <span>
              DEVELOPER · PRAKASH MOOND
            </span>
          </div>

          {/* =================================================
              RESEARCH PARTICIPATION CERTIFICATE
              ================================================= */}

          <div className="certificate-section">
            <ResearchCertificate
              name={userName}
              keywords={getCertificateKeywords(question)}
              sessionId={sessionId}
            />
          </div>

        </section>
      )}

      {/* =====================================================
          FOOTER
          ================================================= */}

      <footer>
        <div>
          <strong>
            AI RESEARCH LAB
          </strong>

          <span>
            Multi-agent research intelligence.
          </span>
        </div>

        <span>
          DISCOVERY · ANALYSIS · SYNTHESIS
        </span>
      </footer>

      {/* =====================================================
          STYLES
          ===================================================== */}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background:
            radial-gradient(
              circle at 50% -10%,
              #ffffff 0%,
              #f7f9fc 42%,
              #eef2f6 100%
            );
          color: #151a22;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        button,
        textarea,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .lab {
          min-height: 100vh;
          overflow: hidden;
          position: relative;
        }

        /* =====================================================
           WELCOME VIDEO
           ===================================================== */

        .welcome {
          width: min(
            1200px,
            calc(100% - 36px)
          );
          margin: 0 auto;
          padding: 28px 0 20px;
          position: relative;
          z-index: 2;
        }

        .welcome-video-shell {
          position: relative;
          width: 100%;
          min-height: 620px;
          overflow: hidden;

          border: 1px solid
            rgba(210, 218, 228, 0.75);
          border-radius: 30px;

          background: #15191f;

          box-shadow:
            0 35px 90px
              rgba(20, 28, 38, 0.18),
            inset 0 1px 0
              rgba(255, 255, 255, 0.75);
        }

        .welcome-video {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          filter:
            brightness(0.72)
            contrast(1.08)
            saturate(0.85);

          transform: scale(1.015);
        }

        .welcome-video-shell::after {
          content: "";
          position: absolute;
          inset: 0;

          border-radius: inherit;
          pointer-events: none;

          box-shadow:
            inset 0 0 80px
              rgba(255, 255, 255, 0.08),
            inset 0 0 0 1px
              rgba(255, 255, 255, 0.2);
        }

        .welcome-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;

          background:
            linear-gradient(
              90deg,
              rgba(5, 8, 13, 0.86) 0%,
              rgba(8, 12, 18, 0.62) 38%,
              rgba(8, 12, 18, 0.25) 72%,
              rgba(5, 8, 13, 0.58) 100%
            );
        }

        .welcome-content {
          position: relative;
          z-index: 4;

          min-height: 620px;
          max-width: 850px;

          display: flex;
          flex-direction: column;
          justify-content: center;

          padding: 70px;
        }

        .welcome-kicker {
          width: fit-content;

          margin-bottom: 22px;
          padding: 9px 15px;

          border: 1px solid
            rgba(225, 232, 240, 0.42);
          border-radius: 999px;

          background:
            rgba(220, 228, 236, 0.09);

          color:
            rgba(245, 248, 252, 0.9);

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.22em;

          backdrop-filter: blur(14px);
        }

        .welcome-kicker::before {
          content: "●";
          margin-right: 8px;
          color: #dce7f0;
        }

        .welcome-content h2 {
          margin: 0;

          color: #f5f7fa;

          font-size:
            clamp(48px, 6.2vw, 86px);

          line-height: 0.98;

          letter-spacing: -0.055em;

          font-weight: 650;
        }

        .welcome-content h2 span {
          background:
            linear-gradient(
              110deg,
              #ffffff 0%,
              #dce3e9 28%,
              #aeb9c5 55%,
              #f8fafc 78%,
              #c2ccd5 100%
            );

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;
        }

        .welcome-content p {
          margin: 26px 0 34px;

          color:
            rgba(232, 238, 244, 0.78);

          font-size: 15px;
          line-height: 1.7;

          letter-spacing: 0.08em;
        }

        .enter-lab {
          width: fit-content;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 17px;

          padding: 14px 21px;

          border: 1px solid
            rgba(235, 240, 245, 0.55);
          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              rgba(248, 250, 252, 0.94),
              rgba(165, 176, 188, 0.82)
            );

          color: #151a20;

          font-size: 11px;
          font-weight: 900;

          letter-spacing: 0.16em;

          box-shadow:
            0 14px 35px
              rgba(0, 0, 0, 0.28),
            inset 0 1px 0
              rgba(255, 255, 255, 0.95);

          transition: 180ms ease;
        }

        .enter-lab:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }

        .enter-lab b {
          font-size: 18px;
        }

        .welcome-status {
          position: absolute;

          right: 24px;
          bottom: 22px;

          z-index: 5;

          display: flex;
          align-items: center;
          gap: 9px;

          padding: 9px 13px;

          border: 1px solid
            rgba(225, 232, 240, 0.25);
          border-radius: 999px;

          background:
            rgba(8, 12, 18, 0.3);

          color:
            rgba(238, 243, 248, 0.72);

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 0.15em;

          backdrop-filter: blur(12px);
        }

        .welcome-status span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #dce7f0;

          box-shadow:
            0 0 12px
              rgba(215, 232, 247, 0.95);
        }

        /* =====================================================
           BACKGROUND
           ===================================================== */

        .grid-background {
          position: fixed;
          inset: 0;
          z-index: -3;
          pointer-events: none;
          opacity: 0.35;

          background-image:
            linear-gradient(
              rgba(50, 60, 70, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(50, 60, 70, 0.035) 1px,
              transparent 1px
            );

          background-size: 70px 70px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 85%
            );
        }

        .orb {
          position: fixed;
          z-index: -2;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(65px);
          opacity: 0.2;

          animation:
            float 13s ease-in-out infinite;
        }

        .orb-one {
          width: 400px;
          height: 400px;
          left: -190px;
          top: 120px;
          background: #c4b5fd;
        }

        .orb-two {
          width: 360px;
          height: 360px;
          right: -170px;
          top: 500px;
          background: #bae6fd;
          animation-delay: -4s;
        }

        .orb-three {
          width: 300px;
          height: 300px;
          left: 40%;
          bottom: -160px;
          background: #fbcfe8;
          animation-delay: -8s;
        }

        @keyframes float {
          0%,
          100% {
            transform:
              translate3d(0, 0, 0);
          }

          50% {
            transform:
              translate3d(35px, -30px, 0);
          }
        }

        /* =====================================================
           HEADER
           ===================================================== */

        .header {
          position: sticky;
          top: 0;
          z-index: 50;

          min-height: 74px;

          padding:
            14px
            clamp(18px, 5vw, 75px);

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom: 1px solid
            rgba(215, 222, 230, 0.8);

          background:
            rgba(255, 255, 255, 0.82);

          backdrop-filter: blur(20px);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .brand-symbol {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;

          border: 1px solid #d4d9df;
          border-radius: 12px;

          background:
            linear-gradient(
              145deg,
              white,
              #e4e8ec
            );

          box-shadow:
            0 8px 25px
              rgba(24, 24, 27, 0.08),
            inset 0 1px 0 white;
        }

        .brand-symbol span {
          width: 3px;
          border-radius: 5px;
          background: #525b66;
        }

        .brand-symbol span:nth-child(1) {
          height: 11px;
        }

        .brand-symbol span:nth-child(2) {
          height: 20px;
        }

        .brand-symbol span:nth-child(3) {
          height: 14px;
        }

        .brand-title {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        .brand-subtitle {
          margin-top: 2px;
          color: #8a939e;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .online,
        .music {
          padding: 9px 12px;

          border: 1px solid #dfe4e9;
          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.75);

          color: #52525b;

          font-size: 10px;
          font-weight: 800;
        }

        .online {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .online span {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 0 4px
              rgba(34, 197, 94, 0.1);
        }

        .music:hover {
          transform: translateY(-1px);
        }

        /* =====================================================
           GLOBAL SECTIONS
           ===================================================== */

        .hero,
        .section,
        footer {
          width:
            min(1200px, calc(100% - 36px));

          margin: auto;
        }

        .hero {
          padding: 100px 0 90px;
        }

        .eyebrow,
        .section-kicker,
        .card-label,
        .research-label,
        .examples-title {
          color: #717b86;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.16em;

          text-transform: uppercase;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-bottom: 20px;
        }

        .eyebrow span {
          width: 32px;
          height: 1px;
          background: #8d99a5;
        }

        h1 {
          margin: 0;
          max-width: 900px;

          font-size:
            clamp(48px, 7.5vw, 86px);

          line-height: 0.97;

          letter-spacing: -0.065em;
        }

        h1 span {
          color: #9aa4af;
        }

        .hero-text {
          max-width: 680px;

          margin: 26px 0 38px;

          color: #71717a;

          font-size: 16px;
          line-height: 1.75;
        }

        /* =====================================================
           RESEARCH BOX
           ===================================================== */

        .research-box {
          padding: 27px;

          border: 1px solid #dfe4e9;
          border-radius: 27px;

          background:
            rgba(255, 255, 255, 0.78);

          backdrop-filter: blur(20px);

          box-shadow:
            0 25px 80px
              rgba(24, 24, 27, 0.07),
            inset 0 1px 0 white;
        }

        .research-box textarea {
          width: 100%;
          min-height: 145px;

          margin-top: 14px;

          resize: vertical;
          outline: none;
          border: 0;

          background: transparent;
          color: #18181b;

          font-size:
            clamp(20px, 2.5vw, 27px);

          line-height: 1.45;
          letter-spacing: -0.025em;
        }

        .research-box textarea::placeholder {
          color: #c4c8cd;
        }

        .research-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;
          padding-top: 17px;

          border-top: 1px solid #edf0f2;
        }

        .character-count {
          color: #929aa4;
          font-size: 11px;
        }

        .launch {
          min-height: 47px;

          display: inline-flex;
          align-items: center;
          gap: 10px;

          padding: 0 20px;

          border: 0;
          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #202832,
              #10151c
            );

          color: white;

          font-size: 12px;
          font-weight: 900;

          box-shadow:
            0 12px 30px
              rgba(24, 24, 27, 0.18);

          transition: 0.2s ease;
        }

        .launch:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .launch:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .launch b {
          font-size: 18px;
        }

        .spinner {
          width: 14px;
          height: 14px;

          border: 2px solid
            rgba(255, 255, 255, 0.3);

          border-top-color: white;

          border-radius: 50%;

          animation:
            spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .examples {
          margin-top: 25px;
        }

        .examples-title {
          margin-bottom: 10px;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .chip {
          padding: 8px 12px;

          border: 1px solid #dfe4e9;
          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.65);

          color: #71717a;

          font-size: 11px;

          transition: 0.2s ease;
        }

        .chip:hover {
          transform: translateY(-1px);
          border-color: #a1a9b2;
          color: #27272a;
        }

        /* =====================================================
           SECTIONS
           ===================================================== */

        .section {
          padding-bottom: 100px;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 30px;
          margin-bottom: 25px;
        }

        .section-heading h2 {
          margin: 6px 0 0;

          font-size:
            clamp(28px, 4vw, 43px);

          letter-spacing: -0.045em;
        }

        .section-heading > p {
          max-width: 380px;
          margin: 0;

          color: #71717a;

          font-size: 13px;
          line-height: 1.7;
        }

        /* =====================================================
           AGENTS
           ===================================================== */

        .agents {
          display: grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap: 11px;
        }

        .agent {
          position: relative;

          min-height: 290px;

          padding: 19px;

          overflow: hidden;

          border: 1px solid #dfe4e9;
          border-radius: 23px;

          background:
            rgba(255, 255, 255, 0.72);

          backdrop-filter: blur(18px);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .agent:hover,
        .agent-working {
          transform: translateY(-5px);

          border-color: var(--accent);

          box-shadow:
            0 25px 65px
              rgba(24, 24, 27, 0.09),
            0 0 35px
              color-mix(
                in srgb,
                var(--accent) 9%,
                transparent
              );
        }

        .agent-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .agent-index {
          color: #c4cad0;
          font-size: 9px;
          font-weight: 900;
        }

        .agent-status {
          display: flex;
          align-items: center;
          gap: 6px;

          color: #929aa4;

          font-size: 9px;
          font-weight: 800;
        }

        .agent-status i {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #cfd5db;
        }

        .agent-status i.working-dot {
          background: #22c55e;

          box-shadow:
            0 0 0 4px
              rgba(34, 197, 94, 0.1);
        }

        .agent-icon {
          width: 58px;
          height: 58px;

          display: grid;
          place-items: center;

          margin: 34px 0 20px;

          border: 1px solid #dfe4e9;
          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              white,
              #f0f3f6
            );

          box-shadow:
            0 10px 25px
              rgba(24, 24, 27, 0.07),
            inset 0 1px 0 white;

          font-size: 28px;
        }

        .agent-role {
          color: var(--accent);

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.12em;

          text-transform: uppercase;
        }

        .agent h3 {
          margin: 5px 0 8px;

          font-size: 22px;

          letter-spacing: -0.04em;
        }

        .agent p {
          margin: 0;

          color: #71717a;

          font-size: 11px;
          line-height: 1.65;
        }

        .agent-line {
          position: absolute;

          left: 19px;
          right: 19px;
          bottom: 18px;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              var(--accent),
              transparent
            );
        }

        /* =====================================================
           LIVE
           ===================================================== */

        .live-card {
          padding: 26px;

          border: 1px solid #dfe4e9;
          border-radius: 25px;

          background:
            rgba(255, 255, 255, 0.76);

          box-shadow:
            0 20px 60px
              rgba(24, 24, 27, 0.06);
        }

        .live-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;
        }

        .live-top h2 {
          margin: 6px 0 0;

          font-size: 24px;

          letter-spacing: -0.035em;
        }

        .live-top > strong {
          font-size: 32px;

          letter-spacing: -0.05em;
        }

        .progress {
          height: 7px;

          margin-top: 24px;

          overflow: hidden;

          border-radius: 99px;

          background: #edf0f3;
        }

        .progress div {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #6b7d91,
              #151d26
            );

          transition:
            width 0.5s ease;
        }

        .live-meta {
          display: flex;
          justify-content: space-between;

          gap: 20px;
          margin-top: 11px;

          color: #929aa4;

          font-size: 10px;
        }

        /* =====================================================
           ERROR
           ===================================================== */

        .error-card {
          display: flex;

          gap: 15px;
          padding: 23px;

          border: 1px solid #fecaca;
          border-radius: 23px;

          background: #fff7f7;
        }

        .error-symbol {
          width: 36px;
          height: 36px;

          flex: 0 0 36px;

          display: grid;
          place-items: center;

          border-radius: 11px;

          background: #fee2e2;

          color: #dc2626;

          font-weight: 900;
        }

        .error-card h2 {
          margin: 5px 0;

          font-size: 20px;
        }

        .error-card p {
          margin: 0;

          color: #7f1d1d;

          font-size: 12px;
          line-height: 1.6;

          white-space: pre-wrap;
        }

        /* =====================================================
           PREMIUM SCORECARD
           ===================================================== */

        .scorecard-shell {
          position: relative;

          padding: 30px;

          border: 1px solid
            rgba(185, 195, 205, 0.9);

          border-radius: 30px;

          background:
            linear-gradient(
              145deg,
              #ffffff 0%,
              #eef2f5 48%,
              #ffffff 100%
            );

          box-shadow:
            0 35px 100px
              rgba(32, 42, 52, 0.13),
            inset 0 1px 0 white;

          overflow: hidden;
        }

        .scorecard-shell::before {
          content: "";

          position: absolute;
          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              115deg,
              transparent 0%,
              rgba(255,255,255,0.8) 42%,
              transparent 65%
            );

          opacity: 0.45;
        }

        .scorecard-top {
          position: relative;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;

          padding-bottom: 24px;

          border-bottom: 1px solid
            #dce2e7;
        }

        .scorecard-kicker {
          color: #66717d;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.2em;
        }

        .scorecard-top h2 {
          margin: 7px 0 4px;

          font-size:
            clamp(25px, 4vw, 44px);

          letter-spacing: -0.045em;
        }

        .scorecard-top p {
          margin: 0;

          color: #7b858f;

          font-size: 12px;
        }

        .scorecard-status {
          display: flex;
          align-items: center;
          gap: 8px;

          padding: 9px 13px;

          border: 1px solid #b8ead1;
          border-radius: 999px;

          background: #f0fff7;

          color: #18794e;

          font-size: 9px;
          font-weight: 900;

          white-space: nowrap;
        }

        .scorecard-status span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #22c55e;
        }

        .scorecard-grid {
          position: relative;

          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 14px;

          padding: 24px 0;
        }

        /* =====================================================
           SCORE AGENT CARD
           ===================================================== */

        .score-agent {
          position: relative;

          min-height: 560px;

          padding: 19px;

          border: 1px solid #cfd7de;
          border-radius: 19px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.96),
              rgba(238,243,247,0.9)
            );

          box-shadow:
            0 16px 35px
              rgba(42, 52, 62, 0.08),
            inset 0 1px 0 white;

          transition: 0.25s ease;
        }

        .score-agent:hover {
          transform: translateY(-4px);

          border-color:
            color-mix(
              in srgb,
              var(--accent) 55%,
              #cfd7de
            );

          box-shadow:
            0 22px 45px
              rgba(42, 52, 62, 0.12);
        }

        .score-agent:nth-child(4),
        .score-agent:nth-child(5) {
          grid-column: span 1;
        }

        .score-agent-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 10px;
        }

        .score-agent-number {
          display: block;

          color: #818b96;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 0.13em;
        }

        .score-agent h3 {
          margin: 4px 0 2px;

          font-size: 22px;

          letter-spacing: -0.04em;
        }

        .score-agent small {
          color: #7f8993;

          font-size: 9px;
          font-weight: 700;

          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .score-agent-icon {
          width: 40px;
          height: 40px;

          display: grid;
          place-items: center;

          border: 1px solid
            color-mix(
              in srgb,
              var(--accent) 30%,
              #d7dde3
            );

          border-radius: 11px;

          background: white;

          font-size: 20px;

          box-shadow:
            inset 0 1px 0 white;
        }

        .mini-chart {
          height: 82px;

          display: flex;
          align-items: flex-end;

          gap: 7px;

          margin-top: 20px;

          padding:
            8px 7px 7px;

          border: 1px solid #e1e6eb;
          border-radius: 12px;

          background:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 19px,
              rgba(100,115,130,0.08) 20px
            );
        }

        .mini-chart span {
          flex: 1;

          min-height: 12px;

          border-radius: 4px 4px 2px 2px;

          background:
            linear-gradient(
              180deg,
              var(--accent),
              rgba(90,110,130,0.28)
            );

          box-shadow:
            0 0 12px
              color-mix(
                in srgb,
                var(--accent) 18%,
                transparent
              );
        }

        .score-metrics {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 7px;

          margin-top: 10px;
        }

        .score-metrics > div {
          padding: 9px;

          border: 1px solid #e0e5ea;
          border-radius: 9px;

          background:
            rgba(255,255,255,0.65);
        }

        .score-metrics span,
        .final-score span {
          display: block;

          color: #87919c;

          font-size: 7px;
          font-weight: 900;

          letter-spacing: 0.12em;
        }

        .score-metrics strong {
          display: block;

          margin-top: 4px;

          color: #35404b;

          font-size: 10px;
        }

        /* =====================================================
           SCORECARD INTELLIGENCE
           ===================================================== */

        .score-intelligence {
          margin-top: 12px;

          display: grid;

          gap: 8px;
        }

        .score-block {
          padding: 9px 10px;

          border: 1px solid #e1e6eb;
          border-radius: 10px;

          background:
            rgba(255, 255, 255, 0.62);
        }

        .score-block span,
        .keyword-label {
          display: block;

          font-size: 7px;
          font-weight: 800;

          letter-spacing: 0.16em;

          color: #8b949e;
        }

        .score-block p {
          margin: 5px 0 0;

          color: #59636d;

          font-size: 9px;
          line-height: 1.5;
        }

        .score-keywords {
          padding-top: 2px;
        }

        .keyword-list {
          display: flex;

          flex-wrap: wrap;

          gap: 5px;

          margin-top: 6px;
        }

        .score-keyword {
          padding: 5px 8px;

          border: 1px solid #d9dfe5;
          border-radius: 999px;

          background: #f8fafb;

          color: #59636d;

          font-size: 7px;
          font-weight: 700;

          letter-spacing: 0.04em;
        }

        .final-score {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: 13px;
          padding-top: 11px;

          border-top: 1px solid #dce2e7;
        }

        .final-score strong {
          color: var(--accent);

          font-size: 24px;

          letter-spacing: -0.05em;
        }

        .overall-performance {
          position: relative;

          padding-top: 22px;

          border-top: 1px solid #dce2e7;
        }

        .overall-performance > div:first-child {
          display: flex;
          align-items: baseline;
          justify-content: space-between;

          gap: 20px;
        }

        .overall-performance span {
          color: #66717d;

          font-size: 11px;
          font-weight: 900;

          letter-spacing: 0.14em;
        }

        .overall-performance strong {
          color: #12a9c4;

          font-size: 38px;

          letter-spacing: -0.06em;
        }

        .performance-line {
          height: 7px;

          margin-top: 10px;

          overflow: hidden;

          border-radius: 99px;

          background: #dfe5ea;
        }

        .performance-line span {
          display: block;

          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #89d8e7,
              #16bdd5
            );

          transition: width 1s ease;
        }

        .overall-performance p {
          margin: 10px 0 0;

          color: #8b949e;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.12em;
        }

        /* =====================================================
           OUTPUT
           ===================================================== */

        .output-section {
          margin-top: 40px;
        }

        .output-section-title {
          margin-bottom: 13px;

          color: #66717d;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.16em;
        }

        .premium-card {
          border: 1px solid #dfe4e9;

          background:
            rgba(255,255,255,0.8);

          backdrop-filter: blur(15px);

          box-shadow:
            0 15px 45px
              rgba(40,50,60,0.055),
            inset 0 1px 0 white;
        }

        .summary-card {
          padding: 27px;

          border-radius: 22px;
        }

        .summary-card > p {
          max-width: 900px;

          margin: 0;

          font-size: 17px;
          line-height: 1.8;
        }

        .metrics {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 11px;
        }

        .metric {
          min-height: 135px;

          padding: 20px;

          border-radius: 18px;
        }

        .metric strong {
          display: block;

          margin-top: 11px;

          font-size: 28px;

          letter-spacing: -0.05em;
        }

        .metric small {
          display: block;

          margin-top: 5px;

          color: #929aa4;

          font-size: 10px;
        }

        .briefs {
          display: grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap: 10px;
        }

        .brief {
          min-height: 250px;

          padding: 18px;

          border-radius: 19px;
        }

        .brief-header {
          display: flex;
          align-items: center;

          gap: 10px;
        }

        .brief-icon {
          width: 34px;
          height: 34px;

          display: grid;
          place-items: center;

          flex: 0 0 34px;

          border: 1px solid
            color-mix(
              in srgb,
              var(--accent) 30%,
              #dfe4e9
            );

          border-radius: 10px;

          background: #fafcfd;

          font-size: 17px;
        }

        .brief-name {
          color: #3f3f46;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.08em;

          text-transform: uppercase;
        }

        .brief-role {
          margin-top: 2px;

          color: #a1a1aa;

          font-size: 9px;
        }

        .brief > p {
          margin: 15px 0 0;

          color: #3f3f46;

          font-size: 11px;
          line-height: 1.7;
        }

        .brief-section {
          margin-top: 17px;

          padding-top: 12px;

          border-top: 1px solid #edf0f2;
        }

        .brief-section > span,
        .brief-concern > span {
          display: block;

          color: #929aa4;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 0.13em;
        }

        .brief-section small {
          display: block;

          margin-top: 6px;

          color: #71717a;

          font-size: 10px;
          line-height: 1.55;
        }

        .brief-concern {
          margin-top: 13px;

          padding-top: 11px;

          border-top: 1px solid #edf0f2;
        }

        .brief-concern p {
          margin: 6px 0 0;

          color: #71717a;

          font-size: 10px;
          line-height: 1.55;
        }

        /* =====================================================
           ACTIONS
           ===================================================== */

        .actions {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 10px;
        }

        .action {
          min-height: 165px;

          padding: 19px;

          border-radius: 19px;
        }

        .action-number {
          color: #a1a1aa;

          font-size: 9px;
          font-weight: 900;
        }

        .action-content {
          margin-top: 12px;
        }

        .action-content strong {
          display: block;

          color: #27272a;

          font-size: 13px;
          line-height: 1.45;
        }

        .action-content p {
          margin: 8px 0 0;

          color: #71717a;

          font-size: 11px;
          line-height: 1.65;
        }

        .action-meta {
          display: flex;
          flex-wrap: wrap;

          gap: 7px;

          margin-top: 13px;
        }

        .action-meta span {
          padding: 5px 8px;

          border: 1px solid #dfe4e9;
          border-radius: 999px;

          background: #fafafa;

          color: #71717a;

          font-size: 9px;
          font-weight: 700;
        }

        /* =====================================================
           EVIDENCE LAB
           ===================================================== */

        .evidence-lab {
          position: relative;

          margin-top: 55px;

          padding: 28px;

          border: 1px solid
            rgba(174, 187, 199, 0.85);

          border-radius: 28px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.96),
              rgba(239,243,247,0.92)
            );

          box-shadow:
            0 30px 80px
              rgba(32,42,52,0.1),
            inset 0 1px 0 white;

          overflow: hidden;
        }

        .evidence-lab::after {
          content: "";

          position: absolute;
          top: -120px;
          right: -100px;

          width: 300px;
          height: 300px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(66,211,232,0.12),
              transparent 68%
            );

          pointer-events: none;
        }

        .evidence-header {
          position: relative;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;

          padding-bottom: 22px;

          border-bottom: 1px solid #dfe5ea;
        }

        .evidence-header h2 {
          margin: 6px 0 7px;

          font-size:
            clamp(28px, 4vw, 43px);

          letter-spacing: -0.045em;
        }

        .evidence-header p {
          max-width: 650px;

          margin: 0;

          color: #727d87;

          font-size: 12px;
          line-height: 1.7;
        }

        .pro-badge {
          padding: 8px 12px;

          border: 1px solid #bdebf2;
          border-radius: 999px;

          background: #effcff;

          color: #07859b;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 0.12em;

          white-space: nowrap;
        }

        .evidence-grid {
          display: grid;

          grid-template-columns:
            1.6fr 0.8fr;

          gap: 13px;

          margin-top: 20px;
        }

        .evidence-input-card,
        .evidence-url-card {
          padding: 19px;

          border: 1px solid #dfe5ea;

          border-radius: 19px;

          background:
            rgba(255,255,255,0.75);

          box-shadow:
            inset 0 1px 0 white;
        }

        .evidence-tabs {
          display: flex;
          gap: 17px;

          margin-bottom: 12px;

          border-bottom: 1px solid #edf0f2;
        }

        .evidence-tabs span {
          padding-bottom: 9px;

          color: #a0a8b0;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 0.12em;
        }

        .evidence-tabs span.active {
          color: #119db4;

          border-bottom: 2px solid #22bfd8;
        }

        .evidence-input-card textarea {
          width: 100%;
          min-height: 145px;

          resize: vertical;

          padding: 0;

          outline: none;
          border: 0;

          background: transparent;

          color: #252d35;

          font-size: 13px;
          line-height: 1.7;
        }

        .evidence-input-card textarea::placeholder {
          color: #aeb5bc;
        }

        .evidence-actions {
          display: flex;
          gap: 8px;

          margin-top: 13px;
        }

        .secondary-action,
        .file-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 39px;

          padding: 0 13px;

          border: 1px solid #d6dde3;
          border-radius: 10px;

          background: white;

          color: #53606c;

          font-size: 9px;
          font-weight: 900;

          cursor: pointer;
        }

        .secondary-action:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .file-action input {
          display: none;
        }

        .evidence-url-card input {
          width: 100%;

          margin-top: 14px;

          padding: 13px;

          outline: none;

          border: 1px solid #dce2e7;
          border-radius: 10px;

          background: #fff;

          color: #29323a;

          font-size: 11px;
        }

        .url-add {
          width: 100%;

          min-height: 39px;

          margin-top: 10px;

          border: 0;
          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #1e2933,
              #111820
            );

          color: white;

          font-size: 9px;
          font-weight: 900;
        }

        .url-add:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .evidence-list {
          margin-top: 16px;

          border: 1px solid #dce3e8;

          border-radius: 19px;

          background:
            rgba(255,255,255,0.72);

          overflow: hidden;
        }

        .evidence-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding: 14px 17px;

          border-bottom: 1px solid #e4e8ec;
        }

        .evidence-list-header span {
          display: block;

          color: #818b95;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 0.13em;
        }

        .evidence-list-header strong {
          display: block;

          margin-top: 3px;

          color: #35404a;

          font-size: 11px;
        }

        .evidence-secure {
          color: #0a9b76;

          font-size: 8px;
          font-weight: 900;
        }

        .evidence-item {
          display: grid;

          grid-template-columns:
            38px 65px 1fr 30px;

          align-items: center;

          gap: 12px;

          padding: 14px 17px;

          border-bottom: 1px solid #edf0f2;
        }

        .evidence-item:last-child {
          border-bottom: 0;
        }

        .evidence-number {
          color: #a0a8b0;

          font-size: 9px;
          font-weight: 900;
        }

        .evidence-type {
          width: fit-content;

          padding: 5px 7px;

          border: 1px solid #d8e2e8;
          border-radius: 999px;

          background: #f8fbfc;

          color: #667582;

          font-size: 7px;
          font-weight: 900;
        }

        .evidence-content strong {
          display: block;

          color: #313b45;

          font-size: 10px;
        }

        .evidence-content p {
          margin: 4px 0 0;

          color: #858e97;

          font-size: 9px;
          line-height: 1.5;
        }

        .remove-evidence {
          width: 28px;
          height: 28px;

          border: 1px solid #e1e5e9;
          border-radius: 8px;

          background: white;

          color: #929ba4;

          font-size: 16px;
        }

        .continue-research {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-top: 18px;
          padding: 17px;

          border: 1px solid #cfdde5;
          border-radius: 16px;

          background:
            linear-gradient(
              100deg,
              rgba(235,250,254,0.8),
              rgba(255,255,255,0.9)
            );
        }

        .continue-research span {
          color: #1599af;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 0.13em;
        }

        .continue-research p {
          margin: 4px 0 0;

          color: #6f7a84;

          font-size: 10px;
        }

        .continue-button {
          min-height: 43px;

          padding: 0 17px;

          border: 0;
          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #1e2933,
              #0d141b
            );

          color: white;

          font-size: 10px;
          font-weight: 900;

          box-shadow:
            0 10px 25px
              rgba(20,30,40,0.15);
        }

        .continue-button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* =====================================================
           LIMITATIONS / SOURCES
           ===================================================== */

        .limitations {
          padding: 19px;

          border-radius: 20px;
        }

        .limitations p {
          display: flex;

          gap: 8px;

          margin: 7px 0;

          color: #71717a;

          font-size: 11px;
          line-height: 1.6;
        }

        .limitations span {
          color: #a1a1aa;
        }

        .sources {
          padding: 8px 19px;

          border-radius: 20px;
        }

        .sources a {
          display: grid;

          grid-template-columns:
            40px 1fr 25px;

          align-items: center;

          gap: 10px;

          padding: 13px 0;

          border-bottom: 1px solid #edf0f2;

          color: #3f3f46;

          text-decoration: none;

          font-size: 11px;
        }

        .sources a:last-child {
          border-bottom: 0;
        }

        .sources a:hover b {
          text-decoration: underline;
        }

        .sources a > span {
          color: #a1a1aa;

          font-size: 9px;
          font-weight: 900;
        }

        .sources em {
          color: #a1a1aa;

          text-align: right;

          font-style: normal;

          font-size: 16px;
        }

        /* =====================================================
           BRANDING
           ===================================================== */

        .provider-info {
          display: flex;
          flex-wrap: wrap;

          gap: 8px;

          margin-top: 24px;

          color: #7d8791;

          font-size: 9px;
        }

        .provider-info span {
          padding: 7px 11px;

          border: 1px solid #d4dce3;
          border-radius: 999px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,0.9),
              rgba(239,243,247,0.8)
            );

          color: #65717c;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 0.1em;

          box-shadow:
            inset 0 1px 0 white;
        }

        /* =====================================================
           FOOTER
           ===================================================== */

        footer {
          display: flex;

          justify-content: space-between;

          gap: 20px;

          padding:
            28px 0 45px;

          border-top: 1px solid #dfe4e9;

          color: #9aa2aa;

          font-size: 9px;

          letter-spacing: 0.08em;

          text-transform: uppercase;
        }

        footer strong {
          color: #525b66;

          margin-right: 10px;
        }

        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 1000px) {
          .agents {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .briefs {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .scorecard-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 720px) {
          .welcome {
            width: calc(100% - 24px);
            padding-top: 18px;
          }

          .welcome-video-shell {
            min-height: 560px;
            border-radius: 22px;
          }

          .welcome-content {
            min-height: 560px;
            padding: 42px 28px;
          }

          .welcome-content h2 {
            font-size:
              clamp(42px, 12vw, 62px);
          }

          .header {
            padding: 12px 16px;
          }

          .online {
            display: none;
          }

          .hero {
            padding-top: 65px;
          }

          h1 {
            font-size: 46px;
          }

          .research-box {
            padding: 20px;
          }

          .research-bottom,
          .section-heading,
          footer,
          .scorecard-top,
          .evidence-header,
          .continue-research {
            align-items: flex-start;
            flex-direction: column;
          }

          .launch {
            width: 100%;
            justify-content: center;
          }

          .agents,
          .briefs,
          .metrics,
          .actions,
          .scorecard-grid,
          .evidence-grid {
            grid-template-columns: 1fr;
          }

          .score-agent {
            min-height: auto;
          }

          .evidence-item {
            grid-template-columns:
              30px 55px 1fr 28px;
          }

          .live-meta {
            flex-direction: column;
            gap: 5px;
          }

          footer {
            gap: 12px;
          }

          .overall-performance
            > div:first-child {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 450px) {
          .brand-subtitle {
            display: none;
          }

          .brand-title {
            font-size: 10px;
          }

          h1 {
            font-size: 39px;
          }

          .hero-text {
            font-size: 14px;
          }

          .welcome-content {
            padding: 35px 22px;
          }

          .scorecard-shell,
          .evidence-lab {
            padding: 20px;
          }

          .evidence-actions {
            flex-direction: column;
          }

          .secondary-action,
          .file-action {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}