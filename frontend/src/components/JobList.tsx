import { useState } from 'react';
import { Trash2, Edit, Search } from 'lucide-react';
import type { Job } from "@/components/App";

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export function JobList({ jobs, onEdit, onDelete }: JobListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-[#3d5a4f] mb-2">All Applications</h2>
        <p className="text-[#7a8a7e]">Manage your job applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a8a7e] w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company or position..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-[#d4d1c8] text-[#3d5a4f] focus:outline-none focus:ring-2 focus:ring-[#8a9a8f] focus:border-transparent transition-all duration-300"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-[#d4d1c8] text-[#3d5a4f] focus:outline-none focus:ring-2 focus:ring-[#8a9a8f] focus:border-transparent transition-all duration-300"
        >
          <option value="all">All Status</option>
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

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.map((job, index) => (
          <div
            key={job.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#d4d1c8] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up group"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[#3d5a4f] mb-1">{job.position}</h3>
                    <p className="text-[#7a8a7e]">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => onEdit(job)}
                      className="p-2 rounded-lg text-[#6b8273] hover:bg-[#eae8df] transition-all duration-300 hover:scale-110"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(job.id)}
                      className="p-2 rounded-lg text-[#b39189] hover:bg-[#f5e8e4] transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-white transition-all duration-300 hover:shadow-lg hover:scale-105 ${getStatusColor(job.status)}`}>
                    {getStatusLabel(job.status)}
                  </span>
                  <span className="text-[#7a8a7e]">Applied: {job.dateApplied}</span>
                  {job.matchScore && (
                    <span className="px-3 py-1 rounded-full bg-[#f5f3ed] text-[#6b8273]">
                      Match: {job.matchScore}%
                    </span>
                  )}
                </div>

                {job.notes && (
                  <p className="mt-3 text-[#7a8a7e] text-sm">{job.notes}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#d4d1c8]">
          <Search className="w-16 h-16 text-[#8a9a8f] mx-auto mb-4" />
          <p className="text-[#7a8a7e]">No jobs found</p>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'applied': 'bg-[#9ca8a0]',
    'no-reply': 'bg-[#a8a095]',
    'rejected': 'bg-[#b39189]',
    'reply': 'bg-[#8a9a8f]',
    'initial-interview': 'bg-[#7a8d7f]',
    'OA': 'bg-[#6b8273]',
    'final-interview': 'bg-[#5a6d5e]',
    'offer': 'bg-[#c5a987]',
    'accepted': 'bg-[#6b8273]',
  };
  return colors[status] || 'bg-[#9ca8a0]';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'applied': 'Applied',
    'no-reply': 'No Reply',
    'rejected': 'Rejected',
    'reply': 'Reply',
    'initial-interview': 'Initial Interview',
    'OA': 'OA Requested',
    'final-interview': 'Final Interview',
    'offer': 'Offer',
    'accepted': 'Accepted',
  };
  return labels[status] || status;
}
export default JobList;
