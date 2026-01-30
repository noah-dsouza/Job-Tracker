import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Send, Loader2, AlertCircle, MessageSquare } from "lucide-react";

import type { Job } from "@/components/App";
import type { ResumeAnalysis, CoachChatMessage } from "@/lib/api";
import { sendCoachChat } from "@/lib/api";

interface MatchCoachChatProps {
  jobs: Job[];
  resumeText: string;
  resumeAnalysis: ResumeAnalysis | null;
}

const INITIAL_MESSAGE = {
  role: "assistant" as const,
  content:
    "Ask me about any saved job and I'll highlight where your resume shines, what's missing, and how to tailor it.",
};

export default function MatchCoachChat({ jobs, resumeText, resumeAnalysis }: MatchCoachChatProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || "");
  const [messages, setMessages] = useState<CoachChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentJob = useMemo(() => {
    if (!jobs.length) return null;
    return jobs.find((job) => job.id === selectedJobId) || jobs[0];
  }, [jobs, selectedJobId]);

  useEffect(() => {
    if (!jobs.length) {
      setSelectedJobId("");
      setMessages([INITIAL_MESSAGE]);
      return;
    }

    if (!jobs.find((job) => job.id === selectedJobId)) {
      setSelectedJobId(jobs[0].id);
      setMessages([INITIAL_MESSAGE]);
    }
  }, [jobs, selectedJobId]);

  const canChat = Boolean(resumeText?.trim()?.length) || Boolean(resumeAnalysis);

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage) return;
    if (!currentJob) {
      setError("Add a job first so the coach has something to review.");
      return;
    }
    if (!canChat) {
      setError("Upload or paste your resume before using the coach.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in again to chat with the coach.");
      return;
    }

    setInput("");
    setError(null);

    const nextMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const jobPayload = {
        id: currentJob.id,
        company: currentJob.company,
        position: currentJob.position,
        role: currentJob.position,
        status: currentJob.status,
        matchScore: currentJob.matchScore,
        matchReason: currentJob.matchReason,
        description: currentJob.description,
      };

      const resumePayload = {
        summary: resumeAnalysis?.summary,
        strengths: resumeAnalysis?.strengths,
        weaknesses: resumeAnalysis?.weaknesses,
        text: resumeText,
      };

      const response = await sendCoachChat(token, {
        message: userMessage,
        job: jobPayload,
        resume: resumePayload,
        history: nextMessages,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Chat request failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!jobs.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#d4d1c8] animate-fade-in">
        <div className="flex items-center gap-3 mb-2 text-[#5a6d5e]">
          <MessageSquare className="w-5 h-5" />
          <h3 className="text-[#3d5a4f]">AI Match Coach</h3>
        </div>
        <p className="text-[#7a8a7e]">
          Add a job application first, then come back for tailored coaching tips.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#d4d1c8] animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-[#3d5a4f]">
            <Sparkles className="w-6 h-6" />
            <div>
              <h3 className="text-[#3d5a4f]">AI Match Coach</h3>
              <p className="text-[#7a8a7e] text-sm">
                Chat about how your resume fits each role and how to improve it.
              </p>
            </div>
          </div>
          <select
            value={currentJob?.id || ""}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              setMessages([INITIAL_MESSAGE]);
            }}
            className="px-4 py-2 rounded-xl bg-[#f5f3ed] border border-[#e0ddd0] text-[#3d5a4f]"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.position} · {job.company}
              </option>
            ))}
          </select>
        </div>
        {!canChat && (
          <div className="flex items-center gap-2 rounded-xl border border-[#d4d1c8] bg-white px-4 py-3 text-sm text-[#7a8a7e]">
            <AlertCircle className="w-4 h-4" />
            <span>Upload or paste your resume to unlock coaching tips.</span>
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-6">
        {messages.map((msg, index) => (
          <div
            key={`${msg.role}-${index}-${msg.content.slice(0, 10)}`}
            className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${
              msg.role === "assistant"
                ? "bg-[#f8f6f3] border-[#e0ddd0] text-[#3d5a4f]"
                : "bg-[#6b8273] border-[#5a6d5e] text-white ml-auto"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-[#7a8a7e] text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Coach is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#d97b66] bg-[#fef4f2] px-4 py-3 text-sm text-[#7a4432] mb-4">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask what you’re missing, how to tailor your resume, or what to improve..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white border border-[#d4d1c8] text-[#3d5a4f] focus:outline-none focus:ring-2 focus:ring-[#8a9a8f]"
            disabled={!canChat || isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || !canChat || isLoading}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white transition-all duration-300 ${
              !input.trim() || !canChat || isLoading
                ? "bg-[#c4c0b9] cursor-not-allowed"
                : "bg-[#6b8273] hover:bg-[#5a6d5e] hover:shadow-lg"
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isLoading ? "Sending" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
