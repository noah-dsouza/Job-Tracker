"use client";

import { useEffect, useState } from "react";

import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import JobList from "@/components/JobList";
import AddJobModal from "@/components/AddJobModal";
import AIMatchScore from "@/components/AIMatchScore";
import ResumeUpload from "@/components/ResumeUpload";
import Logo from "@/components/Logo";

import { getJobs, createJob, updateJob, deleteJob } from "@/lib/api";

export interface Job {
  id: string;
  company: string;
  position: string;
  status:
    | "applied"
    | "reply"
    | "initial-interview"
    | "OA"
    | "final-interview"
    | "offer"
    | "accepted"
    | "rejected"
    | "no-reply";
  dateApplied: string;
  notes?: string;
  matchScore?: number;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "jobs" | "ai-match" | "resume"
  >("dashboard");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [resumeText, setResumeText] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);

  // Load jobs after login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsAuthenticated(true);

    getJobs(token).then((data) => {
      if (!data.error) setJobs(data);
    });
  }, []);

  const handleAddJob = async (job: Omit<Job, "id">) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const result = await createJob(token, job);
    if (!result.error) {
      setJobs([...jobs, result]);
      setIsModalOpen(false);
    }
  };

  const handleEditJob = async (job: Job) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const result = await updateJob(token, job.id, job);
    if (!result.error) {
      setJobs(jobs.map((j) => (j.id === job.id ? result : j)));
      setIsModalOpen(false);
      setEditingJob(null);
    }
  };

  const handleDeleteJob = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    await deleteJob(token, id);
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#d4d1c8] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <h1 className="text-[#3d5a4f] tracking-tight">Greenlit</h1>
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

              <button
                onClick={() => {
                  setEditingJob(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#6b8273] text-white hover:bg-[#5a6d5e] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                + Add Job
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === "dashboard" && <Dashboard jobs={jobs} />}
        {currentView === "jobs" && (
          <JobList jobs={jobs} onEdit={openEditModal} onDelete={handleDeleteJob} />
        )}
        {currentView === "ai-match" && <AIMatchScore jobs={jobs} />}
        {currentView === "resume" && (
          <ResumeUpload resumeText={resumeText} onResumeChange={setResumeText} />
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
