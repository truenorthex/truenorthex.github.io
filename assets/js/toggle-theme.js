document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;

  const html = document.documentElement;

  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    html.setAttribute("data-bs-theme", savedTheme);
    updateThemeIcon(savedTheme);
  };

  const updateThemeIcon = (theme) => {
    toggleBtn.textContent = theme === "dark" ? "🌙" : "☀️";
  };

  const toggleTheme = () => {
    const currentTheme = html.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
  };

  initTheme();
  toggleBtn.addEventListener("click", toggleTheme);
});
