/**
 * 承古建筑官网 — Canvas 2D 粒子背景 v4.1
 * 替代Three.js，零依赖，~80行
 * 金色萤火虫 + 朱红点缀
 */

(function () {
    'use strict';

    window.addEventListener('load', function () {
        var heroBg = document.querySelector('.hero-bg');
        if (!heroBg) return;

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;';
        heroBg.appendChild(canvas);

        var W, H;
        var particles = [];
        var mouse = { x: 0, y: 0 };

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // 鼠标跟随
        document.addEventListener('mousemove', function (e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // 创建粒子
        function createParticle(color, minR, maxR) {
            var angle = Math.random() * Math.PI * 2;
            var radius = 100 + Math.random() * Math.max(W, H) * 0.4;
            return {
                x: W / 2 + Math.cos(angle) * radius,
                y: H / 2 + Math.sin(angle) * radius,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.2,
                r: minR + Math.random() * (maxR - minR),
                color: color,
                alpha: 0.1 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2,
                speed: 0.003 + Math.random() * 0.005
            };
        }

        // 金色粒子
        for (var i = 0; i < 80; i++) {
            particles.push(createParticle('176,141,87', 0.8, 2.2));
        }
        // 朱红点缀
        for (var j = 0; j < 15; j++) {
            particles.push(createParticle('194,59,34', 1, 2.5));
        }

        var time = 0;

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, W, H);
            time += 0.016;

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];

                // 浮动
                p.x += p.vx + Math.sin(time * p.speed * 60 + p.phase) * 0.15;
                p.y += p.vy + Math.cos(time * p.speed * 60 + p.phase) * 0.1;

                // 鼠标微弱吸引
                var dx = mouse.x - p.x;
                var dy = mouse.y - p.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 300) {
                    p.x += dx * 0.00003;
                    p.y += dy * 0.00003;
                }

                // 边界回收
                if (p.x < -50) p.x = W + 50;
                if (p.x > W + 50) p.x = -50;
                if (p.y < -50) p.y = H + 50;
                if (p.y > H + 50) p.y = -50;

                // 呼吸效果
                var breathe = 0.5 + 0.5 * Math.sin(time * 2 + p.phase);
                var alpha = p.alpha * (0.4 + 0.6 * breathe);

                // 绘制光晕
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + p.color + ',' + (alpha * 0.15) + ')';
                ctx.fill();

                // 绘制核心
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + p.color + ',' + alpha + ')';
                ctx.fill();
            }
        }

        animate();
        console.log('✨ Canvas 粒子背景已加载');
    });
})();
