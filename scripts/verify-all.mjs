// Complete Automated Verification for All 12 Security Scenarios
const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

let passedCount = 0;
let failedCount = 0;

function logTest(testNum, title, passed, details = "") {
  if (passed) {
    passedCount++;
    console.log(`\x1b[32m[PASS] Test ${testNum}: ${title}\x1b[0m`);
    if (details) console.log(`       \x1b[90m${details}\x1b[0m`);
  } else {
    failedCount++;
    console.log(`\x1b[31m[FAIL] Test ${testNum}: ${title}\x1b[0m`);
    if (details) console.log(`       \x1b[31m${details}\x1b[0m`);
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  CIVICREPORT RBAC & AUTHENTICATION VERIFICATION SUITE ");
  console.log("=======================================================\n");

  let citizenToken = "";
  let citizenCookie = "";
  let citizenUser = null;
  let adminToken = "";
  let adminCookie = "";
  let adminUser = null;
  let testUserBId = "";

  // ------------------------------------------------------------------
  // Test 1: Random email and password -> Login must fail
  // ------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "random-fake-user@example.com", password: "someRandomPassword123" }),
    });
    const data = await res.json();
    const passed = res.status === 401 && !data.token;
    logTest(1, "Random email and password -> Login must fail", passed, `Status: ${res.status}, Error: "${data.error}"`);
  } catch (err) {
    logTest(1, "Random email and password -> Login must fail", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 2: Registered email with incorrect password -> Login must fail
  // ------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "citizen@community.org", password: "WrongPassword123" }),
    });
    const data = await res.json();
    const passed = res.status === 401 && !data.token;
    logTest(2, "Registered email with incorrect password -> Login must fail", passed, `Status: ${res.status}, Error: "${data.error}"`);
  } catch (err) {
    logTest(2, "Registered email with incorrect password -> Login must fail", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 3: Registered user with correct password -> User Dashboard opens
  // ------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "citizen@community.org", password: "citizen123" }),
    });
    const data = await res.json();
    const setCookie = res.headers.get("set-cookie") || "";
    citizenToken = data.token;
    citizenUser = data.user;
    citizenCookie = setCookie.split(";")[0];

    const passed = res.status === 200 && data.user && data.user.role === "user" && !!data.token;
    logTest(3, "Registered user with correct password -> Login succeeds (role: user)", passed, `User: ${data.user?.name}, Token issued`);
  } catch (err) {
    logTest(3, "Registered user with correct password -> Login succeeds", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 4: Normal user accessing /admin/dashboard -> Access denied / redirected
  // ------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      method: "GET",
      headers: {
        Cookie: citizenCookie || `civic_auth_token=${citizenToken}`,
      },
      redirect: "manual",
    });

    // In Next.js middleware, redirection gives 307 or 302 to /user/dashboard
    const location = res.headers.get("location") || "";
    const passed = (res.status === 307 || res.status === 302 || res.status === 403) && location.includes("/user/dashboard");
    logTest(4, "Normal user accessing /admin/dashboard -> Access denied / Redirected to /user/dashboard", passed, `HTTP ${res.status}, Location: ${location}`);
  } catch (err) {
    logTest(4, "Normal user accessing /admin/dashboard -> Access denied", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 5: Normal user calling admin API directly -> 403 Forbidden
  // ------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${citizenToken}`,
      },
    });
    const data = await res.json();
    const passed = res.status === 403;
    logTest(5, "Normal user calling admin API directly (GET /api/v1/users) -> 403 Forbidden", passed, `Status: ${res.status}, Error: "${data.error}"`);
  } catch (err) {
    logTest(5, "Normal user calling admin API directly -> 403 Forbidden", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 6: User A trying to access User B's profile -> Access denied
  // ------------------------------------------------------------------
  try {
    // Create User B first
    const uniqueEmailB = `testuserb_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "User Bob", email: uniqueEmailB, password: "password123" }),
    });
    const regData = await regRes.json();
    testUserBId = regData.user._id;

    // User A attempts to view User B's profile
    const idorRes = await fetch(`${BASE_URL}/api/v1/users/${testUserBId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${citizenToken}`,
      },
    });
    const idorData = await idorRes.json();
    const passed = idorRes.status === 403;
    logTest(6, "User A trying to access User B's profile -> Access denied (403 Forbidden)", passed, `Status: ${idorRes.status}, Error: "${idorData.error}"`);
  } catch (err) {
    logTest(6, "User A trying to access User B's profile -> Access denied", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 7: User A trying to access User B's issues -> Access denied
  // ------------------------------------------------------------------
  try {
    const issuesRes = await fetch(`${BASE_URL}/api/v1/issues/my-issues`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${citizenToken}`,
      },
    });
    const issuesData = await issuesRes.json();
    const allBelongToA = issuesData.issues?.every((i) => String(i.userId) === String(citizenUser._id));
    const passed = issuesRes.status === 200 && allBelongToA;
    logTest(7, "User A viewing issues (my-issues) -> Only User A's issues returned (IDOR prevented)", passed, `Total: ${issuesData.total} issues, all belonging strictly to ${citizenUser?.email}`);
  } catch (err) {
    logTest(7, "User A trying to access User B's issues -> Access denied", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 8: Admin logging in -> Admin Dashboard opens
  // ------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@civicreport.com", password: "admin123" }),
    });
    const data = await res.json();
    const setCookie = res.headers.get("set-cookie") || "";
    adminToken = data.token;
    adminUser = data.user;
    adminCookie = setCookie.split(";")[0];

    const passed = res.status === 200 && data.user && data.user.role === "admin" && !!data.token;
    logTest(8, "Admin logging in -> Authenticated as admin", passed, `Admin: ${data.user?.name} (${data.user?.email})`);
  } catch (err) {
    logTest(8, "Admin logging in -> Admin Dashboard opens", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 9: Admin accessing all users and issues -> Allowed
  // ------------------------------------------------------------------
  try {
    const [uRes, iRes] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      fetch(`${BASE_URL}/api/v1/issues`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
    ]);
    const uData = await uRes.json();
    const iData = await iRes.json();
    const passed = uRes.status === 200 && iRes.status === 200 && Array.isArray(uData.users) && Array.isArray(iData.issues);
    logTest(9, "Admin accessing all users and issues -> Allowed (200 OK)", passed, `Users count: ${uData.total}, Issues count: ${iData.total}`);
  } catch (err) {
    logTest(9, "Admin accessing all users and issues -> Allowed", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 10: User reporting an issue -> Correct user ID, date, time and location stored
  // ------------------------------------------------------------------
  let createdIssueId = "";
  try {
    const issuePayload = {
      title: "Broken Park Bench and Fallen Branch",
      description: "Severe damage to bench near children playground after thunderstorm.",
      category: "Parks & Recreation",
      priority: "high",
      location: "Central Park West Gate",
      latitude: 40.7829,
      longitude: -73.9654,
    };

    const res = await fetch(`${BASE_URL}/api/v1/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify(issuePayload),
    });
    const data = await res.json();
    createdIssueId = data.issue?._id;

    const correctUser = String(data.issue?.userId) === String(citizenUser._id);
    const correctLocation = data.issue?.latitude === 40.7829 && data.issue?.longitude === -73.9654;
    const hasTimestamps = !!data.issue?.createdAt && !!data.issue?.updatedAt;

    const passed = res.status === 201 && correctUser && correctLocation && hasTimestamps;
    logTest(10, "User reporting issue -> User ID, timestamps & GPS coordinates saved correctly", passed, `Issue ID: ${createdIssueId}, Attached User: ${data.issue?.userName}`);
  } catch (err) {
    logTest(10, "User reporting an issue -> Correct user ID and details stored", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 11: User refreshing the browser -> Authentication remains valid
  // ------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: {
        Cookie: citizenCookie || `civic_auth_token=${citizenToken}`,
      },
    });
    const data = await res.json();
    const passed = res.status === 200 && data.user && data.user.email === citizenUser.email;
    logTest(11, "User refreshing browser -> Session restored from httpOnly cookie", passed, `User retrieved: ${data.user?.email} (${data.user?.role})`);
  } catch (err) {
    logTest(11, "User refreshing browser -> Authentication remains valid", false, err.message);
  }

  // ------------------------------------------------------------------
  // Test 12: Suspended user attempting login -> Access denied
  // ------------------------------------------------------------------
  try {
    // 1. Suspend User B using Admin API
    const suspendRes = await fetch(`${BASE_URL}/api/v1/users/${testUserBId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "suspended" }),
    });
    const suspendData = await suspendRes.json();

    // 2. Attempt login as suspended User B
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `testuserb_${testUserBId}@example.com`, password: "password123" }),
    });

    // Alternatively try with the exact email we registered
    const retryRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: suspendData.user.email, password: "password123" }),
    });

    const retryData = await retryRes.json();
    const passed = retryRes.status === 403 && retryData.error?.includes("suspended");
    logTest(12, "Suspended user attempting login -> Access denied (403 Forbidden)", passed, `Status: ${retryRes.status}, Error: "${retryData.error}"`);
  } catch (err) {
    logTest(12, "Suspended user attempting login -> Access denied", false, err.message);
  }

  console.log("\n=======================================================");
  console.log(`  VERIFICATION RESULTS: ${passedCount}/12 PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error("Test runner error:", e);
  process.exit(1);
});
