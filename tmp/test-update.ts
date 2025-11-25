import app from "../app";

async function run() {
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const base = `http://127.0.0.1:${port}`;

  async function request(path: string, options: RequestInit = {}) {
    const res = await fetch(`${base}${path}`, options);
    const data = await res.json();
    return { status: res.status, data };
  }

  const email = `test${Date.now()}@example.com`;
  const password = "password123";
  const signup = await request("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  console.log("signup", signup);

  const userId = signup.data.id;

  const newJob = await request("/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      userId,
    },
    body: JSON.stringify({
      company: "TestCo",
      position: "Engineer",
      status: "applied",
      dateApplied: "2025-01-01",
    }),
  });
  console.log("create", newJob);

  const jobId = newJob.data.id;

  const updated = await request(`/jobs/${jobId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      userId,
    },
    body: JSON.stringify({
      company: "TestCo",
      position: "Engineer",
      status: "final-interview",
      dateApplied: "2025-01-01",
    }),
  });
  console.log("update", updated);

  server.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
