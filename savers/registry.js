// Each saver calls Savers.register({ id, name, create(ctx, size) }).
//   create(ctx, size) returns { frame(now) }; size() returns { W, H } in CSS pixels.
// frame() must clear and draw its whole scene on ctx.
window.Savers = {
  list: [],
  register(s) { this.list.push(s); },
  ease: t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t),
  rand: (a, b) => a + Math.random() * (b - a),
};
