import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Job } from "@/components/App";

interface AddJobModalProps {
  job?: Job | null;
  onClose: () => void;
  onSave: (job: Omit<Job, "id"> | Job) => void;
}

export default function AddJobModal({ job, onClose, onSave }: AddJobModalProps) {
  const [formData, setFormData] = useState({
    company: job?.company || "",
    position: job?.position || "",
    status: job?.status || "applied",
    dateApplied: job?.dateApplied || new Date().toISOString().split("T")[0],
    notes: job?.notes || "",
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (job) {
      // editing — send full job INCLUDING id
      onSave({ ...formData, id: job.id });
    } else {
      // creating — send ONLY what backend accepts
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-[#3d5a4f]/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white/95 backdrop-blur-md rounded-t-3xl md:rounded-3xl shadow-2xl border border-[#d4d1c8] animate-slide-up flex flex-col">
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-[#d4d1c8] px-8 py-6 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-[#3d5a4f]">{job ? "Edit Job" : "Add New Job"}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#7a8a7e] hover:bg-[#eae8df] transition-all duration-300 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <label htmlFor="company" className="text-[#5a6d5e] block">Company *</label>
                <input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#f5f3ed] border border-[#e0ddd0] text-[#3d5a4f] focus:outline-none focus:ring-2 focus:ring-[#8a9a8f]"
                  required
                />
              </div>

              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.15s" }}>
                <label htmlFor="position" className="text-[#5a6d5e] block">Position *</label>
                <input
                  id="position"
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#f5f3ed] border border-[#e0ddd0] text-[#3d5a4f]"
                  required
                />
              </div>

              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <label htmlFor="status" className="text-[#5a6d5e] block">Status *</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Job["status"] })}
                  className="w-full px-4 py-3 rounded-xl bg-[#f5f3ed] border border-[#e0ddd0] text-[#3d5a4f]"
                  required
                >
                  <option value="applied">Applied</option>
                  <option value="reply">Reply</option>
                  <option value="initial-interview">Initial Interview</option>
                  <option value="OA">OA Requested</option>
                  <option value="final-interview">Final Interview</option>
                  <option value="offer">Offer</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="no-reply">No Reply</option>
                </select>
              </div>

              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.25s" }}>
                <label htmlFor="dateApplied" className="text-[#5a6d5e] block">Date Applied *</label>
                <input
                  id="dateApplied"
                  type="date"
                  value={formData.dateApplied}
                  onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#f5f3ed] border border-[#e0ddd0] text-[#3d5a4f]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <label htmlFor="notes" className="text-[#5a6d5e] block">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#f5f3ed] border border-[#e0ddd0] text-[#3d5a4f] resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl bg-[#eae8df] text-[#5a6d5e] hover:bg-[#d4d1c8]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-[#6b8273] text-white hover:bg-[#5a6d5e] hover:shadow-xl hover:-translate-y-1"
              >
                {job ? "Update" : "Add"} Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
