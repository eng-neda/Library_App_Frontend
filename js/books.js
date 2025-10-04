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

  fetch("https://karyar-library-management-system.liara.run/api/books", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log("داده ها دریافت شد.", responseData);
      const books = responseData.data;
      ////////////////////////////////////////////////////////////////////////////////
      //listing books:

      const container = document.getElementById("booksList");
      container.innerHTML = "";

      books.forEach((book) => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <h3 style="margin: 0; color: #2c3e50">${book.title}</h3>
            <span class="status ${
              book.availableCopies > 0
                ? "status-available"
                : "status-unavailable"
            }">
              ${book.availableCopies > 0 ? "Available" : "Unavailable"}
            </span>
          </div>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>ISBN:</strong> ${book.isbn}</p>
          <p><strong>Category:</strong> ${book.category}</p>
          <p><strong>Available Copies:</strong> ${book.availableCopies}</p>
          <p style="margin-bottom:1rem; font-size:0.9rem; color:#555">${
            book.description
          }</p>
          <div style="display: flex; gap: 0.5rem">
            <button class="btn btn-primary btn-sm borrow-btn" data-id="${
              book._id || book.id
            }" ${book.availableCopies === 0 ? "disabled" : ""}>
              Borrow Book
            </button>
            <button class="btn btn-secondary btn-sm">View Details</button>
          </div>
        `;

        container.appendChild(card);
      });
      ////////////////////////////////////////////////////////////////////////////////
      //cashing:
      const casheKey = "booksCashe";

      async function fetchCasheFromApi() {
        const res = await fetch(
          "https://karyar-library-management-system.liara.run/api/books"
        );
        const data = await res.json();
        console.log(data);
        return data.data;
      }
      async function getBooks() {
        const cashed = localStorage.getItem(casheKey);

        if (cashed) {
          const parsed = JSON.parse(cashed);
          return parsed;
        }
        const books = await fetchCasheFromApi();
        return books;
      }

      localStorage.setItem(casheKey, JSON.stringify(books));
      //after 5min deleting of cashe
      setTimeout(() => {
        localStorage.removeItem(casheKey);
      }, 300000);

      ////////////////////////////////////////////////////////////////////////////////
      //Borrow

      document
        .querySelectorAll(".btn.btn-primary.btn-sm.borrow-btn")
        .forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const bookId = e.target.dataset.id;
            const userId = localStorage.getItem("studentId");

            if (!userId) {
              alert("شناسه کاربر موجود نیست. لطفاً دوباره وارد شوید.");
              return;
            }
            btn.disabled = true;

            try {
              const res = await fetch(
                "https://karyar-library-management-system.liara.run/api/loans",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ bookId, userId }),
                }
              );

              if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Borrow failed");
              }

              const result = await res.json();
              console.log("کتاب امانت شد:", result);
              alert("کتاب با موفقیت به لیست امانات اضافه شد ");
            } catch (err) {
              console.error("خطا در امانت گرفتن:", err);
              alert("خطا در امانت گرفتن کتاب");
            } finally {
              btn.disabled = false;
            }
          });
        });
    })
    .catch((error) => {
      console.error("خطا:", error);
    });
});
////////////////////////////////////////////////////////////////////////////////////////details of books
