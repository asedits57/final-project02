import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// ─── Custom Metrics ────────────────────────────────────────────────
const errorRate = new Rate("errors");

// ─── Load Test Configuration ───────────────────────────────────────
export const options = {
  stages: [
    { duration: "15s", target: 10 },  // ramp up to 10 virtual users
    { duration: "30s", target: 10 },  // hold at 10 virtual users
    { duration: "10s", target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],  // 95% of requests under 2s
    errors: ["rate<0.1"],              // error rate under 10%
  },
};

// ─── Base URL ──────────────────────────────────────────────────────
const BASE_URL = "http://localhost:5000/api/v1";

// ─── Test Credentials ──────────────────────────────────────────────
const TEST_EMAIL    = "k6testuser@mec.com";
const TEST_PASSWORD = "Test@123456";

const HEADERS = { "Content-Type": "application/json" };

// ─── Setup: Register test user once before load test ───────────────
// This runs ONCE before all VUs start.
export function setup() {
  console.log("⚙️  Setup: registering test user...");

  const registerRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      email:    TEST_EMAIL,
      password: TEST_PASSWORD,
      fullName: "K6 Test User",
      username: "k6testuser",
      dept:     "CSE",
    }),
    { headers: HEADERS }
  );

  console.log("Register STATUS:", registerRes.status);
  console.log("Register BODY: ", registerRes.body);

  // User may already exist (409) — that's fine
  if (registerRes.status !== 200 && registerRes.status !== 201 && registerRes.status !== 409) {
    console.warn("⚠️  Registration returned unexpected status:", registerRes.status);
  }

  return { email: TEST_EMAIL, password: TEST_PASSWORD };
}

// ─── Default Function (runs per VU) ────────────────────────────────
export default function (data) {
  // ── POST /api/v1/auth/login ──────────────────────────────────────
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: data.email, password: data.password }),
    { headers: HEADERS }
  );

  console.log("LOGIN STATUS:", loginRes.status);
  console.log("LOGIN BODY:  ", loginRes.body);

  const loginOk = check(loginRes, {
    "✅ login status is 200":   (r) => r.status === 200,
    "✅ login returns token":   (r) => {
      try { return JSON.parse(r.body).accessToken !== undefined; }
      catch { return false; }
    },
  });

  errorRate.add(!loginOk);

  // ── GET /api/v1/leaderboard (public, no auth needed) ─────────────
  const lbRes = http.get(`${BASE_URL}/leaderboard`);

  console.log("LEADERBOARD STATUS:", lbRes.status);

  check(lbRes, {
    "✅ leaderboard status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
