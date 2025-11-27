import type { Job } from "@/components/App";
import { SankeyChart } from './SankeyChart';

interface DashboardProps {
  jobs: Job[];
}

const stagePresets: Record<Job["status"], Job["status"][]> = {
  'applied': ['applied'],
  'reply': ['applied', 'reply'],
  'no-reply': ['applied', 'no-reply'],
  'initial-interview': ['applied', 'reply', 'initial-interview'],
  'OA': ['applied', 'reply', 'OA'],
  'final-interview': ['applied', 'reply', 'initial-interview', 'final-interview'],
  'offer': ['applied', 'reply', 'initial-interview', 'final-interview', 'offer'],
  'accepted': ['applied', 'reply', 'initial-interview', 'final-interview', 'offer', 'accepted'],
  'offer-rejected': ['applied', 'reply', 'initial-interview', 'final-interview', 'offer', 'offer-rejected'],
  'rejected': ['applied', 'reply', 'rejected'],
};

function getStageHistory(job: Job): Job["status"][] {
  const existing = Array.isArray(job.stageHistory) ? job.stageHistory : [];
  const defaults = stagePresets[job.status] ?? ['applied', job.status];
  return Array.from(new Set<Job["status"]>([...existing, ...defaults, 'applied']));
}

export function Dashboard({ jobs }: DashboardProps) {
  const jobHistories = jobs.map((job) => ({
    job,
    history: getStageHistory(job),
  }));

  const countStage = (stage: Job["status"]) =>
    jobHistories.filter(({ history }) => history.includes(stage)).length;

  const totalApplied = jobs.length;
  const totalRejected = countStage('rejected');
  const rejectedFromOA = jobHistories.filter(({ history }) =>
    history.includes('rejected') &&
    history.includes('OA') &&
    !history.includes('initial-interview')
  ).length;
  const rejectedFromInitial = Math.max(totalRejected - rejectedFromOA, 0);

  const stats = {
    applied: totalApplied,
    noReply: countStage('no-reply'),
    rejected: totalRejected,
    rejectedFromInitial,
    rejectedFromOA,
    reply: countStage('reply'),
    initialInterview: countStage('initial-interview'),
    OA: countStage('OA'),
    finalInterview: countStage('final-interview'),
    offer: countStage('offer'),
    offerRejected: countStage('offer-rejected'),
    accepted: countStage('accepted'),
  };

  const responseRate = totalApplied > 0 ? ((stats.reply / totalApplied) * 100).toFixed(1) : '0';
  const offerRate = totalApplied > 0 ? ((stats.offer / totalApplied) * 100).toFixed(1) : '0';
  const activeInterviews = jobHistories.filter(({ history }) =>
    history.includes('initial-interview') || history.includes('final-interview')
  ).length;

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-[#3d5a4f] mb-2">Your Job Search Overview</h2>
        <p className="text-[#7a8a7e]">Track your application journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#d4d1c8] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-[#7a8a7e] mb-1">Total Applied</div>
          <div className="text-[#3d5a4f]">{totalApplied}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#d4d1c8] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-[#7a8a7e] mb-1">Response Rate</div>
          <div className="text-[#6b8273]">{responseRate}%</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#d4d1c8] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-[#7a8a7e] mb-1">Active Interviews</div>
          <div className="text-[#8a9a8f]">{activeInterviews}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#d4d1c8] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-[#7a8a7e] mb-1">Offer Rate</div>
          <div className="text-[#6b8273]">{offerRate}%</div>
        </div>
      </div>

      {/* Sankey Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#d4d1c8] animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-[#3d5a4f] mb-6">Application Flow</h3>
        <SankeyChart stats={stats} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#d4d1c8] animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-[#3d5a4f] mb-4">Recent Applications</h3>
        <div className="space-y-3">
          {jobs.slice(0, 5).map((job, index) => (
            <div 
              key={job.id} 
              className="flex items-center justify-between p-4 rounded-xl bg-[#f8f6f3] hover:bg-[#eae8df] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${0.7 + index * 0.1}s` }}
            >
              <div>
                <div className="text-[#3d5a4f]">{job.position}</div>
                <div className="text-[#7a8a7e]">{job.company}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-white transition-all duration-300 hover:shadow-lg ${getStatusColor(job.status)}`}>
                  {getStatusLabel(job.status)}
                </span>
                <span className="text-[#7a8a7e]">{job.dateApplied}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
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
    'offer-rejected': 'bg-[#d97b66]',
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
    'offer-rejected': 'Offer Rejected',
  };
  return labels[status] || status;
}
export default Dashboard;
