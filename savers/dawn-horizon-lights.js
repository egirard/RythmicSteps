// Dawn horizon lights: inspired by PXL_20261025_114336811.jpg
// Soft horizon glow, layered mountain silhouettes, rising beams, and drifting particles.
Savers.register({
  id: 'dawn-horizon-lights',
  name: 'Dawn Horizon Lights',
  create(ctx, size) {
    const { rand, ease } = Savers;
    let { W, H } = size();
    let hueBase = rand(190, 245);
    let nextRebuild = 0;
    let layers = [];
    let particles = [];

    function buildLayers(now) {
      ({ W, H } = size());
      const horizon = H * rand(0.52, 0.68);
      const layerCount = 4;
      layers = [];
      for (let i = 0; i < layerCount; i++) {
        const depth = i / (layerCount - 1);
        const y = horizon + i * rand(16, 42);
        const amp = rand(12, 36) * (1 - depth * 0.35);
        const freq = rand(0.005, 0.015);
        const phase = rand(0, Math.PI * 2);
        const shade = 16 + i * 12;
        layers.push({ y, amp, freq, phase, shade, drift: rand(-0.0004, 0.0004) });
      }

      particles = Array.from({ length: Math.floor(rand(60, 110)) }, () => ({
        x: rand(0, W),
        y: rand(horizon - H * 0.25, horizon + H * 0.25),
        r: rand(0.6, 2.4),
        vy: rand(-0.025, -0.005),
        vx: rand(-0.01, 0.01),
        tw: rand(0, Math.PI * 2),
      }));

      hueBase = (hueBase + rand(8, 24)) % 360;
      nextRebuild = now + rand(22000, 34000);
    }

    function drawSky(now) {
      const t = now * 0.00005;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, `hsl(${(hueBase + 220) % 360}, 45%, 8%)`);
      g.addColorStop(0.45, `hsl(${(hueBase + 250 + Math.sin(t) * 8) % 360}, 55%, 12%)`);
      g.addColorStop(0.7, `hsl(${(hueBase + 290 + Math.sin(t * 0.7) * 10) % 360}, 55%, 18%)`);
      g.addColorStop(1, `hsl(${(hueBase + 20) % 360}, 50%, 9%)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function drawGlow(now) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.0008);
      const cx = W * (0.45 + 0.1 * Math.sin(now * 0.00012));
      const cy = H * 0.64;
      const r1 = Math.min(W, H) * (0.16 + 0.03 * pulse);
      const r2 = Math.min(W, H) * 0.52;
      const rg = ctx.createRadialGradient(cx, cy, r1 * 0.1, cx, cy, r2);
      rg.addColorStop(0, 'hsla(42, 92%, 72%, 0.40)');
      rg.addColorStop(0.28, 'hsla(30, 85%, 60%, 0.22)');
      rg.addColorStop(1, 'hsla(20, 80%, 30%, 0.00)');
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }

    function drawBeams(now) {
      const centerX = W * 0.5;
      const baseY = H * 0.67;
      const beamCount = 9;
      for (let i = 0; i < beamCount; i++) {
        const p = i / (beamCount - 1) - 0.5;
        const sway = Math.sin(now * 0.0002 + i * 0.7) * 0.08;
        const ang = p * 0.7 + sway;
        const len = H * (0.36 + 0.25 * (0.5 + 0.5 * Math.sin(now * 0.00055 + i)));
        const spread = 40 + 30 * (0.5 + 0.5 * Math.sin(now * 0.0004 + i));

        ctx.save();
        ctx.translate(centerX, baseY);
        ctx.rotate(ang);

        const grad = ctx.createLinearGradient(0, 0, 0, -len);
        grad.addColorStop(0, 'hsla(35, 95%, 70%, 0.15)');
        grad.addColorStop(1, 'hsla(45, 90%, 80%, 0.00)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(-spread * 0.4, 0);
        ctx.lineTo(spread * 0.4, 0);
        ctx.lineTo(spread, -len);
        ctx.lineTo(-spread, -len);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    function drawLayer(layer, idx, now) {
      const y = layer.y;
      const driftedPhase = layer.phase + now * layer.drift;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W + 8; x += 8) {
        const wave = Math.sin(x * layer.freq + driftedPhase) * layer.amp;
        const wave2 = Math.sin(x * layer.freq * 0.53 + driftedPhase * 1.4) * layer.amp * 0.5;
        ctx.lineTo(x, y + wave + wave2);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      const light = 6 + idx * 6;
      ctx.fillStyle = `hsl(${(hueBase + 215) % 360}, 20%, ${layer.shade}%)`;
      ctx.fill();

      // soft rim light
      ctx.strokeStyle = `hsla(${(hueBase + 40) % 360}, 80%, ${48 + light}%, 0.08)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    function drawParticles(now) {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.02;
        if (p.y < -10) {
          p.y = H + 10;
          p.x = rand(0, W);
        }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;

        const a = 0.12 + 0.18 * (0.5 + 0.5 * Math.sin(p.tw + now * 0.001));
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(48 90% 82%)';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    return {
      frame(now) {
        ({ W, H } = size());
        if (!layers.length || now > nextRebuild) buildLayers(now);

        drawSky(now);
        drawGlow(now);
        drawBeams(now);
        for (let i = layers.length - 1; i >= 0; i--) drawLayer(layers[i], i, now);
        drawParticles(now);

        // subtle vignette
        const vg = ctx.createRadialGradient(W * 0.5, H * 0.55, H * 0.2, W * 0.5, H * 0.55, H * 0.9);
        vg.addColorStop(0, 'hsla(0,0%,0%,0)');
        vg.addColorStop(1, 'hsla(0,0%,0%,0.36)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
      }
    };
  }
});
