import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "20s", target: 10 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"],
    checks: ["rate>0.99"],
  },
};

export default function (): void {
  const res = http.get(`${BASE_URL}/transactions/summary`);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "body has balance field": (r) => JSON.parse(r.body).balance !== undefined,
  });

  sleep(0.5);
}
