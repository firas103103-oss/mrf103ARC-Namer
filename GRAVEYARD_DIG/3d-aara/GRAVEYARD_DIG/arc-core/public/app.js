


async function load() {
  out.textContent = "Loading...";
  try {
    const r = await fetch("/secure");
    out.textContent = JSON.stringify(await r.json(), null, 2);
  } catch {
    out.textContent = "Error loading data.";
  }
}

const loginForm = document.getElementById('loginForm');
const out = document.getElementById('out');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        out.textContent = 'Login successful! Token: ' + data.token;
      } else {
        out.textContent = 'Login failed!';
      }
    } catch {
      out.textContent = 'Error connecting to server.';
    }
  });
}
