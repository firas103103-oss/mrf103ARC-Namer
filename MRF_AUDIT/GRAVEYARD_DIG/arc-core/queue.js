const Queue = require("bull");
module.exports = new Queue("arc-tasks", {
  redis: { host: "127.0.0.1", port: 6379 },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false
  }
});
