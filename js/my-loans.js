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

  document.getElementById(
    "studentName"
  ).textContent = `${firstName} ${lastName}`;
  document.getElementById("user-avatar").textContent = firstName
    .charAt(0)
    .toUpperCase();

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
      console.log("داده‌ها دریافت شد:", data);

      const container = document.querySelector("#loans tbody");
      container.innerHTML = "";

      data.data.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
            <strong>${item.book.title}</strong><br />
            <small style="color: #666">ISBN: ${item.book.isbn}</small>
          </td>
          <td>${item.book.author}</td>
          <td>${new Date(item.loanDate).toISOString().split("T")[0]}</td>
          <td>
            <span class="status ${
              item.status === "active" ? "status-active" : "status-returned"
            }">
              ${item.status}
            </span>
          </td>
          <td>
            ${
              item.status === "active"
                ? `<button class="btn btn-success btn-sm" data-loan-id="${item.id}">Return</button>`
                : `<button class="btn btn-secondary btn-sm" disabled>Returned</button>`
            }
          </td>
        `;
        container.appendChild(row);
      });
      const loans = Array.isArray(data) ? data : data.data;

      const activeCount = loans.filter(
        (loan) => loan.status === "active"
      ).length;
      const returnedCount = loans.filter(
        (loan) => loan.status === "returned"
      ).length;

      document.getElementById("activeLoans").textContent = activeCount;
      document.getElementById("returnedBooks").textContent = returnedCount;

      localStorage.setItem("activeLoans", activeCount);
      localStorage.setItem("returnedBooks", returnedCount);

      document.querySelectorAll(".btn.btn-success.btn-sm").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const loanId = e.target.dataset.loanId;
          const userId = localStorage.getItem("studentId");

          if (!userId) {
            alert("شناسه کاربر موجود نیست. لطفاً دوباره وارد شوید.");
            return;
          }

          btn.disabled = true;

          try {
            const res = await fetch(
              `https://karyar-library-management-system.liara.run/api/loans/${loanId}/return`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId }),
              }
            );

            if (!res.ok) {
              const msg = await res.text();
              throw new Error(msg || "Return failed");
            }

            const result = await res.json();
            console.log("کتاب بازگردانده شد:", result);
            alert("کتاب با موفقیت بازگردانده شد");
          } catch (err) {
            console.error("خطا در بازگرداندن کتاب:", err);
            alert("خطا در بازگرداندن کتاب");
          } finally {
            btn.disabled = false;
          }
        });
      });
    })
    .catch((err) => console.error("Error fetching loans:", err));
});
