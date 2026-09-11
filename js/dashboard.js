const user = JSON.parse(sessionStorage.getItem("physioUser") || "null");
if (!user) location.href = "login.html";

const $ = s => document.querySelector(s);
const roleName = user.role === "doctor" ? "الدكتور" : "المركز";
$("#roleBadge").textContent = roleName;

if (user.role !== "doctor") document.querySelectorAll(".doctor-only").forEach(x => x.style.display="none");

async function loadDashboard() {
  const r = await window.physio.dashboard(user.role);
  const d = r.data;
  const cards = [
    ["👥","إجمالي المرضى",d.patients],
    ["📅","مواعيد اليوم",d.todayAppointments],
    ["📝","جلسات اليوم",d.todaySessions]
  ];
  if (user.role === "doctor") {
    cards.push(["💵","إيرادات اليوم",`${Number(d.todayRevenue).toFixed(2)} جنيه`]);
    cards.push(["📈","إيرادات الشهر",`${Number(d.monthRevenue).toFixed(2)} جنيه`]);
    cards.push(["💸","مصروفات الشهر",`${Number(d.monthExpenses).toFixed(2)} جنيه`]);
  }
  $("#cards").innerHTML = cards.map(c=>`<div class="stat"><div class="stat-icon">${c[0]}</div><div><div class="muted">${c[1]}</div><strong>${c[2]}</strong></div></div>`).join("");
}

function show(view) {
  ["dashboardView","patientsView","newPatientView"].forEach(id => $("#"+id).classList.add("hidden"));
  $("#"+view).classList.remove("hidden");
  document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
}
async function loadPatients() {
  const rows = await window.physio.patients.list($("#patientSearch").value);
  $("#patientsTable").innerHTML = rows.length ? rows.map(p=>`
    <tr><td>${p.file_no}</td><td>${escapeHtml(p.full_name)}</td><td>${escapeHtml(p.phone||"-")}</td>
    <td>${escapeHtml(p.diagnosis||"-")}</td><td>${p.status==="active"?"نشط":"مؤرشف"}</td></tr>`).join("") :
    `<tr><td colspan="5" class="empty">لا يوجد مرضى</td></tr>`;
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

$("#patientsNav").onclick=()=>{show("patientsView");loadPatients();};
$("#addPatientBtn").onclick=()=>show("newPatientView");
$("#newPatientBtn").onclick=()=>show("newPatientView");
$("#cancelPatient").onclick=()=>show("patientsView");
$("#patientSearch").oninput=loadPatients;
$("#logout").onclick=()=>{sessionStorage.removeItem("physioUser");location.href="login.html";};

$("#patientForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const r = await window.physio.patients.add(data);
  const msg = $("#patientMsg");
  if(!r.ok){msg.className="wide error";msg.textContent=r.message;return;}
  msg.className="wide success";msg.textContent=`تم حفظ المريض بنجاح — رقم الملف: ${r.file_no}`;
  e.target.reset();
});

loadDashboard();