let isSubmit = false;
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
      console.log("ورود با موفقیت انجام شد.:", data);
      if (data && data.token) {
        localStorage.setItem("Token", data.token);
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
      isSubmit = false;
    });
}

document.querySelector("#loginForm").addEventListener("submit", handleSubmit);
