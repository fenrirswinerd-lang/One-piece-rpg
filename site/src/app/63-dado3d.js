/* ═══════════ DADO 3D (d20) ═══════════
   WebGL feito à mão (sem biblioteca): um icosaedro com número em cada face, desenhado em resolução baixa e ampliado,
   para combinar com o pixel art do site.
   REGRA DE OURO: o número já vem pronto na rolagem (r.nat, gravado no banco). O dado só gira e para na face desse número.
   A queda usa um sorteio "semeado" pela hora da rolagem, então o giro também é igual para todo mundo.
   Sem WebGL, ou com "Dado 3D" desligado no aparelho, ou com movimento reduzido: vale o dado 2D de antes. */
const Dado3D = {
  PIX: 3, cv: null, gl: null, prog: null, tex: new Map(), geo: null, nFaces: 20, ok_: undefined,
  /* preferência deste aparelho (ligado por padrão) */
  ligado() { return lembrar('dado3d') !== '0'; },
  alternar(v) { lembrar('dado3d', v ? '1' : '0'); },
  serve(r) {
    if (window.__sem3d || !this.ligado()) return false;
    const e = String(r.expr || '').replace(/\s/g, '').replace(/−/g, '-');
    return /^1?d20([+-]\d+)?$/i.test(e) && Number.isInteger(r.nat) && r.nat >= 1 && r.nat <= 20 && this.iniciar();
  },

  /* ── contas de rotação (quaternion = [x,y,z,w]) ── */
  qMul: (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]],
  qNorm(q) { const l = Math.hypot(...q) || 1; return q.map(v => v / l); },
  qEixo(ax, ang) { const s = Math.sin(ang / 2); return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(ang / 2)]; },
  qDe(a, b) {   // gira o vetor unitário a até b
    const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    if (d < -0.999999) { const p = Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]; const x = [a[1] * p[2] - a[2] * p[1], a[2] * p[0] - a[0] * p[2], a[0] * p[1] - a[1] * p[0]]; const l = Math.hypot(...x); return [x[0] / l, x[1] / l, x[2] / l, 0]; }
    return this.qNorm([a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0], 1 + d]);
  },
  qVet(q, v) {   // aplica a rotação a um vetor
    const [x, y, z, w] = q, tx = 2 * (y * v[2] - z * v[1]), ty = 2 * (z * v[0] - x * v[2]), tz = 2 * (x * v[1] - y * v[0]);
    return [v[0] + w * tx + (y * tz - z * ty), v[1] + w * ty + (z * tx - x * tz), v[2] + w * tz + (x * ty - y * tx)];
  },
  qSlerp(a, b, t) {
    let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; if (d < 0) { b = b.map(v => -v); d = -d; }
    if (d > 0.9995) return this.qNorm(a.map((v, i) => v + (b[i] - v) * t));
    const th = Math.acos(d), s = Math.sin(th), k1 = Math.sin((1 - t) * th) / s, k2 = Math.sin(t * th) / s;
    return a.map((v, i) => v * k1 + b[i] * k2);
  },
  qMat3(q) {   // matriz 3×3 (colunas)
    const [x, y, z, w] = q;
    return [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)];
  },
  /* sorteio com semente: mesma rolagem → mesmo giro em qualquer aparelho */
  semente(s) { let a = (s >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },

  /* ── geometria: 20 faces, cada uma com seus 3 vértices, normal e a "ponta de cima" do número ── */
  montarGeo() {
    const P = (1 + Math.sqrt(5)) / 2, R = 1.35;
    const V = [[-1, P, 0], [1, P, 0], [-1, -P, 0], [1, -P, 0], [0, -1, P], [0, 1, P], [0, -1, -P], [0, 1, -P], [P, 0, -1], [P, 0, 1], [-P, 0, -1], [-P, 0, 1]]
      .map(v => { const l = Math.hypot(...v); return v.map(c => c / l * R); });
    const F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    const faces = F.map(f => {
      let [a, b, c] = f.map(i => V[i]);
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]; const l = Math.hypot(...n); n = n.map(v => v / l);
      const ct = [0, 1, 2].map(k => (a[k] + b[k] + c[k]) / 3);
      if (n[0] * ct[0] + n[1] * ct[1] + n[2] * ct[2] < 0) { [b, c] = [c, b]; n = n.map(v => -v); }   // sempre com a frente para fora
      const topo = [a[0] - ct[0], a[1] - ct[1], a[2] - ct[2]], lt = Math.hypot(...topo);
      return { v: [a, b, c], n, topo: topo.map(v => v / lt) };
    });
    /* números: faces opostas somam 21, como num dado de verdade */
    const num = new Array(20).fill(0), ordem = [1, 8, 3, 6, 5, 10, 7, 2, 9, 4]; let k = 0;
    faces.forEach((f, i) => {
      if (num[i]) return;
      const j = faces.findIndex((g, jj) => jj !== i && !num[jj] && g.n[0] * f.n[0] + g.n[1] * f.n[1] + g.n[2] * f.n[2] < -0.99);
      num[i] = ordem[k]; num[j] = 21 - ordem[k]; k++;
    });
    const faceDe = {}; num.forEach((n, i) => { faceDe[n] = i; });
    /* posição no desenho dos números (5×4 casas de 128px) */
    const C = 128, W = C * 5, H = C * 4, tri = i => { const cx = (i % 5) * C, cy = Math.floor(i / 5) * C; return [[cx + C / 2, cy + 8], [cx + 6, cy + C - 10], [cx + C - 6, cy + C - 10]]; };
    const dados = new Float32Array(20 * 3 * 8);
    faces.forEach((f, i) => {
      const t = tri(i);
      for (let q = 0; q < 3; q++) dados.set([...f.v[q], ...f.n, t[q][0] / W, t[q][1] / H], (i * 3 + q) * 8);
    });
    this.geo = { faces, num, faceDe, dados, C, W, H, tri };
  },
  /* alvo: a face do número olha para a câmera e o número fica em pé */
  alvo(n) {
    const f = this.geo.faces[this.geo.faceDe[n]], q = this.qDe(f.n, [0, 0, 1]), t = this.qVet(q, f.topo);
    const giro = this.qEixo([0, 0, 1], Math.atan2(t[0], t[1]));
    return this.qMul(giro, q);
  },

  /* ── desenho dos números (uma folha por cor de jogador) ── */
  CORES: ['#e9cf9a', '#a9d1e8', '#b6dba0', '#f0b6a8', '#d3b6e8', '#f2dc7a', '#9fd9cf', '#e8b0d0'],
  corDe(uid) { let h = 0; String(uid || '').split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h % this.CORES.length; },
  textura(ci) {
    if (this.tex.has(ci)) return this.tex.get(ci);
    const { C, W, H, tri, num } = this.geo, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    for (let i = 0; i < 20; i++) {
      const t = tri(i), n = num[i], esp = n === 20 || n === 1;
      g.fillStyle = n === 20 ? '#c9302c' : n === 1 ? '#3b2a1c' : this.CORES[ci];
      g.beginPath(); g.moveTo(...t[0]); g.lineTo(...t[1]); g.lineTo(...t[2]); g.closePath(); g.fill();
      g.lineWidth = 7; g.lineJoin = 'round'; g.strokeStyle = '#2a180d'; g.stroke();
      g.fillStyle = esp ? '#ffd77a' : '#2a180d'; g.font = 'bold 46px "Jersey 20", ui-monospace, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3 + 8;
      g.fillText(String(n), cx, cy); if (n === 6 || n === 9) g.fillRect(cx - 13, cy + 22, 26, 4);
    }
    const gl = this.gl, tx = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
    [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([a, b]) => gl.texParameteri(gl.TEXTURE_2D, a, b));
    this.tex.set(ci, tx); return tx;
  },

  /* ── WebGL ── */
  iniciar() {
    if (this.ok_ !== undefined) return this.ok_;
    try {
      this.montarGeo();
      const cv = document.createElement('canvas'); cv.className = 'dd3'; cv.width = cv.height = 100;
      const gl = cv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true }) || cv.getContext('experimental-webgl');
      if (!gl) throw new Error('sem WebGL');
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec3 p;attribute vec3 n;attribute vec2 u;uniform mat4 M;uniform mat4 P;uniform mat3 R;varying vec3 vn;varying vec2 vu;void main(){vn=R*n;vu=u;gl_Position=P*M*vec4(p,1.);}'));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec3 vn;varying vec2 vu;uniform sampler2D T;uniform float G;void main(){vec4 c=texture2D(T,vu);float l=.55+.9*max(dot(normalize(vn),normalize(vec3(.4,.6,1.))),0.);gl_FragColor=vec4(c.rgb*min(l,1.15)+G*vec3(.28,.2,.04),1.);}'));
      gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link');
      gl.useProgram(pr);
      const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, this.geo.dados, gl.STATIC_DRAW);
      [['p', 3, 0], ['n', 3, 12], ['u', 2, 24]].forEach(([nome, qtd, off]) => { const l = gl.getAttribLocation(pr, nome); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, qtd, gl.FLOAT, false, 32, off); });
      const fov = 35 * Math.PI / 180, f = 1 / Math.tan(fov / 2), ne = 0.1, fa = 50;
      gl.uniformMatrix4fv(gl.getUniformLocation(pr, 'P'), false, [f, 0, 0, 0, 0, f, 0, 0, 0, 0, (fa + ne) / (ne - fa), -1, 0, 0, 2 * fa * ne / (ne - fa), 0]);
      this.u = { M: gl.getUniformLocation(pr, 'M'), R: gl.getUniformLocation(pr, 'R'), G: gl.getUniformLocation(pr, 'G') };
      gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); this.ok_ = false; });
      this.cv = cv; this.gl = gl; this.prog = pr; this.ok_ = true;
    } catch (e) { console.warn('Dado 3D indisponível, vale o 2D:', e.message || e); this.ok_ = false; }
    return this.ok_;
  },
  tamanho(px) {
    const lado = Math.max(48, Math.round(px / (px < 200 ? 2 : this.PIX)));
    if (this.cv.width !== lado) { this.cv.width = this.cv.height = lado; }
    this.gl.viewport(0, 0, lado, lado);
  },
  desenhar(q, x, y, z, brilho) {
    const gl = this.gl, R = this.qMat3(q);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix3fv(this.u.R, false, R);
    gl.uniformMatrix4fv(this.u.M, false, [R[0], R[1], R[2], 0, R[3], R[4], R[5], 0, R[6], R[7], R[8], 0, x, y, z - 6.2, 1]);
    gl.uniform1f(this.u.G, brilho || 0);
    gl.drawArrays(gl.TRIANGLES, 0, 60);
  },

  /* ── a rolagem: pousa em r.nat, sempre ── */
  rolar(r, alvoEl, opc = {}) {
    const n = r.nat, fim = this.alvo(n), rnd = this.semente((r.em || 1) ^ (n * 7919)), T = opc.T || 1400;
    const px = opc.px || 240;
    alvoEl.prepend(this.cv); this.cv.style.setProperty('--d3', px + 'px'); this.tamanho(px);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textura(this.corDe(r.uid)));
    const eixo = this.qNorm([rnd() - .5, rnd() - .5, rnd() - .5, 0]).slice(0, 3), voltas = 5 + rnd() * 3;
    const inicio = this.qNorm([rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1]);
    const sombra = alvoEl.querySelector('.dd3-sombra'), parado = opc.parado;
    const crit = n === 20;
    const ease = t => 1 - Math.pow(1 - t, 3), t0 = performance.now();
    this._anim = ++this._id || (this._id = 1);
    const meu = this._id;
    const quadro = agora => {
      if (meu !== this._id) return;
      const t = parado ? 1 : Math.min(1, (agora - t0) / T), e = ease(t);
      const solto = this.qMul(inicio, this.qEixo(eixo, (1 - e) * voltas * Math.PI * 2));
      const k = t < 0.55 ? 0 : (t - 0.55) / 0.45, q = this.qSlerp(solto, fim, ease(k));
      const y = parado ? 0 : Math.abs(Math.sin(t * Math.PI * 3)) * (1 - t) * 1.2 - 0.15;
      this.desenhar(q, (1 - e) * -1.6, y, (1 - e) * 1.0, t >= 1 && crit ? 1 : 0);
      if (sombra) sombra.style.transform = `translateX(-50%) scale(${(1 - (y + .15) * .28).toFixed(3)})`;
      if (t < 1) requestAnimationFrame(quadro);
      else this.estado = { n, final: true };
    };
    this.estado = { n, final: false };
    requestAnimationFrame(quadro);
  },
  parar() { this._id = (this._id || 0) + 1; }
};

