document.addEventListener("DOMContentLoaded", () => {
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  document.getElementById("userName").textContent = `${firstName} ${lastName}`;
  document.getElementById("studentName").textContent = firstName;
  document.getElementById("userAvatar").textContent = firstName
    .charAt(0)
    .toUpperCase();

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  const token = getCookie("token");

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
