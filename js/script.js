// ===================================
// CARREGAR HEADER E FOOTER
// ===================================
async function loadComponent(elementId, componentPath) {
    try {
        // Usar caminho relativo sem barra inicial para funcionar em mobile
        const response = await fetch(componentPath);
        if (response.ok) {
            const html = await response.text();
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
                console.log(`✅ ${componentPath} carregado`);
            }
        } else {
            console.error(`Erro ${response.status} ao carregar ${componentPath}`);
        }
    } catch (error) {
        console.error(`Erro ao carregar ${componentPath}:`, error);
    }
}

// Destacar página ativa no menu
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===================================
// MENU MOBILE
// ===================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Fechar menu ao clicar em um link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        // Fechar menu ao clicar fora dele
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }

    // ===================================
    // SCROLL SUAVE
    // ===================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===================================
    // HEADER STICKY COM BACKGROUND
    // ===================================
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ===================================
    // ANIMAÇÃO DE DIGITAÇÃO (TYPING TEXT)
    // ===================================
    const typingText = document.querySelector('.typing-text');
    
    if (typingText) {
        const texts = [
            'Machine Learning',
            'Inteligência Artificial',
            'Ciência de Dados',
            'Deep Learning',
            'Data Analytics'
        ];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeText() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingText.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000; // Pausa no final
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500; // Pausa antes de começar a digitar novamente
            }

            setTimeout(typeText, typeSpeed);
        }

        typeText();
    }

    // ===================================
    // ANIMAÇÃO DE SCROLL (INTERSECTION OBSERVER)
    // ===================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.summary-card, .project-card, .article-card, .skill-category, .timeline-item, .cert-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Adicionar classe quando elemento está visível
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // ===================================
    // ANIMAÇÃO DE BARRAS DE SKILL
    // ===================================
    const skillBars = document.querySelectorAll('.skill-fill');
    
    const skillObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.style.width;
                entry.target.style.width = '0';
                setTimeout(() => {
                    entry.target.style.width = width;
                }, 100);
                skillObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    skillBars.forEach(bar => skillObserver.observe(bar));

    // ===================================
    // FILTRO DE PROJETOS
    // ===================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.project-detailed');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remover active de todos os botões
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Adicionar active no botão clicado
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');

                projects.forEach(project => {
                    const category = project.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        project.style.display = 'grid';
                        setTimeout(() => {
                            project.style.opacity = '1';
                            project.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        project.style.opacity = '0';
                        project.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            project.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ===================================
    // FORMULÁRIO DE CONTATO
    // ===================================
    // Formulário agora usa FormSubmit - não precisa interceptar o submit

    // ===================================
    // NEWSLETTER FORM
    // ===================================
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const button = this.querySelector('button');
            
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscrevendo...';
            
            setTimeout(() => {
                alert('Obrigado por se inscrever! Você receberá atualizações em: ' + email);
                button.disabled = false;
                button.textContent = 'Inscrever';
                this.reset();
            }, 1500);
        });
    }

    // ===================================
    // CONTADOR DE ESTATÍSTICAS (NÚMEROS ANIMADOS)
    // ===================================
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const countUp = (element, target) => {
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    };

    const statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.textContent);
                countUp(entry.target, target);
                statObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    statNumbers.forEach(stat => statObserver.observe(stat));

    // ===================================
    // BOTÃO VOLTAR AO TOPO
    // ===================================
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.style.display = 'flex';
            } else {
                backToTopButton.style.display = 'none';
            }
        });

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ===================================
    // PREVENÇÃO DE ENVIO ACIDENTAL DE FORMULÁRIOS
    // ===================================
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                } else {
                    field.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Por favor, preencha todos os campos obrigatórios.');
            }
        });
    });

    // ===================================
    // LAZY LOADING DE IMAGENS
    // ===================================
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // ===================================
    // ADICIONAR EFEITO DE HOVER NOS CARDS
    // ===================================
    const cards = document.querySelectorAll('.summary-card, .project-card, .article-card, .cert-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // ===================================
    // COPIAR EMAIL AO CLICAR
    // ===================================
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const email = this.getAttribute('href').replace('mailto:', '');
            
            // Tentar copiar para área de transferência
            if (navigator.clipboard) {
                navigator.clipboard.writeText(email).then(() => {
                    // Mostrar feedback visual
                    const originalText = this.textContent;
                    this.textContent = 'Email copiado!';
                    this.style.color = '#10b981';
                    
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.color = '';
                    }, 2000);
                });
            }
        });
    });

    // ===================================
    // ADICIONAR ANO ATUAL NO FOOTER
    // ===================================
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = footerYear.innerHTML.replace('2025', currentYear);
    }

    console.log('🚀 Portfólio Ana Beatriz - Carregado com sucesso!');
}

