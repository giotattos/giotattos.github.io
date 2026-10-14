/* =========================================================
   GIOVANNA REIS TATUAGENS — comportamento
   ========================================================= */
(function () {
  "use strict";

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =======================================================
     SUSSURRO — aviso discreto
     ======================================================= */
  const elSussurro = $("#sussurro");
  let relogioSussurro;

  function sussurrar(texto) {
    if (!elSussurro) return;
    elSussurro.textContent = texto;
    elSussurro.classList.add("is-visivel");
    clearTimeout(relogioSussurro);
    relogioSussurro = setTimeout(() => {
      elSussurro.classList.remove("is-visivel");
    }, 5200);
  }

  /* =======================================================
     REVELAÇÕES AO ENTRAR NA TELA
     ======================================================= */
  const alvos = $$(".revelar, .revelar-nevoa");
  alvos.forEach((el) => {
    const atraso = el.dataset.atraso;
    if (atraso) el.style.setProperty("--atraso", atraso + "ms");
  });

  if ("IntersectionObserver" in window) {
    const olho = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-dentro");
            olho.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    alvos.forEach((el) => olho.observe(el));
  } else {
    alvos.forEach((el) => el.classList.add("is-dentro"));
  }

  /* =======================================================
     NAVEGAÇÃO — seção ativa + névoa que sobe pela barra
     ======================================================= */
  const elNav     = $("#nav");
  const elLinks   = $(".nav__links");
  const elChave   = $("#navChave");
  const links     = $$(".nav__link");
  const secoes    = $$(".secao");

  let secaoAtual = "inicio";

  /* =======================================================
     NÉVOA VOLUMÉTRICA DA BARRA
     -------------------------------------------------------
     Ruído fractal (fBm) gerado uma vez num tile que repete
     sem emenda. Depois é desenhado em três camadas com
     escalas e velocidades diferentes — o parallax entre elas
     é o que dá volume. Nada de borrão de CSS.
     ======================================================= */
  const consultaCalma = window.matchMedia("(prefers-reduced-motion: reduce)");

  const bruma = (function () {
    const tela = document.getElementById("navBruma");
    if (!tela) return { soprar() {} };

    const ctx = tela.getContext("2d", { alpha: true });
    if (!ctx) return { soprar() {} };

    const TILE = 256;

    /* ---- ruído de valor que fecha nas bordas (tileable) ---- */
    function malha(n) {
      const g = new Float32Array(n * n);
      for (let i = 0; i < g.length; i++) g[i] = Math.random();
      return g;
    }

    const suave = (t) => t * t * (3 - 2 * t);

    function amostra(g, n, x, y) {
      const fx = x * n, fy = y * n;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = suave(fx - x0), ty = suave(fy - y0);
      const i0 = ((x0 % n) + n) % n, j0 = ((y0 % n) + n) % n;
      const i1 = (i0 + 1) % n,       j1 = (j0 + 1) % n;
      const a = g[j0 * n + i0], b = g[j0 * n + i1];
      const c = g[j1 * n + i0], d = g[j1 * n + i1];
      return (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty;
    }

    function fazerTile() {
      const oct = [
        { n: 2,  amp: 1.00 },
        { n: 4,  amp: 0.50 },
        { n: 8,  amp: 0.25 },
        { n: 16, amp: 0.13 },
        { n: 32, amp: 0.07 }
      ].map((o) => ({ ...o, g: malha(o.n) }));

      const total = oct.reduce((s, o) => s + o.amp, 0);
      const off = document.createElement("canvas");
      off.width = off.height = TILE;
      const octx = off.getContext("2d");
      const img = octx.createImageData(TILE, TILE);
      const d = img.data;

      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          let v = 0;
          for (const o of oct) v += amostra(o.g, o.n, x / TILE, y / TILE) * o.amp;
          v /= total;

          // curva: corta a base e deixa só as mechas mais densas
          let a = (v - 0.42) / 0.58;
          a = a < 0 ? 0 : a > 1 ? 1 : a;
          a = a * a * (3 - 2 * a);

          const i = (y * TILE + x) * 4;
          d[i] = 214; d[i + 1] = 210; d[i + 2] = 203;  // cinza levemente quente
          d[i + 3] = a * 255;
        }
      }
      octx.putImageData(img, 0, 0);
      return off;
    }

    const tile = fazerTile();

    /* ---- camadas: escala, velocidade, subida, opacidade ---- */
    // em tela de toque: duas camadas em vez de tres, e opacidade
    // compensada para a nevoa nao ficar mais rala do que no desktop
    const aparelhoLeve =
      window.matchMedia("(hover:none) and (pointer:coarse)").matches ||
      window.innerWidth <= 980;

    const camadas = aparelhoLeve
      ? [
          { esc: 2.60, vx: 0.0100, vy: 0.0042, op: 0.26, fase: 0 },
          { esc: 1.40, vx: 0.0200, vy: 0.0078, op: 0.16, fase: 110 }
        ]
      : [
          { esc: 2.60, vx: 0.0100, vy: 0.0042, op: 0.22, fase: 0 },
          { esc: 1.55, vx: 0.0175, vy: 0.0068, op: 0.15, fase: 90 },
          { esc: 0.95, vx: 0.0290, vy: 0.0105, op: 0.09, fase: 170 }
        ];

    let larg = 0, alt = 0, dpr = 1;

    function medir() {
      const r = tela.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      dpr = Math.min(window.devicePixelRatio || 1, aparelhoLeve ? 1 : 2);
      larg = r.width; alt = r.height;
      tela.width = Math.round(larg * dpr);
      tela.height = Math.round(alt * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    const AMBIENTE = 0.16;   // respiração de fundo, quase imperceptível
    let vigor = AMBIENTE;    // 0..1
    let alvo  = AMBIENTE;
    let rodando = false;
    let t0 = 0;

    function pintar(t, forca) {
      ctx.clearRect(0, 0, larg, alt);
      for (const c of camadas) {
        const lado = alt * c.esc;
        if (lado <= 0) continue;
        const dx = -(((t * c.vx * lado + c.fase) % lado) + lado) % lado;
        const dy = -(((t * c.vy * lado + c.fase) % lado) + lado) % lado;
        ctx.globalAlpha = c.op * forca;
        for (let x = dx; x < larg; x += lado) {
          for (let y = dy; y < alt; y += lado) {
            ctx.drawImage(tile, x, y, lado, lado);
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    function quadroBruma(agora) {
      if (!larg && !medir()) { requestAnimationFrame(quadroBruma); return; }

      // quem pediu menos movimento recebe a névoa parada, não a ausência dela
      if (consultaCalma.matches) {
        pintar(0, AMBIENTE * 2.2);
        rodando = false;
        return;
      }

      if (!t0) t0 = agora;
      const t = (agora - t0) / 1000;

      // o vigor persegue o alvo; sobe rápido, assenta devagar
      const k = alvo > vigor ? 0.020 : 0.0042;
      vigor += (alvo - vigor) * k * (16.7 / 16.7);
      if (alvo > AMBIENTE && vigor > 0.9) alvo = AMBIENTE;

      pintar(t, vigor);
      requestAnimationFrame(quadroBruma);
    }

    function acordar() {
      if (rodando) return;
      rodando = true;
      larg = 0;
      medir();
      tela.classList.add("is-viva");
      // pinta já um quadro: a aba pode estar oculta e o rAF não disparar
      if (larg) pintar(0, consultaCalma.matches ? AMBIENTE * 2.2 : vigor);
      if (!consultaCalma.matches) requestAnimationFrame(quadroBruma);
    }

    window.addEventListener("resize", () => {
      larg = 0;
      if (!rodando) { rodando = true; requestAnimationFrame(quadroBruma); }
    }, { passive: true });

    // se a preferência de movimento mudar, a névoa acompanha
    const aoMudarCalma = () => { rodando = false; acordar(); };
    if (consultaCalma.addEventListener) {
      consultaCalma.addEventListener("change", aoMudarCalma);
    }

    return {
      soprar() {
        acordar();
        alvo = 1;      // a lufada; o decaimento devolve ao ambiente
      }
    };
  })();

  function soprarNevoa() {
    bruma.soprar();
  }

  // a barra já nasce com a respiração de fundo
  bruma.soprar();

  // ao voltar para a aba, a animação retoma do ponto onde parou
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) bruma.soprar();
  });

  function marcarSecao(nome) {
    if (nome === secaoAtual) return;
    secaoAtual = nome;
    links.forEach((a) => {
      a.classList.toggle("is-ativo", a.dataset.secao === nome);
    });
    soprarNevoa();
  }

  if ("IntersectionObserver" in window && secoes.length) {
    const olhoSecao = new IntersectionObserver(
      (entradas) => {
        // escolhe a seção mais visível no momento
        let melhor = null;
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          if (!melhor || e.intersectionRatio > melhor.intersectionRatio) melhor = e;
        });
        if (melhor) marcarSecao(melhor.target.dataset.secao);
      },
      { threshold: [0.3, 0.55, 0.75], rootMargin: "-18% 0px -18% 0px" }
    );
    secoes.forEach((s) => olhoSecao.observe(s));
  }

  /* =======================================================
     A BARRA SE RECOLHE
     -------------------------------------------------------
     Some quando ninguém está usando e volta quando o ponteiro
     encosta no topo. Nunca some: no alto da página, com o menu
     do celular aberto, ou com o foco do teclado dentro dela —
     senão quem navega sem mouse ficaria sem saída.
     ======================================================= */
  const ZONA_TOPO = 100;   // px do topo que chamam a barra de volta
  const ESPERA    = 2200;  // ms parado antes de recolher

  const temPonteiro = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let relogioRecolher = null;
  let ultimaRolagem = window.scrollY;

  function menuEstaAberto() {
    return !!(elLinks && elLinks.classList.contains("is-aberto"));
  }

  function podeRecolher() {
    if (!elNav) return false;
    if (menuEstaAberto()) return false;
    if (window.scrollY < 60) return false;                 // no alto, fica
    if (elNav.contains(document.activeElement)) return false;
    if (elNav.matches(":hover")) return false;
    return true;
  }

  function mostrarBarra() {
    clearTimeout(relogioRecolher);
    if (elNav) elNav.classList.remove("is-recolhida");
  }

  function recolherBarra() {
    if (podeRecolher()) elNav.classList.add("is-recolhida");
  }

  function agendarRecolher(ms) {
    clearTimeout(relogioRecolher);
    relogioRecolher = setTimeout(recolherBarra, ms == null ? ESPERA : ms);
  }

  if (elNav) {
    // ---- com mouse: o topo da tela chama a barra ----
    if (temPonteiro) {
      window.addEventListener("pointermove", (ev) => {
        if (ev.pointerType && ev.pointerType !== "mouse") return;
        if (ev.clientY <= ZONA_TOPO) mostrarBarra();
        else agendarRecolher();
      }, { passive: true });

      elNav.addEventListener("pointerenter", mostrarBarra);
      elNav.addEventListener("pointerleave", () => agendarRecolher());
    }

    // ---- teclado: a barra nunca pode ficar fora de alcance ----
    // escuta no documento em fase de captura: funciona mesmo quando o
    // evento não chega a borbulhar até a barra recolhida
    document.addEventListener("focusin", (ev) => {
      if (elNav.contains(ev.target)) mostrarBarra();
      else agendarRecolher(600);
    }, true);

    // Tab em qualquer lugar já chama a barra de volta
    window.addEventListener("keydown", (ev) => {
      if (ev.key === "Tab") mostrarBarra();
    });

    // ---- no toque não existe hover: vale o sentido da rolagem ----
    window.addEventListener("scroll", () => {
      const agora = window.scrollY;
      const subindo = agora < ultimaRolagem;
      ultimaRolagem = agora;

      if (agora < 60) { mostrarBarra(); return; }

      if (!temPonteiro) {
        if (subindo) { mostrarBarra(); agendarRecolher(2600); }
        else recolherBarra();
      } else if (!elNav.matches(":hover")) {
        agendarRecolher();
      }
    }, { passive: true });

    // clicar num link mostra a barra e dá tempo de ver a névoa subir
    links.forEach((a) => a.addEventListener("click", () => {
      mostrarBarra();
      agendarRecolher(3400);
    }));

    agendarRecolher(3200);
  }

  // sombra da barra ao descer
  function medirRolagem() {
    if (!elNav) return;
    elNav.classList.toggle("is-encostada", window.scrollY > 24);
  }
  medirRolagem();
  window.addEventListener("scroll", medirRolagem, { passive: true });

  // menu do celular
  if (elChave && elLinks) {
    elChave.addEventListener("click", () => {
      const aberto = elLinks.classList.toggle("is-aberto");
      elChave.setAttribute("aria-expanded", String(aberto));
      elChave.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });
    elLinks.addEventListener("click", (ev) => {
      if (ev.target.closest(".nav__link")) {
        elLinks.classList.remove("is-aberto");
        elChave.setAttribute("aria-expanded", "false");
        elChave.setAttribute("aria-label", "Abrir menu");
      }
    });
  }

  /* =======================================================
     FOCO DA SEÇÃO
     -------------------------------------------------------
     Âncora de HTML para no topo da caixa da seção. Como cada
     seção tem min-height:100vh e o conteúdo centralizado
     dentro de um padding desigual, o topo da caixa não é
     onde o conteúdo está — daí parar "no meio".
     Aqui a conta é feita sobre o conteúdo de verdade.
     ======================================================= */
  function caixaDoConteudo(secao) {
    let topo = Infinity, base = -Infinity;

    for (const filho of secao.children) {
      if (!filho.getClientRects().length) continue;
      // painéis fixos (a história) não contam como conteúdo da seção
      if (getComputedStyle(filho).position === "fixed") continue;
      const r = filho.getBoundingClientRect();
      if (r.height === 0) continue;
      if (r.top < topo) topo = r.top;
      if (r.bottom > base) base = r.bottom;
    }

    if (!isFinite(topo)) {
      const r = secao.getBoundingClientRect();
      return { topo: r.top, altura: r.height };
    }
    return { topo: topo, altura: base - topo };
  }

  function focarSecao(secao) {
    if (!secao) return;
    const barra = elNav ? elNav.offsetHeight : 0;
    const util = window.innerHeight - barra;
    const { topo, altura } = caixaDoConteudo(secao);
    const topoNoDoc = topo + window.scrollY;

    let destino;
    if (altura <= util - 28) {
      // cabe inteiro: centraliza na área livre abaixo da barra
      destino = topoNoDoc - barra - (util - altura) / 2;
    } else {
      // mais alto que a tela: encosta o começo logo abaixo da barra
      destino = topoNoDoc - barra - 22;
    }

    const limite = document.documentElement.scrollHeight - window.innerHeight;
    destino = Math.max(0, Math.min(Math.round(destino), limite));

    window.scrollTo({ top: destino, behavior: calmo ? "instant" : "smooth" });
  }

  links.forEach((a) => {
    a.addEventListener("click", (ev) => {
      const alvo = document.querySelector(a.getAttribute("href"));
      if (!alvo) return;
      ev.preventDefault();
      soprarNevoa();
      focarSecao(alvo);
      if (history.replaceState) history.replaceState(null, "", a.getAttribute("href"));
    });
  });

  // abrir a página já com #secao na URL também respeita o foco
  function focarPelaUrl() {
    if (!location.hash || location.hash.length < 2) return;
    const alvo = document.querySelector(location.hash);
    if (alvo) setTimeout(() => focarSecao(alvo), 90);
  }
  window.addEventListener("load", focarPelaUrl);
  window.addEventListener("hashchange", focarPelaUrl);

  /* =======================================================
     03 — CARROSSEL DE TATUAGENS
     ======================================================= */
  const trilho  = $("#carrosselTrilho");
  const janela  = $("#carrosselJanela");
  const pontos  = $("#carrosselPontos");
  const setaEsq = $("#setaEsq");
  const setaDir = $("#setaDir");

  let cartoes = [];
  let qtdReal = 0;

  function montarCartao(tattoo, indice) {
    const art = document.createElement("article");
    art.className = "cartao mold";
    art.tabIndex = 0;
    art.setAttribute("role", "button");
    art.dataset.indice = String(indice);
    art.setAttribute("aria-label", tattoo.titulo + " — clique para conhecer a história");

    art.innerHTML =
      '<div class="mold__janela">' +
      '<img src="' + tattoo.arquivo + '" alt="' + escapar(tattoo.alt) + '" loading="lazy" draggable="false">' +
      "</div>" +
      '<span class="mold__arte" aria-hidden="true"></span>' +
      '<span class="cartao__etiqueta">clique para conhecer a história</span>';

    return art;
  }

  if (trilho && window.DADOS && Array.isArray(DADOS.tattoos) && DADOS.tattoos.length) {
    qtdReal = DADOS.tattoos.length;

    // duas voltas: a fita corre sem emenda visível
    const fragmento = document.createDocumentFragment();
    for (let volta = 0; volta < 2; volta++) {
      DADOS.tattoos.forEach((t, i) => fragmento.appendChild(montarCartao(t, i)));
    }
    trilho.appendChild(fragmento);
    cartoes = $$(".cartao", trilho);

    // pontos: um por tattoo real
    if (pontos) {
      DADOS.tattoos.forEach((t, i) => {
        const b = document.createElement("button");
        b.className = "ponto";
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Ir para " + t.titulo);
        b.dataset.indice = String(i);
        pontos.appendChild(b);
      });
    }
  }

  /* ---- deslize contínuo e suave ---- */
  const VELOCIDADE = 0.28; // px por quadro — lento e constante
  let deslocamento = 0;
  let meiaFita = 0;
  let correndo = true;
  let quadro = null;

  function medirFita() {
    if (!trilho) return;
    meiaFita = trilho.scrollWidth / 2;
    basesCartoes = [];
    medirCartoes();
  }

  function passo() {
    if (!trilho) return;
    if (correndo && meiaFita > 0) {
      deslocamento -= VELOCIDADE;
      if (-deslocamento >= meiaFita) deslocamento += meiaFita;
      trilho.style.transform = "translate3d(" + deslocamento + "px,0,0)";
      destacarCentro();
    }
    quadro = requestAnimationFrame(passo);
  }

  /* ---- cartão em destaque: o que estiver mais ao centro ---- */
  let destaqueAtual = null;

  /* posicao de cada cartao, medida UMA vez.
     Antes isto lia o layout dos 26 cartoes a cada quadro — cerca de
     1.560 leituras por segundo, que era o que travava no celular.
     Agora o quadro so faz aritmetica. */
  let basesCartoes = [];
  let centroJanela = 0;

  function medirCartoes() {
    if (!janela || !cartoes.length) return;
    const cj = janela.getBoundingClientRect();
    centroJanela = cj.width / 2;
    basesCartoes = cartoes.map((c) => {
      const r = c.getBoundingClientRect();
      return (r.left - cj.left) + r.width / 2 - deslocamento;
    });
  }

  function destacarCentro() {
    if (!janela || !cartoes.length) return;
    if (!basesCartoes.length) medirCartoes();

    let eleito = -1;
    let menor = Infinity;
    for (let i = 0; i < basesCartoes.length; i++) {
      const d = Math.abs(basesCartoes[i] + deslocamento - centroJanela);
      if (d < menor) { menor = d; eleito = i; }
    }
    if (eleito < 0) return;

    const alvo = cartoes[eleito];
    if (alvo !== destaqueAtual) {
      if (destaqueAtual) destaqueAtual.classList.remove("is-destaque");
      alvo.classList.add("is-destaque");
      destaqueAtual = alvo;
      marcarPonto(Number(alvo.dataset.indice));
    }
  }

  function marcarPonto(indice) {
    if (!pontos) return;
    $$(".ponto", pontos).forEach((p) => {
      p.classList.toggle("is-ativo", Number(p.dataset.indice) === indice);
    });
  }

  /* ---- levar um cartão até o centro ---- */
  function levarAoCentro(indice, suave) {
    if (!janela || !trilho || !cartoes.length) return;

    // usa a ocorrência mais próxima do centro atual
    const caixa = janela.getBoundingClientRect();
    const centro = caixa.left + caixa.width / 2;
    let alvo = null;
    let menor = Infinity;

    for (const c of cartoes) {
      if (Number(c.dataset.indice) !== indice) continue;
      const cc = c.getBoundingClientRect();
      const d = Math.abs(cc.left + cc.width / 2 - centro);
      if (d < menor) { menor = d; alvo = c; }
    }
    if (!alvo) return;

    const ac = alvo.getBoundingClientRect();
    const diferenca = centro - (ac.left + ac.width / 2);

    if (suave && !calmo) {
      animarAte(deslocamento + diferenca, 900);
    } else {
      deslocamento += diferenca;
      trilho.style.transform = "translate3d(" + deslocamento + "px,0,0)";
      destacarCentro();
    }
  }

  let animacaoManual = null;

  function animarAte(destino, duracao) {
    if (animacaoManual) cancelAnimationFrame(animacaoManual);
    const partida = deslocamento;
    const curso = destino - partida;
    const inicio = performance.now();
    const guardado = correndo;
    correndo = false;

    function tique(agora) {
      const t = Math.min(1, (agora - inicio) / duracao);
      // easing suave, sem solavanco
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      deslocamento = partida + curso * e;
      if (-deslocamento >= meiaFita) deslocamento += meiaFita;
      if (deslocamento > 0) deslocamento -= meiaFita;
      trilho.style.transform = "translate3d(" + deslocamento + "px,0,0)";
      destacarCentro();
      if (t < 1) {
        animacaoManual = requestAnimationFrame(tique);
      } else {
        animacaoManual = null;
        correndo = guardado;
      }
    }
    animacaoManual = requestAnimationFrame(tique);
  }

  function passoLateral(direcao) {
    if (!cartoes.length) return;
    const largura = cartoes[0].getBoundingClientRect().width + 28;
    animarAte(deslocamento - direcao * largura, 850);
  }

  if (setaEsq) setaEsq.addEventListener("click", () => passoLateral(-1));
  if (setaDir) setaDir.addEventListener("click", () => passoLateral(1));

  /* ---- arrastar com o dedo (no celular as setas não existem) ---- */
  if (janela) {
    let arrastando = false;
    let partidaX = 0;
    let partidaDeslocamento = 0;
    let percorrido = 0;
    let corriaAntes = true;

    janela.addEventListener("pointerdown", (ev) => {
      if (ev.button != null && ev.button !== 0) return;
      arrastando = true;
      percorrido = 0;
      partidaX = ev.clientX;
      partidaDeslocamento = deslocamento;
      corriaAntes = correndo;
      correndo = false;
      if (animacaoManual) { cancelAnimationFrame(animacaoManual); animacaoManual = null; }
    });

    janela.addEventListener("pointermove", (ev) => {
      if (!arrastando || !trilho) return;
      const avanco = ev.clientX - partidaX;
      percorrido = Math.max(percorrido, Math.abs(avanco));
      // Capturar antes do arrasto redireciona o clique do cartão para a janela.
      if (percorrido > 8 && !janela.hasPointerCapture?.(ev.pointerId)) {
        janela.setPointerCapture?.(ev.pointerId);
      }
      deslocamento = partidaDeslocamento + avanco;

      // a fita é cíclica: emenda nas duas pontas
      if (meiaFita > 0) {
        while (-deslocamento >= meiaFita) deslocamento += meiaFita;
        while (deslocamento > 0) deslocamento -= meiaFita;
      }
      trilho.style.transform = "translate3d(" + deslocamento + "px,0,0)";
      destacarCentro();
    });

    function soltar(ev) {
      if (!arrastando) return;
      arrastando = false;
      if (janela.hasPointerCapture?.(ev.pointerId)) {
        janela.releasePointerCapture(ev.pointerId);
      }
      correndo = corriaAntes;
    }
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);

    // arrastar não pode abrir a história sem querer
    janela.addEventListener("click", (ev) => {
      if (percorrido > 8) {
        ev.stopPropagation();
        ev.preventDefault();
        percorrido = 0;
      }
    }, true);
  }

  if (pontos) {
    pontos.addEventListener("click", (ev) => {
      const p = ev.target.closest(".ponto");
      if (!p) return;
      const i = Number(p.dataset.indice);
      levarAoCentro(i, true);
      abrirHistoria(i);
    });
  }

  /* =======================================================
     PAINEL LATERAL DA HISTÓRIA
     ======================================================= */
  const painel      = $("#historia");
  const painelImg   = $("#historiaImg");
  const painelTit   = $("#historiaTitulo");
  const painelTxt   = $("#historiaTexto");
  const painelSai   = $("#historiaFechar");
  let cartaoAberto  = null;

  function abrirHistoria(indice) {
    if (!painel || !window.DADOS) return;
    const t = DADOS.tattoos[indice];
    if (!t) return;

    painelImg.src = t.arquivoAlta || t.arquivo;
    painelImg.alt = t.alt;
    painelTit.textContent = t.titulo;

    const emParagrafos = (texto) =>
      texto
        .split(/\n{2,}/)
        .map((p) => "<p>" + escapar(p).replace(/\n/g, "<br>") + "</p>")
        .join("");

    const obra      = (t.obra || "").trim();
    const frase     = (t.frase || "").trim();
    const descricao = (t.descricao || "").trim();
    const relato    = (t.historia || "").trim();

    let corpo = "";

    if (obra) {
      corpo +=
        '<p class="historia__obra"><span aria-hidden="true">✦</span>' +
        escapar(obra) + "</p>";
    }
    if (frase) {
      corpo +=
        '<p class="historia__frase">' + escapar(frase) + "</p>" +
        '<span class="historia__filete" aria-hidden="true"></span>';
    }
    if (descricao) corpo += emParagrafos(descricao);

    if (relato) {
      corpo +=
        '<span class="historia__divisa" aria-hidden="true"></span>' +
        emParagrafos(relato);
    }

    painelTxt.innerHTML = corpo;

    painel.classList.add("is-aberta");
    painel.setAttribute("aria-hidden", "false");

    if (cartaoAberto) cartaoAberto.classList.remove("is-aberto");
    const marcado = cartoes.find(
      (c) => Number(c.dataset.indice) === indice && c.classList.contains("is-destaque")
    ) || cartoes.find((c) => Number(c.dataset.indice) === indice);
    if (marcado) {
      marcado.classList.add("is-aberto");
      cartaoAberto = marcado;
    }

    // o carrossel continua correndo com o painel aberto — por pedido da referência
  }

  function fecharHistoria() {
    if (!painel) return;
    painel.classList.remove("is-aberta");
    painel.setAttribute("aria-hidden", "true");
    if (cartaoAberto) {
      cartaoAberto.classList.remove("is-aberto");
      cartaoAberto = null;
    }
  }

  if (painelSai) painelSai.addEventListener("click", fecharHistoria);

  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    if (painel && painel.classList.contains("is-aberta")) fecharHistoria();
    if (veu && !veu.hidden) fecharVeu();
  });

  if (trilho) {
    trilho.addEventListener("click", (ev) => {
      const c = ev.target.closest(".cartao");
      if (!c) return;
      const i = Number(c.dataset.indice);
      levarAoCentro(i, true);
      abrirHistoria(i);
    });
    trilho.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      const c = ev.target.closest(".cartao");
      if (!c) return;
      ev.preventDefault();
      const i = Number(c.dataset.indice);
      levarAoCentro(i, true);
      abrirHistoria(i);
    });
  }

  // fora da tela, o carrossel descansa
  if (trilho && "IntersectionObserver" in window) {
    const olhoCarrossel = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          correndo = e.isIntersecting && !animacaoManual;
        });
      },
      { threshold: 0.04 }
    );
    olhoCarrossel.observe(trilho);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) correndo = false;
    else if (!animacaoManual) correndo = true;
  });

  if (trilho && !calmo) {
    const arrancar = () => { medirFita(); passo(); };
    if (document.readyState === "complete") arrancar();
    else window.addEventListener("load", arrancar);
    window.addEventListener("resize", medirFita);
  } else if (trilho) {
    medirFita();
    destacarCentro();
  }

  /* =======================================================
     04 — VÍDEOS DE MEMÓRIA
     ======================================================= */
  const videos = $$(".memoria__palco");

  // num celular, tres videos decodificando ao mesmo tempo engasga a
  // pagina inteira. Em tela de toque toca so o que estiver mais a vista.
  const umVideoPorVez =
    window.matchMedia("(hover:none) and (pointer:coarse)").matches ||
    window.innerWidth <= 980;

  const pausadosAMao = new WeakSet();
  const visibilidade = new Map();

  function tocar(palco) {
    const v = $(".memoria__video", palco);
    if (v && v.paused && !pausadosAMao.has(palco)) v.play().catch(() => {});
  }
  function parar(palco) {
    const v = $(".memoria__video", palco);
    if (v && !v.paused) v.pause();
  }

  function ajustarVideos() {
    if (umVideoPorVez) {
      let melhor = null, maior = 0;
      visibilidade.forEach((r, palco) => {
        if (r > maior) { maior = r; melhor = palco; }
      });
      videos.forEach((palco) => (palco === melhor && maior > 0.25) ? tocar(palco) : parar(palco));
    } else {
      visibilidade.forEach((r, palco) => (r > 0.25) ? tocar(palco) : parar(palco));
    }
  }

  videos.forEach((palco) => {
    const video = $(".memoria__video", palco);
    const play  = $(".memoria__play", palco);
    if (!video || !play) return;

    visibilidade.set(palco, 0);

    play.addEventListener("click", () => {
      if (video.paused) {
        pausadosAMao.delete(palco);
        video.play().catch(() => {});
      } else {
        pausadosAMao.add(palco);
        video.pause();
      }
    });

    video.addEventListener("playing", () => palco.classList.add("is-tocando"));
    video.addEventListener("pause",   () => palco.classList.remove("is-tocando"));
  });

  if ("IntersectionObserver" in window && videos.length) {
    const olhoVideo = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => visibilidade.set(e.target, e.isIntersecting ? e.intersectionRatio : 0));
        ajustarVideos();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    videos.forEach((palco) => olhoVideo.observe(palco));
  }

  /* Sem autoplay no HTML, quem decide quem toca e o JS. O observador
     e o caminho principal; a rolagem e a rede de seguranca, caso ele
     demore ou a pessoa caia direto na secao pelo link. Mede so os 3
     palcos e no maximo 5 vezes por segundo. */
  function medirVisibilidadeAgora() {
    const alturaTela = window.innerHeight || 1;
    videos.forEach((palco) => {
      const r = palco.getBoundingClientRect();
      const visivel = Math.max(0, Math.min(r.bottom, alturaTela) - Math.max(r.top, 0));
      visibilidade.set(palco, r.height > 0 ? visivel / r.height : 0);
    });
  }

  if (videos.length) {
    let agendado = null;
    const reavaliar = () => {
      if (agendado) return;
      agendado = setTimeout(() => {
        agendado = null;
        medirVisibilidadeAgora();
        ajustarVideos();
      }, 200);
    };
    window.addEventListener("scroll", reavaliar, { passive: true });
    window.addEventListener("resize", reavaliar, { passive: true });

    medirVisibilidadeAgora();
    ajustarVideos();
  }

  /* =======================================================
     TRILHA
     -------------------------------------------------------
     Áudio do primeiro vídeo, em volume baixo e em loop.
     Entra e sai sempre com fade — nunca corta seco.
     Navegador nenhum deixa tocar som sozinho, então a trilha
     espera o primeiro gesto da pessoa. E a escolha fica
     guardada: quem desligou não ouve de novo na volta.
     ======================================================= */
  (function () {
    const audio  = $("#tema");
    const botao  = $("#trilhaBotao");
    if (!audio || !botao) return;

    const VOLUME  = 0.17;   // baixo: companhia, não trilha de cinema
    const ENTRADA = 2600;   // ms
    const SAIDA   = 1400;   // ms
    const CHAVE   = "giovanna:trilha";

    audio.volume = 0;

    let fade = null;

    function esmaecer(destino, duracao, aoFim) {
      if (fade) cancelAnimationFrame(fade);

      if (duracao <= 0 || calmo) {
        audio.volume = destino;
        if (aoFim) aoFim();
        return;
      }

      const partida = audio.volume;
      const curso = destino - partida;
      let decorrido = 0;
      let anterior = performance.now();

      (function tique(agora) {
        // o relógio avança por diferença, com teto: se a aba dormir no meio
        // do fade, ao voltar ele continua de onde parou em vez de dar um salto
        const passo = Math.min(agora - anterior, 50);
        anterior = agora;
        decorrido += passo;

        const t = Math.min(1, decorrido / duracao);
        const e = t * t * (3 - 2 * t);          // suave nas duas pontas
        const v = partida + curso * e;
        audio.volume = v < 0 ? 0 : v > 1 ? 1 : v;

        if (t < 1) fade = requestAnimationFrame(tique);
        else { fade = null; if (aoFim) aoFim(); }
      })(anterior);
    }

    function marcar(ligada) {
      botao.setAttribute("aria-pressed", String(ligada));
      botao.setAttribute("aria-label", ligada ? "Silenciar a trilha" : "Ligar a trilha");
    }

    function lembrar(valor) {
      try { localStorage.setItem(CHAVE, valor); } catch (e) { /* janela anônima */ }
    }
    function lembrado() {
      try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
    }

    function ligar() {
      const promessa = audio.play();
      if (promessa && promessa.catch) {
        promessa
          .then(() => { marcar(true); esmaecer(VOLUME, ENTRADA); })
          .catch(() => { marcar(false); });   // bloqueado: espera um gesto
      } else {
        marcar(true);
        esmaecer(VOLUME, ENTRADA);
      }
    }

    function desligar() {
      esmaecer(0, SAIDA, () => audio.pause());
      marcar(false);
    }

    botao.addEventListener("click", () => {
      const tocando = botao.getAttribute("aria-pressed") === "true";
      if (tocando) { desligar(); lembrar("off"); }
      else         { ligar();    lembrar("on");  }
    });

    // primeiro gesto da pessoa libera o som, a menos que ela já tenha desligado
    let liberado = false;
    function primeiroGesto() {
      if (liberado) return;
      liberado = true;
      gestos.forEach((g) => window.removeEventListener(g, primeiroGesto));
      if (lembrado() !== "off") ligar();
    }
    const gestos = ["pointerdown", "keydown", "wheel", "touchstart"];
    gestos.forEach((g) =>
      window.addEventListener(g, primeiroGesto, { once: false, passive: true })
    );

    // tenta já na abertura: se o navegador deixar, a trilha nasce tocando;
    // se bloquear (quase sempre bloqueia), o primeiro gesto acima resolve
    if (lembrado() !== "off") ligar();

    // trocar de aba silencia; voltar retoma, se estava tocando
    document.addEventListener("visibilitychange", () => {
      if (audio.paused) return;
      // na aba oculta o rAF congela: baixa direto, e faz o fade só na volta
      if (document.hidden) esmaecer(0, 0);
      else esmaecer(VOLUME, 1200);
    });

    marcar(false);
  })();

  /* =======================================================
     WHATSAPP — nunca inventa número
     ======================================================= */
  const temZap = () => !!(window.DADOS && DADOS.whatsapp && /^\d{10,15}$/.test(DADOS.whatsapp));

  function linkZap(texto) {
    const base = "https://wa.me/" + DADOS.whatsapp;
    return texto ? base + "?text=" + encodeURIComponent(texto) : base;
  }

  function avisarSemZap() {
    sussurrar(
      "O número de WhatsApp da Gio ainda não foi informado. " +
      "Por enquanto, fale com ela pelo Direct do Instagram: @" + DADOS.instagram + "."
    );
  }

  const numeroValido = (n) => !!(n && /^\d{10,15}$/.test(n));

  $$("[data-wa]").forEach((a) => {
    // o botao do parceiro tem numero proprio; os demais sao da Gio
    const doParceiro = a.dataset.wa === "parceiro";
    const numero = doParceiro ? (DADOS.whatsappParceiro || "") : (DADOS.whatsapp || "");

    if (numeroValido(numero)) {
      a.href = "https://wa.me/" + numero;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    } else {
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        if (doParceiro) {
          sussurrar("O WhatsApp do Tiagão Tattoo Crew ainda não foi informado.");
        } else {
          avisarSemZap();
        }
      });
    }
  });

  /* =======================================================
     EXEMPLO QUE SURGE NO CAMPO DA IDEIA
     -------------------------------------------------------
     Linhas de exemplo aparecendo uma a uma, saindo da névoa.
     É só sugestão visual: nunca entra no texto da pessoa.
     Some assim que ela clica ou escreve.
     ======================================================= */
  (function () {
    const campo  = $("#campoIdeia");
    const caixa  = $("#fantasmaLinhas");
    if (!campo || !caixa) return;

    const EXEMPLOS = [
      [
        "uma gata preta dormindo numa lua minguante",
        "antebraço esquerdo, uns 12 cm",
        "traço fino, blackwork, sem cor",
        "quero que caiba num lugar discreto",
        "tenho as tardes de sexta livres"
      ],
      [
        "uma rosa vermelha com as pétalas caindo",
        "na lateral da costela, uns 15 cm",
        "old school, cor fechada",
        "é a minha primeira, tenho um pouco de medo",
        "consigo ir num sábado de manhã"
      ],
      [
        "um retrato dentro de uma moldura antiga",
        "fechando o antebraço com o que já tenho",
        "blackwork com pontilhado",
        "mando as referências no direct",
        "sem pressa, quero fazer com calma"
      ]
    ];

    const ENTRE_LINHAS = 620;    // ms entre uma linha e a seguinte
    const DESCANSO     = 5200;   // ms com o exemplo inteiro à mostra
    const SAIDA        = 900;    // ms da dissolução

    let indice = 0;
    let relogios = [];
    let vivo = false;

    const limpar = () => { relogios.forEach(clearTimeout); relogios = []; };
    const daqui  = (fn, ms) => relogios.push(setTimeout(fn, ms));

    function desenhar(linhas) {
      caixa.textContent = "";
      return linhas.map((texto) => {
        const el = document.createElement("span");
        el.className = "fantasma__linha";
        el.textContent = texto;
        caixa.appendChild(el);
        return el;
      });
    }

    function ciclo() {
      if (!vivo) return;
      const els = desenhar(EXEMPLOS[indice]);

      if (calmo) {
        els.forEach((el) => el.classList.add("is-visivel"));
        return;                       // sem movimento: mostra um e para
      }

      els.forEach((el, i) => {
        daqui(() => el.classList.add("is-visivel"), 60 + i * ENTRE_LINHAS);
      });

      const tudoVisivel = 60 + (els.length - 1) * ENTRE_LINHAS;
      daqui(() => {
        els.forEach((el, i) => {
          daqui(() => {
            el.classList.remove("is-visivel");
            el.classList.add("is-saindo");
          }, i * 110);
        });
        daqui(() => {
          indice = (indice + 1) % EXEMPLOS.length;
          ciclo();
        }, SAIDA + els.length * 110);
      }, tudoVisivel + DESCANSO);
    }

    function acordar() { if (vivo) return; vivo = true; ciclo(); }
    function dormir()  { vivo = false; limpar(); }

    // o exemplo não é o texto da pessoa: ao escrever, ele sai de cena
    function conferirTexto() {
      const temTexto = campo.value.trim().length > 0;
      campo.classList.toggle("tem-texto", temTexto);
      if (temTexto) dormir();
      else if (document.activeElement !== campo) acordar();
    }

    campo.addEventListener("input", conferirTexto);
    campo.addEventListener("focus", dormir);
    campo.addEventListener("blur", conferirTexto);

    // começa já: o observador abaixo só serve para poupar quando sai de vista
    conferirTexto();

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entradas) => {
          entradas.forEach((e) => {
            if (e.isIntersecting) conferirTexto();
            else dormir();
          });
        },
        { threshold: 0.2 }
      ).observe(campo);
    }
  })();

  /* =======================================================
     06 — ENVIO DA IDEIA (sempre com confirmação)
     ======================================================= */
  const ficha  = $("#fichaIdeia");
  const veu    = $("#veu");
  const corpoD = $("#dialogoCorpo");
  const saiD   = $("#dialogoFechar");

  // vai exatamente o que a pessoa escreveu: nada acrescentado, nada cortado
  function montarMensagem() {
    return $("#campoIdeia").value.trim();
  }

  function abrirVeu(html) {
    if (!veu || !corpoD) return;
    corpoD.innerHTML = html;
    veu.hidden = false;
    void veu.offsetWidth;
    veu.classList.add("is-visivel");
  }

  function fecharVeu() {
    if (!veu) return;
    veu.classList.remove("is-visivel");
    setTimeout(() => { veu.hidden = true; }, 700);
  }

  if (saiD) saiD.addEventListener("click", fecharVeu);
  if (veu) {
    veu.addEventListener("click", (ev) => {
      if (ev.target === veu) fecharVeu();
    });
  }

  const iconeZap =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5.1-1.3A10 10 0 1012 2zm0 1.8a8.2 8.2 0 11-4.2 15.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0112 3.8zm-3.3 4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.2-.6.1l-.8 1c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5l-.8-1.9c-.2-.4-.4-.4-.6-.4h-.6z"/></svg>';

  const iconeInsta =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">' +
    '<rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4.1"/>' +
    '<circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" stroke="none"/></svg>';

  function escapar(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  if (ficha) {
    ficha.addEventListener("submit", (ev) => {
      ev.preventDefault();

      const ideia = $("#campoIdeia").value.trim();

      if (!ideia) {
        sussurrar("Conte sua ideia de tattoo antes de enviar.");
        $("#campoIdeia").focus();
        return;
      }

      const mensagem = montarMensagem();

      abrirVeu(
        '<h3 class="dialogo__titulo">Para onde levamos sua ideia?</h3>' +
        '<span class="dialogo__linha" aria-hidden="true"></span>' +
        '<p class="dialogo__aviso">Nada é enviado sozinho. Escolha o caminho e confirme — ' +
        "sua mensagem vai exatamente como você escreveu.</p>" +
        '<div class="dialogo__previa">' + escapar(mensagem) + "</div>" +
        '<div class="dialogo__opcoes">' +
          '<button type="button" class="opcao opcao--rubi" id="irZap">' + iconeZap + "<span>WhatsApp</span></button>" +
          '<button type="button" class="opcao" id="irInsta">' + iconeInsta + "<span>Direct do Instagram</span></button>" +
        "</div>" +
        '<p class="dialogo__rodape">No WhatsApp a conversa abre com o texto já preenchido. ' +
        "No Instagram o perfil da Gio abre e o texto fica copiado, pronto para colar no Direct — " +
        "o envio continua sendo seu.</p>"
      );

      const btZap = $("#irZap");
      const btIns = $("#irInsta");

      if (btZap) {
        btZap.addEventListener("click", () => {
          if (!temZap()) {
            avisarSemZap();
            fecharVeu();
            return;
          }
          window.open(linkZap(mensagem), "_blank", "noopener");
          fecharVeu();
          sussurrar("WhatsApp aberto com sua mensagem preenchida. O envio é seu.");
        });
      }

      if (btIns) {
        btIns.addEventListener("click", async () => {
          let copiou = false;
          try {
            await navigator.clipboard.writeText(mensagem);
            copiou = true;
          } catch (e) {
            copiou = false;
          }
          window.open(DADOS.instagramDireta, "_blank", "noopener");
          fecharVeu();
          sussurrar(
            copiou
              ? "Texto copiado e Direct aberto. É só colar e enviar quando quiser."
              : "Direct aberto. Copie sua mensagem do formulário e cole lá — o envio é seu."
          );
        });
      }
    });
  }
})();
