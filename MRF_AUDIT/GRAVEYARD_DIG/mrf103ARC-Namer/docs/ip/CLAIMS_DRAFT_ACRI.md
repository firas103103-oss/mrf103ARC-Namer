# ACRI — Draft Claims (Non-legal)

## System Claim
A system for anomaly confirmation in an isolated multi-sensor node comprising:
(a) a cross-verification engine producing an initial anomaly suspicion from gas and physical sensors,
(b) a probe script generator producing a nonce-based active challenge,
(c) an active stimulus executor causing a sensor stimulus pattern,
(d) a response signature generator producing a stimulus–response signature from real-time measurements,
(e) a verifier validating the response signature against the probe script,
wherein escalation to final alarm is allowed only when the response signature is verified.

## Method Claim
A method comprising:
detecting an initial anomaly,
generating a nonce-based probe script,
executing an active stimulus sequence,
computing a response signature,
verifying said signature,
and logging the probe and verification outcome as audit evidence.

## Dependent claims
- probe script uses heater profile sweeps
- response signature includes timing jitter + feature deltas
- verifier resists replay by nonce binding