// ===================================
// INICIALIZAÇÃO PRINCIPAL
// ===================================
document.addEventListener('DOMContentLoaded', async function() {
    // Carregar header e footer
    await loadComponent('header-placeholder', 'components/header.html');
    await loadComponent('footer-placeholder', 'components/footer.html');
    
    // Aguardar um momento para o DOM atualizar
    setTimeout(() => {
        // Destacar página ativa no menu
        try {
            highlightActivePage();
        } catch (e) {
            console.warn('highlightActivePage failed:', e);
        }

        // Inicializar menu mobile
        try {
            initMobileMenu();
        } catch (e) {
            console.warn('initMobileMenu failed:', e);
        }

        // Inicializar outras funcionalidades com proteção para evitar que uma falha pare o carregamento
        const inits = [
            'initScrollEffects',
            'initTypingAnimation',
            'initProjectFilters',
            'initContactForm',
            'initAnimations'
        ];

        inits.forEach(name => {
            try {
                const fn = window[name];
                if (typeof fn === 'function') fn();
                else console.debug(`${name} não definida — pulando.`);
            } catch (err) {
                console.warn(`${name} threw:`, err);
            }
        });

        // Sempre tentar inicializar o carrossel (independente das outras funções)
        try {
            initCertCarousel();
        } catch (e) {
            console.error('initCertCarousel failed:', e);
        }

        console.log('🚀 Portfólio Ana Beatriz - Carregado com sucesso!');
    }, 100);
});

