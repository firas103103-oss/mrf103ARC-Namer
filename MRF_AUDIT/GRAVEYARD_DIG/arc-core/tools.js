module.exports = {
  add: async ({a,b}) => a+b,
  echo: async ({msg}) => msg,
  ai: async ({prompt,input}) => {
    const r = await require("./ai/router").run({prompt,input});
    return r.output;
  }
};
