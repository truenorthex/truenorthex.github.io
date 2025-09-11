(function () {
  // Helper to resolve relative paths
  const resolvePath = (path) => {
    if (path.startsWith("./")) {
      const currentFolder = window.location.pathname.substring(
        0,
        window.location.pathname.lastIndexOf("/")
      );
      return currentFolder + path.substring(1);
    }
    return path;
  };

  // Fetch nav.html from current folder, fallback to empty navbar
  fetch("./nav.html")
    .then((res) => {
      if (!res.ok) {
        throw new Error("nav.html not found");
      }
      return res.text();
    })
    .then((html) => {
      document.getElementById("chapter-nav-container").innerHTML = html;
      console.log("Nav loaded:", document.querySelector("nav.navbar"));
      initializeNav();
    })
    .catch((err) => {
      console.warn(
        "Failed to load nav.html, rendering empty navbar:",
        err.message
      );
      document.getElementById("chapter-nav-container").innerHTML =
        '<nav class="navbar"></nav>';
      initializeNav();
    });

  function initializeNav() {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navbar = document.querySelector(".navbar");
    const dropdowns = document.querySelectorAll(".dropdown");
    const navLinks = document.querySelectorAll(".nav-link");
    const dropdownLinks = document.querySelectorAll(".dropdown-link");

    console.log("Hamburger:", hamburger); // Debug
    console.log("NavMenu:", navMenu); // Debug
    console.log("Navbar:", navbar); // Debug

    // Skip interactivity if navbar is empty
    if (!navbar || (!hamburger && !navMenu)) {
      console.log("Empty navbar, skipping interactivity");
      return;
    }

    // Hamburger toggle
    if (hamburger && navMenu) {
      document.addEventListener("click", (e) => {
        if (e.target.closest(".hamburger")) {
          console.log("Hamburger clicked"); // Debug
          hamburger.classList.toggle("active");
          navMenu.classList.toggle("active");
        }
      });
    }

    // Dropdown toggle on mobile
    dropdowns.forEach((dropdown) => {
      const dropdownLink = dropdown.querySelector(".nav-link");
      if (dropdownLink) {
        dropdownLink.addEventListener("click", function (e) {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            console.log("Dropdown clicked:", dropdown); // Debug
            if (dropdown.classList.contains("active")) {
              dropdown.classList.remove("active");
            } else {
              dropdowns.forEach(
                (item) => item !== dropdown && item.classList.remove("active")
              );
              dropdown.classList.add("active");
            }
          }
        });
      }
    });

    // Nav link clicks
    navLinks.forEach((link) => {
      if (!link.parentElement.classList.contains("dropdown")) {
        link.addEventListener("click", function (e) {
          console.log("Nav link clicked:", this); // Debug
          const currentActive = document.querySelector(".nav-link.active");
          if (currentActive) currentActive.classList.remove("active");
          this.classList.add("active");
          if (hamburger && navMenu) {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
          }
          if (this.getAttribute("href").startsWith("#")) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              const navbarHeight = navbar.offsetHeight || 40;
              const targetPosition =
                targetElement.getBoundingClientRect().top +
                window.pageYOffset -
                navbarHeight;
              window.scrollTo({ top: targetPosition, behavior: "smooth" });
              history.pushState(null, null, targetId);
            }
          }
        });
      }
    });

    // Dropdown link clicks
    dropdownLinks.forEach((link) => {
      link.addEventListener("click", function () {
        console.log("Dropdown link clicked:", this); // Debug
        const currentActive = document.querySelector(".dropdown-link.active");
        if (currentActive) currentActive.classList.remove("active");
        this.classList.add("active");
        const parentDropdown = this.closest(".dropdown");
        if (parentDropdown) {
          parentDropdown.querySelector(".nav-link").classList.add("active");
        }
        if (hamburger && navMenu) {
          hamburger.classList.remove("active");
          navMenu.classList.remove("active");
        }
        dropdowns.forEach((dropdown) => dropdown.classList.remove("active"));
      });
    });

    // Scroll effect
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });

    // Set active state
    function setActiveState() {
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      const allLinks = document.querySelectorAll(".nav-link, .dropdown-link");
      allLinks.forEach((link) => link.classList.remove("active"));

      // Handle hash links (e.g., #contact)
      if (currentHash && currentHash.length > 1) {
        const hashLink = document.querySelector(
          `.nav-link[href="${currentHash}"]`
        );
        if (hashLink) hashLink.classList.add("active");
        return;
      }

      // Handle chapter links from dropdown-menu
      const chapters = Array.from(
        document.querySelectorAll(".dropdown-link")
      ).map((link) => ({
        path: link.getAttribute("href"),
        title: link.textContent.trim(),
      }));
      for (const chapter of chapters) {
        if (
          chapter.path.startsWith("http://") ||
          chapter.path.startsWith("https://")
        ) {
          continue; // Skip external links
        }
        const fullPath = resolvePath(chapter.path);
        if (
          currentPath === fullPath ||
          currentPath.endsWith(fullPath.split("/").pop())
        ) {
          const link = document.querySelector(
            `.dropdown-link[href="${chapter.path}"]`
          );
          if (link) link.classList.add("active");
          const parentDropdown = link?.closest(".dropdown");
          if (parentDropdown)
            parentDropdown.querySelector(".nav-link").classList.add("active");
          return;
        }
      }

      // Handle home page
      if (
        currentPath === "/" ||
        currentPath === "" ||
        currentPath.endsWith("index.html")
      ) {
        const homeLink = document.querySelector(
          '.nav-link[href="/index.html"]'
        );
        if (homeLink) homeLink.classList.add("active");
      }
    }
    setActiveState();

    // Update active state on scroll (for #contact)
    window.addEventListener("scroll", () => {
      if (
        window.location.pathname === "/" ||
        window.location.pathname === "" ||
        window.location.pathname.endsWith("index.html")
      ) {
        const contactSection = document.querySelector("#contact");
        if (contactSection) {
          const sectionTop = contactSection.offsetTop;
          const sectionHeight = contactSection.offsetHeight;
          const currentScroll = window.pageYOffset;
          const navbarHeight = navbar.offsetHeight || 40;
          if (
            currentScroll >= sectionTop - navbarHeight - 100 &&
            currentScroll < sectionTop + sectionHeight
          ) {
            allLinks.forEach((link) => link.classList.remove("active"));
            const contactLink = document.querySelector(
              '.nav-link[href="#contact"]'
            );
            if (contactLink) contactLink.classList.add("active");
          } else if (currentScroll < sectionTop - navbarHeight - 100) {
            allLinks.forEach((link) => link.classList.remove("active"));
            const homeLink = document.querySelector(
              '.nav-link[href="/index.html"]'
            );
            if (homeLink) homeLink.classList.add("active");
          }
        }
      }
    });

    // Close menu on resize to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && hamburger && navMenu) {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
        dropdowns.forEach((dropdown) => dropdown.classList.remove("active"));
      }
    });

    // Update active state on back/forward navigation
    window.addEventListener("popstate", setActiveState);
  }
})();
