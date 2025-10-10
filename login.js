  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async function(event) {
  event.preventDefault(); 

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.success) {
          alert(data.message);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor");
      }
});
