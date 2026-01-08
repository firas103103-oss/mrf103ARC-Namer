// ============================================================================
// LOGIN DEBUG SCRIPT - Run this in Browser Console (F12)
// ============================================================================
// Copy this entire code and paste in Console tab at https://app.mrf103.com
// Press Enter to execute
// ============================================================================

console.clear();
console.log("🔍 ARC NAMER LOGIN DIAGNOSTICS");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// Test 1: Check if backend is reachable
console.log("\n✅ Test 1: Backend Health Check");
fetch('/api/health', { credentials: 'include' })
  .then(res => res.json())
  .then(data => {
    console.log("Backend Status:", data);
    if (data.db?.status === 'up') {
      console.log("✅ Database connected");
    } else {
      console.log("❌ Database connection issue");
    }
  })
  .catch(err => console.error("❌ Backend unreachable:", err));

// Test 2: Check current cookies
console.log("\n✅ Test 2: Current Cookies");
console.log("Cookies:", document.cookie || "(none)");
console.log("Has arc.sid?", document.cookie.includes('arc.sid') ? "✅ YES" : "❌ NO");

// Test 3: Test login endpoint directly
console.log("\n✅ Test 3: Direct Login Test");
console.log("Testing with password: 'arc-dev-password-123'");

fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'arc-dev-password-123' }),
  credentials: 'include'
})
.then(async response => {
  console.log("Login Response Status:", response.status);
  console.log("Response Headers:");
  
  // Check Set-Cookie header
  const setCookie = response.headers.get('set-cookie');
  console.log("  Set-Cookie:", setCookie || "❌ MISSING (this is the problem)");
  
  // Check CORS headers
  console.log("  Access-Control-Allow-Credentials:", response.headers.get('access-control-allow-credentials'));
  console.log("  Access-Control-Allow-Origin:", response.headers.get('access-control-allow-origin'));
  
  const data = await response.json();
  console.log("Response Body:", data);
  
  if (response.ok) {
    console.log("✅ Login successful (backend accepted password)");
    
    // Wait 1 second then check if cookie was set
    setTimeout(() => {
      console.log("\n✅ Test 4: Cookie After Login");
      console.log("Cookies now:", document.cookie || "(none)");
      console.log("Has arc.sid?", document.cookie.includes('arc.sid') ? "✅ YES - LOGIN WORKS!" : "❌ NO - COOKIE NOT SET");
      
      if (!document.cookie.includes('arc.sid')) {
        console.error("\n❌ PROBLEM IDENTIFIED:");
        console.error("   Backend returns 200 OK but cookie not set in browser");
        console.error("   Possible causes:");
        console.error("   1. Session table missing in Supabase (most likely)");
        console.error("   2. CORS blocking cookies (sameSite/httpOnly issue)");
        console.error("   3. Railway DATABASE_URL incorrect");
        console.error("\n🔧 FIX: Run supabase_compatibility_setup_PATCHED.sql in Supabase");
      }
    }, 1000);
  } else {
    console.error("❌ Login failed:", data);
  }
})
.catch(err => console.error("❌ Login request error:", err));

// Test 5: Check user endpoint
setTimeout(() => {
  console.log("\n✅ Test 5: User Data Fetch");
  fetch('/api/auth/user', { credentials: 'include' })
    .then(async res => {
      console.log("User endpoint status:", res.status);
      if (res.ok) {
        const user = await res.json();
        console.log("✅ User data:", user);
      } else {
        console.log("❌ Not authenticated (expected if cookie wasn't set)");
      }
    });
}, 2000);

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("⏳ Wait 3 seconds for all tests to complete...");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
