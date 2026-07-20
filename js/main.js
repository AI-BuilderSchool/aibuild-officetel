document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 오시는길: 모델하우스 위치 구글 지도 ---------- */
  const contactMapEl = document.getElementById('contactMap');
  if (contactMapEl && window.GOOGLE_MAPS_API_KEY) {
    const address = encodeURIComponent('서울특별시 서초구 서초동 1498-1');
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
  function openModalById(id){
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModalById(id){
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-open');
    document.body.style.overflow = '';
    if (id === 'lookupModal') resetLookupModal();
  }

  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeMnb();
      openModalById(btn.dataset.openModal || 'consultModal');
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => {
      const modalEl = el.closest('.modal');
      if (modalEl) closeModalById(modalEl.id);
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal.is-open').forEach(m => closeModalById(m.id));
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

  /* ---------- Supabase 연동 (상담 신청 저장 + 예약 조회/취소) ---------- */
  const supabaseClient = (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY)
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
    : null;

  /* ---------- Forms: 상담 신청 ---------- */
  function handleSubmit(form, onSuccess){
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.querySelector('input[name="name"]').value.trim();
      const phone = form.querySelector('input[name="phone"]').value.trim();
      if (!name || !phone) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      if (supabaseClient) {
        const { error } = await supabaseClient.from('reservations').insert({ name, phone });
        if (error) {
          console.error('reservation insert failed', error);
          alert('상담 신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          if (submitBtn) submitBtn.disabled = false;
          return;
        }
      }

      alert(`${name}님, 상담 신청이 접수되었습니다.\n담당자가 빠른 시일 내에 ${phone}로 연락드리겠습니다.`);
      form.reset();
      if (submitBtn) submitBtn.disabled = false;
      if (onSuccess) onSuccess();
    });
  }

  handleSubmit(document.getElementById('contactForm'));
  handleSubmit(document.getElementById('modalForm'), () => closeModalById('consultModal'));

  /* ---------- 예약 조회 · 취소 ---------- */
  const lookupForm = document.getElementById('lookupForm');
  const lookupMsg = document.getElementById('lookupMsg');
  const reservationList = document.getElementById('reservationList');

  function resetLookupModal(){
    if (lookupForm) lookupForm.reset();
    if (lookupMsg) lookupMsg.textContent = '';
    if (reservationList) reservationList.innerHTML = '';
  }

  function renderReservations(rows){
    reservationList.innerHTML = '';
    if (!rows.length) {
      lookupMsg.textContent = '조회된 예약 내역이 없습니다.';
      return;
    }
    lookupMsg.textContent = '';

    rows.forEach(row => {
      const li = document.createElement('li');
      li.className = 'reservation-item';

      const dateSpan = document.createElement('span');
      dateSpan.className = 'reservation-item__date';
      dateSpan.textContent = new Date(row.created_at).toLocaleString('ko-KR') + ' 접수';

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'reservation-item__cancel';
      cancelBtn.textContent = '취소';
      cancelBtn.addEventListener('click', async () => {
        if (!confirm('예약을 취소하시겠습니까?')) return;
        cancelBtn.disabled = true;

        const { data, error } = await supabaseClient.rpc('cancel_my_reservation', {
          p_id: row.id, p_name: row.name, p_phone: row.phone
        });

        if (error || !data) {
          console.error('reservation cancel failed', error);
          alert('취소 처리 중 오류가 발생했습니다.');
          cancelBtn.disabled = false;
          return;
        }

        li.remove();
        if (!reservationList.children.length) {
          lookupMsg.textContent = '취소되었습니다. 남은 예약 내역이 없습니다.';
        }
      });

      li.appendChild(dateSpan);
      li.appendChild(cancelBtn);
      reservationList.appendChild(li);
    });
  }

  if (lookupForm) {
    lookupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!supabaseClient) {
        lookupMsg.textContent = '예약 조회 기능을 사용할 수 없습니다.';
        return;
      }

      const name = lookupForm.querySelector('input[name="name"]').value.trim();
      const phone = lookupForm.querySelector('input[name="phone"]').value.trim();
      if (!name || !phone) return;

      const submitBtn = lookupForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      lookupMsg.textContent = '조회 중...';
      reservationList.innerHTML = '';

      const { data, error } = await supabaseClient.rpc('lookup_my_reservations', { p_name: name, p_phone: phone });

      if (submitBtn) submitBtn.disabled = false;
      if (error) {
        console.error('reservation lookup failed', error);
        lookupMsg.textContent = '조회 중 오류가 발생했습니다.';
        return;
      }
      renderReservations(data || []);
    });
  }

});
