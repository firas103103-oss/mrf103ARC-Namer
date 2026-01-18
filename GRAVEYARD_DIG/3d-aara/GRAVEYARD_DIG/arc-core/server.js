require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const Joi = require("joi");
const auth = require("./auth");
const CircuitBreaker = require("opossum");

const db = new Database("db/arc.db");
const app = express();
app.use(express.json());
app.use(express.static("public"));

// ميدل وير عامة (ريتك ليمتر، سيركت بريكر) قبل كل شيء
app.use(auth.rateLimiter);
const breaker = new CircuitBreaker((fn) => fn(), {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
});
app.use((req, res, next) => breaker.fire(next).catch(() => res.sendStatus(503)));

// الراوتات العامة أولاً
app.get("/", (_, res) => res.send("ARC OK"));
app.get("/health", (_, res) => res.json({ status: "ok" }));



const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

app.post("/login", async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.sendStatus(400);

  const u = db.prepare("SELECT * FROM users WHERE email=?").get(req.body.email);
  if (!u || !bcrypt.compareSync(req.body.password, u.password_hash))
    return res.sendStatus(401);

  const token = auth.issueToken({ id: u.id, role: u.role }, process.env.TOKEN_TTL);
  const refresh = auth.issueToken({ id: u.id }, process.env.REFRESH_TTL);

  res.json({ token, refresh });
});

app.post("/refresh", (req, res) => {
  try {
    const payload = jwt.verify(req.body.refresh, process.env.JWT_SECRET);
    const token = auth.issueToken({ id: payload.id }, process.env.TOKEN_TTL);
    res.json({ token });
  } catch {
    res.sendStatus(401);
  }
});

app.get("/secure", (req, res) => {
  res.json({ ok: true, user: "public" });
});

/* START */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("SERVER RUNNING", PORT));
