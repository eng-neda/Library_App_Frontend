document.addEventListener("DOMLoaded", () => {
  const userName = localStorage.getItem("userName");

  document.getElementById("userName").textContent = userName;

  document.getElementById("studentName").textContent = userName;

  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();
});
