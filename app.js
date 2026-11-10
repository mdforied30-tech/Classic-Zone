const $ = id => document.getElementById(id);
let products = [], cfg = S.DEF, cat = 'All', q = '', zone = 'dhaka';
let cart = JSON.parse(localStorage.cz_cart || '[]');
const saveCart = () => { localStorage.cz_cart = JSON.stringify(cart); $('cnt').textContent = cart.reduce((a, c) => a + c.qty, 0); };
const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2600); };
const delivery = () => zone === 'dhaka' ? +cfg.dhaka : +cfg.outside;

function chips() {
  $('chips').innerHTML = ['All', ...cfg.cats].map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  $('dl').textContent = `Dhaka er bhitore ${tk(cfg.dhaka)}, bahire ${tk(cfg.outside)}`;
  $('ft').textContent = `© ${new Date().getFullYear()} ${cfg.shop}. All rights reserved.`;
}
function grid() {
  const list = products.filter(p => (cat === 'All' || p.category === cat) && p.name.toLowerCase().includes(q));
  $('grid').innerHTML = list.length ? list.map(p => `<div class="card" data-id="${esc(p.id)}" tabindex="0">
    <div class="im" style="background-image:url('${esc(p.image || '')}')">${p.stock === false ? '<span class="tag out">Stock out</span>' : p.discount ? `<span class="tag">-${+p.discount}%</span>` : ''}</div>
    <div class="tx"><small>${esc(p.category)}</small><h3>${esc(p.name)}</h3>
    <div class="pr">${tk(fin(p))}${p.discount ? `<s>${tk(p.price)}</s>` : ''}</div></div></div>`).join('')
    : '<div class="empty">Kono product nei. Shigroi notun product asche!</div>';
  const io = new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.card').forEach((c, i) => { c.style.animationDelay = (i % 6) * 70 + 'ms'; io.observe(c); });
}
function openProduct(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  const out = p.stock === false;
  $('pbox').innerHTML = `<button class="x" data-close>✕</button><div class="pim" style="background-image:url('${esc(p.image || '')}')"></div>
  <h2>${esc(p.name)}</h2><div class="pr" style="font-size:1.4rem">${tk(fin(p))}${p.discount ? `<s>${tk(p.price)}</s> <span class="sm">${+p.discount}% off</span>` : ''}</div>
  <p style="color:var(--mut);margin:8px 0">${esc(p.description)}</p>
  ${(p.sizes || []).length ? `<b>Size</b><div class="sizes">${p.sizes.map((s, i) => `<label><input type="radio" name="sz" value="${esc(s)}" ${i ? '' : 'checked'}><span>${esc(s)}</span></label>`).join('')}</div>` : ''}
  <b>Quantity</b> <input class="f" id="qty" type="number" min="1" max="20" value="1" style="width:90px">
  <button class="btn ac" style="width:100%;margin-top:10px" id="addc" ${out ? 'disabled' : ''}>${out ? 'Stock out' : 'Add to cart'}</button>`;
  $('pov').classList.add('show');
  $('addc').onclick = () => {
    const s = document.querySelector('input[name=sz]:checked')?.value || '-', n = Math.max(1, Math.min(20, +$('qty').value || 1));
    const ex = cart.find(c => c.pid === id && c.size === s);
    ex ? ex.qty += n : cart.push({ pid: id, name: p.name, size: s, qty: n, price: fin(p) });
    saveCart(); $('pov').classList.remove('show'); $('cartBtn').classList.add('bump'); setTimeout(() => $('cartBtn').classList.remove('bump'), 600); toast('Cart e add hoyeche ✔');
  };
}
function cartView() {
  const sub = cart.reduce((a, c) => a + c.price * c.qty, 0), d = cart.length ? delivery() : 0;
  $('cbox').innerHTML = `<button class="x" data-close>✕</button><h2>Apnar Cart</h2>` + (!cart.length ? '<p class="empty">Cart faka.</p>' : `
  ${cart.map((c, i) => `<div class="line"><span>${esc(c.name)} <span class="sm">${esc(c.size)}</span> × ${c.qty}</span><span>${tk(c.price * c.qty)} <button class="sm" data-rm="${i}">✕</button></span></div>`).join('')}
  <div class="line"><span>Subtotal</span><span>${tk(sub)}</span></div>
  <div class="line"><span>Delivery charge</span><span>${tk(d)}</span></div>
  <div class="line tot"><span>Total</span><span>${tk(sub + d)}</span></div>
  <select class="f" id="zone"><option value="dhaka" ${zone === 'dhaka' ? 'selected' : ''}>Dhaka er bhitore (${tk(cfg.dhaka)})</option><option value="outside" ${zone === 'outside' ? 'selected' : ''}>Dhaka er bahire (${tk(cfg.outside)})</option></select>
  <input class="f" id="nm" placeholder="Apnar naam"><input class="f" id="ph" placeholder="Phone (01XXXXXXXXX)" inputmode="numeric">
  <textarea class="f" id="ad" rows="2" placeholder="Puro thikana"></textarea>
  <div class="pay"><b>Payment:</b> Bkash / Nagad (Send Money only)<br><b>${esc(cfg.pay)}</b><br><input class="f" id="trx" placeholder="Transaction ID (optional)"></div>
  <b>Kothay order korben?</b><div class="two"><button class="ms" data-o="m">Messenger</button><button class="wa" data-o="w">WhatsApp</button></div>`);
}
async function order(via) {
  const name = $('nm').value.trim(), phone = $('ph').value.trim(), addr = $('ad').value.trim();
  if (name.length < 2 || !/^01\d{9}$/.test(phone) || addr.length < 8) return toast('Naam, sothik phone ar puro thikana din');
  const sub = cart.reduce((a, c) => a + c.price * c.qty, 0), d = delivery(), total = sub + d, oid = 'CZ' + Date.now().toString().slice(-6);
  const items = cart.map(c => `${c.name} (${c.size}) x${c.qty} = ${tk(c.price * c.qty)}`);
  const msg = `🛍️ New Order ${oid} - ${cfg.shop}\n${items.join('\n')}\nSubtotal: ${tk(sub)}\nDelivery (${zone === 'dhaka' ? 'Dhaka' : 'Outside'}): ${tk(d)}\nTotal: ${tk(total)}\n\nName: ${name}\nPhone: ${phone}\nAddress: ${addr}\nPayment: Bkash/Nagad Send Money ${cfg.pay}${$('trx').value ? '\nTrxID: ' + $('trx').value.trim() : ''}`;
  try { await navigator.clipboard.writeText(msg); } catch {}
  const url = via === 'w' ? cfg.whatsapp + '?text=' + encodeURIComponent(msg) : cfg.messenger;
  window.open(url, '_blank');
  try { await S.save('orders', { oid, name, phone, address: addr, zone, items, subtotal: sub, delivery: d, total, trx: $('trx').value.trim(), via: via === 'w' ? 'WhatsApp' : 'Messenger', status: 'New', createdAt: Date.now() }); }
  catch (e) { console.error(e); }
  cart = []; saveCart(); $('cov').classList.remove('show');
  toast(via === 'm' ? 'Order message copy hoyeche - Messenger e paste kore send korun' : 'Order pathano hoyeche ✔');
}
document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('[data-close]') || t.classList.contains('ov')) document.querySelectorAll('.ov').forEach(o => o.classList.remove('show'));
  if (t.dataset.c) { cat = t.dataset.c; chips(); grid(); }
  const card = t.closest('.card'); if (card) openProduct(card.dataset.id);
  if (t.closest('#cartBtn')) { cartView(); $('cov').classList.add('show'); }
  if (t.dataset.rm) { cart.splice(+t.dataset.rm, 1); saveCart(); cartView(); }
  if (t.dataset.o) order(t.dataset.o);
});
document.addEventListener('change', e => { if (e.target.id === 'zone') { zone = e.target.value; cartView(); } });
$('q').oninput = e => { q = e.target.value.toLowerCase(); grid(); };
S.watch('products', l => { products = l.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); grid(); });
S.watchSettings(s => { cfg = s; chips(); grid(); });
saveCart(); chips();
