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
          <p style="color: #666; margin-bottom: 0.5rem"><strong>Author:</strong> ${
            book.author
          }</p>
          <p style="color: #666; margin-bottom: 0.5rem"><strong>ISBN:</strong> ${
            book.isbn
          }</p>
          <p style="color: #666; margin-bottom: 0.5rem"><strong>Category:</strong> ${
            book.category
          }</p>
          <p style="color: #666; margin-bottom: 1rem"><strong>Available Copies:</strong> ${
            book.availableCopies
          }</p>
          <p style="margin-bottom: 1rem; font-size: 0.9rem; color: #555">${
            book.description
          }</p>
          <div style="display: flex; gap: 0.5rem">
            <button class="btn btn-primary btn-sm" ${
              book.availableCopies === 0 ? "disabled" : ""
            }>Borrow Book</button>
            <button class="btn btn-secondary btn-sm">View Details</button>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("خطا:", error);
    });
});
