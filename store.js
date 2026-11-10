const S = (() => {
  const cfg = window.FIREBASE_CONFIG, live = !!(cfg && cfg.apiKey);
  const DEF = { shop:'Classic Zone', dhaka:70, outside:120, pay:'01871196902',
    messenger:'https://m.me/1299160756614235', whatsapp:'https://wa.me/8801871196902',
    cats:['Panjabi','T-Shirt','Shirt','Pant'] };
  const bus = new EventTarget();
  const get = (k,d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } };
  const set = (k,v) => { localStorage.setItem(k, JSON.stringify(v)); bus.dispatchEvent(new Event(k)); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  let db, auth;
  if (live) { firebase.initializeApp(cfg); db = firebase.firestore(); auth = firebase.auth(); }
  function listen(k, f) { bus.addEventListener(k, f); addEventListener('storage', e => e.key === k && f()); f(); }
  return {
    live, DEF, uid,
    watch(name, cb) {
      if (live) return db.collection(name).onSnapshot(s => cb(s.docs.map(d => ({ id:d.id, ...d.data() }))), e => console.error(e));
      listen('cz_'+name, () => cb(get('cz_'+name, [])));
    },
    async save(name, o) {
      const id = o.id || uid(), d = { ...o }; delete d.id;
      if (live) await db.collection(name).doc(id).set(d, { merge:true });
      else { const a = get('cz_'+name, []), i = a.findIndex(x => x.id === id), n = { ...d, id };
        i < 0 ? a.unshift(n) : (a[i] = { ...a[i], ...n }); set('cz_'+name, a); }
      return id;
    },
    async del(name, id) {
      if (live) return db.collection(name).doc(id).delete();
      set('cz_'+name, get('cz_'+name, []).filter(x => x.id !== id));
    },
    watchSettings(cb) {
      if (live) return db.doc('settings/main').onSnapshot(s => cb({ ...DEF, ...(s.data() || {}) }));
      listen('cz_settings', () => cb({ ...DEF, ...get('cz_settings', {}) }));
    },
    async saveSettings(o) {
      if (live) return db.doc('settings/main').set(o, { merge:true });
      set('cz_settings', { ...get('cz_settings', {}), ...o });
    },
    async login(email, pass) {
      if (live) return auth.signInWithEmailAndPassword(email, pass);
      if (email !== 'mdforied30@gmail.com' || pass !== 'demo') throw { code:'auth/invalid-credential' };
      sessionStorage.cz_admin = '1'; bus.dispatchEvent(new Event('auth'));
    },
    logout() { if (live) return auth.signOut(); delete sessionStorage.cz_admin; bus.dispatchEvent(new Event('auth')); },
    onAuth(cb) {
      if (live) return auth.onAuthStateChanged(u => cb(!!u && u.email === 'mdforied30@gmail.com'));
      const f = () => cb(!!sessionStorage.cz_admin); bus.addEventListener('auth', f); f();
    }
  };
})();
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fin = p => Math.round(p.price * (1 - (p.discount || 0) / 100));
const tk = n => '৳' + Number(n).toLocaleString('en-US');
