const $ = id => document.getElementById(id);
const DNOTE = '🚚 কোনো সমস্যা না হলে ২-৩ দিনের মধ্যে ডেলিভারি পেয়ে যাবেন';
let draft = null, busy = false;
let products = [], cfg = S.DEF, cat = 'All', q = '', zone = 'dhaka';
let cart = JSON.parse(localStorage.cz_cart || '[]');
const saveCart = () => { localStorage.cz_cart = JSON.stringify(cart); $('cnt').textContent = cart.reduce((a, c) => a + c.qty, 0); };
const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2600); };
const delivery = () => zone === 'dhaka' ? +cfg.dhaka : +cfg.outside;

function chips() {
  $('chips').innerHTML = ['All', ...cfg.cats].map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  $('dl').textContent = `ঢাকার ভিতরে ${tk(cfg.dhaka)}, ঢাকার বাইরে ${tk(cfg.outside)}`;
  $('ft').textContent = `© ${new Date().getFullYear()} ${cfg.shop}. All rights reserved.`;
}
function grid() {
  const list = products.filter(p => (cat === 'All' || p.category === cat) && p.name.toLowerCase().includes(q));
  $('grid').innerHTML = list.length ? list.map(p => `<div class="card" data-id="${esc(p.id)}" tabindex="0">
    <div class="im" style="background-image:url('${esc(p.image || '')}')">${p.stock === false ? '<span class="tag out">স্টক শেষ</span>' : p.discount ? `<span class="tag">-${+p.discount}%</span>` : ''}</div>
    <div class="tx"><small>${esc(p.category)}</small><h3>${esc(p.name)}</h3>
    <div class="pr">${tk(fin(p))}${p.discount ? `<s>${tk(p.price)}</s>` : ''}</div></div></div>`).join('')
    : '<div class="empty">এখনো কোনো পণ্য নেই। শীঘ্রই নতুন পণ্য আসছে!</div>';
  const io = new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.card').forEach((c, i) => { c.style.animationDelay = (i % 6) * 70 + 'ms'; io.observe(c); });
}
function openProduct(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  const out = p.stock === false;
  $('pbox').innerHTML = `<button class="x" data-close>✕</button><div class="pim" style="background-image:url('${esc(p.image || '')}')"></div>
  <h2>${esc(p.name)}</h2><div class="pr" style="font-size:1.4rem">${tk(fin(p))}${p.discount ? `<s>${tk(p.price)}</s> <span class="sm">${+p.discount}% ছাড়</span>` : ''}</div>
  <div class="dnote">${DNOTE}</div><p class="desc">${esc(p.description)}</p>
  ${(p.sizes || []).length ? `<b>সাইজ</b><div class="sizes">${p.sizes.map((s, i) => `<label><input type="radio" name="sz" value="${esc(s)}" ${i ? '' : 'checked'}><span>${esc(s)}</span></label>`).join('')}</div>` : ''}
  <b>পরিমাণ</b> <input class="f" id="qty" type="number" min="1" max="20" value="1" style="width:90px">
  <button class="btn ac" style="width:100%;margin-top:10px" id="addc" ${out ? 'disabled' : ''}>${out ? 'স্টক শেষ' : 'ডাইরেক্ট অর্ডার করুন'}</button>`;
  $('pov').classList.add('show');
  $('addc').onclick = () => {
    const s = document.querySelector('input[name=sz]:checked')?.value || '-', n = Math.max(1, Math.min(20, +$('qty').value || 1));
    const ex = cart.find(c => c.pid === id && c.size === s);
    ex ? ex.qty += n : cart.push({ pid: id, name: p.name, size: s, qty: n, price: fin(p) });
    saveCart(); $('pov').classList.remove('show'); cartView(); $('cov').classList.add('show');
  };
}
function cartView() {
  const sub = cart.reduce((a, c) => a + c.price * c.qty, 0), d = cart.length ? delivery() : 0;
  $('cbox').innerHTML = `<button class="x" data-close>✕</button><h2>আপনার কার্ট</h2>` + (!cart.length ? '<p class="empty">কার্ট খালি।</p>' : `
  ${cart.map((c, i) => `<div class="line"><span>${esc(c.name)} <span class="sm">${esc(c.size)}</span> × ${c.qty}</span><span>${tk(c.price * c.qty)} <button class="sm" data-rm="${i}">✕</button></span></div>`).join('')}
  <div class="line"><span>পণ্যের মূল্য</span><span>${tk(sub)}</span></div>
  <div class="line"><span>ডেলিভারি চার্জ</span><span>${tk(d)}</span></div>
  <div class="line tot"><span>সর্বমোট</span><span>${tk(sub + d)}</span></div>
  <b>ডেলিভারি এলাকা</b><select class="f" id="zone"><option value="dhaka" ${zone === 'dhaka' ? 'selected' : ''}>ঢাকার ভিতরে (${tk(cfg.dhaka)})</option><option value="outside" ${zone === 'outside' ? 'selected' : ''}>ঢাকার বাইরে (${tk(cfg.outside)})</option></select>
  <input class="f" id="nm" placeholder="আপনার নাম"><input class="f" id="ph" placeholder="মোবাইল নম্বর (01XXXXXXXXX)" inputmode="numeric">
  <textarea class="f" id="ad" rows="2" placeholder="সম্পূর্ণ ঠিকানা (গ্রাম/এলাকা, থানা, জেলা)"></textarea>
  <div class="pay"><b>💵 ক্যাশ অন ডেলিভারি</b><br>পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।<hr><b>অগ্রিম পেমেন্ট (ঐচ্ছিক)</b><br>চাইলে আগেই পাঠাতে পারেন: বিকাশ / নগদ (শুধু Send Money)<br><b>${esc(cfg.pay)}</b><input class="f" id="trx" placeholder="ট্রানজেকশন আইডি (অগ্রিম দিলে)"></div>
  <div class="dnote">${DNOTE}</div>
  <button class="btn ac" style="width:100%" data-o="1">✅ অর্ডার কনফার্ম করুন (${tk(sub + d)})</button>
  <button class="sm" style="margin-top:10px" data-close>+ আরও পণ্য দেখুন</button>`);
}
async function order() {
  if (busy) return;
  const name = $('nm').value.trim(), phone = $('ph').value.trim(), addr = $('ad').value.trim(), trx = $('trx').value.trim();
  if (name.length < 2 || !/^01\d{9}$/.test(phone) || addr.length < 8) return toast('নাম, সঠিক মোবাইল নম্বর ও সম্পূর্ণ ঠিকানা দিন');
  const sub = cart.reduce((a, c) => a + c.price * c.qty, 0), d = delivery(), total = sub + d;
  draft = draft || { id: S.uid(), oid: 'CZ' + Date.now().toString().slice(-6) };
  const items = cart.map(c => `${c.name} (${c.size}) x${c.qty} = ${tk(c.price * c.qty)}`);
  const btn = document.querySelector('[data-o]'); busy = true; btn.disabled = true; btn.textContent = 'অর্ডার হচ্ছে...';
  try {
    await Promise.race([
      S.save('orders', { id: draft.id, oid: draft.oid, name, phone, address: addr, zone, items, subtotal: sub, delivery: d, total, trx, pay: trx ? 'Advance' : 'COD', via: 'Website', status: 'New', createdAt: Date.now() }),
      new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 15000))
    ]);
  } catch (e) {
    console.error(e); busy = false; btn.disabled = false; btn.textContent = '✅ অর্ডার কনফার্ম করুন (' + tk(total) + ')';
    return toast('অর্ডার পাঠানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন');
  }
  const oid = draft.oid; draft = null; busy = false; cart = []; saveCart();
  $('cbox').innerHTML = `<button class="x" data-close>✕</button><div class="ok"><div class="okic">✅</div><h2>অর্ডার সফল হয়েছে!</h2>
  <p>ধন্যবাদ ${esc(name)}, আপনার অর্ডার আমরা পেয়েছি।</p>
  <div class="pay"><b>অর্ডার নম্বর: ${esc(oid)}</b><br>সর্বমোট: ${tk(total)} (${trx ? 'অগ্রিম পেমেন্টের তথ্য দেওয়া হয়েছে' : 'ক্যাশ অন ডেলিভারি'})</div>
  <div class="dnote">${DNOTE}</div><p style="margin:10px 0">প্রয়োজনে আমরা আপনার মোবাইল নম্বরে যোগাযোগ করব।</p>
  <button class="btn ac" data-close>ঠিক আছে</button></div>`;
  $('cov').classList.add('show');
}
document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('[data-close]') || t.classList.contains('ov')) document.querySelectorAll('.ov').forEach(o => o.classList.remove('show'));
  if (t.dataset.c) { cat = t.dataset.c; chips(); grid(); }
  const card = t.closest('.card'); if (card) openProduct(card.dataset.id);
  if (t.closest('#cartBtn')) { cartView(); $('cov').classList.add('show'); }
  if (t.dataset.rm) { cart.splice(+t.dataset.rm, 1); saveCart(); cartView(); }
  if (t.dataset.o) order();
});
document.addEventListener('change', e => { if (e.target.id === 'zone') { const ids = ['nm', 'ph', 'ad', 'trx'], v = ids.map(i => $(i).value); zone = e.target.value; cartView(); ids.forEach((i, k) => $(i).value = v[k]); } });
$('q').oninput = e => { q = e.target.value.toLowerCase(); grid(); };
S.watch('products', l => { products = l.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); grid(); });
S.watchSettings(s => { cfg = s; chips(); grid(); });
saveCart(); chips();
