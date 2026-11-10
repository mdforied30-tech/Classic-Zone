const $ = id => document.getElementById(id), A = $('app'), EMAIL = 'mdforied30@gmail.com';
let tab = 'products', products = [], orders = [], cfg = S.DEF, edit = null, img = '';
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const lock = () => JSON.parse(localStorage.cz_lock || '{"n":0,"until":0}');

function loginView(msg = '') {
  A.innerHTML = `<form class="login" id="lf"><h2>🔐 Admin</h2><input class="f" id="em" type="email" placeholder="Email" autocomplete="username"><input class="f" id="pw" type="password" placeholder="Password" autocomplete="current-password">
  <button class="btn ac" style="width:100%;margin-top:8px">Login</button><div class="err" id="er">${msg}</div>${S.live ? '' : '<p class="note" style="margin-top:10px">DEMO mode (Firebase set kora hoyni). Demo password: demo</p>'}</form>`;
  $('lf').onsubmit = async e => {
    e.preventDefault(); const L = lock(), now = Date.now();
    if (L.until > now) return $('er').textContent = `Onek beshi try. ${Math.ceil((L.until - now) / 60000)} minute pore abar chesta korun.`;
    try { await S.login($('em').value.trim(), $('pw').value); localStorage.cz_lock = '{"n":0,"until":0}'; }
    catch { L.n++; if (L.n >= 5) { L.until = now + 15 * 60000; L.n = 0; } localStorage.cz_lock = JSON.stringify(L); $('er').textContent = L.until > now ? 'Block kora hoyeche: 15 minute.' : 'Email ba password vul.'; }
  };
}
function shell() {
  A.innerHTML = `<div class="ad"><div style="display:flex;justify-content:space-between;align-items:center"><div class="logo">Classic <b>Zone</b> Panel ${S.live ? '🟢 Live' : '🟡 Demo'}</div><button class="sb d" id="lo">Logout</button></div>
  <div class="tabs">${[['products', 'Products'], ['orders', 'Orders'], ['cats', 'Categories'], ['settings', 'Settings']].map(([k, v]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}">${v}${k === 'orders' ? ` (${orders.filter(o => o.status === 'New').length})` : ''}</button>`).join('')}</div><div id="body"></div></div>`;
  $('lo').onclick = () => S.logout();
  document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; edit = null; render(); });
  render();
}
function render() {
  if (!$('body')) return;
  document.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
  const B = $('body');
  if (tab === 'products') {
    const p = edit || { sizes: ['M', 'L', 'XL'], stock: true, category: cfg.cats[0], discount: 0 };
    B.innerHTML = `<div class="pnl"><h3>${edit ? 'Edit product' : 'Notun product'}</h3><div class="fg">
    <input class="f full" id="pn" placeholder="Product naam" value="${esc(p.name)}">
    <select class="f" id="pc">${cfg.cats.map(c => `<option ${c === p.category ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
    <input class="f" id="pp" type="number" min="0" placeholder="Price (৳)" value="${p.price ?? ''}">
    <input class="f" id="pd" type="number" min="0" max="90" placeholder="Discount %" value="${p.discount || ''}">
    <label class="ck"><input type="checkbox" id="ps" ${p.stock !== false ? 'checked' : ''}> In stock</label>
    <div class="full"><b>Size: </b>${SIZES.map(s => `<label class="ck"><input type="checkbox" class="sz" value="${s}" ${(p.sizes || []).includes(s) ? 'checked' : ''}>${s}</label>`).join('')}</div>
    <textarea class="f full" id="pt" rows="2" placeholder="Description">${esc(p.description)}</textarea>
    <div class="full"><input type="file" id="pf" accept="image/*"> <div id="pv">${img || p.image ? `<img src="${esc(img || p.image)}" style="height:70px;border-radius:8px;margin-top:6px">` : ''}</div></div></div>
    <button class="btn ac" id="sv">Save</button> ${edit ? '<button class="sb" id="cn">Cancel</button>' : ''}</div>
    <div class="pnl"><div style="display:flex;justify-content:space-between"><h3>Sob product (${products.length})</h3><button class="sb d" id="da">Delete all</button></div>
    ${products.map(x => `<div class="row">${x.image ? `<img src="${esc(x.image)}" alt="">` : '<div class="th"></div>'}<div class="g"><b>${esc(x.name)}</b><br><small>${esc(x.category)} • ${tk(fin(x))}${x.discount ? ` (-${+x.discount}%)` : ''} • ${(x.sizes || []).join(',')} ${x.stock === false ? '• OUT' : ''}</small></div>
    <button class="sb" data-e="${esc(x.id)}">Edit</button><button class="sb d" data-d="${esc(x.id)}">Delete</button></div>`).join('') || '<p>Kono product nei.</p>'}</div>`;
    $('pf').onchange = async e => { img = await shrink(e.target.files[0]); $('pv').innerHTML = `<img src="${img}" style="height:70px;border-radius:8px;margin-top:6px">`; };
    $('sv').onclick = async () => {
      const name = $('pn').value.trim(), price = +$('pp').value; if (!name || !(price > 0)) return alert('Naam ar price din');
      await S.save('products', { id: edit?.id, name, category: $('pc').value, price, discount: +$('pd').value || 0, stock: $('ps').checked,
        sizes: [...document.querySelectorAll('.sz:checked')].map(c => c.value), description: $('pt').value.trim(), image: img || edit?.image || '', createdAt: edit?.createdAt || Date.now() });
      edit = null; img = ''; render();
    };
    if ($('cn')) $('cn').onclick = () => { edit = null; img = ''; render(); };
    $('da').onclick = async () => { if (confirm('Sob product delete hobe. Nishchit?')) for (const x of products) await S.del('products', x.id); };
    B.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { edit = products.find(x => x.id === b.dataset.e); img = ''; render(); scrollTo(0, 0); });
    B.querySelectorAll('[data-d]').forEach(b => b.onclick = () => confirm('Delete korben?') && S.del('products', b.dataset.d));
  }
  if (tab === 'orders') {
    B.innerHTML = `<div class="pnl"><div style="display:flex;justify-content:space-between"><h3>Orders (${orders.length})</h3><button class="sb d" id="da">Delete all</button></div>
    ${orders.map(o => `<div class="row"><div class="g"><b>${esc(o.oid)}</b> • ${esc(o.name)} • <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a><br><small>${esc(o.address)} (${o.zone === 'dhaka' ? 'Dhaka' : 'Outside'})<br>${(o.items || []).map(esc).join('<br>')}<br>Total: <b>${tk(o.total)}</b> • via ${esc(o.via)} ${o.trx ? '• TrxID ' + esc(o.trx) : ''} • ${new Date(o.createdAt).toLocaleString()}</small></div>
    <select class="f" style="width:auto" data-s="${esc(o.id)}">${['New', 'Confirmed', 'Delivered', 'Cancelled'].map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select><button class="sb d" data-d="${esc(o.id)}">Delete</button></div>`).join('') || '<p>Kono order nei.</p>'}</div>`;
    $('da').onclick = async () => { if (confirm('Sob order delete hobe. Nishchit?')) for (const x of orders) await S.del('orders', x.id); };
    B.querySelectorAll('[data-s]').forEach(s => s.onchange = () => S.save('orders', { id: s.dataset.s, status: s.value }));
    B.querySelectorAll('[data-d]').forEach(b => b.onclick = () => confirm('Delete korben?') && S.del('orders', b.dataset.d));
  }
  if (tab === 'cats') {
    B.innerHTML = `<div class="pnl"><h3>Categories</h3><div style="display:flex;gap:8px"><input class="f" id="nc" placeholder="Notun category (e.g. Jacket)"><button class="btn ac" id="ac">Add</button></div>
    ${cfg.cats.map((c, i) => `<div class="row"><div class="g"><b>${esc(c)}</b></div><button class="sb" data-r="${i}">Rename</button><button class="sb d" data-x="${i}">Delete</button></div>`).join('')}</div>`;
    $('ac').onclick = () => { const v = $('nc').value.trim(); if (v && !cfg.cats.includes(v)) S.saveSettings({ cats: [...cfg.cats, v] }); };
    B.querySelectorAll('[data-x]').forEach(b => b.onclick = () => confirm('Category delete korben?') && S.saveSettings({ cats: cfg.cats.filter((_, i) => i !== +b.dataset.x) }));
    B.querySelectorAll('[data-r]').forEach(b => b.onclick = async () => { const old = cfg.cats[+b.dataset.r], v = (prompt('Notun naam', old) || '').trim(); if (!v || v === old) return;
      for (const p of products.filter(p => p.category === old)) await S.save('products', { id: p.id, category: v });
      S.saveSettings({ cats: cfg.cats.map(c => c === old ? v : c) }); });
  }
  if (tab === 'settings') {
    B.innerHTML = `<div class="pnl"><h3>Settings</h3><div class="fg">
    <label>Dhaka delivery ৳<input class="f" id="s1" type="number" value="${cfg.dhaka}"></label><label>Dhaka er bahire ৳<input class="f" id="s2" type="number" value="${cfg.outside}"></label>
    <label>Bkash/Nagad number<input class="f" id="s3" value="${esc(cfg.pay)}"></label><label>Shop naam<input class="f" id="s4" value="${esc(cfg.shop)}"></label>
    <label class="full">Messenger link<input class="f" id="s5" value="${esc(cfg.messenger)}"></label><label class="full">WhatsApp link<input class="f" id="s6" value="${esc(cfg.whatsapp)}"></label></div>
    <button class="btn ac" id="ss">Save</button></div>`;
    $('ss').onclick = async () => { await S.saveSettings({ dhaka: +$('s1').value, outside: +$('s2').value, pay: $('s3').value.trim(), shop: $('s4').value.trim(), messenger: $('s5').value.trim(), whatsapp: $('s6').value.trim() }); alert('Saved ✔'); };
  }
}
function shrink(file) {
  return new Promise(res => { const r = new FileReader(); r.onload = () => { const i = new Image(); i.onload = () => {
    const k = Math.min(1, 700 / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = i.width * k; c.height = i.height * k;
    c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .72)); }; i.src = r.result; }; r.readAsDataURL(file); });
}
let started = false;
S.onAuth(ok => {
  if (!ok) { started = false; return loginView(); }
  if (started) return; started = true; shell();
  S.watch('products', l => { products = l.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); if (!edit) render(); });
  S.watch('orders', l => { orders = l.sort((a, b) => b.createdAt - a.createdAt); if (tab === 'orders') render(); const t = document.querySelector('[data-t=orders]'); if (t) t.textContent = `Orders (${orders.filter(o => o.status === 'New').length})`; });
  S.watchSettings(s => { cfg = s; if (tab !== 'settings' && !edit) render(); });
});
