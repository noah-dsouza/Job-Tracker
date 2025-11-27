"use client";

import { useCallback, useEffect, useState } from "react";

import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import JobList from "@/components/JobList";
import AddJobModal from "@/components/AddJobModal";
import AIMatchScore from "@/components/AIMatchScore";
import ResumeUpload from "@/components/ResumeUpload";
import Logo from "@/components/Logo";

import { getJobs, createJob, updateJob, deleteJob } from "@/lib/api";

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

  const [jobs, setJobs] = useState<Job[]>([]);

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

    const result = await createJob(token, job);
    if (!result.error) {
      setJobs((prev) => [...prev, result]);
      setIsModalOpen(false);
    }
  };

  const handleEditJob = async (job: Job) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const result = await updateJob(token, job.id, job);
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

<<<<<<< HEAD
      
=======
>>>>>>> 76fcc03 (	modified:   db.json)
            <div className="flex items-center">
              <Logo className="w-14 h-14" />
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
