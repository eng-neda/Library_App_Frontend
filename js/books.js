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
      /////////////////////////////////////////////////////////////////////////
      //listing books:

      const container = document.getElementById("booksList");
      container.innerHTML = "";

      books.forEach((book) => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
      <h3 style="margin: 0; color:black" font-size=20px">${book.title}</h3>
      <span class="status ${
        book.availableCopies > 0 ? "status-available" : "status-unavailable"
      }">
        ${book.availableCopies > 0 ? "Available" : "Unavailable"}
      </span>
    </div>
    <p><strong>Author:</strong> ${book.author}</p>
    <p><strong>ISBN:</strong> ${book.isbn}</p>
    <p><strong>Category:</strong> ${book.category.name}</p>
    <p><strong>Available Copies:</strong> ${book.availableCopies}</p>
    <p style="margin-bottom:1rem; font-size:0.9rem; color:#111">
      ${book.description}
    </p>
  `;

        const buttonsDiv = document.createElement("div");
        buttonsDiv.style.display = "flex";
        buttonsDiv.style.gap = "0.5rem";

        buttonsDiv.innerHTML = `
    <button 
      class="btn btn-primary btn-sm borrow-btn" 
      data-id="${book.id}" 
      ${book.availableCopies === 0 ? "disabled" : ""}
    >
      ${book.availableCopies === 0 ? "Out of Stock" : "Borrow Book"}
    </button>
   <button 
    class="btn btn-secondary btn-sm view-details-btn"
    data-id="${book.id}"
  >
    View Details
  </button>
  `;

        card.appendChild(buttonsDiv);

        container.appendChild(card);
      });
      /////////////////////////////////////////////////////////////////////////
      //search Box

      const searchInput = document.getElementById("search");
      const searchButton = document.querySelector(".search-box button");
      const backButton = document.getElementById("backBtn");

      function filterBooks() {
        const searchedBook = searchInput.value.trim().toLowerCase();
        const cards = container.querySelectorAll(".card");

        let visibleCount = 0;

        cards.forEach((card) => {
          const title = card.querySelector("h3").textContent.toLowerCase();
          const author = card
            .querySelector("p strong")
            .nextSibling.textContent.toLowerCase();

          if (title.includes(searchedBook) || author.includes(searchedBook)) {
            card.style.display = "block";
            visibleCount++;
          } else {
            card.style.display = "none";
          }
        });

        if (visibleCount === 0) {
          container.innerHTML =
            "<p style='color:white; text-align:center;'>کتابی با این مشخصات یافت نشد.</p>";
        }

        backButton.style.display = "inline-block";
      }

      function showAllBooks() {
        if (!container.querySelector(".card")) {
          location.reload();
          return;
        }

        const cards = container.querySelectorAll(".card");
        cards.forEach((card) => (card.style.display = "block"));

        searchInput.value = "";

        backButton.style.display = "none";
      }

      searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") filterBooks();
      });
      searchButton.addEventListener("click", filterBooks);
      backButton.addEventListener("click", showAllBooks);

      /////////////////////////////////////////////////////////////////////////
      //cashing:

      async function fetchCasheFromApi() {
        const res = await fetch(
          "https://karyar-library-management-system.liara.run/api/books"
        );
        const data = await res.json();
        console.log(data);
        return data.data;
      }

      function setCache(key, data) {
        const cacheData = {
          data: data,
          timestamp: Date.now(),
          expireTime: 300000,
        };

        localStorage.setItem(key, JSON.stringify(cacheData));
      }

      function getCache(key) {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        return JSON.parse(cached);
      }

      function isCacheValid(cacheData) {
        if (!cacheData) return false;

        const currentTime = Date.now();
        const cacheAge = currentTime - cacheData.timestamp;

        return cacheAge < cacheData.expireTime;
      }

      /////////////////////////////////////////////////////////////////////////
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

              btn.textContent = "Out of Stock";
              btn.disabled = true;
              const statusSpan = btn.closest(".card").querySelector(".status");
              statusSpan.textContent = "Unavailable";
              statusSpan.classList.remove("status-available");
              statusSpan.classList.add("status-unavailable");
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

  ///////////////////////////////////////////////////////////////////////////////details of books

  const dialog = document.getElementById("myDialog");
  const closeBtn = document.getElementById("closeBtn");
  const p = dialog.querySelector("p");

  closeBtn.addEventListener("click", () => dialog.close());

  const booksList = document.getElementById("booksList");

  booksList.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn.btn-secondary.btn-sm");
    if (!btn) return;
    const bookId = btn.dataset.id;
    if (!bookId) {
      alert("شناسه کتاب مشخص نشده.");
      return;
    }

    const userId = localStorage.getItem("studentId");

    if (!userId) {
      alert("شناسه کاربر موجود نیست. لطفاً دوباره وارد شوید.");
      return;
    }
    if (!bookId) {
      alert("شناسه کتاب مشخص نشده.");
      return;
    }

    btn.disabled = true;
    p.textContent = "در حال بارگذاری اطلاعات کتاب...";

    try {
      const res = await fetch(
        `https://karyar-library-management-system.liara.run/api/books/${bookId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "خطا در دریافت اطلاعات کتاب");
      }

      const result = await res.json();

      p.innerHTML = `
      <strong>Title:</strong> ${result.title}<br>
       <strong>Publisher:</strong> ${result.publisher}<br>
       <strong>PublisherYear:</strong> ${result.publicationYear}<br>
       <strong>createdAt:</strong> ${result.createdAt}<br>
     
    `;

      dialog.showModal();
    } catch (err) {
      console.error("خطا در نمایش جزئیات کتاب", err);
      p.textContent = "خطا در دریافت اطلاعات کتاب!";
      alert("خطا در نمایش جزئیات کتاب");
    } finally {
      btn.disabled = false;
    }
  });
});
