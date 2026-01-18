import { Router } from "express";
import { issueProbe, signResponse, verifyResponse, type ProbeResponse } from "../services/acri/probe";

export const acriRouter = Router();

// 1) Issue probe (challenge)
acriRouter.post("/probe/issue", (_req, res) => {
  res.json(issueProbe());
});

// 2) Simulate device response (normally device-side)
acriRouter.post("/probe/respond", (req, res) => {
  const { probeId, nonce, measured } = req.body ?? {};
  if (!probeId || !nonce) return res.status(400).json({ error: "probeId and nonce required" });

  const signature = signResponse(String(probeId), String(nonce), measured);
  res.json({ probeId, nonce, measured, signature });
});

// 3) Verify response signature
acriRouter.post("/probe/verify", (req, res) => {
  const body = req.body as ProbeResponse;
  const ok = verifyResponse(body);
  res.json({ ok });
});
