/**
 * 承古建筑官网 — Hero 视觉特效
 * 飘落叶子 + 边缘金色光点 + 3D视差
 */

(function () {
    'use strict';

    window.addEventListener('load', function () {
        var heroBg = document.querySelector('.hero-bg');
        if (!heroBg) return;

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;';
        heroBg.appendChild(canvas);

        var W, H, centerX, centerY;
        var leaves = [];
        var sparks = [];
        var LEAF_COUNT = 28;
        var SPARK_COUNT = 40;
        var mouse = { x: 0, y: 0 };

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            centerX = W / 2;
            centerY = H / 2;
        }
        resize();
        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', function (e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // ===== 叶子绘制 =====
        function drawLeaf(x, y, size, rotation, alpha, color, glow) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.globalAlpha = alpha;

            // 光晕
            if (glow) {
                ctx.shadowColor = color;
                ctx.shadowBlur = size * 2;
            }

            // 叶片
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.bezierCurveTo(size * 0.7, -size * 0.5, size * 0.7, size * 0.4, 0, size);
            ctx.bezierCurveTo(-size * 0.7, size * 0.4, -size * 0.7, -size * 0.5, 0, -size);
            ctx.fillStyle = color;
            ctx.fill();

            // 叶脉
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.7);
            ctx.lineTo(0, size * 0.7);
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // 侧脉
            for (var i = -2; i <= 2; i++) {
                if (i === 0) continue;
                var py = i * size * 0.2;
                ctx.beginPath();
                ctx.moveTo(0, py);
                ctx.lineTo(i > 0 ? size * 0.3 : -size * 0.3, py - size * 0.1);
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            ctx.restore();
        }

        // 叶子颜色（更亮更饱和）
        var leafColors = [
            '#d4a84b',  // 亮金
            '#c4963a',  // 暖金
            '#b8883a',  // 深金
            '#e8c46a',  // 浅金
            '#c23b22',  // 朱红
            '#d47a3a',  // 琥珀
        ];

        // 创建叶子
        for (var i = 0; i < LEAF_COUNT; i++) {
            leaves.push({
                x: Math.random() * W,
                y: Math.random() * H * 1.5 - H * 0.5,
                size: 10 + Math.random() * 16,
                speedY: 0.4 + Math.random() * 0.8,
                speedX: (Math.random() - 0.5) * 0.3,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.025,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.008 + Math.random() * 0.015,
                wobbleAmp: 0.5 + Math.random() * 1,
                alpha: 0.35 + Math.random() * 0.5,
                color: leafColors[Math.floor(Math.random() * leafColors.length)],
                glow: Math.random() > 0.5
            });
        }

        // ===== 边缘金色光点 =====
        function createSpark() {
            var side = Math.floor(Math.random() * 4);
            var x, y;
            switch (side) {
                case 0: x = Math.random() * W; y = -10; break;
                case 1: x = W + 10; y = Math.random() * H; break;
                case 2: x = Math.random() * W; y = H + 10; break;
                case 3: x = -10; y = Math.random() * H; break;
            }
            return {
                x: x, y: y,
                size: 1.5 + Math.random() * 3,
                speedX: (centerX - x) * 0.0003 + (Math.random() - 0.5) * 0.3,
                speedY: (centerY - y) * 0.0003 + (Math.random() - 0.5) * 0.3,
                alpha: 0,
                maxAlpha: 0.3 + Math.random() * 0.5,
                fadeIn: true,
                life: 0,
                maxLife: 200 + Math.random() * 300,
                color: Math.random() > 0.8 ? '#c23b22' : '#d4a84b'
            };
        }

        for (var j = 0; j < SPARK_COUNT; j++) {
            var s = createSpark();
            s.life = Math.random() * s.maxLife;
            s.alpha = s.maxAlpha * 0.5;
            s.fadeIn = false;
            sparks.push(s);
        }

        // ===== 鼠标光晕 =====
        var mouseGlow = { x: centerX, y: centerY, size: 200 };

        // ===== 动画循环 =====
        var time = 0;

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, W, H);
            time += 0.01;

            // 鼠标光晕（缓慢跟随）
            mouseGlow.x += (mouse.x - mouseGlow.x) * 0.02;
            mouseGlow.y += (mouse.y - mouseGlow.y) * 0.02;

            var grad = ctx.createRadialGradient(
                mouseGlow.x, mouseGlow.y, 0,
                mouseGlow.x, mouseGlow.y, mouseGlow.size
            );
            grad.addColorStop(0, 'rgba(212, 168, 75, 0.06)');
            grad.addColorStop(0.5, 'rgba(212, 168, 75, 0.02)');
            grad.addColorStop(1, 'rgba(212, 168, 75, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // 绘制边缘光点
            for (var k = 0; k < sparks.length; k++) {
                var sp = sparks[k];
                sp.life++;

                if (sp.fadeIn) {
                    sp.alpha += 0.01;
                    if (sp.alpha >= sp.maxAlpha) sp.fadeIn = false;
                }

                if (sp.life > sp.maxLife * 0.7) {
                    sp.alpha -= 0.008;
                }

                if (sp.life > sp.maxLife || sp.alpha <= 0) {
                    sparks[k] = createSpark();
                    continue;
                }

                sp.x += sp.speedX;
                sp.y += sp.speedY;

                // 光点光晕
                ctx.save();
                ctx.globalAlpha = sp.alpha * 0.4;
                ctx.shadowColor = sp.color;
                ctx.shadowBlur = sp.size * 4;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
                ctx.fillStyle = sp.color;
                ctx.fill();
                ctx.restore();

                // 光点核心
                ctx.save();
                ctx.globalAlpha = sp.alpha;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.restore();
            }

            // 绘制叶子
            for (var m = 0; m < leaves.length; m++) {
                var l = leaves[m];

                l.y += l.speedY;
                l.wobble += l.wobbleSpeed;
                l.x += l.speedX + Math.sin(l.wobble) * l.wobbleAmp;
                l.rotation += l.rotSpeed;

                // 鼠标微弱影响
                var dx = mouse.x - l.x;
                var dy = mouse.y - l.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    l.x -= dx * 0.001;
                    l.y -= dy * 0.0005;
                }

                if (l.y > H + 30) {
                    l.y = -30;
                    l.x = Math.random() * W;
                }
                if (l.x < -30) l.x = W + 30;
                if (l.x > W + 30) l.x = -30;

                drawLeaf(l.x, l.y, l.size, l.rotation, l.alpha, l.color, l.glow);
            }
        }

        animate();
        console.log('🍂 Hero 视觉特效已加载');
    });
})();
