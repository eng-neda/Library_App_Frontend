document.addEventListener("DOMContentLoaded", () => {
  function getCookie() {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name === "token") return value;
    }
    return null;
  }

  const token = getCookie("token");

  const allowedPages = ["index.html", "login.html"];
  const currentPage = window.location.pathname.split("/").pop();

  if (!allowedPages.includes(currentPage) && !token) {
    window.location.href = "login.html";
  }
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  document.getElementById("userName").textContent = `${firstName} ${lastName}`;
  document.getElementById("studentName").textContent = firstName;
  document.getElementById("userAvatar").textContent = firstName
    .charAt(0)
    .toUpperCase();

  fetch("https://karyar-library-management-system.liara.run/api/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log("داده ها دریافت شد.", responseData);

      if (responseData && responseData.data && responseData.data.stats) {
        const stats = responseData.data.stats;

        localStorage.setItem("activeLoans", stats.activeLoans);
        localStorage.setItem("availableBooks", stats.availableBooks);

        document.getElementById("availableBooks").textContent =
          stats.availableBooks;
        document.getElementById("activeLoans").textContent = stats.activeLoans;
      }
    })
    .catch((error) => {
      console.error("خطا:", error);
    });
});
