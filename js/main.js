/**
 * 承古建筑官网 — Main JS v4.2
 * 修复: GSAP动画可靠性 + 安全回退
 */

document.addEventListener('DOMContentLoaded', function () {

    // ===== DOM 缓存 =====
    var nav = document.getElementById('nav');
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    var scrollProgress = document.getElementById('scrollProgress');
    var backTop = document.getElementById('backTop');
    var contactForm = document.getElementById('contactForm');
    var sections = document.querySelectorAll('section[id]');
    var navItems = navLinks.querySelectorAll('a:not(.nav-cta)');

    // ===== 导航切换 =====
    navToggle.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // ===== 平滑滚动 =====
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                var offset = nav.offsetHeight + 16;
                window.scrollTo({
                    top: target.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== 合并滚动事件（requestAnimationFrame 节流）=====
    var ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(function () {
                var scrollTop = window.pageYOffset;
                var docHeight = document.documentElement.scrollHeight - window.innerHeight;

                // 滚动进度条
                if (scrollProgress) {
                    scrollProgress.style.width = (scrollTop / docHeight * 100) + '%';
                }

                // 导航滚动状态
                nav.classList.toggle('scrolled', scrollTop > 50);

                // 回到顶部
                if (backTop) {
                    backTop.classList.toggle('visible', scrollTop > 600);
                }

                // 导航高亮
                var current = '';
                sections.forEach(function (section) {
                    if (scrollTop >= section.offsetTop - 120) {
                        current = section.getAttribute('id');
                    }
                });
                navItems.forEach(function (item) {
                    item.classList.toggle('active', item.getAttribute('href') === '#' + current);
                });

                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // 回到顶部点击
    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== 图片加载 =====
    function handleImageLoad(img) {
        if (img.complete && img.naturalWidth > 0) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function () {
                img.classList.add('loaded');
            });
            img.addEventListener('error', function () {
                // 图片加载失败也显示（避免永远隐藏）；画廊备选图保持隐藏，防止盖住当前画面
                img.classList.add('loaded');
                if (!img.closest('.case-gallery')) {
                    img.style.opacity = '0.3';
                }
            });
        }
    }

    document.querySelectorAll('img').forEach(handleImageLoad);

    // ===== FAQ 手风琴 =====
    document.querySelectorAll('.faq-q').forEach(function (button) {
        button.addEventListener('click', function () {
            var faqItem = this.parentElement;
            var answer = faqItem.querySelector('.faq-a');
            var isActive = faqItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(function (item) {
                item.classList.remove('active');
                item.querySelector('.faq-a').style.maxHeight = '0';
            });

            if (!isActive) {
                faqItem.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // ===== 表单提交 =====
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = this.querySelector('.btn-submit');
            var originalText = btn.textContent;
            btn.textContent = '提交中...';
            btn.disabled = true;

            setTimeout(function () {
                var toast = document.createElement('div');
                toast.className = 'toast-success';
                toast.innerHTML = '<span class="toast-icon">✓</span> 感谢您的咨询！我们将尽快与您联系。';
                document.body.appendChild(toast);

                setTimeout(function () { toast.classList.add('show'); }, 10);
                setTimeout(function () {
                    toast.classList.remove('show');
                    setTimeout(function () { toast.remove(); }, 400);
                }, 3000);

                contactForm.reset();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 800);
        });
    }
    // contactForm removed — no form on page

    // ===== 3D 卡片鼠标倾斜 =====
    document.querySelectorAll('.case-card, .adv-item, .testi-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect = this.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var cx = rect.width / 2;
            var cy = rect.height / 2;
            var rx = (y - cy) / cy * -6;
            var ry = (x - cx) / cx * 6;
            this.style.transform = 'translateY(-8px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(1.02)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });

    // ===== 案例多图按钮切换（document 级事件委托，免疫绑定时序与缓存差异） =====
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.case-tabs button');
        if (!btn || btn.classList.contains('active')) return;
        var tabs = btn.closest('.case-tabs');
        var card = btn.closest('.case-card');
        if (!tabs || !card) return;
        var btns = tabs.querySelectorAll('button');
        var idx = Array.prototype.indexOf.call(btns, btn);
        btns.forEach(function (b, i) {
            b.classList.toggle('active', i === idx);
            b.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
        });
        var imgs = card.querySelectorAll('img');
        imgs.forEach(function (img, i) {
            img.classList.toggle('active', i === idx);
        });
    });

    // 悬停/触摸到画廊卡片时，立即解除懒加载，把备用视角图提前拉下来
    document.addEventListener('pointerover', function (e) {
        var card = e.target.closest('.case-gallery');
        if (!card || card.dataset.eager) return;
        card.dataset.eager = '1';
        card.querySelectorAll('img[loading]').forEach(function (img) {
            img.loading = 'eager';
        });
    }, { passive: true });

    // ===== GSAP 动效 =====
    var gsapLoaded = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    if (gsapLoaded) {
        gsap.registerPlugin(ScrollTrigger);

        // Hero 入场动画 — 用 set() 先隐藏，再 to() 显示
        var heroEls = ['.hero-tag', '.hero-desc', '.hero-actions', '.hero-stats', '.hero-scroll'];
        heroEls.forEach(function (sel) {
            var el = document.querySelector(sel);
            if (el) gsap.set(el, { opacity: 0, y: 20 });
        });

        document.querySelectorAll('.hero h1 .line').forEach(function (line) {
            gsap.set(line, { opacity: 0, y: 40 });
        });

        var heroTl = gsap.timeline({ delay: 0.3 });

        heroTl
            .to('.hero-tag', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
            .to('.hero h1 .line', { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '-=0.4')
            .to('.hero-desc', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
            .to('.hero-actions', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
            .to('.hero-stats', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2')
            .to('.hero-scroll', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.1');

        // Hero 数字计数
        document.querySelectorAll('.hero-stat-num').forEach(function (el) {
            var target = parseInt(el.getAttribute('data-count'));
            if (!target) return;
            var obj = { val: 0 };
            el.textContent = '0';
            heroTl.add(function () {
                gsap.to(obj, {
                    val: target, duration: 1.5, ease: 'power2.out',
                    onUpdate: function () { el.textContent = Math.floor(obj.val); }
                });
            }, '-=0.5');
        });

        // Hero 背景视差
        gsap.to('.hero-bg img', {
            yPercent: 20, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });

        // 通用 ScrollTrigger 动画配置
        var scrollAnims = [
            { sel: '.trust-item', trigger: '.trust-banner', from: { opacity: 0, y: 20 }, stagger: 0.1 },
            { sel: '.about-narrative p', trigger: '.about-narrative', from: { opacity: 0, y: 30 }, stagger: 0.15 },
            { sel: '.highlight-card', trigger: '.about-highlights', from: { opacity: 0, scale: 0.9 }, stagger: 0.1, ease: 'back.out(1.7)' },
            { sel: '.service-card', trigger: '.services-grid', from: { opacity: 0, y: 40 }, stagger: 0.08 },
            { sel: '.case-card', trigger: '.cases-grid', from: { opacity: 0, y: 40, scale: 0.97 }, stagger: 0.12 },
            { sel: '.adv-item', trigger: '.adv-grid', from: { opacity: 0, y: 30 }, stagger: 0.08 },
            { sel: '.process-item', trigger: '.process-grid', from: { opacity: 0, y: 30 }, stagger: 0.1 },
            { sel: '.testi-card', trigger: '.testi-grid', from: { opacity: 0, y: 30 }, stagger: 0.1 },
            { sel: '.faq-item', trigger: '.faq-list', from: { opacity: 0, x: -20 }, stagger: 0.08 },
            { sel: '.film-frame', trigger: '.film-frame', from: { opacity: 0, y: 40, scale: 0.98 }, stagger: 0.1 },
        ];

        scrollAnims.forEach(function (anim) {
            gsap.from(anim.sel, Object.assign({
                duration: 0.6,
                ease: anim.ease || 'power2.out',
                stagger: anim.stagger,
                scrollTrigger: {
                    trigger: anim.trigger,
                    start: 'top 95%',
                    once: true
                }
            }, anim.from));
        });

        // About visual
        gsap.from('.visual-main', {
            opacity: 0, x: 60, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: '.about-visual', start: 'top 95%', once: true }
        });

        gsap.from('.visual-accent', {
            opacity: 0, scale: 0.5, rotation: -10, duration: 0.6, delay: 0.3, ease: 'back.out(2)',
            scrollTrigger: { trigger: '.about-visual', start: 'top 95%', once: true }
        });

        // Stats 数字动画
        document.querySelectorAll('[data-count]').forEach(function (el) {
            var target = parseInt(el.getAttribute('data-count'));
            var obj = { val: 0 };
            gsap.to(obj, {
                val: target, duration: 2, ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 95%', once: true },
                onUpdate: function () { el.textContent = Math.floor(obj.val); }
            });
        });

        gsap.from('.stats-grid', {
            opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: '.stats-grid', start: 'top 95%', once: true }
        });

        // CTA
        gsap.from('.cta-section h2, .cta-section p, .cta-actions', {
            opacity: 0, y: 30, stagger: 0.15, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: '.cta-section', start: 'top 95%', once: true }
        });

        // Section headers
        document.querySelectorAll('.section-header').forEach(function (header) {
            gsap.from(header, {
                opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
                scrollTrigger: { trigger: header, start: 'top 95%', once: true }
            });
        });

    } else {
        // ===== 无 GSAP 降级：所有元素默认可见，仅做简单淡入 =====
        console.log('GSAP not loaded, using fallback animations');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

        // 给所有区块添加淡入效果
        var animateEls = document.querySelectorAll(
            '.service-card, .case-card, .adv-item, .process-item, .testi-card, .faq-item, .highlight-card, .trust-item, .film-frame'
        );
        animateEls.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Hero 入场
        setTimeout(function () {
            var heroTag = document.querySelector('.hero-tag');
            if (heroTag) heroTag.style.opacity = '1';

            document.querySelectorAll('.hero h1 .line').forEach(function (line, i) {
                setTimeout(function () {
                    line.style.opacity = '1';
                    line.style.transform = 'translateY(0)';
                }, i * 120);
            });

            setTimeout(function () {
                var els = ['.hero-desc', '.hero-actions', '.hero-stats', '.hero-scroll'];
                els.forEach(function (sel) {
                    var el = document.querySelector(sel);
                    if (el) el.style.opacity = '1';
                });
            }, 600);
        }, 300);

        // 数字计数
        var countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var target = parseInt(el.getAttribute('data-count'));
                    if (!target) return;
                    var current = 0;
                    var increment = target / 50;
                    var timer = setInterval(function () {
                        current += increment;
                        if (current >= target) { current = target; clearInterval(timer); }
                        el.textContent = Math.floor(current);
                    }, 30);
                    countObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('[data-count]').forEach(function (el) {
            countObserver.observe(el);
        });
    }

    // ===== 安全回退：5秒后确保所有内容可见 =====
    setTimeout(function () {
        var hidden = document.querySelectorAll('[style*="opacity: 0"]');
        if (hidden.length > 0) {
            console.log('Safety fallback: showing ' + hidden.length + ' hidden elements');
            hidden.forEach(function (el) {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        }
    }, 5000);
});
