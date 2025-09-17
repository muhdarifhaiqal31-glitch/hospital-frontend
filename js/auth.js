const API_BASE = 'http://10.62.77.117:4000/api'; // ganti dengan IP/backend host

// register
async function apiRegister(payload) {
  const res = await fetch(API_BASE + '/register', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  return res.json();
}

// login
async function apiLogin(staff_id, password) {
  const res = await fetch(API_BASE + '/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ staff_id, password })
  });
  return res.json();
}

// forgot
async function apiForgot(payload) {
  const res = await fetch(API_BASE + '/forgot', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  return res.json();
}

// get dashboard (protected)
async function apiDashboard(token) {
  const res = await fetch(API_BASE + '/dashboard', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  return res.json();
}

// export staff
async function apiExport(token) {
  const res = await fetch(API_BASE + '/export-staff', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  return res.json();
}
