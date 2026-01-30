import { Target, TrendingUp, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export default function AIRecommendations() {
  return (
    <div
      className="bg-gradient-to-br from-[#f8f6f3] to-[#eae8df] rounded-2xl p-8 border border-[#d4d1c8] animate-slide-up"
      style={{ animationDelay: "0.35s" }}
    >
      <h3 className="text-[#3d5a4f] mb-4">AI Recommendations</h3>
      <div className="space-y-3">
        <Recommendation
          icon={<Target className="w-4 h-4 text-[#c5a987]" />}
          title="Focus on high-match applications"
          detail="Applications with 80%+ match have higher success rates."
          accent="bg-[#c5a987]/20"
        />
        <Recommendation
          icon={<TrendingUp className="w-4 h-4 text-[#8a9a8f]" />}
          title="Tailor your applications"
          detail="Customize your resume and cover letter for better matches."
          accent="bg-[#8a9a8f]/20"
        />
        <Recommendation
          icon={<Sparkles className="w-4 h-4 text-[#6b8273]" />}
          title="Follow up strategically"
          detail="Prioritize following up on applications with high match scores."
          accent="bg-[#6b8273]/20"
        />
      </div>
    </div>
  );
}

interface RecommendationProps {
  icon: ReactNode;
  title: string;
  detail: string;
  accent: string;
}

function Recommendation({ icon, title, detail, accent }: RecommendationProps) {
  return (
    <div className="flex items-start gap-3 text-[#5a6d5e]">
      <div className={`w-8 h-8 rounded-lg ${accent} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="mb-1">{title}</div>
        <div className="text-[#7a8a7e] text-sm">{detail}</div>
      </div>
    </div>
  );
}
