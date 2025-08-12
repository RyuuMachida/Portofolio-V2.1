document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("mainNavbar");

  // Navbar scroll transparency
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  // Aktifkan highlight menu
  const items = document.querySelectorAll(".nav-item");
  items.forEach((item) => {
    item.addEventListener("click", function () {
      items.forEach((el) => el.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Variable untuk menyimpan status login user
  let userLoggedIn = false;
  let userData = null;

  // Ambil session user (PERBAIKAN: cuma sekali)
  fetch("/session-user")
    .then((res) => res.json())
    .then((data) => {
      userData = data; // Simpan data user

      if (data.loggedIn) {
        userLoggedIn = true;

        const logo = document.getElementById('logo');
        if (logo) logo.src = data.logo;

        const displayName = document.getElementById('displayName');
        if (displayName) {
          displayName.innerHTML = `Hi, ${data.username}! <span class="role-${data.role.toLowerCase()}">${data.role}</span>`;
        }

        const auth = document.getElementById("authLinks");
        if (auth) {
          auth.innerHTML = `
            <a href="profile.html" class="nav-signup">My Profile</a>
            <a href="/logout" class="nav-login">Logout</a>
          `;
        }

        // Set user role (PERBAIKAN: pindahin ke dalam blok ini)
        const userRole = document.getElementById("userRole");
        if (userRole) {
          userRole.textContent = data.role;

          if (data.role === 'Dev🔧') {
            userRole.classList.add('role-dev');
          } else {
            userRole.classList.add('role-visitor');
          }
        }
      }
    })
    .catch(err => {
      console.log("Session check failed:", err);
    });

  // Typewriter effect
  const textElement = document.getElementById("typewriter-text");
  if (textElement) {
    const fullText = "Haloo! saya Ariel Evan Arpansyah";
    let index = 0;

    function typeText() {
      if (index <= fullText.length) {
        textElement.textContent = fullText.slice(0, index);
        index++;
        setTimeout(typeText, 100);
      } else {
        setTimeout(() => {
          index = 0;
          typeText();
        }, 2000);
      }
    }

    typeText();
  }

  // Glow effects
  const glows = [
    document.getElementById('glow1'),
    document.getElementById('glow2'),
    document.getElementById('glow3'),
    document.getElementById('glow4')
  ].filter(Boolean); // PERBAIKAN: filter null elements

  if (glows.length > 0) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - windowHeight;

      if (maxScroll > 0) { // PERBAIKAN: prevent division by zero
        const scrollProgress = scrollY / maxScroll;

        glows.forEach((glow, i) => {
          const angle = (scrollProgress * Math.PI * 2) + i;
          const radius = 150;

          const offsetX = Math.sin(angle) * radius * (1 - Math.abs(Math.sin(scrollProgress * Math.PI)));
          const offsetY = Math.cos(angle) * radius * (1 - Math.abs(Math.sin(scrollProgress * Math.PI)));

          const rotation = scrollY * 0.3 + i * 90;

          glow.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
        });
      }
    });
  }

  // Float text effects
  const textElements = document.querySelectorAll('.float-text');
  if (textElements.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;

      if (maxScroll > 0) { // PERBAIKAN: prevent division by zero
        const scrollProgress = scrollY / maxScroll;

        textElements.forEach((el, i) => {
          const angle = scrollProgress * Math.PI * 2 + i;
          const offsetX = Math.sin(angle + i) * 30;
          const offsetY = Math.cos(angle + i * 1.3) * 30;

          el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

          if (scrollProgress > 0.3 && scrollProgress < 0.7) {
            el.style.opacity = 1;
          } else {
            el.style.opacity = 0;
          }
        });
      }
    });
  }

  // Animation tracks
  const tracks = [
    document.getElementById('appsTrack'),
    document.getElementById('frontendTrack'),
    document.getElementById('backendTrack')
  ].filter(Boolean); // PERBAIKAN: filter null elements

  if (tracks.length > 0) {
    document.addEventListener('mousedown', () => {
      tracks.forEach(track => {
        if (track.style.animationPlayState !== undefined) {
          track.style.animationPlayState = 'paused';
        }
      });
    });

    document.addEventListener('mouseup', () => {
      tracks.forEach(track => {
        if (track.style.animationPlayState !== undefined) {
          track.style.animationPlayState = 'running';
        }
      });
    });
  }

  // PERBAIKAN: Fungsi untuk render comments (dipindah ke atas)
  function renderComments(comments, parentId = null, level = 0) {
    const list = document.getElementById('commentList');
    if (!list) return; // PERBAIKAN: early return jika element tidak ada

    if (parentId === null) list.innerHTML = '';

    comments
      .filter(c => String(c.parentId) === String(parentId))
      .forEach(c => {
        const li = document.createElement('li');
        li.style.marginLeft = `${level * 20}px`;
        li.innerHTML = `
          <strong>${c.username} (${c.role})</strong>: ${c.content}
          <button class="reply-btn" data-id="${c._id}">Balas</button>
          <div class="reply-box" id="reply-${c._id}" style="display:none; margin-top:8px;">
            <textarea placeholder="Balas komentar..." rows="2" class="reply-text"></textarea>
            <button class="send-reply" data-id="${c._id}">Kirim</button>
          </div>
        `;
        list.appendChild(li);

        // Recursive render untuk balasan
        renderComments(comments, c._id, level + 1);
      });
  }

  // Load comments (PERBAIKAN: cuma sekali)
  fetch('/comments')
    .then(res => res.json())
    .then(data => renderComments(data))
    .catch(err => {
      console.log("Failed to load comments:", err);
    });

  // Comment form handling
  const commentForm = document.getElementById('commentForm');
  const commentInput = document.getElementById('commentInput');
  const popup = document.getElementById("popupWarning");
  const closePopup = document.getElementById("closePopup");

  // Cegah ngetik di textarea kalau belum login
  if (commentInput) {
    commentInput.addEventListener("focus", (e) => {
      if (!userLoggedIn && popup) {
        e.preventDefault();
        popup.classList.remove("hidden");
        commentInput.blur();
      }
    });
  }

  // Submit comment form
  if (commentForm) {
    commentForm.addEventListener('submit', async e => {
      e.preventDefault();

      if (!userLoggedIn && popup) {
        popup.classList.remove("hidden");
        return;
      }

      const content = commentInput ? commentInput.value : '';
      if (!content.trim()) return;

      try {
        const res = await fetch('/comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });

        if (res.ok) {
          location.reload();
        }
      } catch (err) {
        console.log("Failed to submit comment:", err);
      }
    });
  }

  // Close popup
  if (closePopup) {
    closePopup.addEventListener("click", () => {
      if (popup) popup.classList.add("hidden");
    });
  }

  // Reply functionality dengan event delegation
  document.addEventListener('click', e => {
    // Toggle reply box
    if (e.target.classList.contains('reply-btn')) {
      const id = e.target.dataset.id;
      const box = document.getElementById(`reply-${id}`);
      if (box) {
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
      }
    }

    // Send reply
    if (e.target.classList.contains('send-reply')) {
      const id = e.target.dataset.id;
      const textarea = document.querySelector(`#reply-${id} .reply-text`);
      const content = textarea ? textarea.value : '';

      if (!content.trim()) return;

      fetch('/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId: id })
      }).then(res => {
        if (res.ok) location.reload();
      }).catch(err => {
        console.log("Failed to send reply:", err);
      });
    }
  });

  // Enter key untuk reply (PERBAIKAN: pakai event delegation)
  document.addEventListener("keydown", (e) => {
    if (e.target.classList.contains("reply-text") && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const sendBtn = e.target.parentElement.querySelector(".send-reply");
      if (sendBtn) {
        sendBtn.click();
      }
    }
  });

  // ================================
  //   LAZY ANIMATION - INTERSECTION OBSERVER (FIXED)
  // ================================

  // Configuration for intersection observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  // Create intersection observer for lazy animations
  const lazyAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        handleSpecialAnimations(entry.target);
        lazyAnimationObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Elements to observe for lazy animation
  const elementsToObserve = [
    '.tech-logos-container',
    '.about-section',
    '.comments-container',
    '#contact',
    '.tech-box',
    '.about-card',
    '.comment-box',
    '.social-icons',
    '.float-text'
  ];

  // Start observing elements
  elementsToObserve.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => lazyAnimationObserver.observe(el));
  });

  // Handle special animations
  function handleSpecialAnimations(element) {
    // Tech section
    if (element.classList.contains('tech-logos-container')) {
      setTimeout(() => {
        const techBoxes = element.querySelectorAll('.tech-box');
        techBoxes.forEach((box, index) => {
          setTimeout(() => {
            box.classList.add('animate');
          }, index * 100);
        });
      }, 200);
    }

    // About section
    if (element.classList.contains('about-section')) {
      setTimeout(() => {
        const aboutCards = element.querySelectorAll('.about-card');
        aboutCards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('animate');
          }, index * 200);
        });
      }, 300);
    }

    // Comments section
    if (element.classList.contains('comments-container')) {
      setTimeout(() => {
        const commentBoxes = element.querySelectorAll('.comment-box');
        commentBoxes.forEach((box, index) => {
          setTimeout(() => {
            box.classList.add('animate');
          }, index * 150);
        });
      }, 200);
    }

    // Contact section
    if (element.id === 'contact') {
      setTimeout(() => {
        const socialIcons = element.querySelector('.social-icons');
        if (socialIcons) {
          socialIcons.classList.add('animate');
        }
      }, 300);
    }

    // Enhance glow effect
    if (element.classList.contains('tech-logos-container') ||
      element.classList.contains('about-section')) {
      const glow = document.querySelector('.glow');
      if (glow) {
        glow.classList.add('enhanced');
        setTimeout(() => {
          glow.classList.remove('enhanced');
        }, 2000);
      }
    }

    // Floating texts
    if (element.classList.contains('float-text')) {
      const randomDelay = Math.random() * 1000;
      element.style.animationDelay = `${randomDelay}ms`;
    }
  }

  // ================================
  //   PERFORMANCE OPTIMIZATIONS
  // ================================

  // Clean up will-change after animations complete
  setTimeout(() => {
    const animatedElements = document.querySelectorAll('.animate');
    animatedElements.forEach(el => {
      el.style.willChange = 'auto';
    });
  }, 2000);

  // ================================
  //   MOBILE OPTIMIZATIONS
  // ================================

  if (window.innerWidth <= 480) {
    observerOptions.threshold = 0.05;
    observerOptions.rootMargin = '0px 0px -20px 0px';
  }

  // ================================
  //   UTILITY FUNCTIONS
  // ================================

  function triggerAnimation(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.classList.add('animate'));
  }

  function resetAnimations() {
    const animatedElements = document.querySelectorAll('.animate');
    animatedElements.forEach(el => {
      el.classList.remove('animate');
    });
  }

  // Export functions for global access
  window.LazyAnimation = {
    trigger: triggerAnimation,
    reset: resetAnimations
  };

  // Hamburger Menu Toggle for Mobile
  const hamburger = document.querySelector('.hamburger');
  const navCenter = document.querySelector('.nav-center');

  if (hamburger && navCenter) {
    // Toggle menu when hamburger is clicked
    hamburger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      navCenter.classList.toggle('mobile-open');

      // Change hamburger icon with animation
      if (navCenter.classList.contains('mobile-open')) {
        hamburger.innerHTML = '✕'; // Close icon
        hamburger.style.transform = 'rotate(180deg)';
      } else {
        hamburger.innerHTML = '☰'; // Hamburger icon
        hamburger.style.transform = 'rotate(0deg)';
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
      if (!hamburger.contains(event.target) && !navCenter.contains(event.target)) {
        navCenter.classList.remove('mobile-open');
        hamburger.innerHTML = '☰';
        hamburger.style.transform = 'rotate(0deg)';
      }
    });

    // Close menu when clicking on nav item
    const navItems = navCenter.querySelectorAll('a');
    navItems.forEach(item => {
      item.addEventListener('click', function () {
        navCenter.classList.remove('mobile-open');
        hamburger.innerHTML = '☰';
        hamburger.style.transform = 'rotate(0deg)';
      });
    });

    // Handle window resize
    window.addEventListener('resize', function () {
      if (window.innerWidth > 480) {
        navCenter.classList.remove('mobile-open');
        hamburger.innerHTML = '☰';
        hamburger.style.transform = 'rotate(0deg)';
      }
    });
  }

  // ================================
  //   PROJECT CARD ANIMATIONS (FIXED)
  // ================================

  // Project card click effects
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-15px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Create separate observer for project cards with different options
  const projectObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        projectObserver.unobserve(entry.target);
      }
    });
  }, projectObserverOptions);

  // Observe all project cards
  document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    projectObserver.observe(card);
  });

});
