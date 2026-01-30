"use client";

import { useCallback, useEffect, useState } from "react";

import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import JobList from "@/components/JobList";
import AddJobModal from "@/components/AddJobModal";
import AIMatchScore from "@/components/AIMatchScore";
import ResumeUpload from "@/components/ResumeUpload";
import Logo from "@/components/Logo";

import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  evaluateResumeUpload,
  fetchMatchScore,
  type ResumeAnalysis,
} from "@/lib/api";

export type JobStatus =
  | "applied"
  | "reply"
  | "initial-interview"
  | "OA"
  | "final-interview"
  | "offer"
  | "accepted"
  | "offer-rejected"
  | "rejected"
  | "no-reply";

export interface Job {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  dateApplied: string;
  notes?: string;
  matchScore?: number;
  description?: string;
  matchReason?: string;
  stageHistory?: JobStatus[];
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "jobs" | "ai-match" | "resume"
  >("dashboard");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [resumeStatus, setResumeStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);

  const handleResumeTextChange = (text: string) => {
    setResumeText(text);
    setResumeAnalysis(null);
    setResumeStatus("idle");
    setResumeError(null);
  };

  const analyzeResume = async (payload: { file?: File; text?: string }) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setResumeStatus("uploading");
    setResumeError(null);

    try {
      const result = await evaluateResumeUpload(token, payload);
      setResumeText(result.resumeText);
      setResumeAnalysis(result.analysis);
      setResumeStatus("success");
    } catch (err) {
      console.error("Resume analysis failed", err);
      setResumeStatus("error");
      const message =
        err instanceof Error ? err.message : "Resume analysis failed.";
      setResumeError(message);
    }
  };

  const runMatchScoring = async (jobInput: {
    company: string;
    position: string;
    description?: string;
  }) => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      setMatchError(null);
      const result = await fetchMatchScore(token, {
        company: jobInput.company,
        role: jobInput.position,
        description: jobInput.description || "",
        resumeText,
      });
      return result;
    } catch (err) {
      console.error("AI match scoring failed", err);
      const message =
        err instanceof Error ? err.message : "AI match scoring failed.";
      setMatchError(`${message} Job was saved without an AI score.`);
      return null;
    }
  };

  const loadJobs = useCallback(async (token: string) => {
    try {
      const data = await getJobs(token);
      if (!data.error) {
        setJobs(data);
      }
    } catch (err) {
      console.error("Failed to load jobs", err);
    }
  }, []);

  // Load jobs after login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsAuthenticated(true);
    loadJobs(token);
  }, [loadJobs]);

  const handleAddJob = async (job: Omit<Job, "id">) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const aiResult = await runMatchScoring({
      company: job.company,
      position: job.position,
      description: job.description,
    });

    const payload = {
      ...job,
      matchScore: aiResult?.score ?? job.matchScore,
      matchReason: aiResult?.reason ?? job.matchReason,
    };

    const result = await createJob(token, payload);
    if (!result.error) {
      setJobs((prev) => [...prev, result]);
      setIsModalOpen(false);
    }
  };

  const handleEditJob = async (job: Job) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const existingJob = jobs.find((j) => j.id === job.id);
    let payload: Job = existingJob ? { ...existingJob, ...job } : job;

    const needsRescore =
      existingJob &&
      (existingJob.company !== payload.company ||
        existingJob.position !== payload.position ||
        (existingJob.description || "") !== (payload.description || ""));

    if (needsRescore) {
      const aiResult = await runMatchScoring({
        company: payload.company,
        position: payload.position,
        description: payload.description,
      });

      if (aiResult) {
        payload = {
          ...payload,
          matchScore: aiResult.score,
          matchReason: aiResult.reason,
        };
      }
    }

    const result = await updateJob(token, job.id, payload);
    if (!result.error) {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? result : j)));
      setIsModalOpen(false);
      setEditingJob(null);
    }
  };

  const handleDeleteJob = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    await deleteJob(token, id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setJobs([]);
    setCurrentView("dashboard");
    setResumeText("");
    setResumeAnalysis(null);
    setResumeStatus("idle");
    setResumeError(null);
    setMatchError(null);
  };

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={(token) => {
          setIsAuthenticated(true);
          loadJobs(token);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#d4d1c8] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">

            <div className="flex items-center">
              <Logo className="w-12 h-12" />
            </div>

            <div className="flex gap-2">
              {["dashboard", "jobs", "ai-match", "resume"].map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view as any)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    currentView === view
                      ? "bg-[#8a9a8f] text-white shadow-md"
                      : "text-[#5a6d5e] hover:bg-[#e8e6df]"
                  }`}
                >
                  {view === "ai-match"
                    ? "AI Match"
                    : view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingJob(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#6b8273] text-white hover:bg-[#5a6d5e] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  + Add Job
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border border-[#d4d1c8] text-[#5a6d5e] hover:bg-[#e8e6df] transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {matchError && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#f5c6ab] bg-[#fff7f2] px-4 py-3 text-sm text-[#7a4432]">
            <span>{matchError}</span>
            <button
              onClick={() => setMatchError(null)}
              className="rounded-lg px-3 py-1 text-[#7a4432] transition-colors duration-200 hover:bg-[#f5c6ab]/30"
            >
              Dismiss
            </button>
          </div>
        )}
        {currentView === "dashboard" && <Dashboard jobs={jobs} />}
        {currentView === "jobs" && (
          <JobList jobs={jobs} onEdit={openEditModal} onDelete={handleDeleteJob} />
        )}
        {currentView === "ai-match" && <AIMatchScore jobs={jobs} />}
        {currentView === "resume" && (
          <ResumeUpload
            resumeText={resumeText}
            analysis={resumeAnalysis}
            status={resumeStatus}
            error={resumeError}
            onResumeChange={handleResumeTextChange}
            onSubmit={analyzeResume}
          />
        )}
      </main>

      {isModalOpen && (
        <AddJobModal
          job={editingJob}
          onClose={() => {
            setIsModalOpen(false);
            setEditingJob(null);
          }}
          onSave={(job) => {
            if (editingJob) handleEditJob(job as Job);
            else handleAddJob(job as Omit<Job, "id">);
          }}
        />
      )}
    </div>
  );
}
