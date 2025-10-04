document.addEventListener("DOMContentLoaded", () => {
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  document.getElementById(
    "studentName"
  ).textContent = `${firstName} ${lastName}`;
  document.getElementById("user-avatar").textContent = firstName
    .charAt(0)
    .toUpperCase();

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  const token = getCookie("token");

  fetch(
    "https://karyar-library-management-system.liara.run/api/loans/my-loans",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("داده ها دریافت شد.", data);
      const loanedBooks = data;
    });
});
//////////////////////////////////////////////////////////////////////////////////////
//listin of loanedBooks
const container = document.getElementById("loans");
container.innerHTML = "";
