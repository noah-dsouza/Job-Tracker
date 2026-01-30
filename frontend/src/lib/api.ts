const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

// request helper
async function request(
  path: string,
  method: string,
  token?: string,
  body?: any
) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { userId: token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

export interface ResumeAnalysis {
  score: number;
  strengths: string;
  weaknesses: string;
  summary: string;
}

export interface ResumeEvaluationResult {
  resumeText: string;
  analysis: ResumeAnalysis;
}

export interface MatchScoreResult {
  score: number;
  reason: string;
}

// Auth Endpoints

export async function login(email: string, password: string) {
  return request("/auth/login", "POST", undefined, { email, password });
}

export async function signup(email: string, password: string) {
  return request("/auth/signup", "POST", undefined, { email, password });
}

// j*b endpoints

export async function getJobs(token: string) {
  return request("/jobs", "GET", token);
}

export async function createJob(token: string, job: any) {
  return request("/jobs", "POST", token, job);
}

export async function updateJob(token: string, id: string, job: any) {
  return request(`/jobs/${id}`, "PUT", token, job);
}

export async function deleteJob(token: string, id: string) {
  return request(`/jobs/${id}`, "DELETE", token);
}

export async function evaluateResumeUpload(
  token: string,
  payload: { file?: File; text?: string }
): Promise<ResumeEvaluationResult> {
  if (!payload.file && !payload.text) {
    throw new Error("Resume content is required");
  }

  const formData = new FormData();
  if (payload.file) {
    formData.append("file", payload.file);
  }
  if (payload.text && !payload.file) {
    formData.append("text", payload.text);
  }

  const res = await fetch(`${API_URL}/resume`, {
    method: "POST",
    headers: {
      ...(token ? { userId: token } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Resume upload failed");
  }

  return res.json();
}

export async function fetchMatchScore(
  token: string,
  payload: { company: string; role: string; description?: string; resumeText?: string }
): Promise<MatchScoreResult> {
  const result = await request("/ai/match", "POST", token, payload);

  if (result?.error) {
    throw new Error(result.error);
  }

  return result;
}
