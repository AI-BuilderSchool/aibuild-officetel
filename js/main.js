document.addEventListener('DOMContentLoaded', () => {

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
