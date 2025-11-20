const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Helpers
async function request(path: string, method: string, token?: string, body?: any) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

// AUTH 

export async function login(email: string, password: string) {
  return request("/auth/login", "POST", undefined, { email, password });
}

export async function signup(email: string, password: string) {
  return request("/auth/signup", "POST", undefined, { email, password });
}

// JOBS 

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
