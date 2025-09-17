// ===== Date & Time =====
function setDateTimeOnce() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString("en-US", options);
  const timeStr = now.toLocaleTimeString("en-US", { hour24:false });
  document.getElementById("siteDateTime").innerText = `${dateStr} | ${timeStr}`;
}
setDateTimeOnce();

// ===== Show/Hide Forms =====
function showLogin() {
  document.querySelector('.login-box').classList.remove('hidden');
  document.getElementById('registerBox')?.classList.add('hidden');
  document.getElementById('forgotBox')?.classList.add('hidden');
  document.getElementById('dashboardBox')?.classList.add('hidden');
  hideLogoutButton();
  document.getElementById('msgLogin').innerText = "";
}

function showRegister() {
  document.querySelector('.login-box').classList.add('hidden');
  document.getElementById('registerBox')?.classList.remove('hidden');
  document.getElementById('forgotBox')?.classList.add('hidden');
  hideLogoutButton();
}

function showForgot() {
  document.querySelector('.login-box').classList.add('hidden');
  document.getElementById('registerBox')?.classList.add('hidden');
  document.getElementById('forgotBox')?.classList.remove('hidden');
  hideLogoutButton();
}

// ===== Logout Button =====
function showLogoutButton() {
  document.getElementById('logoutContainer')?.classList.remove('hidden');
}

function hideLogoutButton() {
  document.getElementById('logoutContainer')?.classList.add('hidden');
}

function doLogout() {
  localStorage.removeItem('currentStaff'); // optional session
  hideLogoutButton();
  showLogin();
}

// ===== LocalStorage Helpers =====
function getStaffDB() {
  return JSON.parse(localStorage.getItem('staffDB') || '[]');
}

function saveStaffDB(db) {
  localStorage.setItem('staffDB', JSON.stringify(db));
}

// ===== Login =====
function doLogin() {
  const staffID = document.getElementById('loginStaffId').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const msgLogin = document.getElementById('msgLogin');

  if (!staffID || !password) {
    msgLogin.innerText = "Please fill in all fields!";
    msgLogin.className = "message error";
    return;
  }

  const staffDB = getStaffDB();
  const staff = staffDB.find(s => s.id === staffID && s.password === password);
  if (!staff) {
    msgLogin.innerText = "Invalid Staff ID or Password!";
    msgLogin.className = "message error";
    return;
  }

  // Save session
  localStorage.setItem('currentStaff', JSON.stringify(staff));

  // Show dashboard
  document.querySelector('.login-box').classList.add('hidden');
  document.getElementById('dashboardBox').classList.remove('hidden');
  msgLogin.innerText = "";

  // Show logout button
  showLogoutButton();

  // Fill profile
  document.getElementById('staffProfile').innerHTML = `
    <p><b>Name:</b> ${staff.name}</p>
    <p><b>Staff ID:</b> ${staff.id}</p>
    <p><b>Phone:</b> ${staff.phone}</p>
    <p><b>Email:</b> ${staff.email}</p>
    <p><b>Department:</b> ${staff.dept}</p>
    <p><b>Position:</b> ${staff.pos}</p>
  `;

  // Load dashboard data
  loadDashboardData();
}

// ===== Register =====
async function doRegister() {
  const id = document.getElementById('regStaffId').value.trim();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const dept = document.getElementById('regDept')?.value.trim() || 'N/A';
  const pos = document.getElementById('regPosition')?.value.trim() || 'N/A';
  const q1 = document.getElementById('regQ1').value;
  const a1 = document.getElementById('regA1').value.trim();
  const q2 = document.getElementById('regQ2').value;
  const a2 = document.getElementById('regA2').value.trim();
  const msg = document.getElementById('msgRegister');

  if (!id || !name || !email || !phone || !password || !a1 || !a2) {
    msg.innerText = "Please fill in all fields!";
    msg.className = "message error";
    return;
  }

  let staffDB = getStaffDB();
  if (staffDB.find(s => s.id === id)) {
    msg.innerText = "Staff ID already exists!";
    msg.className = "message error";
    return;
  }

  const staffObj = { id, name, email, phone, password, dept, pos, q1, a1, q2, a2 };

  try {
    // Send to server first
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, staffID: id })
    });
    const result = await res.json();
    if (result.success) {
      msg.innerText = "Registration Successful! (DB)";
      msg.className = "message success";
    } else {
      throw new Error('DB failed');
    }
  } catch (err) {
    // fallback localStorage
    staffDB.push(staffObj);
    saveStaffDB(staffDB);
    msg.innerText = "Registration stored locally! (fallback)";
    msg.className = "message success";
  }

  setTimeout(() => { showLogin(); msg.innerText = ''; }, 1500);
}

// ===== Forgot Password =====
function doForgot() {
  const id = document.getElementById('forgotStaffId').value.trim();
  const qno = document.getElementById('forgotQno').value;
  const answer = document.getElementById('forgotAnswer').value.trim();
  const newPass = document.getElementById('forgotNewPassword').value.trim();
  const msg = document.getElementById('msgForgot');

  if (!id || !newPass) {
    msg.innerText = "Please fill all fields!";
    msg.className = "message error";
    return;
  }

  let staffDB = getStaffDB();
  const staff = staffDB.find(s => s.id === id);
  if (!staff) { msg.innerText = "Staff ID not found!"; msg.className = "message error"; return; }

  if ((qno === '1' && staff.a1 !== answer) || (qno === '2' && staff.a2 !== answer)) {
    msg.innerText = "Security answer incorrect!"; msg.className = "message error"; return;
  }

  staff.password = newPass;
  saveStaffDB(staffDB);
  msg.innerText = "Password reset successful!";
  msg.className = "message success";

  setTimeout(() => { showLogin(); msg.innerText = ''; }, 1500);
}

// ===== Dashboard Data =====
function loadDashboardData() {
  // Machines
  let machineDB = JSON.parse(localStorage.getItem('machineDB') || '[]');
  const divMachines = document.getElementById('machineList');
  if (divMachines) {
    if (machineDB.length === 0) divMachines.innerHTML = "<p>No machine data yet.</p>";
    else divMachines.innerHTML = machineDB.map(m => `<p>${m.id} - ${m.name} | ${m.status}</p>`).join('');
  }

  // Aduan
  let aduanDB = JSON.parse(localStorage.getItem('aduanDB') || '[]');
  const divAduan = document.getElementById('aduanList');
  if (divAduan) {
    if (aduanDB.length === 0) divAduan.innerHTML = "<p>No aduan yet.</p>";
    else divAduan.innerHTML = aduanDB.map((a, i) => `<p>${i + 1}. [${a.time}] ${a.text}</p>`).join('');
  }
}

// ===== Submit Aduan =====
function submitAduan() {
  let aduanDB = JSON.parse(localStorage.getItem('aduanDB') || '[]');
  const text = document.getElementById('aduanText').value.trim();
  if (!text) return alert("Please type something!");
  aduanDB.push({ text, time: new Date().toLocaleString() });
  localStorage.setItem('aduanDB', JSON.stringify(aduanDB));
  loadDashboardData();
  document.getElementById('aduanText').value = '';
}

// ===== Dummy Machine Data =====
function dummyMachineData() {
  let machineDB = JSON.parse(localStorage.getItem('machineDB') || '[]');
  const dummy = { id: machineDB.length + 1, name: 'Machine' + (machineDB.length + 1), status: 'Active' };
  machineDB.push(dummy);
  localStorage.setItem('machineDB', JSON.stringify(machineDB));
  loadDashboardData();
}
