export function dummyAPI () {
  return {
    async get (ctx) {
      ctx.body = ctx.state.auth;
    },
  };
}
