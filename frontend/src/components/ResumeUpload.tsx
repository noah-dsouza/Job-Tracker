import { useState, useRef } from 'react';
import { Upload, FileText, Check, Sparkles } from 'lucide-react';

interface ResumeUploadProps {
  resumeText: string;
  onResumeChange: (text: string) => void;
}

export function ResumeUpload({ resumeText, onResumeChange }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.docx')) {
      setUploadStatus('uploading');
      
      // Simulate file upload and processing
      setTimeout(() => {
        // In a real app, this would extract text from the file
        const mockResumeText = `John Doe
Software Engineer

EXPERIENCE
Senior Frontend Developer at Tech Corp (2022-Present)
- Developed React applications with TypeScript
- Led team of 5 developers
- Implemented CI/CD pipelines

Frontend Developer at StartupXYZ (2020-2022)
- Built responsive web applications
- Collaborated with design team
- Optimized performance

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Git

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2016-2020)`;

        onResumeChange(mockResumeText);
        setUploadStatus('success');
      }, 1500);
    } else {
      alert('Please upload a PDF, TXT, or DOCX file');
    }
  };

  const handleTextChange = (text: string) => {
    onResumeChange(text);
    if (text && uploadStatus === 'idle') {
      setUploadStatus('success');
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-[#3d5a4f] mb-2">Your Resume</h2>
        <p className="text-[#7a8a7e]">Upload or paste your resume to get AI-powered job matching</p>
      </div>

      {/* Upload Area */}
      {!resumeText && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-white/80 backdrop-blur-sm rounded-2xl p-12 border-2 border-dashed transition-all duration-300 cursor-pointer animate-slide-up ${
            isDragging
              ? 'border-[#6b8273] bg-[#6b8273]/5'
              : 'border-[#d4d1c8] hover:border-[#8a9a8f]'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            {uploadStatus === 'uploading' ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#d4d1c8] border-t-[#6b8273]" />
                </div>
                <p className="text-[#5a6d5e]">Processing your resume...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <Upload className="w-16 h-16 text-[#8a9a8f]" />
                </div>
                <h3 className="text-[#3d5a4f] mb-2">Upload Your Resume</h3>
                <p className="text-[#7a8a7e] mb-4">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-[#7a8a7e]">
                  Supports PDF, DOCX, and TXT files
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
      )}

      {/* Manual Entry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[#3d5a4f]">
            {resumeText ? 'Edit Resume' : 'Or paste your resume text'}
          </h3>
          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 text-[#6b8273] animate-fade-in">
              <Check className="w-5 h-5" />
              <span>Resume saved</span>
            </div>
          )}
        </div>

        <textarea
          value={resumeText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#d4d1c8] text-[#3d5a4f] focus:outline-none focus:ring-2 focus:ring-[#8a9a8f] focus:border-transparent transition-all duration-300 resize-none"
          rows={15}
          placeholder="Paste your resume here or upload a file above..."
        />
      </div>

      {/* AI Analysis Preview */}
      {resumeText && (
        <div className="bg-gradient-to-br from-[#6b8273] to-[#5a6d5e] rounded-2xl p-8 text-white shadow-xl animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-white">AI Analysis</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-white/80 mb-1">Skills Detected</div>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white/80 mb-1">Experience Level</div>
              <div className="text-white">Senior (5+ years)</div>
            </div>
            <div>
              <div className="text-white/80 mb-1">Key Strengths</div>
              <ul className="list-disc list-inside text-white space-y-1">
                <li>Frontend Development with React</li>
                <li>Team Leadership</li>
                <li>Full-Stack Capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#d4d1c8] animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-[#3d5a4f] mb-6">How AI Matching Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#6b8273]/10 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-[#6b8273]" />
            </div>
            <h4 className="text-[#3d5a4f]">1. Analyze Resume</h4>
            <p className="text-[#7a8a7e]">
              We extract your skills, experience, and qualifications
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#8a9a8f]/10 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-[#8a9a8f]" />
            </div>
            <h4 className="text-[#3d5a4f]">2. Match Jobs</h4>
            <p className="text-[#7a8a7e]">
              AI compares your profile with job requirements
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#c5a987]/10 flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-[#c5a987]" />
            </div>
            <h4 className="text-[#3d5a4f]">3. Get Insights</h4>
            <p className="text-[#7a8a7e]">
              Receive match scores and personalized recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ResumeUpload;
