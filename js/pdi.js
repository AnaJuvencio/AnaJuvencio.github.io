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

    // Foto ampliada: abre ao clicar numa foto do mosaico e volta para a miniatura ao fechar
    const lightbox = (function () {
        const root = document.createElement('div');
        root.className = 'pdi-lightbox';
        root.hidden = true;
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-label', 'Foto ampliada');
        root.innerHTML =
            '<button class="pdi-lb-close" type="button" aria-label="Fechar foto"><i class="fas fa-xmark" aria-hidden="true"></i></button>' +
            '<button class="pdi-lb-nav pdi-lb-prev" type="button" aria-label="Foto anterior"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>' +
            '<button class="pdi-lb-nav pdi-lb-next" type="button" aria-label="Próxima foto"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>' +
            '<figure class="pdi-lb-figure"><div class="pdi-lb-frame"><img alt="" draggable="false"></div><figcaption></figcaption></figure>';
        document.body.appendChild(root);

        const frame = $('.pdi-lb-frame', root);
        const img = $('img', root);
        const caption = $('figcaption', root);
        const closeButton = $('.pdi-lb-close', root);
        const prevButton = $('.pdi-lb-prev', root);
        const nextButton = $('.pdi-lb-next', root);
        let group = [];
        let index = 0;
        let opener = null;
        let hideTimer = null;

        // Anima a moldura entre a posição da miniatura e a posição ampliada
        function transformFrom(tile) {
            const from = tile.getBoundingClientRect();
            const to = frame.getBoundingClientRect();
            if (!to.width) return '';
            const dx = from.left + from.width / 2 - (to.left + to.width / 2);
            const dy = from.top + from.height / 2 - (to.top + to.height / 2);
            return 'translate(' + dx + 'px, ' + dy + 'px) scale(' + from.width / to.width + ')';
        }

        function show(i, animateFrom) {
            index = (i + group.length) % group.length;
            const source = $('img', group[index]);
            const url = source.currentSrc || source.src;
            img.src = url;
            img.alt = source.alt;
            frame.style.setProperty('--lb-bg', 'url("' + url + '")');
            caption.textContent = source.alt + (group.length > 1 ? ' · ' + (index + 1) + ' de ' + group.length : '');
            prevButton.hidden = nextButton.hidden = group.length < 2;
            if (animateFrom && !reduceMotion) {
                frame.style.transition = 'none';
                frame.style.transform = transformFrom(animateFrom);
                frame.getBoundingClientRect();
                frame.style.transition = '';
                frame.style.transform = '';
            }
        }

        function open(tiles, i) {
            clearTimeout(hideTimer);
            group = tiles;
            opener = tiles[i];
            root.hidden = false;
            document.documentElement.classList.add('pdi-lb-open');
            show(i, opener);
            root.getBoundingClientRect();
            root.classList.add('is-open');
            closeButton.focus();
        }

        function close() {
            if (root.hidden) return;
            const tile = group[index];
            root.classList.remove('is-open');
            if (!reduceMotion) frame.style.transform = transformFrom(tile);
            hideTimer = setTimeout(function () {
                root.hidden = true;
                frame.style.transform = '';
                document.documentElement.classList.remove('pdi-lb-open');
            }, reduceMotion ? 0 : 350);
            if (opener) tile.focus({ preventScroll: true });
        }

        closeButton.addEventListener('click', close);
        prevButton.addEventListener('click', function () { show(index - 1); });
        nextButton.addEventListener('click', function () { show(index + 1); });
        root.addEventListener('click', function (event) {
            if (event.target === root || event.target === $('.pdi-lb-figure', root)) close();
        });

        document.addEventListener('keydown', function (event) {
            if (root.hidden) return;
            if (event.key === 'Escape') close();
            else if (event.key === 'ArrowLeft' && group.length > 1) show(index - 1);
            else if (event.key === 'ArrowRight' && group.length > 1) show(index + 1);
            else if (event.key === 'Tab') {
                const focusable = [closeButton, prevButton, nextButton].filter(function (el) { return !el.hidden; });
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        });

        // Deslizar o dedo para o lado troca de foto
        let touchX = null;
        root.addEventListener('touchstart', function (event) { touchX = event.touches[0].clientX; }, { passive: true });
        root.addEventListener('touchend', function (event) {
            if (touchX === null || group.length < 2) return;
            const delta = event.changedTouches[0].clientX - touchX;
            touchX = null;
            if (Math.abs(delta) > 50) show(index + (delta < 0 ? 1 : -1));
        }, { passive: true });

        return { open: open };
    })();

    // Linha do tempo da trajetória: arrastar/deslizar, setas e destaque da etapa em foco
    $$('[data-timeline]').forEach(function (root) {
        const viewport = $('.pdi-tl-viewport', root);
        const track = $('.pdi-tl-track', root);
        const items = $$('.pdi-tl-item', root);
        const prev = $('[data-dir="-1"]', root);
        const next = $('[data-dir="1"]', root);
        const bar = $('.pdi-tl-bar span', root);
        const count = $('.pdi-tl-count', root);
        const behavior = reduceMotion ? 'auto' : 'smooth';
        let active = -1;
        let ticking = false;

        function centerOf(item) { return item.offsetLeft + item.offsetWidth / 2; }

        // Ramificações: cada botão mostra a face do cartão com o mesmo data-face
        const branches = items.map(function (item, n) {
            const chips = $$('.pdi-tl-chip', item);
            const faces = $$('.pdi-tl-face', item);
            chips.forEach(function (chip, c) {
                const face = faces.find(function (f) { return f.dataset.face === chip.dataset.face; });
                chip.id = 'tl-chip-' + n + '-' + c;
                chip.setAttribute('role', 'tab');
                if (face) {
                    face.id = 'tl-face-' + n + '-' + c;
                    face.setAttribute('role', 'tabpanel');
                    face.setAttribute('aria-labelledby', chip.id);
                    chip.setAttribute('aria-controls', face.id);
                }
            });

            function show(name) {
                chips.forEach(function (chip) {
                    const on = chip.dataset.face === name;
                    chip.setAttribute('aria-selected', String(on));
                    chip.tabIndex = on ? 0 : -1;
                });
                faces.forEach(function (face) {
                    const on = face.dataset.face === name;
                    face.classList.toggle('is-on', on);
                    face.inert = !on;
                });
            }

            chips.forEach(function (chip, c) {
                chip.addEventListener('click', function () { touched(); show(chip.dataset.face); });
                chip.addEventListener('keydown', function (event) {
                    let to = null;
                    if (event.key === 'ArrowRight') to = (c + 1) % chips.length;
                    else if (event.key === 'ArrowLeft') to = (c - 1 + chips.length) % chips.length;
                    if (to === null) return;
                    event.preventDefault();
                    chips[to].focus();
                    show(chips[to].dataset.face);
                });
            });

            show('main');
            return show;
        });

        function goTo(index) {
            const item = items[Math.max(0, Math.min(items.length - 1, index))];
            viewport.scrollTo({ left: centerOf(item) - viewport.clientWidth / 2, behavior: behavior });
        }

        function update() {
            ticking = false;
            const middle = viewport.scrollLeft + viewport.clientWidth / 2;
            let nearest = 0;
            items.forEach(function (item, i) {
                if (Math.abs(centerOf(item) - middle) < Math.abs(centerOf(items[nearest]) - middle)) nearest = i;
            });
            if (nearest === active) return;
            if (active !== -1) branches[active]('main');
            active = nearest;
            items.forEach(function (item, i) {
                item.classList.toggle('is-active', i === active);
                if (i === active) item.setAttribute('aria-current', 'step');
                else item.removeAttribute('aria-current');
            });
            track.style.setProperty('--tl-fill', centerOf(items[active]) + 'px');
            root.style.setProperty('--tl-progress', String((active + 1) / items.length));
            count.textContent = 'Etapa ' + (active + 1) + ' de ' + items.length;
            prev.disabled = active === 0;
            next.disabled = active === items.length - 1;
        }

        function touched() { root.classList.add('is-touched'); }

        viewport.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });

        prev.addEventListener('click', function () { touched(); goTo(active - 1); });
        next.addEventListener('click', function () { touched(); goTo(active + 1); });

        items.forEach(function (item, i) {
            item.addEventListener('click', function () {
                if (!dragged && i !== active) { touched(); goTo(i); }
            });
        });

        viewport.addEventListener('keydown', function (event) {
            if (event.target !== viewport) return;
            const keys = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: items.length - 1 };
            if (!(event.key in keys)) return;
            event.preventDefault();
            touched();
            goTo(keys[event.key]);
        });

        // Toque já rola nativamente; para o mouse, arrastar com o botão pressionado
        let dragging = false;
        let dragged = false;
        let startX = 0;
        let startScroll = 0;

        viewport.addEventListener('pointerdown', function (event) {
            if (event.pointerType !== 'mouse' || event.button !== 0) return;
            dragging = true;
            dragged = false;
            startX = event.clientX;
            startScroll = viewport.scrollLeft;
        });

        window.addEventListener('pointermove', function (event) {
            if (!dragging) return;
            const delta = event.clientX - startX;
            if (!dragged && Math.abs(delta) > 5) {
                dragged = true;
                touched();
                viewport.classList.add('is-dragging');
            }
            if (dragged) viewport.scrollLeft = startScroll - delta;
        });

        function release() {
            if (!dragging) return;
            dragging = false;
            if (!dragged) return;
            viewport.classList.remove('is-dragging');
            update();
            goTo(active);
            setTimeout(function () { dragged = false; }, 0);
        }
        window.addEventListener('pointerup', release);
        window.addEventListener('pointercancel', release);

        viewport.addEventListener('touchstart', touched, { passive: true });
        viewport.addEventListener('wheel', touched, { passive: true });
        window.addEventListener('resize', function () { active = -1; update(); goTo(Math.max(active, 0)); });
        window.addEventListener('load', function () { viewport.scrollTo({ left: centerOf(items[0]) - viewport.clientWidth / 2 }); update(); });

        // Fotos do mosaico: só a etapa em foco abre a foto ampliada
        items.forEach(function (item, n) {
            const tiles = $$('.pdi-tl-tile:not(.pdi-tl-tile-empty)', item);
            tiles.forEach(function (tile, t) {
                tile.tabIndex = 0;
                tile.setAttribute('role', 'button');
                tile.setAttribute('aria-label', 'Ampliar foto: ' + $('img', tile).alt);
                function activate() {
                    if (n !== active) { touched(); goTo(n); return; }
                    lightbox.open(tiles, t);
                }
                tile.addEventListener('click', function () { if (!dragged && n === active) lightbox.open(tiles, t); });
                tile.addEventListener('keydown', function (event) {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    activate();
                });
            });
        });

        viewport.scrollLeft = centerOf(items[0]) - viewport.clientWidth / 2;
        update();
    });

    // Abas acessíveis (metas, MBTI)
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
