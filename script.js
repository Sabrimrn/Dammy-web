// ===== Cursor Glow =====
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    document.body.classList.add('has-cursor');
    if (cursorGlow) {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    }
});

// ===== Starfield Canvas =====
function createStarfield(canvas, opts = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const count = opts.count || 200;
    const layers = 3;
    let w, h;
    let stars = [];
    let mouseX = 0, mouseY = 0;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        w = rect.width; h = rect.height;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        stars = [];
        for (let i = 0; i < count; i++) {
            const layer = Math.floor(Math.random() * layers);
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                z: layer,
                size: 0.4 + (layer * 0.5) + Math.random() * 0.8,
                baseAlpha: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.5 + Math.random() * 2,
                twinkleOffset: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.04 * (layer + 1),
                vy: (Math.random() - 0.5) * 0.04 * (layer + 1),
            });
        }
    }
    resize();
    window.addEventListener('resize', resize);

    if (opts.parallax) {
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5);
            mouseY = (e.clientY / window.innerHeight - 0.5);
        });
    }

    let scrollY = 0;
    if (opts.scrollParallax) {
        window.addEventListener('scroll', () => { scrollY = window.scrollY; });
    }

    function tick(t) {
        ctx.clearRect(0, 0, w, h);
        const time = t / 1000;
        for (const s of stars) {
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0) s.x = w;
            if (s.x > w) s.x = 0;
            if (s.y < 0) s.y = h;
            if (s.y > h) s.y = 0;
            const px = s.x + (opts.parallax ? mouseX * (s.z + 1) * 12 : 0);
            const py = s.y + (opts.parallax ? mouseY * (s.z + 1) * 12 : 0)
                          - (opts.scrollParallax ? scrollY * 0.05 * (s.z + 1) : 0);
            const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
            const alpha = s.baseAlpha * (0.4 + 0.6 * twinkle);
            ctx.beginPath();
            ctx.fillStyle = `rgba(138, 158, 108, ${alpha * 0.55})`;
            ctx.arc(px, py, s.size, 0, Math.PI * 2);
            ctx.fill();
            // glow on bright stars
            if (s.z === 2) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(138, 158, 108, ${alpha * 0.12})`;
                ctx.arc(px, py, s.size * 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        // shooting star
        if (opts.shootingStars && Math.random() < 0.0035) {
            shootingStars.push({
                x: Math.random() * w * 0.6,
                y: Math.random() * h * 0.4,
                len: 80 + Math.random() * 60,
                angle: Math.PI / 6 + (Math.random() - 0.5) * 0.4,
                speed: 8 + Math.random() * 4,
                life: 1
            });
        }
        for (const ss of shootingStars) {
            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.life -= 0.018;
            if (ss.life > 0) {
                const tx = ss.x - Math.cos(ss.angle) * ss.len;
                const ty = ss.y - Math.sin(ss.angle) * ss.len;
                const grad = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
                grad.addColorStop(0, 'rgba(138, 158, 108, 0)');
                grad.addColorStop(1, `rgba(138, 158, 108, ${ss.life * 0.7})`);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(ss.x, ss.y);
                ctx.stroke();
            }
        }
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            if (shootingStars[i].life <= 0) shootingStars.splice(i, 1);
        }
        requestAnimationFrame(tick);
    }
    const shootingStars = [];
    requestAnimationFrame(tick);
}

document.querySelectorAll('.star-canvas').forEach(c => {
    createStarfield(c, { count: 280, parallax: true, scrollParallax: true, shootingStars: true });
});
document.querySelectorAll('.section-stars').forEach(c => {
    createStarfield(c, { count: 100, parallax: true });
});
document.querySelectorAll('.cta-stars').forEach(c => {
    createStarfield(c, { count: 80 });
});

// ===== Navbar scroll =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

// ===== Mobile menu =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ===== Reveal =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const children = entry.target.querySelectorAll('.value-card, .service-card, .process-step');
            children.forEach((child, i) => setTimeout(() => child.classList.add('visible'), 110 * i));
            staggerObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.section').forEach(s => staggerObserver.observe(s));

// ===== Word morph =====
const morphEl = document.querySelector('.word-morph .word');
const morphWords = ['groei', 'impact', 'innovatie', 'succes'];
let morphIdx = 0;
function morphNext() {
    if (!morphEl) return;
    morphEl.classList.add('exiting');
    setTimeout(() => {
        morphIdx = (morphIdx + 1) % morphWords.length;
        morphEl.textContent = morphWords[morphIdx];
        morphEl.classList.remove('exiting');
        morphEl.classList.add('entering');
        requestAnimationFrame(() => morphEl.classList.remove('entering'));
    }, 500);
}
setInterval(morphNext, 3000);

// ===== Smooth scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href === '#hero' || href === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const target = document.querySelector(href);
        if (!target) return;
        const navHeight = document.getElementById('navbar').offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

// ===== Contact form =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const span = btn.querySelector('span');
        const original = span.textContent;
        btn.disabled = true; span.textContent = 'Verzenden...';
        try {
            const data = Object.fromEntries(new FormData(contactForm).entries());
            const res = await fetch(contactForm.action, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            span.textContent = res.ok ? 'Verstuurd!' : 'Er ging iets mis';
            if (res.ok) contactForm.reset();
        } catch { span.textContent = 'Geen verbinding'; }
        setTimeout(() => { span.textContent = original; btn.disabled = false; }, 3500);
    });
}

// ===== Service tilt + glow position =====
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (y - rect.height / 2) / 28;
        const rotateY = (rect.width / 2 - x) / 28;
        card.style.transform = `translateY(-12px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// Value cards mouse position glow
document.querySelectorAll('.value-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
});

// ===== Magnetic buttons =====
document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ===== Hero parallax tilt on scroll =====
const heroContent = document.querySelector('.hero-content');
const heroOrb = document.querySelector('.hero-orb');
window.addEventListener('scroll', () => {
    const s = window.scrollY;
    if (heroContent) heroContent.style.transform = `translateY(${s * 0.25}px)`;
    if (heroOrb) heroOrb.style.transform = `translate(-50%, calc(-50% + ${s * 0.15}px)) scale(${1 + s * 0.0003})`;
});

// ===== Mouse-follow tilt for hero h1 =====
const heroH1 = document.querySelector('.hero-content h1');
if (heroH1) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5);
        const y = (e.clientY / window.innerHeight - 0.5);
        heroH1.style.transform = `perspective(1200px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
}

// ===== Chat Widget =====
(function() {
    const widget = document.getElementById('chat-widget');
    const toggle = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('chat-close');
    const panel = document.getElementById('chat-panel');
    const messagesEl = document.getElementById('chat-messages');
    const form = document.getElementById('chat-input-form');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    if (!widget || !toggle || !panel || !messagesEl || !form || !input) return;

    const history = [];
    let isLoading = false;

    function openChat() {
        widget.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        setTimeout(() => input.focus(), 250);
    }

    function closeChat() {
        widget.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
    }

    function toggleChat() {
        if (widget.classList.contains('is-open')) closeChat();
        else openChat();
    }

    toggle.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);

    function appendMessage(role, text) {
        const msg = document.createElement('div');
        msg.className = 'chat-message chat-message-' + (role === 'user' ? 'user' : 'bot');
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.textContent = text;
        msg.appendChild(bubble);
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return msg;
    }

    function appendTyping() {
        const msg = document.createElement('div');
        msg.className = 'chat-message chat-message-bot';
        msg.id = 'chat-typing-indicator';
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        const typing = document.createElement('span');
        typing.className = 'chat-typing';
        typing.innerHTML = '<span></span><span></span><span></span>';
        bubble.appendChild(typing);
        msg.appendChild(bubble);
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function removeTyping() {
        const t = document.getElementById('chat-typing-indicator');
        if (t) t.remove();
    }

    async function sendMessage(text) {
        if (!text.trim() || isLoading) return;
        isLoading = true;
        sendBtn.disabled = true;

        appendMessage('user', text);
        history.push({ role: 'user', content: text });

        appendTyping();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history })
            });

            removeTyping();

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                appendMessage('assistant', data.error || 'Sorry, er ging iets mis. Probeer het zo opnieuw.');
            } else {
                const data = await response.json();
                const reply = data.reply || 'Sorry, ik kon geen antwoord genereren.';
                appendMessage('assistant', reply);
                history.push({ role: 'assistant', content: reply });
            }
        } catch (err) {
            removeTyping();
            appendMessage('assistant', 'Geen verbinding. Probeer het later opnieuw.');
        } finally {
            isLoading = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        sendMessage(text);
    });
})();
