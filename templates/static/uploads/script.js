
document.getElementById("checkBtn").addEventListener("click", async () => {
  const result = document.getElementById("result");

  try {
    const response = await fetch("/api/status");
    const data = await response.json();
    result.textContent = data.message;
  } catch {
    result.textContent = "Unable to connect to server.";
  }
});