/* a rolagem pública usa o dado 3D quando dá; senão cai no 2D que já existia */
const _proximo2D = DadoCentral.proximo;
DadoCentral.proximo = function () {
  if (this.ocupado || !this.fila.length) return;
  const r = this.fila[0], box = $('#mt-dado');
  if (!(box && App.rota === 'mesa' && Dado3D.serve(r))) return _proximo2D.call(this);
  this.fila.shift(); this.ocupado = true; Som.tocar('dado');
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const crit = r.nat === 20, falha = r.nat === 1, rapido = this.fila.length > 0;
  const T = reduz ? 0 : rapido ? 850 : 1450, t1 = T + (reduz ? 150 : 120), t2 = t1 + (rapido ? 1300 : 2700);
  const q = $('#mt-quadro'), px = Math.round(Math.min(300, Math.max(150, ((q && q.clientHeight) || 400) * 0.6)));
  if (q) q.classList.add('rolando');
  box.hidden = false; box.className = 'mt-dado dd-3d' + (crit ? ' crit' : '') + (falha ? ' falha' : '');
  const soma = r.total !== r.nat;
  box.innerHTML = `<div class="dd-anim dd-anim3" style="--d3:${px}px"><i class="dd3-sombra" aria-hidden="true"></i>${soma ? `<b class="dd-tot">= ${r.total}</b>` : ''}</div>
    <div class="dd-placa"><p class="dd-quem">${esc(r.nome)}${r.rot ? ` · <span>${esc(r.rot)}</span>` : ''}</p>
    <p class="dd-conta">${esc(r.expr)}${r.dados && r.dados.length ? ` → ${r.dados.join(r.modo ? ' / ' : ' + ')}` : ''}${r.bonus ? ` ${sg(r.bonus)}` : ''}${r.modo ? ` · ${r.modo === 'vant' ? 'vantagem' : 'desvantagem'}` : ''}${r.motivo ? ` · ${esc(r.motivo)}` : ''}</p>
    ${crit ? '<p class="dd-sel">20 natural!</p>' : falha ? '<p class="dd-sel">1 natural…</p>' : ''}</div>`;
  Dado3D.rolar(r, $('.dd-anim3', box), { T: T || 1, px, parado: reduz });
  setTimeout(() => {
    box.classList.add('revela'); Som.tocar(crit ? 'critico' : falha ? 'falha' : 'acerto');
    if (crit && MANIFEST.anims.critico) { const e = document.createElement('div'); e.className = 'dd-estrela'; e.innerHTML = anim('critico', 3.2, { umaVez: true, dur: 1.1 }); box.appendChild(e); }
  }, t1);
  setTimeout(() => box.classList.add('some'), t2);
  setTimeout(() => { Dado3D.parar(); box.hidden = true; box.className = 'mt-dado'; if (q) q.classList.remove('rolando'); this.ocupado = false; this.proximo(); }, t2 + 450);
};

/* interruptor "Dado 3D" (por aparelho) */
ACT['dado3d'] = el => { Dado3D.alternar(el.checked); toast(el.checked ? 'Dado 3D ligado.' : 'Dado 3D desligado: volta o dado 2D.', { tipo: 'bom' }); };
