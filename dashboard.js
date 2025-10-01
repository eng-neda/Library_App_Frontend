document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("userName") || "کاربر";

  // جایگزینی در هدر
  document.getElementById("userName").textContent = userName;

  // جایگزینی در متن خوشامدگویی
  document.getElementById("studentName").textContent = userName;

  // ساخت حرف اول برای آواتار
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();
});
