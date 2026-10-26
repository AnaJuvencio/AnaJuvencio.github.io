(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (selector, root) => (root || document).querySelector(selector);
    const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

    // Barra de progresso de leitura
    const progress = $('.pdi-progress span');
    function updateProgress() {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? doc.scrollTop / max : 0) + ')';
    }
    if (progress) {
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    // Números que contam ao aparecer
    function countUp(el) {
        const target = Number(el.dataset.count);
        if (reduceMotion || !target) {
            el.textContent = target;
            return;
        }
        const start = performance.now();
        const duration = 900;
        (function frame(now) {
            const t = Math.min((now - start) / duration, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
            if (t < 1) requestAnimationFrame(frame);
        })(start);
    }

    // Conteúdo que aparece ao rolar
    const revealTargets = $$('.pdi-reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(function (el) { revealObserver.observe(el); });

        const countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    countObserver.unobserve(entry.target);
                }
            });
        });
        $$('[data-count]').forEach(function (el) { countObserver.observe(el); });
    } else {
        revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // Destaque da seção atual no menu da página
    const nav = $('#pdi-nav');
    if (nav && 'IntersectionObserver' in window) {
        const links = $$('a', nav);
        const spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (link) {
                    const active = link.getAttribute('href') === '#' + entry.target.id;
                    if (active) {
                        link.setAttribute('aria-current', 'true');
                        const left = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
                        nav.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' });
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            });
        }, { rootMargin: '-35% 0px -55% 0px' });
        $$('main section[id]').forEach(function (section) { spy.observe(section); });
    }

    // Abas acessíveis (trajetória, metas, MBTI)
    $$('[data-tabs]').forEach(function (root) {
        const tabs = $$('[role="tab"]', root);
        const panels = tabs.map(function (tab) { return document.getElementById(tab.getAttribute('aria-controls')); });

        function activate(index, focus) {
            tabs.forEach(function (tab, i) {
                const on = i === index;
                tab.setAttribute('aria-selected', String(on));
                tab.tabIndex = on ? 0 : -1;
                panels[i].hidden = !on;
            });
            if (focus) tabs[index].focus();
        }

        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () { activate(i); });
            tab.addEventListener('keydown', function (event) {
                const last = tabs.length - 1;
                let next = null;
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = i === last ? 0 : i + 1;
                else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = i === 0 ? last : i - 1;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = last;
                if (next !== null) {
                    event.preventDefault();
                    activate(next, true);
                }
            });
        });

        const selected = tabs.findIndex(function (tab) { return tab.getAttribute('aria-selected') === 'true'; });
        activate(Math.max(selected, 0));
    });

    // Alternância Hoje / Daqui a 1 ano
    const shift = $('.pdi-shift');
    $$('.pdi-switch button').forEach(function (button) {
        button.addEventListener('click', function () {
            shift.dataset.mode = button.dataset.mode;
            $$('.pdi-switch button').forEach(function (other) {
                other.setAttribute('aria-pressed', String(other === button));
            });
        });
    });

    // Cards de "hoje / daqui a 1 ano": cada um abre e fecha pelo botão +
    const cards = $$('.pdi-shift-card');
    cards.forEach(function (card) {
        const toggle = $('.pdi-shift-toggle', card);
        toggle.addEventListener('click', function () {
            const open = !card.classList.contains('is-open');
            card.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
        });
    });

    // Na impressão, os cards fechados também devem sair no papel
    let reopenedCards = [];
    window.addEventListener('beforeprint', function () {
        reopenedCards = cards.filter(function (card) { return !card.classList.contains('is-open'); });
        reopenedCards.forEach(function (card) { card.classList.add('is-open'); });
    });
    window.addEventListener('afterprint', function () {
        reopenedCards.forEach(function (card) { card.classList.remove('is-open'); });
        reopenedCards = [];
    });

    // Dicas dos ícones de informação: abrem ao passar o mouse, ao focar com o teclado ou ao tocar
    const tips = $$('.pdi-tip');
    function closeTips(except) {
        tips.forEach(function (tip) { if (tip !== except) tip.classList.remove('is-open'); });
    }
    tips.forEach(function (tip) {
        const button = $('.pdi-tip-btn', tip);
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            const willOpen = !tip.classList.contains('is-open');
            closeTips(tip);
            tip.classList.toggle('is-open', willOpen);
        });
        ['mouseenter', 'focus'].forEach(function (name) {
            button.addEventListener(name, function () { tip.classList.remove('is-dismissed'); });
        });
    });
    document.addEventListener('click', function () { closeTips(); });
    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        tips.forEach(function (tip) {
            tip.classList.remove('is-open');
            tip.classList.add('is-dismissed');
        });
    });

    // Radar de competências gerado a partir dos cartões
    const radar = $('#pdi-radar');
    if (radar) {
        const items = $$('[data-radar]')
            .map(function (el) {
                return {
                    axis: Number(el.dataset.axis),
                    label: el.dataset.label,
                    current: Number(el.dataset.current),
                    target: Number(el.dataset.target)
                };
            })
            .sort(function (a, b) { return a.axis - b.axis; });

        const cx = 230, cy = 185, radius = 120, max = 10, n = items.length;
        const angle = function (i) { return (-90 + (360 / n) * i) * Math.PI / 180; };
        const point = function (i, value) {
            const r = radius * value / max;
            return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
        };
        const polygon = function (key) {
            return items.map(function (item, i) { return point(i, item[key]).map(function (v) { return v.toFixed(1); }).join(','); }).join(' ');
        };

        let svg = '';
        [2, 4, 6, 8, 10].forEach(function (level) {
            const ring = items.map(function (_, i) { return point(i, level).map(function (v) { return v.toFixed(1); }).join(','); }).join(' ');
            svg += '<polygon class="grid-ring" points="' + ring + '"/>';
        });
        items.forEach(function (_, i) {
            const end = point(i, max);
            svg += '<line class="grid-axis" x1="' + cx + '" y1="' + cy + '" x2="' + end[0].toFixed(1) + '" y2="' + end[1].toFixed(1) + '"/>';
        });
        [2, 4, 6, 8, 10].forEach(function (level) {
            svg += '<text class="ring-label" x="' + (cx + 4) + '" y="' + (cy - radius * level / max + 3) + '">' + level + '</text>';
        });
        svg += '<polygon class="shape shape-goal" points="' + polygon('target') + '"/>';
        svg += '<polygon class="shape shape-now" points="' + polygon('current') + '"/>';
        items.forEach(function (item, i) {
            const goalPoint = point(i, item.target);
            svg += '<circle class="shape dot-goal" cx="' + goalPoint[0].toFixed(1) + '" cy="' + goalPoint[1].toFixed(1) + '" r="3.5"/>';
        });
        items.forEach(function (item, i) {
            const p = point(i, item.current);
            svg += '<circle class="shape dot-now" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4"/>';
            const cos = Math.cos(angle(i));
            const sin = Math.sin(angle(i));
            const lx = (cx + (radius + 16) * cos).toFixed(1);
            const ly = cy + (radius + 16) * sin;
            const anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
            // Nome e valores ocupam duas linhas, posicionadas conforme o lado do gráfico
            const nameY = sin < -0.5 ? ly - 16 : sin > 0.5 ? ly + 11 : ly - 1;
            const valueY = nameY + 14;
            svg += '<text class="axis-label" x="' + lx + '" y="' + nameY.toFixed(1) + '" text-anchor="' + anchor + '">' + item.label + '</text>';
            svg += '<text class="axis-value" x="' + lx + '" y="' + valueY.toFixed(1) + '" text-anchor="' + anchor + '"><tspan class="v-now">' + item.current + '</tspan><tspan class="v-arrow"> → </tspan><tspan class="v-goal">' + item.target + '</tspan></text>';
        });
        radar.setAttribute('aria-label', 'Radar com o nível efetivo e o desejável de cada competência, de 0 a 10: ' + items.map(function (item) {
            return item.label + ', efetivo ' + item.current + ' e desejável ' + item.target;
        }).join('; '));
        radar.innerHTML = svg;
    }
}());
