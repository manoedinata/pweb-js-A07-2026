function getUserData(users, username, password) {
  return users.find(function (user) {
    return user.username === username && user.password === password;
  });
}

function toggleLoadingIndicator(show) {
  const loadingIndicator = document.querySelector(".loading");
  if (show) {
    loadingIndicator.classList.remove("hidden");
  } else {
    loadingIndicator.classList.add("hidden");
  }
}

const loginForm = document.getElementById("login-form");

// Session Persistence
document.addEventListener("DOMContentLoaded", function () {
  const storedUserData = localStorage.getItem("firstName");
  if (storedUserData) {
    alert("Anda sudah login!");
    window.location.href = "index.html";
  }
});

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  toggleLoadingIndicator(true);

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    // Autentikasi API
    const response = await fetch("https://dummyjson.com/users?limit=0");

    if (!response.ok) {
      throw new Error(`Gagal terhubung ke server (status ${response.status})`);
    }

    const data = await response.json();
    const user = getUserData(data.users, username, password);

    if (user) {
      // Session Persistence
      localStorage.setItem("firstName", user.firstName);
      localStorage.setItem("lastName", user.lastName);
      localStorage.setItem("email", user.email);

      // Auto Redirect
      window.location.href = "index.html";
      return;
    } else {
      // Error Handling
      alert("Username atau password yang Anda masukkan salah.");
    }
  } catch (error) {
    // Error Handling
    console.error("Login error:", error);
    alert("Terjadi masalah dengan server. Periksa koneksi internet Anda.");
  } finally {
    toggleLoadingIndicator(false);
  }
});
