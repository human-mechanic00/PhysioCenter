document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const error = document.getElementById("error");
  error.textContent = "";
  const result = await window.physio.login({
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value
  });
  if (!result.ok) return error.textContent = result.message;
  sessionStorage.setItem("physioUser", JSON.stringify(result.user));
  location.href = "dashboard.html";
});