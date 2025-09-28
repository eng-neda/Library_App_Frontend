function handleSubmit(event) {
  event.preventDefault();

  const form = document.querySelector("#loginForm");
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  const payload = {
    email,
    password,
  };

  if (!payload.email || !payload.password) {
    alert("لطفاً ایمیل و رمز عبور را وارد کنید.");
    return;
  }

  fetch("https://karyar-library-management-system.liara.run/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => console.log("data:", data))
    .catch((err) => console.error("Error:", err));
}
document.querySelector("#loginForm").addEventListener("submit", handleSubmit);
