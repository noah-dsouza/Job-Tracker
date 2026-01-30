import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { ResumeAnalysis } from "@/lib/api";

interface ResumeUploadProps {
  resumeText: string;
  analysis: ResumeAnalysis | null;
  status: "idle" | "uploading" | "success" | "error";
  error?: string | null;
  onResumeChange: (text: string) => void;
  onSubmit: (payload: { file?: File; text?: string }) => Promise<void>;
}

export function ResumeUpload({
  resumeText,
  analysis,
  status,
  error,
  onResumeChange,
  onSubmit,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing = status === "uploading";
  const hasText = resumeText.trim().length > 0;

  const handleFile = async (file: File) => {
    if (!isSupportedFile(file)) {
      alert("Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    try {
      await onSubmit({ file });
    } catch {
      // parent component surfaces an error banner
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleFile(files[0]);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleAnalyzeText = async () => {
    if (!hasText || isProcessing) return;

    try {
      await onSubmit({ text: resumeText });
    } catch {
      // error handled by parent
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-[#3d5a4f] mb-2">Your Resume</h2>
        <p className="text-[#7a8a7e]">
          Upload a resume or paste the text so AI can personalize match scores.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isProcessing) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`bg-white/80 backdrop-blur-sm rounded-2xl p-12 border-2 border-dashed transition-all duration-300 cursor-pointer animate-slide-up ${
          isDragging
            ? "border-[#6b8273] bg-[#6b8273]/5"
            : "border-[#d4d1c8] hover:border-[#8a9a8f]"
        } ${isProcessing ? "opacity-70 pointer-events-none" : ""}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center space-y-4">
          {isProcessing ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#6b8273]" />
              <p className="text-[#5a6d5e]">Analyzing your resume...</p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <Upload className="w-16 h-16 text-[#8a9a8f]" />
              </div>
              <h3 className="text-[#3d5a4f] mb-2">Upload Your Resume</h3>
              <p className="text-[#7a8a7e] mb-2">
                Drag & drop a file here, or click to browse
              </p>
              <p className="text-[#7a8a7e] text-sm">
                Supports PDF, DOCX, and TXT files. We store only the parsed
                text.
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Manual Entry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[#3d5a4f]">
            {resumeText ? "Edit Resume Text" : "Or paste your resume text"}
          </h3>
          {status === "success" && (
            <div className="flex items-center gap-2 text-[#6b8273] animate-fade-in">
              <Check className="w-5 h-5" />
              <span>Analysis saved</span>
            </div>
          )}
        </div>

        <textarea
          value={resumeText}
          onChange={(e) => onResumeChange(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#d4d1c8] text-[#3d5a4f] focus:outline-none focus:ring-2 focus:ring-[#8a9a8f] focus:border-transparent transition-all duration-300 resize-none"
          rows={12}
          placeholder="Paste your resume here to analyze without uploading a file..."
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <button
            type="button"
            onClick={handleAnalyzeText}
            disabled={!hasText || isProcessing}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-white transition-all duration-300 ${
              !hasText || isProcessing
                ? "bg-[#c4c0b9] cursor-not-allowed"
                : "bg-[#6b8273] hover:bg-[#5a6d5e] hover:shadow-lg"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Text with AI
              </>
            )}
          </button>
          <p className="text-[#7a8a7e] text-sm">
            We reuse your latest resume analysis whenever you score new jobs.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-[#d97b66] bg-[#fef4f2] px-4 py-3 text-sm text-[#7a4432]">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="bg-gradient-to-br from-[#6b8273] to-[#5a6d5e] rounded-2xl p-8 text-white shadow-xl animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-white">AI Resume Insights</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-3 space-y-2">
              <div className="text-white/70 text-sm">Summary</div>
              <p className="text-white leading-relaxed">{analysis.summary}</p>
            </div>
            <div>
              <div className="text-white/70 text-sm mb-2">Strengths</div>
              <ul className="list-disc list-outside space-y-2 text-white/90 pl-5">
                {toList(analysis.strengths).map((item) => (
                  <li key={item} className="leading-snug">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-white/70 text-sm mb-2">Weaknesses</div>
              <ul className="list-disc list-outside space-y-2 text-white/90 pl-5">
                {toList(analysis.weaknesses).map((item) => (
                  <li key={item} className="leading-snug">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#d4d1c8] animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <h3 className="text-[#3d5a4f] mb-6">How AI Matching Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#6b8273]/10 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-[#6b8273]" />
            </div>
            <h4 className="text-[#3d5a4f]">1. Analyze Resume</h4>
            <p className="text-[#7a8a7e]">
              We extract your skills, stacks, and accomplishments from uploads or pasted text.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#8a9a8f]/10 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-[#8a9a8f]" />
            </div>
            <h4 className="text-[#3d5a4f]">2. Compare With Jobs</h4>
            <p className="text-[#7a8a7e]">
              AI compares your resume highlights with each job description you save.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#c5a987]/10 flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-[#c5a987]" />
            </div>
            <h4 className="text-[#3d5a4f]">3. Get Targeted Insights</h4>
            <p className="text-[#7a8a7e]">
              Receive match scores and suggestions to fine-tune each application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;

const SUPPORTED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function isSupportedFile(file: File) {
  return (
    SUPPORTED_TYPES.includes(file.type) ||
    /\.pdf$/i.test(file.name) ||
    /\.docx$/i.test(file.name) ||
    /\.txt$/i.test(file.name)
  );
}

function toList(value?: string | string[] | null) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  const normalized = value
    .replace(/•/g, "\n")
    .replace(/[-–]\s+/g, "\n")
    .replace(/([.!?])\s+(?=[A-Z0-9])/g, "$1\n");

  return normalized
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
