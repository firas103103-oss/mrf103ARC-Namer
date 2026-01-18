# ACRI Demo Script

1) Issue probe: POST /api/acri/probe/issue (get probeId+nonce)
2) Respond: POST /api/acri/probe/respond (simulated measured -> gets signature)
3) Verify: POST /api/acri/probe/verify => ok:true

Replay test:
4) Issue a NEW probe (new nonce)
5) Try verifying OLD response against NEW nonce => ok:false

Message:
"Even if someone spoofs gas/radar feeds, they cannot pass because probe nonce changes and requires a real-time stimulus-bound response."
