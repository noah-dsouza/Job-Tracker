import type { Job } from "@/components/App";
import { Sparkles, TrendingUp, Target } from 'lucide-react';

interface AIMatchScoreProps {
  jobs: Job[];
}

export function AIMatchScore({ jobs }: AIMatchScoreProps) {
  const scoredJobs = jobs.filter(
    (job): job is Job & { matchScore: number } =>
      typeof job.matchScore === "number"
  );

  const avgMatchScore =
    scoredJobs.length > 0
      ? Math.round(
          scoredJobs.reduce(
            (sum, job) => sum + (job.matchScore ?? 0),
            0
          ) / scoredJobs.length
        )
      : 0;

  const topMatches = [...scoredJobs]
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 5);

  const highMatchJobs = scoredJobs.filter(
    (job) => (job.matchScore || 0) >= 80
  ).length;
  const mediumMatchJobs = scoredJobs.filter(
    (job) => (job.matchScore || 0) >= 60 && (job.matchScore || 0) < 80
  ).length;
  const lowMatchJobs = scoredJobs.filter(
    (job) => (job.matchScore || 0) < 60
  ).length;

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-[#3d5a4f] mb-2">AI Match Insights</h2>
        <p className="text-[#7a8a7e]">See how well positions match your profile</p>
      </div>

      {/* Average Score Card */}
      <div className="bg-gradient-to-br from-[#6b8273] to-[#5a6d5e] rounded-3xl p-8 text-white shadow-xl animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8" />
          <h3 className="text-white">Your Average Match Score</h3>
        </div>
        <div className="flex items-end gap-4">
          <div className="text-6xl animate-scale-in" style={{ animationDelay: '0.2s' }}>
            {avgMatchScore}
            <span className="text-3xl">%</span>
          </div>
          <div className="pb-2 text-white/80 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Based on {scoredJobs.length} applications
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#d4d1c8] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#c5a987]/20">
              <Target className="w-5 h-5 text-[#c5a987]" />
            </div>
            <div className="text-[#7a8a7e]">High Match</div>
          </div>
          <div className="text-[#3d5a4f] mb-1">{highMatchJobs}</div>
          <div className="text-[#7a8a7e] text-sm">80%+ match rate</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#d4d1c8] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#8a9a8f]/20">
              <TrendingUp className="w-5 h-5 text-[#8a9a8f]" />
            </div>
            <div className="text-[#7a8a7e]">Medium Match</div>
          </div>
          <div className="text-[#3d5a4f] mb-1">{mediumMatchJobs}</div>
          <div className="text-[#7a8a7e] text-sm">60-79% match rate</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#d4d1c8] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#b39189]/20">
              <Sparkles className="w-5 h-5 text-[#b39189]" />
            </div>
            <div className="text-[#7a8a7e]">Lower Match</div>
          </div>
          <div className="text-[#3d5a4f] mb-1">{lowMatchJobs}</div>
          <div className="text-[#7a8a7e] text-sm">Below 60% match</div>
        </div>
      </div>

      {/* Top Matches */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#d4d1c8] animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-[#3d5a4f] mb-6">Top Matches</h3>
        <div className="space-y-4">
          {topMatches.map((job, index) => {
            const matchReason = getDisplayedReason(job);
            return (
              <div
                key={job.id}
                className="flex items-center justify-between p-5 rounded-xl bg-[#f8f6f3] hover:bg-[#eae8df] transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="flex-1">
                  <div className="text-[#3d5a4f] mb-1">{job.position}</div>
                  <div className="text-[#7a8a7e]">{job.company}</div>
                  {matchReason && (
                    <div className="mt-2 text-[#7a8a7e] text-sm">
                      {matchReason}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className="text-2xl text-[#6b8273] animate-scale-in"
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      {job.matchScore}%
                    </div>
                    <div className="text-[#7a8a7e] text-sm">match</div>
                  </div>
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#e0ddd0"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={getScoreColor(job.matchScore || 0)}
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - (job.matchScore || 0) / 100)}`}
                        className="transition-all duration-1000 ease-out"
                        style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {topMatches.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-16 h-16 text-[#8a9a8f] mx-auto mb-4" />
            <p className="text-[#7a8a7e]">No match scores available yet</p>
            <p className="text-[#7a8a7e] text-sm mt-2">Add match scores to your applications to see insights</p>
          </div>
        )}
      </div>

    </div>
  );
}

function getDisplayedReason(job: Job): string | null {
  if (job.matchReason && job.matchReason.trim().length > 0) {
    return job.matchReason.trim();
  }
  if (typeof job.matchScore === "number") {
    return getMatchReason(job.matchScore);
  }
  return null;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#c5a987';
  if (score >= 60) return '#8a9a8f';
  return '#b39189';
}

function getMatchReason(score: number): string {
  if (score >= 90) return 'Excellent fit based on your skills and experience';
  if (score >= 80) return 'Strong alignment with your profile';
  if (score >= 70) return 'Good potential for success';
  if (score >= 60) return 'Decent match with some gaps';
  return 'Consider skill development for better fit';
}
export default AIMatchScore;
