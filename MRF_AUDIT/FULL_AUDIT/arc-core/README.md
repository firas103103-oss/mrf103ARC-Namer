# ARC PLATFORM — OFFICIAL DOCUMENTATION v1

## 1) Overview

**ARC** منصة تنفيذ ذكية تعتمد على:

* Agents قابلة للبرمجة
* Workflows مرنة
* AI متعدد المزوّدين
* Queue + Workers قابلة للتحجيم
* واجهة Web + API

الحالة: **Production Ready**

---

## 2) Architecture

```
[ Client / UI ]
        |
     (HTTPS)
        |
    [ Nginx ]
        |
  [ API Layer ]
        |
   ┌───────────────┐
   │ Redis (Queue) │
   └───────────────┘
        |
   [ Workers xN ]
        |
 [ Agents / AI / Tools ]
        |
     [ SQLite ]
```

---

## 3) Components

### API Server

* Express.js
* JWT Auth
* Rate Limit
* Metrics `/metrics`
* Health `/health`

### Workers

* Bull Queue
* Retry + Backoff
* Dead Letter Queue
* Autoscaling via PM2

### AI Layer

* OpenAI
* Claude
* Gemini
* Router + Fallback

### Agents

* States: `idle | running | completed | failed`
* Memory (SQLite)
* Goals + Planning Loop
* Tools execution

### Workflows

* Step-based execution
* Parallel steps
* Event-driven waits
* Persistent state
* Resume after restart

---

## 4) Environment Variables

```
PORT=8080
JWT_SECRET=***
OPENAI_API_KEY=***
ANTHROPIC_API_KEY=***
GEMINI_API_KEY=***
```

---

## 5) API Reference (Core)

### Auth

* `POST /login`
* `POST /refresh`
* `GET /secure`

### AI

* `POST /ai`

### Agents

* `POST /agent`
* `POST /agent/goal`
* `POST /task/assign`

### Workflows

* `POST /workflow`

### System

* `GET /health`
* `GET /metrics`

(التفاصيل الدقيقة موثقة في API v1 المرجعي)

---

## 6) Deployment (Production)

### Process Manager

```bash
pm2 start server.js --name arc-api -i 2
pm2 start worker.js --name arc-worker -i max
pm2 start workflow-engine.js --name arc-wf
pm2 save
```

### Nginx

* Reverse Proxy
* Load Balancing
* HTTPS (Certbot)

### Backup

* Daily cron
* DB + configs + code

---

## 7) Scaling Strategy

* Horizontal API scaling
* Worker autoscaling
* Redis persistence
* Circuit breaker
* Metrics-driven decisions

---

## 8) Security

* JWT Access + Refresh
* Rate limiting
* Input validation
* Secrets via env only
* DLQ for failure isolation

---

## 9) Operational Checklist

* [x] Health OK
* [x] Metrics exposed
* [x] Queue stable
* [x] Workers autoscaling
* [x] AI providers responding
* [x] Backups active

---

## 10) Versioning

* Current: **v1**
* Strategy: Backward-compatible
* Schema migrations explicit

---

## FINAL STATUS

**ARC v1**

* ✔ Built
* ✔ Secured
* ✔ Scaled
* ✔ Documented
* ✔ Production-ready