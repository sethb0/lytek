export const dummy = {
  async get (ctx) {
    ctx.body = ctx.state.auth;
  },
};
