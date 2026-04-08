import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 10,
  duration: '20s',
};

const BASE_URL  = 'http://localhost:5000/api/v1';
const EMAIL     = 'k6testuser@mec.com';
const PASSWORD  = 'Test@123456';
const HEADERS   = { 'Content-Type': 'application/json' };

// ── Runs ONCE before all VUs start ──────────────────────────────────
export function setup() {
  console.log('⚙️  Registering test user...');
  const res = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({ email: EMAIL, password: PASSWORD, fullName: 'K6 User', username: 'k6user', dept: 'CSE' }),
    { headers: HEADERS }
  );
  console.log('Register:', res.status, res.body);
  return { email: EMAIL, password: PASSWORD };
}

// ── Runs per VU ─────────────────────────────────────────────────────
export default function (data) {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: data.email, password: data.password }),
    { headers: HEADERS }
  );

  console.log(res.status);
  console.log(res.body);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

