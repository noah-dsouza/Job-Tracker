"use client";

import { useState } from "react";

import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import JobList from "@/components/JobList";
import AddJobModal from "@/components/AddJobModal";
import AIMatchScore from "@/components/AIMatchScore";
import ResumeUpload from "@/components/ResumeUpload";
import Logo from "@/components/Logo";

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

  const [jobs, setJobs] = useState<Job[]>([
    { id: "1", company: "TechCorp", position: "Frontend Developer", status: "initial-interview", dateApplied: "2025-11-01", matchScore: 87 },
    { id: "2", company: "StartupXYZ", position: "Full Stack Engineer", status: "OA", dateApplied: "2025-11-05", matchScore: 92 },
    { id: "3", company: "BigTech Inc", position: "Software Engineer", status: "reply", dateApplied: "2025-11-10", matchScore: 78 },
    { id: "4", company: "DesignCo", position: "UI Developer", status: "applied", dateApplied: "2025-11-12", matchScore: 85 },
    { id: "5", company: "DataCorp", position: "Frontend Engineer", status: "no-reply", dateApplied: "2025-10-15", matchScore: 65 },
    { id: "6", company: "CloudSystems", position: "React Developer", status: "rejected", dateApplied: "2025-10-20", matchScore: 70 },
    { id: "7", company: "AI Startup", position: "JavaScript Developer", status: "final-interview", dateApplied: "2025-11-08", matchScore: 94 },
    { id: "8", company: "FinTech Solutions", position: "Senior Developer", status: "offer", dateApplied: "2025-11-03", matchScore: 96 },
  ]);

  const handleAddJob = (job: Omit<Job, "id">) => {
    const newJob = { ...job, id: Date.now().toString() };
    setJobs([...jobs, newJob]);
    setIsModalOpen(false);
  };

  const handleEditJob = (job: Job) => {
    setJobs(jobs.map((j) => (j.id === job.id ? job : j)));
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleDeleteJob = (id: string) => {
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
          onSave={(job: Job) =>
            editingJob ? handleEditJob(job) : handleAddJob(job)
          }
        />
      )}
    </div>
  );
}
