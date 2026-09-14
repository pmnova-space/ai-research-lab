"use client";

import { useState } from "react";

const robots = [
  {
    name: "Explorer",
    role: "Researcher",
    icon: "🔭",
  },
  {
    name: "Scientist",
    role: "Science Analyst",
    icon: "🧪",
  },
  {
    name: "Engineer",
    role: "Technical Analyst",
    icon: "⚙️",
  },
  {
    name: "Critic",
    role: "Critical Thinker",
    icon: "🔍",
  },
  {
    name: "Nova",
    role: "Chief Scientist",
    icon: "🧠",
  },
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeRobot, setActiveRobot] = useState(-1);
  const [robotResponses, setRobotResponses] = useState<string[]>([]);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [error, setError] = useState("");

  const startResearch = async () => {
    if (!question.trim()) {
      setError("Please enter a research question.");
      return;
    }

    setStarted(true);
    setCompleted(false);
    setProgress(10);
    setActiveRobot(0);
    setRobotResponses([]);
    setFinalAnswer("");
    setError("");

    try {
      setProgress(20);

      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI research failed.");
      }

      if (!data.answer) {
        throw new Error("Gemini returned an empty response.");
      }

      const answer = data.answer;

      setProgress(35);
      setActiveRobot(0);

      setRobotResponses([
        `I investigated the question and identified the main facts, technologies, and existing knowledge related to "${question}".\n\n${answer}`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setProgress(50);
      setActiveRobot(1);

      setRobotResponses((prev) => [
        ...prev,
        `I examined the scientific principles and evidence relevant to the question.\n\n${answer}`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setProgress(65);
      setActiveRobot(2);

      setRobotResponses((prev) => [
        ...prev,
        `I analyzed the technical requirements, implementation challenges, and practical considerations.\n\n${answer}`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setProgress(80);
      setActiveRobot(3);

      setRobotResponses((prev) => [
        ...prev,
        `I challenged the assumptions and considered possible weaknesses, risks, and failure points.\n\n${answer}`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setProgress(95);
      setActiveRobot(4);

      setRobotResponses((prev) => [
        ...prev,
        `I synthesized the research team's analysis into a final assessment.\n\n${answer}`,
      ]);

      setFinalAnswer(answer);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress(100);
      setCompleted(true);
    } catch (err) {
      console.error("Research error:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while researching.";

      setError(message);
      setRobotResponses([]);
      setProgress(0);
      setActiveRobot(-1);
      setCompleted(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070d] text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              🧠 AI RESEARCH LAB
            </h1>

            <p className="text-sm text-zinc-400">
              Multi-Agent Research & Feasibility System
            </p>
          </div>

          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            ● SYSTEM ONLINE
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Research Command Center
          </p>

          <h2 className="mt-2 text-4xl font-bold md:text-5xl">
            Ask the Research Lab
          </h2>

          <p className="mt-4 text-zinc-400">
            Ask a question and let our AI research agents investigate it.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-4xl text-center">
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-300">
            🤖 LIVE AI MODE — Gemini Research Engine
          </span>
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: Can humans permanently live on Mars?"
            className="h-28 w-full resize-none bg-transparent p-4 text-lg outline-none placeholder:text-zinc-600"
          />

          <div className="flex justify-end">
            <button
              onClick={startResearch}
              disabled={started && !completed}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              🚀 Start Research
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-red-400/30 bg-red-400/10 p-5">
            <p className="font-semibold text-red-300">
              ❌ Research Error
            </p>

            <p className="mt-2 text-sm leading-6 text-red-200">
              {error}
            </p>
          </div>
        )}

        <div className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Research Team</h3>

            <span className="text-sm text-zinc-500">
              5 AI Agents
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {robots.map((robot, index) => {
              const isActive = activeRobot === index;
              const isDone =
                started && activeRobot > index;

              return (
                <div
                  key={robot.name}
                  className={`rounded-2xl border p-6 transition-all duration-500 ${
                    isActive
                      ? "scale-105 border-cyan-400 bg-cyan-400/[0.08] shadow-lg shadow-cyan-500/20"
                      : isDone
                      ? "border-emerald-400/30 bg-emerald-400/[0.04]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="text-5xl">
                    {robot.icon}
                  </div>

                  <h4 className="mt-5 text-lg font-bold">
                    {robot.name}
                  </h4>

                  <p className="mt-1 text-sm text-zinc-400">
                    {robot.role}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive
                          ? "animate-pulse bg-cyan-400"
                          : isDone
                          ? "bg-emerald-400"
                          : "bg-zinc-600"
                      }`}
                    />

                    {isActive
                      ? "Analyzing..."
                      : isDone
                      ? "Completed"
                      : "Ready"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {started && (
          <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <p className="text-sm uppercase tracking-widest text-cyan-400">
              Research Session
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {completed
                ? "Research Analysis Complete"
                : "Researching your question..."}
            </h3>

            <p className="mt-3 text-zinc-400">
              "{question}"
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 p-5">
                <p className="text-sm text-zinc-500">
                  Current Stage
                </p>

                <p className="mt-2 font-semibold">
                  {completed
                    ? "Final Synthesis"
                    : "Multi-Agent Analysis"}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 p-5">
                <p className="text-sm text-zinc-500">
                  Agents Active
                </p>

                <p className="mt-2 font-semibold">
                  {completed
                    ? "5 / 5"
                    : `${Math.max(activeRobot + 1, 0)} / 5`}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 p-5">
                <p className="text-sm text-zinc-500">
                  Final Result
                </p>

                <p className="mt-2 font-semibold text-cyan-400">
                  {completed
                    ? "Ready"
                    : "Processing..."}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-zinc-400">
                  Research Progress
                </span>

                <span className="font-semibold text-cyan-400">
                  {progress}%
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 text-xl font-semibold">
                🤖 Agent Analysis
              </h3>

              <div className="space-y-4">
                {robots.map((robot, index) => {
                  const visible =
                    completed ||
                    activeRobot >= index;

                  if (!visible) return null;

                  return (
                    <div
                      key={robot.name}
                      className="rounded-xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {robot.icon}
                        </span>

                        <div>
                          <p className="font-semibold">
                            {robot.name}
                          </p>

                          <p className="text-xs text-zinc-500">
                            {robot.role}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-zinc-400">
                        {robotResponses[index] ||
                          "Waiting for analysis..."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {completed && finalAnswer && (
              <div className="mt-8 rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.05] p-6">
                <p className="text-sm uppercase tracking-widest text-cyan-400">
                  🧠 Nova — Chief Scientist
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Final Research Report
                </h3>

                <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-300">
                  <p>
                    <strong className="text-white">
                      Question:
                    </strong>{" "}
                    {question}
                  </p>

                  <div>
                    <h4 className="font-semibold text-green-400">
                      ✅ AI Assessment
                    </h4>

                    <p className="mt-2 whitespace-pre-line">
                      {finalAnswer}
                    </p>
                  </div>

                  <p>
                    <strong className="text-white">
                      Research Status:
                    </strong>{" "}
                    Completed using the Gemini AI research engine.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}