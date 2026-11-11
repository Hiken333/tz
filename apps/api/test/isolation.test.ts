import { expect, test } from "bun:test";
import { app } from "../src/app";

const CLIENT = { email: "marina@sever.example", password: "client-demo" };
const ADMIN = { email: "admin@istinny.example", password: "admin-demo" };
const FOREIGN_BRANCH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1";
const OWN_BRANCH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const FOREIGN_COMPANY = "22222222-2222-4222-8222-222222222222";

async function login(email: string, password: string) {
  const response = await app.handle(
    new Request("http://localhost/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
  const cookie = response.headers.get("set-cookie");
  return { response, cookie };
}

function withCookie(path: string, cookie: string, init?: RequestInit) {
  return app.handle(
    new Request(`http://localhost${path}`, {
      ...init,
      headers: { cookie, ...init?.headers },
    }),
  );
}

test("rejects a malformed login body", async () => {
  const response = await app.handle(
    new Request("http://localhost/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", password: "short" }),
    }),
  );
  expect(response.status).toBe(422);
});

test("rejects a wrong password", async () => {
  const { response } = await login(CLIENT.email, "wrong-pass");
  expect(response.status).toBe(401);
});

test("keeps a client inside their own company", async () => {
  const { response, cookie } = await login(CLIENT.email, CLIENT.password);
  expect(response.status).toBe(200);
  expect(cookie).toBeTruthy();
  if (!cookie) throw new Error("expected session cookie");

  const companies = await withCookie("/companies", cookie);
  expect(companies.status).toBe(200);
  const companyList = await companies.json();
  expect(companyList).toHaveLength(1);
  expect(companyList[0].name).toBe("Северный берег");

  const foreignCompany = await withCookie(`/branches?companyId=${FOREIGN_COMPANY}`, cookie);
  expect(foreignCompany.status).toBe(403);

  const foreignBranch = await withCookie(`/branches/${FOREIGN_BRANCH}`, cookie);
  expect(foreignBranch.status).toBe(403);

  const foreignMetrics = await withCookie(
    `/metrics/summary?period=7d&branchId=${FOREIGN_BRANCH}`,
    cookie,
  );
  expect(foreignMetrics.status).toBe(403);

  const foreignReviews = await withCookie(`/reviews?branchId=${FOREIGN_BRANCH}`, cookie);
  expect(foreignReviews.status).toBe(403);

  const ownBranch = await withCookie(`/branches/${OWN_BRANCH}`, cookie);
  expect(ownBranch.status).toBe(200);
});

test("lets an admin read every company", async () => {
  const { response, cookie } = await login(ADMIN.email, ADMIN.password);
  expect(response.status).toBe(200);
  expect(cookie).toBeTruthy();
  if (!cookie) throw new Error("expected session cookie");

  const companies = await withCookie("/companies", cookie);
  const companyList = await companies.json();
  expect(companyList.length).toBeGreaterThanOrEqual(2);

  const foreignBranch = await withCookie(`/branches/${FOREIGN_BRANCH}`, cookie);
  expect(foreignBranch.status).toBe(200);
});
