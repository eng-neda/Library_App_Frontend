const form = document.querySelector("#loginForm");
const formData = new FormData(form);
const formValues = {
  email: formData.get("email"),
  password: formData.get("password"),
};
console.log(formValues);
