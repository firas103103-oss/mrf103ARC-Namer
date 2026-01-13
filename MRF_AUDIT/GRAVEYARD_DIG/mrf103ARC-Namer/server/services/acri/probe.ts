import crypto from "crypto";

export type ProbeStep = { heater?: number; durationMs: number; sampleHz: number };

export type ProbeScript = {
  probeId: string;
  nonce: string;
  steps: ProbeStep[];
  issuedAt: string;
};

export type ProbeResponse = {
  probeId: string;
  nonce: string;
  measured: unknown; // simulated features/time-series
  signature: string;
};

export function issueProbe(): ProbeScript {
  const probeId = crypto.randomUUID();
  const nonce = crypto.randomBytes(16).toString("hex");
  const issuedAt = new Date().toISOString();

  // MVP steps; later map to real heater profiles / sampling cadence
  const steps: ProbeStep[] = [
    { heater: 200, durationMs: 1200, sampleHz: 10 },
    { heater: 320, durationMs: 900, sampleHz: 12 },
    { heater: 260, durationMs: 1100, sampleHz: 10 },
  ];

  return { probeId, nonce, steps, issuedAt };
}

function requireSecret() {
  const secret = process.env.ACRI_SECRET;
  if (!secret) throw new Error("ACRI_SECRET missing");
  return secret;
}

export function signResponse(probeId: string, nonce: string, measured: unknown): string {
  const secret = requireSecret();
  const body = JSON.stringify({ probeId, nonce, measured });
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export function verifyResponse(resp: ProbeResponse): boolean {
  const expected = signResponse(resp.probeId, resp.nonce, resp.measured);
  // timingSafeEqual requires equal length buffers
  if (resp.signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(resp.signature), Buffer.from(expected));
}
