document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 히어로 배경: 마우스 움직임에 반응하는 패럴랙스 효과 ---------- */
  const heroEl = document.querySelector('.hero');
  const heroBg = document.querySelector('.hero__bg');

  if (heroEl && heroBg) {
    const maxShift = 24; // px
    let heroTicking = false;
    let pendingX = 0;
    let pendingY = 0;

    function applyHeroShift(){
      heroBg.style.transform = `scale(1.08) translate(${pendingX}px, ${pendingY}px)`;
      heroTicking = false;
    }

    heroEl.addEventListener('mousemove', (e) => {
      const rect = heroEl.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      pendingX = -nx * maxShift * 2;
      pendingY = -ny * maxShift * 2;
      if (!heroTicking) {
        window.requestAnimationFrame(applyHeroShift);
        heroTicking = true;
      }
    });

    heroEl.addEventListener('mouseleave', () => {
      pendingX = 0;
      pendingY = 0;
      window.requestAnimationFrame(applyHeroShift);
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

  /* ---------- 메뉴 & 상담신청 버튼 활성 색상: 스크롤 위치의 섹션에 따라 전환 ---------- */
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.gnb a, .mnb a, .logo');
  const headerCta = document.querySelector('.header__cta');

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

    // 상담신청 버튼: 오시는길·상담문의(#contact) 섹션일 때만 배경색을 갖도록 처리
    if (headerCta) headerCta.classList.toggle('is-active', activeHref === '#contact');
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
