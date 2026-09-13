/* ==========================================================================
   BelleFacite - comportamento da página
   Sem dependências. Tudo degrada para uma página estática legível se o JS falhar.
   ========================================================================== */
(function () {
  'use strict';

  var WHATSAPP = '5583991646936';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function zap(texto) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  }

  /* --- navegação --------------------------------------------------------- */
  function initNav() {
    var nav = $('.nav');
    var toggle = $('.nav__toggle');
    var sentinel = $('#topo-sentinela');
    if (!nav) return;

    // A sombra do topo aparece quando a sentinela sai da tela. Um
    // IntersectionObserver evita rodar código a cada quadro de rolagem.
    if (sentinel && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        nav.dataset.stuck = String(!entries[0].isIntersecting);
      }, { rootMargin: '-1px 0px 0px 0px', threshold: 0 }).observe(sentinel);
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = nav.dataset.open === 'true';
        nav.dataset.open = String(!open);
        toggle.setAttribute('aria-expanded', String(!open));
        toggle.querySelector('use').setAttribute('href', open ? '#i-list' : '#i-x');
      });

      $$('.nav__links a').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.dataset.open = 'false';
          toggle.setAttribute('aria-expanded', 'false');
          toggle.querySelector('use').setAttribute('href', '#i-list');
        });
      });
    }
  }

  /* --- entrada das seções ------------------------------------------------ */
  function initReveal() {
    var alvos = $$('.reveal');
    if (!alvos.length) return;

    if (reduced.matches || !('IntersectionObserver' in window)) {
      alvos.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    alvos.forEach(function (el) { obs.observe(el); });
  }

  /* --- calculadora de retorno -------------------------------------------- */
  var TABELA = {
    hifu:        { nome: 'Herus HIFU 4D',       diaria: 800,  tres: 1200, semana: 1600 },
    criopad:     { nome: 'Axcel Criopad Full',  diaria: 600,  tres: 1000, semana: 1600 },
    microneedle: { nome: 'Axcel Microneedle',   diaria: 1000, tres: 1500, semana: 2000 },
    lipocavity:  { nome: 'Lipocavity 40',       diaria: 300,  tres: 600,  semana: 800  },
    stimcare:    { nome: 'Stim Care',           diaria: 150,  tres: 300,  semana: 600  }
  };

  // Pontos de partida para a simulação. Quem usa ajusta para o próprio preço.
  var PADRAO = {
    hifu:        { sessoes: 3, preco: 1200 },
    criopad:     { sessoes: 4, preco: 600 },
    microneedle: { sessoes: 3, preco: 700 },
    lipocavity:  { sessoes: 6, preco: 200 },
    stimcare:    { sessoes: 6, preco: 120 }
  };

  var CARTUCHO = { convencional: 1.30, quatro: 1.70, pen: 1.00 };
  var PONTEIRA = 300;

  var brl = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0
  });

  function initCalc() {
    var raiz = $('#calculadora');
    if (!raiz) return;

    var estado = {
      equip: 'hifu',
      modalidade: 'diaria',
      sessoes: PADRAO.hifu.sessoes,
      preco: PADRAO.hifu.preco,
      disparos: 500,
      cartucho: 'convencional'
    };

    var el = {
      equip: $$('[data-calc-equip]', raiz),
      modalidade: $$('[data-calc-modalidade]', raiz),
      cartucho: $$('[data-calc-cartucho]', raiz),
      sessoesOut: $('#calc-sessoes'),
      sessoesMenos: $('#calc-sessoes-menos'),
      sessoesMais: $('#calc-sessoes-mais'),
      disparosOut: $('#calc-disparos'),
      disparosMenos: $('#calc-disparos-menos'),
      disparosMais: $('#calc-disparos-mais'),
      preco: $('#calc-preco'),
      campoDisparos: $('#campo-disparos'),
      campoCartucho: $('#campo-cartucho'),
      lucro: $('#calc-lucro'),
      breakeven: $('#calc-breakeven'),
      linhaReceita: $('#linha-receita'),
      linhaLocacao: $('#linha-locacao'),
      linhaInsumo: $('#linha-insumo'),
      linhaInsumoItem: $('#linha-insumo-item'),
      linhaTotal: $('#linha-total'),
      rotuloLocacao: $('#rotulo-locacao'),
      rotuloInsumo: $('#rotulo-insumo'),
      cta: $('#calc-cta')
    };

    function insumoPorSessao() {
      if (estado.equip === 'hifu') return estado.disparos * CARTUCHO[estado.cartucho];
      if (estado.equip === 'microneedle') return PONTEIRA;
      return 0;
    }

    var ROTULO_MODALIDADE = {
      diaria: 'Diária',
      tres: 'Pacote de 3 dias',
      semana: 'Semana inteira'
    };

    function render() {
      var eq = TABELA[estado.equip];
      var locacao = eq[estado.modalidade];
      var porSessao = insumoPorSessao();
      var receita = estado.sessoes * estado.preco;
      var insumos = estado.sessoes * porSessao;
      var total = locacao + insumos;
      var lucro = receita - total;
      var margem = estado.preco - porSessao;

      el.lucro.textContent = brl.format(lucro);
      el.lucro.dataset.negative = String(lucro <= 0);

      if (margem > 0) {
        var sessaoQuita = Math.ceil(locacao / margem);
        if (sessaoQuita <= estado.sessoes) {
          el.breakeven.innerHTML = 'A locação se paga na <strong>' + sessaoQuita +
            'ª sessão</strong>. As seguintes são lucro.';
        } else {
          el.breakeven.innerHTML = 'Com esse valor, a locação se paga na <strong>' + sessaoQuita +
            'ª sessão</strong>. Aumente as sessões do período para cobrir o custo.';
        }
      } else {
        el.breakeven.innerHTML = 'O preço por sessão não cobre nem o insumo. Ajuste o valor cobrado.';
      }

      el.linhaReceita.textContent = brl.format(receita);
      el.linhaLocacao.textContent = brl.format(locacao);
      el.linhaTotal.textContent = brl.format(total);
      el.rotuloLocacao.textContent = ROTULO_MODALIDADE[estado.modalidade];

      if (porSessao > 0) {
        el.linhaInsumoItem.hidden = false;
        el.linhaInsumo.textContent = brl.format(insumos);
        el.rotuloInsumo.textContent = estado.equip === 'hifu'
          ? 'Disparos (' + (estado.disparos * estado.sessoes).toLocaleString('pt-BR') + ' no total)'
          : 'Ponteiras descartáveis (' + estado.sessoes + ')';
      } else {
        el.linhaInsumoItem.hidden = true;
      }

      var hifu = estado.equip === 'hifu';
      el.campoDisparos.hidden = !hifu;
      el.campoCartucho.hidden = !hifu;

      el.cta.href = zap('Olá! Vim pelo site e quero um orçamento de locação do ' + eq.nome +
        ' (' + ROTULO_MODALIDADE[estado.modalidade].toLowerCase() + ').');

      el.sessoesOut.textContent = estado.sessoes;
      el.disparosOut.textContent = estado.disparos.toLocaleString('pt-BR');
      el.sessoesMenos.disabled = estado.sessoes <= 1;
      el.sessoesMais.disabled = estado.sessoes >= 30;
      el.disparosMenos.disabled = estado.disparos <= 100;
      el.disparosMais.disabled = estado.disparos >= 3000;
    }

    function marcar(lista, attr, valor) {
      lista.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset[attr] === valor));
      });
    }

    el.equip.forEach(function (b) {
      b.addEventListener('click', function () {
        estado.equip = b.dataset.calcEquip;
        estado.sessoes = PADRAO[estado.equip].sessoes;
        estado.preco = PADRAO[estado.equip].preco;
        el.preco.value = estado.preco;
        marcar(el.equip, 'calcEquip', estado.equip);
        render();
      });
    });

    el.modalidade.forEach(function (b) {
      b.addEventListener('click', function () {
        estado.modalidade = b.dataset.calcModalidade;
        marcar(el.modalidade, 'calcModalidade', estado.modalidade);
        render();
      });
    });

    el.cartucho.forEach(function (b) {
      b.addEventListener('click', function () {
        estado.cartucho = b.dataset.calcCartucho;
        marcar(el.cartucho, 'calcCartucho', estado.cartucho);
        render();
      });
    });

    el.sessoesMenos.addEventListener('click', function () {
      estado.sessoes = Math.max(1, estado.sessoes - 1); render();
    });
    el.sessoesMais.addEventListener('click', function () {
      estado.sessoes = Math.min(30, estado.sessoes + 1); render();
    });
    el.disparosMenos.addEventListener('click', function () {
      estado.disparos = Math.max(100, estado.disparos - 100); render();
    });
    el.disparosMais.addEventListener('click', function () {
      estado.disparos = Math.min(3000, estado.disparos + 100); render();
    });

    el.preco.addEventListener('input', function () {
      var v = parseInt(el.preco.value, 10);
      estado.preco = isNaN(v) || v < 0 ? 0 : Math.min(v, 100000);
      render();
    });
    el.preco.addEventListener('blur', function () {
      el.preco.value = estado.preco;
    });

    el.preco.value = estado.preco;
    marcar(el.equip, 'calcEquip', estado.equip);
    marcar(el.modalidade, 'calcModalidade', estado.modalidade);
    marcar(el.cartucho, 'calcCartucho', estado.cartucho);
    render();
  }

  /* --- ficha do equipamento ---------------------------------------------- */
  function initFichas() {
    var anterior = null;

    function abrir(id) {
      var dlg = document.getElementById('ficha-' + id);
      if (!dlg || typeof dlg.showModal !== 'function') return false;
      anterior = document.activeElement;
      dlg.showModal();
      document.documentElement.style.overflow = 'hidden';
      return true;
    }

    $$('[data-ficha]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        abrir(btn.dataset.ficha);
      });
    });

    $$('.sheet').forEach(function (dlg) {
      $$('[data-fechar]', dlg).forEach(function (b) {
        b.addEventListener('click', function () { dlg.close(); });
      });

      // Clique fora do conteúdo fecha a ficha.
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg) dlg.close();
      });

      dlg.addEventListener('close', function () {
        document.documentElement.style.overflow = '';
        if (anterior && anterior.focus) anterior.focus();
        anterior = null;
      });

      // Galeria: a miniatura troca a foto grande.
      var palco = $('.sheet__stage img', dlg);
      $$('.sheet__thumbs button', dlg).forEach(function (t) {
        t.addEventListener('click', function () {
          var img = $('img', t);
          palco.src = img.src;
          palco.alt = img.alt;
          $$('.sheet__thumbs button', dlg).forEach(function (o) {
            o.setAttribute('aria-current', String(o === t));
          });
        });
      });
    });

    // Link direto: /#ficha-hifu abre a ficha correspondente.
    function porHash() {
      var m = /^#ficha-([a-z]+)$/.exec(window.location.hash);
      if (m) abrir(m[1]);
    }
    window.addEventListener('hashchange', porHash);
    porHash();
  }

  /* --- links de WhatsApp -------------------------------------------------- */
  function initZap() {
    $$('[data-zap]').forEach(function (a) {
      a.href = zap(a.dataset.zap);
    });
  }

  // Cada módulo é isolado: um erro em um não pode deixar o resto da página
  // quebrada (as seções .reveal começam invisíveis e dependem do JS).
  function roda(nome, fn) {
    try { fn(); } catch (e) { console.error('[bellefacite] ' + nome, e); }
  }

  function init() {
    roda('reveal', initReveal);
    roda('nav', initNav);
    roda('whatsapp', initZap);
    roda('calculadora', initCalc);
    roda('fichas', initFichas);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
