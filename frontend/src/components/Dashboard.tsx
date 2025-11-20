import { Job } from '../App';
import { SankeyChart } from './SankeyChart';

interface DashboardProps {
  jobs: Job[];
}

export function Dashboard({ jobs }: DashboardProps) {
  // Calculate statistics
  const stats = {
    applied: jobs.filter(j => j.status === 'applied').length,
    noReply: jobs.filter(j => j.status === 'no-reply').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
    reply: jobs.filter(j => j.status === 'reply').length,
    initialInterview: jobs.filter(j => j.status === 'initial-interview').length,
    OA: jobs.filter(j => j.status === 'OA').length,
    finalInterview: jobs.filter(j => j.status === 'final-interview').length,
    offer: jobs.filter(j => j.status === 'offer').length,
    accepted: jobs.filter(j => j.status === 'accepted').length,
  };

  const totalApplied = jobs.length;
  const totalReplies = stats.reply + stats.initialInterview + stats.OA + stats.finalInterview + stats.offer + stats.accepted;
  const responseRate = totalApplied > 0 ? ((totalReplies / totalApplied) * 100).toFixed(1) : '0';
  const offerRate = totalApplied > 0 ? (((stats.offer + stats.accepted) / totalApplied) * 100).toFixed(1) : '0';

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
          <div className="text-[#8a9a8f]">{stats.initialInterview + stats.finalInterview}</div>
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