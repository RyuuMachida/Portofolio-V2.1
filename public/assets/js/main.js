document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("mainNavbar");

  // Navbar scroll transparency
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Aktifkan highlight menu
  const items = document.querySelectorAll(".nav-item");
  items.forEach((item) => {
    item.addEventListener("click", function () {
      items.forEach((el) => el.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Ambil session user
  fetch("/session-user")
    .then((res) => res.json())
    .then((data) => {
      if (data.loggedIn) {
        const logo = document.getElementById('logo');
        if (logo) logo.src = data.logo;

        const displayName = document.getElementById('displayName');
        if (displayName) {
          displayName.innerHTML = `Hi, ${data.username}! <span class="role-${data.role.toLowerCase()}">${data.role}</span>`;
        }

        const auth = document.getElementById("authLinks");
        auth.innerHTML = `
          <a href="profile.html" class="nav-signup">My Profile</a>
          <a href="/logout" class="nav-login">Logout</a>
        `;
      }
    });

  const textElement = document.getElementById("typewriter-text");
  const fullText = "Haloo! saya Ariel Evan Arpansyah";
  let index = 0;

  function typeText() {
    if (index <= fullText.length) {
      textElement.textContent = fullText.slice(0, index);
      index++;
      setTimeout(typeText, 100); // ketik 1 karakter per 100m// 
    } else {
      setTimeout(() => {
        index = 0;
        typeText();
      }, 2000); // tunggu 2 detik sebelum ulang
    }
  }

  typeText();

  const glows = [
    document.getElementById('glow1'),
    document.getElementById('glow2'),
    document.getElementById('glow3'),
    document.getElementById('glow4')
  ];

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - windowHeight;

    // Scroll progress 0 - 1
    const scrollProgress = scrollY / maxScroll;

    glows.forEach((glow, i) => {
      // Masing-masing punya fase berbeda biar gak bareng-bareng
      const angle = (scrollProgress * Math.PI * 2) + i;
      const radius = 150; // Seberapa jauh dari sudut ke tengah

      // Gerak ke tengah dan balik lagi pakai sin
      const offsetX = Math.sin(angle) * radius * (1 - Math.abs(Math.sin(scrollProgress * Math.PI)));
      const offsetY = Math.cos(angle) * radius * (1 - Math.abs(Math.sin(scrollProgress * Math.PI)));

      // Rotasi terus menerus berdasarkan scroll
      const rotation = scrollY * 0.3 + i * 90;

      glow.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
    });
  });

  const textElements = document.querySelectorAll('.float-text');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = scrollY / maxScroll;

    // Glow movement logic (dari sebelumnya tetap dipake)
    glows.forEach((glow, i) => {
      const angle = (scrollProgress * Math.PI * 2) + i;
      const radius = 150;
      const offsetX = Math.sin(angle) * radius * (1 - Math.abs(Math.sin(scrollProgress * Math.PI)));
      const offsetY = Math.cos(angle) * radius * (1 - Math.abs(Math.sin(scrollProgress * Math.PI)));
      const rotation = scrollY * 0.3 + i * 90;
      glow.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
    });

    // Text movement + fade
    textElements.forEach((el, i) => {
      const angle = scrollProgress * Math.PI * 2 + i;
      const offsetX = Math.sin(angle + i) * 30;
      const offsetY = Math.cos(angle + i * 1.3) * 30;

      el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

      // Fade in mid-scroll (sekitar 30%-70%)
      if (scrollProgress > 0.3 && scrollProgress < 0.7) {
        el.style.opacity = 1;
      } else {
        el.style.opacity = 0;
      }
    });
  });

  const tracks = [
    document.getElementById('appsTrack'),
    document.getElementById('frontendTrack'),
    document.getElementById('backendTrack')
  ];

  document.addEventListener('mousedown', () => {
    tracks.forEach(track => track.style.animationPlayState = 'paused');
  });

  document.addEventListener('mouseup', () => {
    tracks.forEach(track => track.style.animationPlayState = 'running');
  });

  fetch('/comments')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('commentList');
      data.forEach(comment => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${comment.username}, ${comment.role}</strong>: ${comment.content}`;
        list.appendChild(li);
      });
    });

  document.getElementById('commentForm').addEventListener('submit', e => {
    e.preventDefault();
    const content = document.getElementById('commentInput').value;

    fetch('/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    }).then(res => {
      if (res.ok) location.reload();
    });
  });

  let userLoggedIn = false;

  fetch("/session-user")
    .then(res => res.json())
    .then(data => {
      console.log(data);

      if (data.loggedIn) {
        userLoggedIn = true;
      }
    });

  const commentInput = document.getElementById("commentInput");
  const commentForm = document.getElementById("commentForm");
  const popup = document.getElementById("popupWarning");
  const closePopup = document.getElementById("closePopup");

  // Cegah ngetik di textarea kalau belum login
  commentInput?.addEventListener("focus", (e) => {
    if (!userLoggedIn) {
      e.preventDefault();
      popup.classList.remove("hidden");
      commentInput.blur();
    }
  });

  // Cegah submit kalau belum login
  commentForm?.addEventListener("submit", (e) => {
    if (!userLoggedIn) {
      e.preventDefault();
      popup.classList.remove("hidden");
    }
  });

  closePopup?.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  const userRole = document.getElementById("userRole");
  if (userRole && data.role) {
    userRole.textContent = data.role;

    if (data.role === 'Dev🔧') {
      userRole.classList.add('role-dev');
    } else {
      userRole.classList.add('role-visitor');
    }
  }

  function renderComments(comments, parentId = null, level = 0) {
    const list = document.getElementById('commentList');
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

  // Load komentar
  fetch('/comments')
    .then(res => res.json())
    .then(data => renderComments(data));

  // Kirim komentar utama
  document.getElementById('commentForm').addEventListener('submit', async e => {
    e.preventDefault();
    const content = document.getElementById('commentInput').value;
    const res = await fetch('/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });

    if (res.ok) location.reload();
  });

  // Delegasi: Toggle reply box
  document.addEventListener('click', e => {
    if (e.target.classList.contains('reply-btn')) {
      const id = e.target.dataset.id;
      const box = document.getElementById(`reply-${id}`);
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }

    // Kirim balasan
    if (e.target.classList.contains('send-reply')) {
      const id = e.target.dataset.id;
      const content = document.querySelector(`#reply-${id} .reply-text`).value;

      fetch('/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId: id })
      }).then(res => {
        if (res.ok) location.reload();
      });
    }
  });

  document.querySelectorAll(".reply-text").forEach((textarea) => {
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // biar gak nambah baris baru

        const sendBtn = textarea.parentElement.querySelector(".send-reply");
        if (sendBtn) {
          sendBtn.click(); // trigger tombol kirim
        }
      }
    });
  });
});