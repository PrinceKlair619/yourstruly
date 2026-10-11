(function(){
  const C = window.YTC_CONFIG;
  const $ = id => document.getElementById(id);
  document.getElementById('year').textContent = new Date().getFullYear();
  document.querySelectorAll('.js-ig').forEach(a => a.href = C.instagram);
  document.querySelectorAll('.js-li').forEach(a => a.href = C.linkedin);

  /* ---------- Mobile menu ---------- */
  const nav = document.getElementById('nav'), menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); }));

  /* ---------- Old one-page links (/#contact etc.) go to the new pages ---------- */
  const MOVED = { services:'services.html', work:'work.html', reviews:'reviews.html', area:'area.html', contact:'contact.html' };
  const hash = location.hash.slice(1);
  if (MOVED[hash] && !document.getElementById(hash)) location.replace(MOVED[hash]);

  /* ---------- Project photos (shared by the home strip and the work.html library) ---------- */
  // Photos live in images/work/: work-NN.jpg (full size) and work-NN-thumb.jpg (600x600).
  // To add one, save both files and add a line here. cat is one of: kitchens, bathrooms, more.
  const PHOTOS = [
    { id:'01', cat:'kitchens',  title:'Two-tone kitchen with granite island', text:'A slate-blue island anchors white shaker cabinets on the perimeter, with double wall ovens, glass-front uppers and pendant lights over the granite top.' },
    { id:'04', cat:'kitchens',  title:'Open kitchen with patterned backsplash', text:'White cabinets with glass-front display uppers, a blue patterned tile backsplash, farmhouse sink and peninsula seating for the family.' },
    { id:'03', cat:'bathrooms', title:'Green tile shower and floating vanity', text:'Floor-to-ceiling green stacked tile, a low-threshold walk-in shower, backlit round mirrors and a compact vanity that keeps the room open.' },
    { id:'10', cat:'more',      title:'Back deck rebuild', text:'A worn deck taken down and rebuilt with new gray decking, white railings, new steps and lattice skirting around the base.' },
    { id:'08', cat:'kitchens',  title:'White kitchen with chandelier', text:'Raised-panel white cabinetry, a stone backsplash behind the range and a granite island with seating under a statement chandelier.' },
    { id:'07', cat:'bathrooms', title:'Walk-in shower with double vanity', text:'Gray subway-tile shower behind frameless glass, paired with a dark double vanity, marble top and matte black hardware.' },
    { id:'13', cat:'kitchens',  title:'Bright kitchen with a long island', text:'White cabinetry, a long island with counter seating, a professional-style range, lantern pendants and wide-plank wood floors.' },
    { id:'09', cat:'bathrooms', title:'Geometric tile shower', text:'Patterned geometric wall tile, a low-profile shower base, black rain-shower fixtures and built-in open shelving.' },
    { id:'06', cat:'more',      title:'Open-plan main floor', text:'Wide-plank gray flooring carried through the living space, a staircase with black metal balusters and a clear line through to the kitchen.' },
    { id:'12', cat:'kitchens',  title:'Farmhouse kitchen with copper hood', text:'A hammered copper range hood, navy beadboard island, glass-front cabinets and brass pendants over the seating.' },
    { id:'05', cat:'bathrooms', title:'Marble-look tub and shower', text:'A tub with a black-framed glass panel, marble-look wall tile, gray vanity and matte black fixtures in a compact bathroom.' },
    { id:'02', cat:'kitchens',  title:'Gray shaker kitchen', text:'A full run of gray shaker cabinets around a center island, light counters, stainless appliances and wood-look tile flooring.' },
    { id:'11', cat:'bathrooms', title:'Subway tile shower and dark vanity', text:'Classic white subway tile with a decorative niche, a glass shower door and a dark wood vanity with a white top.' },
  ];
  const CAT_NAME = { kitchens:'Kitchen remodel', bathrooms:'Bathroom remodel', more:'Interior & exterior' };
  const thumb = p => `images/work/work-${p.id}-thumb.jpg`;
  const full  = p => `images/work/work-${p.id}.jpg`;
  const ARROW_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';

  // Arrow buttons that scroll a horizontal track, disabled at either end.
  function railControls(track, prev, next){
    const step = () => Math.max(track.clientWidth * 0.8, 200);
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left:  step(), behavior: 'smooth' }));
    const update = () => {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return update;
  }

  /* ---------- Home: recent projects strip ---------- */
  if ($('workRail')) {
    const rail = $('workRail');
    PHOTOS.forEach(p => {
      const a = document.createElement('a');
      a.className = 'rail-card';
      a.href = `work.html#p-${p.id}`;
      a.innerHTML = `<span class="ph"><img src="${thumb(p)}" alt="" loading="lazy" width="600" height="600"></span>
        <span class="meta"><span class="cat">${CAT_NAME[p.cat]}</span><strong>${p.title}</strong></span>`;
      rail.appendChild(a);
    });
    railControls(rail, $('railPrev'), $('railNext'));
  }

  /* ---------- Work: photo library ---------- */
  if ($('library')) {
    const img = $('libImg'), bg = $('libBg'), strip = $('libStrip');
    const lb = $('lightbox'), lbImg = $('lbImg'), lbCount = $('lbCount');
    let list = PHOTOS, cur = 0, lastFocus = null;

    function renderStrip(){
      strip.innerHTML = '';
      list.forEach((p, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'lib-thumb';
        b.setAttribute('aria-label', `Show photo ${i + 1}: ${p.title}`);
        b.innerHTML = `<img src="${thumb(p)}" alt="" loading="lazy" width="600" height="600">`;
        b.addEventListener('click', () => select(i));
        strip.appendChild(b);
      });
      $('libTotal').textContent = `${list.length} photo${list.length === 1 ? '' : 's'}`;
      updateRail();
    }

    function select(i, { smooth = true } = {}){
      cur = (i + list.length) % list.length;
      const p = list[cur];
      img.classList.add('is-loading');
      img.onload = () => img.classList.remove('is-loading');
      img.src = full(p);
      img.alt = `${p.title}. ${p.text}`;
      bg.style.backgroundImage = `url("${thumb(p)}")`;
      $('libCat').textContent = CAT_NAME[p.cat];
      $('libTitle').textContent = p.title;
      $('libText').textContent = p.text;
      $('libCount').textContent = `${cur + 1} / ${list.length}`;
      [...strip.children].forEach((b, j) => b.setAttribute('aria-current', j === cur));
      const t = strip.children[cur];
      strip.scrollTo({ left: t.offsetLeft - (strip.clientWidth - t.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
      history.replaceState(null, '', `#p-${p.id}`);
      // Warm the cache for the neighbours so arrowing feels instant.
      [cur - 1, cur + 1].forEach(k => { new Image().src = full(list[(k + list.length) % list.length]); });
      if (lb.classList.contains('open')) showLb();
    }

    document.querySelectorAll('.lib-filters button').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.lib-filters button').forEach(b => b.setAttribute('aria-pressed', b === btn));
      const cat = btn.dataset.cat;
      list = cat === 'all' ? PHOTOS : PHOTOS.filter(p => p.cat === cat);
      renderStrip();
      select(0);
    }));
    document.querySelectorAll('.lib-filters [data-cat]').forEach(b => {
      const n = b.dataset.cat === 'all' ? PHOTOS.length : PHOTOS.filter(p => p.cat === b.dataset.cat).length;
      b.querySelector('small').textContent = n;
    });

    $('libPrev').onclick = () => select(cur - 1);
    $('libNext').onclick = () => select(cur + 1);
    const updateRail = railControls(strip, $('stripPrev'), $('stripNext'));

    // Swipe on the main photo
    let sx = null;
    const view = $('libView');
    view.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    view.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) select(cur + (dx < 0 ? 1 : -1)); sx = null; });

    /* Full-screen view */
    function showLb(){ const p = list[cur]; lbImg.src = full(p); lbImg.alt = img.alt; lbCount.textContent = `${p.title} · ${cur + 1} / ${list.length}`; }
    function openLb(){ lastFocus = document.activeElement; showLb(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('lbClose').focus(); }
    function closeLb(){ lb.classList.remove('open'); document.body.style.overflow = ''; lastFocus?.focus(); }
    $('libExpand').onclick = openLb;
    img.addEventListener('click', openLb);
    $('lbClose').onclick = closeLb;
    $('lbPrev').onclick = () => select(cur - 1);
    $('lbNext').onclick = () => select(cur + 1);
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
    let tx = null;
    lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
    lb.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) select(cur + (dx < 0 ? 1 : -1)); tx = null; });

    document.addEventListener('keydown', e => {
      const inLb = lb.classList.contains('open');
      if (inLb && e.key === 'Escape') return closeLb();
      // Arrow keys work in full screen, or while focus is inside the library (but not in the filter row)
      if (!inLb && (!$('library').contains(document.activeElement) || e.target.closest('.lib-filters'))) return;
      if (e.key === 'ArrowLeft'){ e.preventDefault(); select(cur - 1); }
      if (e.key === 'ArrowRight'){ e.preventDefault(); select(cur + 1); }
    });

    renderStrip();
    const start = PHOTOS.findIndex(p => location.hash === `#p-${p.id}`);
    select(Math.max(start, 0), { smooth: false });
    if (start >= 0) $('library').scrollIntoView();
  }

  /* ---------- Google reviews link ---------- */
  document.querySelectorAll('.js-google-reviews').forEach(a => a.href = C.googleReviewsUrl);

  /* ---------- Quote form (contact.html) ---------- */
  if ($('quoteForm')) {
    const form = document.getElementById('quoteForm'), status = document.getElementById('formStatus'), submitBtn = document.getElementById('submitBtn');
    const MSG = { name:'Enter your name.', phone:'Enter a phone number we can reach you at.', town:'Enter your town or ZIP so we know the location.', service:'Choose the type of work.', email:'Enter your email so we can send you the estimate.', emailFormat:'Check the email address format.' };
    function validate(){
      let firstBad = null;
      form.querySelectorAll('.field').forEach(f => {
        const el = f.querySelector('input:not([type=radio]),select,textarea'); if (!el) return;
        const errEl = f.querySelector('.err'); let msg = '';
        const v = el.value.trim();
        if (el.required && !v) msg = MSG[el.name];
        else if (el.name === 'phone' && v.replace(/\D/g,'').length < 10) msg = 'Enter a 10-digit phone number.';
        else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = MSG.emailFormat;
        if (msg){ f.setAttribute('data-error',''); if (errEl) errEl.textContent = msg; el.setAttribute('aria-invalid','true'); firstBad ??= el; }
        else { f.removeAttribute('data-error'); if (errEl) errEl.textContent = ''; el.removeAttribute('aria-invalid'); }
      });
      firstBad?.focus();
      return !firstBad;
    }
    form.addEventListener('input', e => { const f = e.target.closest('.field'); if (f?.hasAttribute('data-error')) validate(); });
    // Lays the request out as labeled rows; FormSubmit renders these as a table in the email.
    function formatRequest(d){
      const when = new Date().toLocaleString('en-US', { dateStyle:'full', timeStyle:'short', timeZone:'America/New_York' });
      return {
        'Name': d.name.trim(),
        'Phone': d.phone.trim(),
        'Email': d.email.trim(),
        'Town / ZIP': d.town.trim(),
        'Service needed': d.service,
        'Timeline': d.timeline,
        'Project details': (d.message || '').trim() || '(none given)',
        'Submitted': when + ' (ET)'
      };
    }
    function asText(rows){ return Object.entries(rows).map(([k, v]) => `${k}: ${v}`).join('\n'); }
    function mailtoHref(rows){
      return `mailto:${C.email}?subject=${encodeURIComponent(`Quote request: ${rows['Service needed']} - ${rows['Name']}`)}&body=${encodeURIComponent(asText(rows))}`;
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      status.className = 'form-status';
      if (!validate()) return;
      const data = Object.fromEntries(new FormData(form));
      const rows = formatRequest(data);

      // Bots fill the hidden field; act as if it worked and send nothing.
      if (data._honey){ form.reset(); status.className = 'form-status ok'; status.textContent = 'Request sent.'; return; }

      if (!C.formEndpoint){ window.location.href = mailtoHref(rows); return; }

      submitBtn.disabled = true; submitBtn.textContent = 'Sending…';
      try{
        const res = await fetch(C.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
          body: JSON.stringify({
            _subject: `New quote request: ${rows['Service needed']} - ${rows['Name']}`,
            _replyto: rows['Email'],
            _template: 'table',
            _captcha: 'false',
            ...rows
          })
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) !== 'true') throw new Error(out.message || res.status);
        form.reset();
        status.className = 'form-status ok';
        status.textContent = `Thanks, ${rows['Name'].split(' ')[0]}. Your request was sent. We'll reach out at ${rows['Phone']} or ${rows['Email']} within one business day.`;
      }catch(err){
        console.warn('Quote form not delivered:', err.message);
        status.className = 'form-status bad';
        if (/activat/i.test(err.message)){
          status.innerHTML = `This form is waiting for the company to activate email delivery. Please call <a href="tel:+19147712566">(914) 771-2566</a> or <a href="${mailtoHref(rows)}">email the request instead</a> (it's filled in for you).`;
          return;
        }
        status.innerHTML = `The request didn't go through. Call <a href="tel:+19147712566">(914) 771-2566</a>, or <a href="${mailtoHref(rows)}">email it to us instead</a> (it's filled in for you).`;
      }finally{ submitBtn.disabled = false; submitBtn.textContent = 'Send my request'; }
    });
  }
})();
