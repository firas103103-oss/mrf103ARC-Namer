const Queue = require("bull");
module.exports = new Queue("arc-dlq", {
  redis: { host: "127.0.0.1", port: 6379 }
});
