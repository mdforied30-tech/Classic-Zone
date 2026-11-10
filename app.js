const $ = id => document.getElementById(id);
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
  <p class="desc">${esc(p.description)}</p>
  ${(p.sizes || []).length ? `<b>সাইজ</b><div class="sizes">${p.sizes.map((s, i) => `<label><input type="radio" name="sz" value="${esc(s)}" ${i ? '' : 'checked'}><span>${esc(s)}</span></label>`).join('')}</div>` : ''}
  <b>পরিমাণ</b> <input class="f" id="qty" type="number" min="1" max="20" value="1" style="width:90px">
  <button class="btn ac" style="width:100%;margin-top:10px" id="addc" ${out ? 'disabled' : ''}>${out ? 'স্টক শেষ' : 'কার্টে যোগ করুন'}</button>`;
  $('pov').classList.add('show');
  $('addc').onclick = () => {
    const s = document.querySelector('input[name=sz]:checked')?.value || '-', n = Math.max(1, Math.min(20, +$('qty').value || 1));
    const ex = cart.find(c => c.pid === id && c.size === s);
    ex ? ex.qty += n : cart.push({ pid: id, name: p.name, size: s, qty: n, price: fin(p) });
    saveCart(); $('pov').classList.remove('show'); $('cartBtn').classList.add('bump'); setTimeout(() => $('cartBtn').classList.remove('bump'), 600); toast('কার্টে যোগ হয়েছে ✔');
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
  <b>কোথায় অর্ডার করবেন?</b><div class="two"><button class="ms" data-o="m">Messenger</button><button class="wa" data-o="w">WhatsApp</button></div>`);
}
async function order(via) {
  const name = $('nm').value.trim(), phone = $('ph').value.trim(), addr = $('ad').value.trim();
  if (name.length < 2 || !/^01\d{9}$/.test(phone) || addr.length < 8) return toast('নাম, সঠিক মোবাইল নম্বর ও সম্পূর্ণ ঠিকানা দিন');
  const sub = cart.reduce((a, c) => a + c.price * c.qty, 0), d = delivery(), total = sub + d, oid = 'CZ' + Date.now().toString().slice(-6);
  const items = cart.map(c => `${c.name} (${c.size}) x${c.qty} = ${tk(c.price * c.qty)}`);
  const msg = `🛍️ নতুন অর্ডার ${oid} - ${cfg.shop}\n${items.join('\n')}\nপণ্যের মূল্য: ${tk(sub)}\nডেলিভারি চার্জ (${zone === 'dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'}): ${tk(d)}\nসর্বমোট: ${tk(total)}\n\nনাম: ${name}\nমোবাইল: ${phone}\nঠিকানা: ${addr}\nপেমেন্ট: ${$('trx').value.trim() ? 'অগ্রিম পেমেন্ট করা হয়েছে (বিকাশ/নগদ ' + cfg.pay + '), TrxID: ' + $('trx').value.trim() : 'ক্যাশ অন ডেলিভারি'}`;
  try { await navigator.clipboard.writeText(msg); } catch {}
  const url = via === 'w' ? cfg.whatsapp + '?text=' + encodeURIComponent(msg) : cfg.messenger;
  window.open(url, '_blank');
  try { await S.save('orders', { oid, name, phone, address: addr, zone, items, subtotal: sub, delivery: d, total, trx: $('trx').value.trim(), via: via === 'w' ? 'WhatsApp' : 'Messenger', status: 'New', createdAt: Date.now() }); }
  catch (e) { console.error(e); }
  cart = []; saveCart(); $('cov').classList.remove('show');
  toast(via === 'm' ? 'অর্ডারের মেসেজ কপি হয়েছে — মেসেঞ্জারে পেস্ট করে সেন্ড করুন' : 'অর্ডার পাঠানো হয়েছে ✔ ধন্যবাদ!');
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
