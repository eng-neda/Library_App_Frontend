let isSubmit = false;
const overlay = document.getElementById("coverage");
const loginBtn = document.getElementById("loginBtn");

function handleSubmit(event) {
  event.preventDefault();
  if (isSubmit) return;
  isSubmit = true;

  const form = document.querySelector("#loginForm");
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  const formValue = {
    email,
    password,
  };

  if (!formValue.email || !formValue.password) {
    alert("لطفاً ایمیل و رمز عبور را وارد کنید.");
    return;
  }

  overlay.style.display = "flex";
  loginBtn.disabled = true;

  fetch("https://karyar-library-management-system.liara.run/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formValue),
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: درخواست شما ناموفق بود.`);
      return response.json();
    })
    .then((data) => {
      console.log("ورود با موفقیت انجام شد:", data);
      if (data && data.token) {
        document.cookie =
          "token=${data.token}; path=/; max-age=3600; secure; samesite=strict";
        console.log("توکن در کوکی ذخیره شد");
      }
    })
    .catch((err) => {
      if (err.message.includes("Failed to fetch")) {
        console.error("خطای شبکه: لطفاً اتصال اینترنت خود را بررسی کنید");
      } else {
        console.error("خطای JSON:", err.message);
      }
    })
    .finally(() => {
      overlay.style.display = "none";
      loginBtn.disabled = false;
      isSubmit = false;
    });
}

document.querySelector("#loginForm").addEventListener("submit", handleSubmit);