// ===================================
// CARROSSEL DE CERTIFICAÇÕES
// ===================================
function initCertCarousel() {
    const viewport = document.querySelector('.cert-viewport');
    const track = document.querySelector('.cert-track');
    const prevBtn = document.querySelector('.cert-prev');
    const nextBtn = document.querySelector('.cert-next');

    console.debug('initCertCarousel: viewport', !!viewport, 'track', !!track, 'prevBtn', !!prevBtn, 'nextBtn', !!nextBtn);

    if (!viewport || !track) {
        console.warn('initCertCarousel: required elements not found, aborting.');
        return;
    }

    const items = Array.from(track.children);
    let currentIndex = 0;

    function parseGapPx(el) {
        const gap = getComputedStyle(el).gap || getComputedStyle(el).columnGap || '0px';
        if (gap.endsWith('px')) return parseFloat(gap);
        if (gap.endsWith('rem')) return parseFloat(gap) * parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
        return parseFloat(gap) || 0;
    }

    function getParams() {
        const gapPx = parseGapPx(track);
        const itemWidth = items[0].getBoundingClientRect().width + gapPx;
        const viewportWidth = viewport.getBoundingClientRect().width;
        const maxVisible = Math.max(1, Math.floor(viewportWidth / itemWidth));
        const maxIndex = Math.max(0, items.length - maxVisible);
        return { gapPx, itemWidth, viewportWidth, maxVisible, maxIndex };
    }

    function update() {
        const { itemWidth, maxIndex } = getParams();

        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxIndex) currentIndex = maxIndex;

        const offset = -(currentIndex * itemWidth);
        track.style.transform = `translateX(${offset}px)`;

        // atualizar estado dos botões (se existirem)
        if (prevBtn) prevBtn.disabled = currentIndex <= 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            // move by one item width backwards in px mode
            try {
                const { itemWidth } = getParams();
                pxOffset -= itemWidth;
                if (originalTrackWidth > 0) {
                    while (pxOffset < 0) pxOffset += originalTrackWidth;
                    pxOffset = pxOffset % originalTrackWidth;
                    track.style.transform = `translateX(${-pxOffset}px)`;
                }
            } catch (e) {
                // fallback to index mode
                currentIndex -= 1;
                update();
            }
            // pause autoplay briefly on manual interaction
            pauseAutoplayTemporarily();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            try {
                const { itemWidth } = getParams();
                pxOffset += itemWidth;
                if (originalTrackWidth > 0) pxOffset = pxOffset % originalTrackWidth;
                track.style.transform = `translateX(${-pxOffset}px)`;
            } catch (e) {
                currentIndex += 1;
                update();
            }
            pauseAutoplayTemporarily();
        });
    }

    // ===================================
    // AUTOPLAY CONTÍNUO (PIXEL-BASED, INFINITO)
    // ===================================
    const carouselEl = document.querySelector('.cert-carousel');
    let rafId = null;
    let lastTime = null;
    let pxOffset = 0;
    let originalTrackWidth = 0;
    let autoplaySpeed = 80; // pixels per second (aumentado)
    let isPaused = false;

    // duplicate items to allow seamless loop (duplicate only once)
    function ensureDuplicate() {
        if (track.dataset.duplicated === 'true') return;
        const children = Array.from(track.children);
        if (children.length === 0) return;
        const originalCount = children.length;
        // clone only the original set and append
        const clones = children.slice(0, originalCount).map(node => node.cloneNode(true));
        clones.forEach(c => c.removeAttribute && c.removeAttribute('id'));
        clones.forEach(c => track.appendChild(c));
        track.dataset.duplicated = 'true';
    }

    function recalcWidths() {
        // originalTrackWidth should be width of the first set of items
        const itemsNow = Array.from(track.children);
        const half = Math.floor(itemsNow.length / 2) || itemsNow.length;
        let width = 0;
        const gapPx = parseGapPx(track);
        for (let i = 0; i < half; i++) {
            width += itemsNow[i].getBoundingClientRect().width + gapPx;
        }
        originalTrackWidth = width;
    }

    function step(now) {
        if (lastTime == null) lastTime = now;
        const dt = (now - lastTime) / 1000; // seconds
        lastTime = now;
        if (!isPaused) {
            pxOffset += autoplaySpeed * dt;
            if (originalTrackWidth > 0) {
                // wrap (use modulo to keep value small)
                pxOffset = pxOffset % originalTrackWidth;
                // avoid tiny floating rounding jumping at exact boundary
                if (Math.abs(pxOffset - originalTrackWidth) < 0.0001) pxOffset = 0;
                track.style.transform = `translateX(${-pxOffset}px)`;
            }
        }
        rafId = requestAnimationFrame(step);
    }

    // AUTOPLAY: prefer CSS animation for seamless loop, fallback to RAF step
    let cssAnimStyleEl = null;
    const cssAnimName = 'certScrollAnim';

    function stopRaf() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
            lastTime = null;
        }
    }

    function startCssAnimation() {
        stopRaf();
        if (!originalTrackWidth || originalTrackWidth <= 0) return startRaf();
        const duration = Math.max(4, originalTrackWidth / autoplaySpeed);
        // remove previous style if exists
        if (cssAnimStyleEl) cssAnimStyleEl.remove();
        cssAnimStyleEl = document.createElement('style');
        cssAnimStyleEl.textContent = `@keyframes ${cssAnimName} { 0% { transform: translateX(0); } 100% { transform: translateX(-${originalTrackWidth}px); } }`;
        document.head.appendChild(cssAnimStyleEl);
        track.style.animation = `${cssAnimName} ${duration}s linear infinite`;
        track.style.willChange = 'transform';
        if (carouselEl) carouselEl.classList.add('autoplay');
    }

    function stopCssAnimation() {
        if (cssAnimStyleEl) {
            cssAnimStyleEl.remove();
            cssAnimStyleEl = null;
        }
        if (track) track.style.animation = '';
        if (carouselEl) carouselEl.classList.remove('autoplay');
    }

    function startRaf() {
        isPaused = false;
        if (!rafId) {
            lastTime = null;
            rafId = requestAnimationFrame(step);
            if (carouselEl) carouselEl.classList.add('autoplay');
        }
    }

    function startAutoplay() {
        // prefer CSS animation for smooth looping
        if (originalTrackWidth > 0) startCssAnimation(); else startRaf();
    }

    function stopAutoplay() {
        stopCssAnimation();
        stopRaf();
    }

    function pauseAutoplayTemporarily() {
        stopAutoplay();
        setTimeout(() => startAutoplay(), 2000);
    }

    // interactions to pause/resume
    viewport.addEventListener('mouseenter', () => {
        // pause css animation or raf
        if (track && track.style.animation) track.style.animationPlayState = 'paused';
        isPaused = true;
        stopRaf();
    });
    viewport.addEventListener('mouseleave', () => {
        if (track && track.style.animation) track.style.animationPlayState = 'running';
        isPaused = false;
        // if css animation present, it will run; otherwise restart raf
        if (!track.style.animation) startRaf();
    });
    viewport.addEventListener('pointerdown', () => {
        if (track && track.style.animation) track.style.animationPlayState = 'paused';
        isPaused = true;
        stopRaf();
    });
    viewport.addEventListener('pointerup', () => { pauseAutoplayTemporarily(); });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    // Swipe support
    let startX = 0;
    let isDown = false;

    viewport.addEventListener('pointerdown', (e) => {
        isDown = true;
        startX = e.clientX;
    });

    viewport.addEventListener('pointerup', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        if (dx > 30) currentIndex -= 1;
        if (dx < -30) currentIndex += 1;
        update();
        isDown = false;
    });

    window.addEventListener('resize', update);
    // Aguarda imagens do track carregarem antes de calcular tamanhos e iniciar autoplay
    const imgs = Array.from(track.querySelectorAll('img'));

    function imagesLoaded(elements) {
        return new Promise(resolve => {
            if (elements.length === 0) return resolve();
            let remaining = elements.length;
            elements.forEach(img => {
                if (img.complete && img.naturalWidth > 0) {
                    remaining -= 1;
                    if (remaining === 0) resolve();
                } else {
                    img.addEventListener('load', () => {
                        remaining -= 1;
                        if (remaining === 0) resolve();
                    }, { once: true });
                    img.addEventListener('error', () => {
                        remaining -= 1;
                        if (remaining === 0) resolve();
                    }, { once: true });
                }
            });
        });
    }

    imagesLoaded(imgs).then(() => {
        // inicializar estado e autoplay após imagens prontas
        update();
        try {
            ensureDuplicate();
            recalcWidths();
        } catch (e) {
            console.warn('carousel duplication/recalc failed:', e);
        }
        startAutoplay();
    }).catch(() => {
        // fallback: mesmo que alguma imagem falhe, inicializa após curto delay
        setTimeout(() => {
            update();
            try {
                ensureDuplicate();
                recalcWidths();
            } catch (e) {
                console.warn('carousel duplication/recalc failed (fallback):', e);
            }
            startAutoplay();
        }, 300);
    });
}

// ===================================
// PREVENIR SCROLL HORIZONTAL
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.overflowX = 'hidden';
});
