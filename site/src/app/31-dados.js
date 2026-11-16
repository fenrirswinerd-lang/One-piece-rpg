/* ═══════════ dados da mesa: Firebase (de verdade) ou modo de teste (tudo no navegador) ═══════════
   O resto do site só usa DB.* e Arquivos.*: o mesmo código roda online e no teste.
   Teste: ?teste no endereço, prévia do Claude, ou Firebase indisponível. Cada aba escolhe quem é (mestre ou jogador). */
const MESTRE_EMAIL = String(window.MESTRE_EMAIL || 'fenrirsw0@gmail.com').toLowerCase();
const TESTE = (() => { try { return IN_CLAUDE || /[?&]teste(=|&|$)/.test(location.search) || !window.FB || !window.FIREBASE_CONFIG; } catch (e) { return true; } })();
const APAGAR = '__apagar__';                 // valor especial: apaga o campo ao gravar com mescla
const PARTE = 900000;                        // bytes por pedaço de arquivo (o Firestore aceita até 1 MiB por documento)
const LIMITE_BANCO = 1024 ** 3;              // 1 GiB no plano grátis
const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const partes = p => String(p).split('/').filter(Boolean);
const limpo = d => JSON.parse(JSON.stringify(d ?? null));

/* ───── IndexedDB: cache de arquivos (músicas, imagens) e pedaços do modo de teste ───── */
const IDB = {
  db: null, mem: new Map(),
  abrir() {
    if (!this.db) this.db = new Promise((ok, erro) => {
      try {
        const r = indexedDB.open('mesa-op', 1);
        r.onupgradeneeded = () => { ['cache', 'partes'].forEach(n => { if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n); }); };
        r.onsuccess = () => ok(r.result); r.onerror = () => erro(r.error);
      } catch (e) { erro(e); }
    });
    return this.db;
  },
  async op(loja, modo, f) {
    try {
      const db = await this.abrir();
      return await new Promise((ok, erro) => { const t = db.transaction(loja, modo), q = f(t.objectStore(loja)); t.oncomplete = () => ok(q && q.result); t.onerror = () => erro(t.error); });
    } catch (e) { return f === null ? null : undefined; }
  },
  async get(loja, k) { const v = await this.op(loja, 'readonly', s => s.get(k)); return v !== undefined ? v : this.mem.get(loja + '/' + k); },
  async put(loja, k, v) { this.mem.set(loja + '/' + k, v); await this.op(loja, 'readwrite', s => s.put(v, k)); },
  async del(loja, k) { this.mem.delete(loja + '/' + k); await this.op(loja, 'readwrite', s => s.delete(k)); }
};

