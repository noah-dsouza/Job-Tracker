const API_URL = "http://localhost:3000/api";

export async function signup(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getJobs(token: string) {
  const res = await fetch(`${API_URL}/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createJob(token: string, job: any) {
  const res = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(job),
  });
  return res.json();
}

export async function updateJob(token: string, id: string, job: any) {
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(job),
  });
  return res.json();
}

export async function deleteJob(token: string, id: string) {
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
