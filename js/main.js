document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 오시는길: 모델하우스 위치 구글 지도 ---------- */
  const contactMapEl = document.getElementById('contactMap');
  if (contactMapEl && window.GOOGLE_MAPS_API_KEY) {
    const address = encodeURIComponent('서울 서초구 서초동 1498-1 AI빌드 갤러리');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=${window.GOOGLE_MAPS_API_KEY}&q=${address}`;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.title = '모델하우스 위치 지도';
    contactMapEl.appendChild(iframe);
  }

  /* ---------- 히어로 배경: 마우스를 따라다니는 손전등(스포트라이트) 효과 ---------- */
  const heroEl = document.querySelector('.hero');

  if (heroEl) {
    let glowTicking = false;
    let pendingMx = 50;
    let pendingMy = 35;

    function applyHeroGlow(){
      heroEl.style.setProperty('--mx', pendingMx + '%');
      heroEl.style.setProperty('--my', pendingMy + '%');
      glowTicking = false;
    }

    heroEl.addEventListener('mousemove', (e) => {
      const rect = heroEl.getBoundingClientRect();
      pendingMx = ((e.clientX - rect.left) / rect.width) * 100;
      pendingMy = ((e.clientY - rect.top) / rect.height) * 100;
      if (!glowTicking) {
        window.requestAnimationFrame(applyHeroGlow);
        glowTicking = true;
      }
    });

    heroEl.addEventListener('mouseenter', () => {
      heroEl.classList.add('is-spotlight');
    });

    heroEl.addEventListener('mouseleave', () => {
      heroEl.classList.remove('is-spotlight');
    });
  }

  /* ---------- Mobile nav ---------- */
  const hamburger = document.getElementById('hamburger');
  const mnb = document.getElementById('mnb');

  function closeMnb(){
    mnb.classList.remove('is-open');
  }

  hamburger.addEventListener('click', () => {
    mnb.classList.toggle('is-open');
  });

  mnb.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMnb));

  /* ---------- Modal ---------- */
  const modal = document.getElementById('consultModal');

  function openModal(){
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeMnb();
      openModal();
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- Floorplan tabs ---------- */
  const tabBtns = document.querySelectorAll('.tabs__btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      document.querySelectorAll('.tabs__panel').forEach(panel => {
        panel.classList.toggle('is-active', panel.id === target);
      });
    });
  });

  /* ---------- 메뉴 활성 색상: 스크롤 위치의 섹션에 따라 전환 ---------- */
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.gnb a, .mnb a, .logo');

  function isDarkSection(el){
    if (!el) return false;
    return el.classList.contains('hero') || el.classList.contains('section--dark');
  }

  function updateHeaderTheme(){
    const headerRect = header.getBoundingClientRect();
    const probeX = window.innerWidth / 2;
    const probeY = headerRect.bottom + 2;
    const elAtProbe = document.elementFromPoint(probeX, probeY);
    const section = elAtProbe ? elAtProbe.closest('section, .hero') : null;
    header.classList.toggle('is-on-dark', isDarkSection(section));

    const activeHref = section && section.id ? '#' + section.id : null;
    navLinks.forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === activeHref);
    });
  }

  let themeTicking = false;
  window.addEventListener('scroll', () => {
    if (!themeTicking) {
      window.requestAnimationFrame(() => { updateHeaderTheme(); themeTicking = false; });
      themeTicking = true;
    }
  });
  window.addEventListener('resize', updateHeaderTheme);
  updateHeaderTheme();

  /* ---------- Back to top ---------- */
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('is-visible', window.scrollY > 480);
  });
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Forms (demo submission) ---------- */
  function handleSubmit(form, onSuccess){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('input[name="name"]').value.trim();
      const phone = form.querySelector('input[name="phone"]').value.trim();
      if (!name || !phone) return;

      alert(`${name}님, 상담 신청이 접수되었습니다.\n담당자가 빠른 시일 내에 ${phone}로 연락드리겠습니다.`);
      form.reset();
      if (onSuccess) onSuccess();
    });
  }

  handleSubmit(document.getElementById('contactForm'));
  handleSubmit(document.getElementById('modalForm'), closeModal);

});