/* ───── Firebase ───── */
const Fire = {
  iniciar() {
    const F = window.FB;
    this.app = F.initializeApp(window.FIREBASE_CONFIG);
    this.auth = F.getAuth(this.app);
    try { this.db = F.initializeFirestore(this.app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
    catch (e) { this.db = F.initializeFirestore(this.app, { localCache: F.memoryLocalCache() }); }
    F.getRedirectResult(this.auth).catch(e => console.warn('login', e));
  },
  ref(p) { return window.FB.doc(this.db, ...partes(p)); },
  col(p) { return window.FB.collection(this.db, ...partes(p)); },
  conv(d) {   // troca o marcador APAGAR pelo apagador do Firestore
    if (d === APAGAR) return window.FB.deleteField();
    if (Array.isArray(d)) return d.map(v => this.conv(v));
    if (d && typeof d === 'object' && !(d instanceof window.FB.Bytes)) { const o = {}; Object.entries(d).forEach(([k, v]) => { if (v !== undefined) o[k] = this.conv(v); }); return o; }
    return d;
  },
  aoMudarLogin(cb) {
    return window.FB.onAuthStateChanged(this.auth, u => cb(u ? { uid: u.uid, email: (u.email || '').toLowerCase(), nome: u.displayName || u.email || 'Pirata', foto: u.photoURL || '', verificado: !!u.emailVerified } : null));
  },
  async entrar() {
    const F = window.FB, prov = new F.GoogleAuthProvider(); prov.setCustomParameters({ prompt: 'select_account' });
    try { await F.signInWithPopup(this.auth, prov); }
    catch (e) {
      const c = e.code || '';
      if (/popup-blocked|operation-not-supported|web-storage-unsupported/.test(c)) return F.signInWithRedirect(this.auth, prov);
      if (/popup-closed-by-user|cancelled-popup-request/.test(c)) return;
      throw e;
    }
  },
  sair() { return window.FB.signOut(this.auth); },
  async ler(p) { const s = await window.FB.getDoc(this.ref(p)); return s.exists() ? s.data() : null; },
  gravar(p, d, mescla = true) { return window.FB.setDoc(this.ref(p), this.conv(d), { merge: mescla }); },
  apagar(p) { return window.FB.deleteDoc(this.ref(p)); },
  async novo(p, d) { return (await window.FB.addDoc(this.col(p), this.conv(d))).id; },
  ouvir(p, cb, erro) { return window.FB.onSnapshot(this.ref(p), s => cb(s.exists() ? s.data() : null), e => { console.warn(p, e); erro && erro(e); }); },
  ouvirLista(p, o, cb, erro) {
    const F = window.FB, q = [];
    if (o && o.ordem) q.push(F.orderBy(o.ordem, o.desc ? 'desc' : 'asc'));
    if (o && o.max) q.push(F.limit(o.max));
    return F.onSnapshot(F.query(this.col(p), ...q), s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => { console.warn(p, e); erro && erro(e); });
  },
  async lista(p) { const s = await window.FB.getDocs(this.col(p)); return s.docs.map(d => ({ id: d.id, ...d.data() })); },
  gravarParte(id, i, u8) { return window.FB.setDoc(this.ref(`arquivos/${id}/partes/${i}`), { i, d: window.FB.Bytes.fromUint8Array(u8) }); },
  async lerParte(id, i) { const s = await window.FB.getDoc(this.ref(`arquivos/${id}/partes/${i}`)); return s.exists() ? s.data().d.toUint8Array() : null; },
  apagarParte(id, i) { return window.FB.deleteDoc(this.ref(`arquivos/${id}/partes/${i}`)); }
};

/* ───── modo de teste: localStorage + aviso entre abas; login por aba (sessionStorage) ───── */
const Local = {
  pre: 'mesa-teste:', docs: new Map(), listas: new Set(),
  iniciar() {
    window.addEventListener('storage', e => { if (e.key && e.key.startsWith(this.pre)) this.avisar(e.key.slice(this.pre.length)); });
  },
  usuario() { try { return JSON.parse(sessionStorage.getItem('mesa-teste-usuario') || 'null'); } catch (e) { return null; } },
  aoMudarLogin(cb) { this.cbLogin = cb; setTimeout(() => cb(this.usuario()), 0); return () => {}; },
  async entrar(u) { try { sessionStorage.setItem('mesa-teste-usuario', JSON.stringify(u)); } catch (e) { /* aba sem armazenamento */ } this.cbLogin && this.cbLogin(u); },
  async sair() { try { sessionStorage.removeItem('mesa-teste-usuario'); } catch (e) { /* idem */ } this.cbLogin && this.cbLogin(null); },
  get(p) { try { return JSON.parse(localStorage.getItem(this.pre + p) || 'null'); } catch (e) { return null; } },
  put(p, d) {
    try { if (d == null) localStorage.removeItem(this.pre + p); else localStorage.setItem(this.pre + p, JSON.stringify(d)); }
    catch (e) { toast('O modo de teste encheu o armazenamento do navegador.', { tipo: 'ruim' }); }
    setTimeout(() => this.avisar(p), 0);
  },
  avisar(p) {
    (this.docs.get(p) || new Set()).forEach(cb => cb(this.get(p)));
    const col = partes(p).slice(0, -1).join('/');
    this.listas.forEach(l => { if (l.p === col) l.cb(this.listaJa(l.p, l.o)); });
  },
  mescla(a, b) {
    if (b === APAGAR) return undefined;
    if (!b || typeof b !== 'object' || Array.isArray(b)) return b;
    const o = a && typeof a === 'object' && !Array.isArray(a) ? { ...a } : {};
    Object.entries(b).forEach(([k, v]) => { const r = this.mescla(o[k], v); if (r === undefined) delete o[k]; else o[k] = r; });
    return o;
  },
  async ler(p) { return this.get(p); },
  async gravar(p, d, mescla = true) { this.put(p, mescla ? this.mescla(this.get(p), limpo(d)) : this.mescla({}, limpo(d))); },
  async apagar(p) { this.put(p, null); },
  async novo(p, d) { const id = novoId(); await this.gravar(`${p}/${id}`, d, false); return id; },
  ouvir(p, cb) {
    if (!this.docs.has(p)) this.docs.set(p, new Set());
    this.docs.get(p).add(cb); setTimeout(() => cb(this.get(p)), 0);
    return () => this.docs.get(p).delete(cb);
  },
  listaJa(p, o = {}) {
    const n = partes(p).length + 1, out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (!k || !k.startsWith(this.pre + p + '/')) continue;
      const c = k.slice(this.pre.length); if (partes(c).length !== n) continue;
      out.push({ id: partes(c).pop(), ...this.get(c) });
    }
    if (o.ordem) out.sort((a, b) => ((a[o.ordem] ?? 0) > (b[o.ordem] ?? 0) ? 1 : -1) * (o.desc ? -1 : 1));
    return o.max ? out.slice(0, o.max) : out;
  },
  ouvirLista(p, o, cb) { const l = { p, o: o || {}, cb }; this.listas.add(l); setTimeout(() => cb(this.listaJa(p, l.o)), 0); return () => this.listas.delete(l); },
  async lista(p) { return this.listaJa(p); },
  gravarParte(id, i, u8) { return IDB.put('partes', `${id}/${i}`, u8.slice()); },
  lerParte(id, i) { return IDB.get('partes', `${id}/${i}`); },
  apagarParte(id, i) { return IDB.del('partes', `${id}/${i}`); }
};

const DB = TESTE ? Local : Fire;

/* ───── arquivos em pedaços dentro do banco, com cache no aparelho ───── */
const Arquivos = {
  urls: new Map(),
  /** blob → banco. meta: { nome, cat: 'imagem'|'trilha'|'sfx'|'foto'|'pdf'|'icone' }. Grava os pedaços primeiro e a ficha do arquivo por último. */
  async enviar(blob, meta, aoAndar) {
    const u8 = new Uint8Array(await blob.arrayBuffer()), n = Math.max(1, Math.ceil(u8.length / PARTE)), id = novoId();
    for (let i = 0; i < n; i++) { await DB.gravarParte(id, i, u8.subarray(i * PARTE, (i + 1) * PARTE)); if (aoAndar) aoAndar(i + 1, n); }
    const info = { ...meta, id, tam: u8.length, partes: n, tipo: blob.type || meta.tipo || '', dono: Eu.uid || '', em: Date.now() };
    await DB.gravar('arquivos/' + id, info, false);
    await IDB.put('cache', id, blob);
    return info;
  },
  async blob(id) {
    if (!id) return null;
    const c = await IDB.get('cache', id); if (c) return c;
    const info = await DB.ler('arquivos/' + id); if (!info) return null;
    const pedacos = [];
    for (let i = 0; i < info.partes; i++) { const p = await DB.lerParte(id, i); if (!p) return null; pedacos.push(p); }
    const b = new Blob(pedacos, { type: info.tipo || 'application/octet-stream' });
    await IDB.put('cache', id, b);
    return b;
  },
  async url(id) {
    if (!id) return '';
    if (this.urls.has(id)) return this.urls.get(id);
    const p = this.blob(id).then(b => b ? URL.createObjectURL(b) : '');
    this.urls.set(id, p);
    const u = await p; if (!u) this.urls.delete(id);
    return u;
  },
  async apagar(id) {
    const info = await DB.ler('arquivos/' + id);
    await DB.apagar('arquivos/' + id);
    for (let i = 0; i < ((info && info.partes) || 1); i++) { try { await DB.apagarParte(id, i); } catch (e) { /* pedaço já sumiu */ } }
    await IDB.del('cache', id); this.urls.delete(id);
  }
};

/* ───── preparar arquivos antes de enviar ───── */
async function reduzirImagem(file, lado = 1600, q = 0.86) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, lado / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  cv.getContext('2d').drawImage(bmp, 0, 0, w, h);
  const tipo = /png|gif|webp/.test(file.type) && k === 1 && file.size < 400000 ? file.type : 'image/webp';
  if (tipo === file.type) return file;
  return await new Promise(ok => cv.toBlob(b => ok(b || file), 'image/webp', q));
}
const tamanho = b => b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
