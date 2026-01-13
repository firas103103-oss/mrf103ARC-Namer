# GDPR Compliance Statement

**Company:** ARC Technologies  
**Service:** ARC Namer AI Platform  
**Website:** https://app.mrf103.com  
**Effective Date:** January 6, 2026  
**Last Updated:** January 6, 2026

---

## 1. Commitment to GDPR Compliance

ARC Technologies is committed to protecting the privacy and personal data of all users, particularly those in the European Union (EU) and European Economic Area (EEA). This statement outlines our compliance with the **General Data Protection Regulation (GDPR)** (Regulation EU 2016/679).

---

## 2. Data Controller Information

**Data Controller:** ARC Technologies  
**Contact Email:** privacy@arctechnologies.io (to be configured)  
**Data Protection Officer (DPO):** [To Be Appointed]  
**DPO Email:** dpo@arctechnologies.io (to be configured)  
**Company Address:** [To Be Determined]

---

## 3. Legal Basis for Processing

We process personal data under the following legal bases:

### 3.1 Consent (Article 6(1)(a))
- Marketing communications
- Optional analytics cookies
- Third-party AI provider integrations (explicit consent)

### 3.2 Contract (Article 6(1)(b))
- Account creation and management
- Service provision (AI agent orchestration)
- Payment processing
- Customer support

### 3.3 Legal Obligation (Article 6(1)(c))
- Tax and accounting records
- Compliance with court orders
- Data breach notifications

### 3.4 Legitimate Interest (Article 6(1)(f))
- Fraud prevention
- Security monitoring (Sentry error tracking)
- Service improvement (anonymized analytics)
- Network and information security

**Balancing Test:** Our legitimate interests do not override your fundamental rights and freedoms.

---

## 4. Data Subject Rights

Under GDPR, you have the following rights:

### 4.1 Right to Access (Article 15)
Request a copy of your personal data in a structured, machine-readable format (JSON/CSV).

**How to Exercise:**
- Email: privacy@arctechnologies.io
- In-app: Account Settings → Export Data

**Response Time:** Within **30 days** (extendable by 2 months for complex requests)

### 4.2 Right to Rectification (Article 16)
Correct inaccurate or incomplete personal data.

**How to Exercise:**
- In-app: Account Settings → Edit Profile
- Email: privacy@arctechnologies.io

### 4.3 Right to Erasure ("Right to be Forgotten") (Article 17)
Request deletion of your personal data when:
- Data is no longer necessary
- You withdraw consent
- You object to processing
- Data was processed unlawfully

**Exceptions:** We may retain data for legal obligations or legitimate interests (e.g., fraud prevention).

**How to Exercise:**
- In-app: Account Settings → Delete Account
- Email: privacy@arctechnologies.io

**Data Deletion Timeline:**
- Account data: Deleted within **90 days**
- Backups: Purged within **90 days**
- Logs: Deleted within **30 days**

### 4.4 Right to Restriction (Article 18)
Limit processing of your data when:
- You contest data accuracy
- Processing is unlawful
- You object to processing

**How to Exercise:** Email privacy@arctechnologies.io

### 4.5 Right to Data Portability (Article 20)
Receive your data in a portable format and transmit it to another controller.

**How to Exercise:**
- In-app: Account Settings → Export Data (JSON format)
- Email request for bulk export

### 4.6 Right to Object (Article 21)
Object to processing based on legitimate interests or for direct marketing.

**How to Exercise:**
- Marketing emails: Click "Unsubscribe"
- Processing objection: Email privacy@arctechnologies.io

### 4.7 Right to Withdraw Consent (Article 7(3))
Withdraw consent at any time (does not affect lawfulness of prior processing).

**How to Exercise:**
- In-app: Account Settings → Privacy Preferences
- Email: privacy@arctechnologies.io

### 4.8 Right to Lodge a Complaint (Article 77)
File a complaint with your local supervisory authority if you believe your rights have been violated.

**EU Supervisory Authorities:** https://edpb.europa.eu/about-edpb/board/members_en

---

## 5. Data Categories and Processing Activities

### 5.1 Personal Data Collected

| Data Category | Examples | Purpose | Legal Basis |
|---------------|----------|---------|-------------|
| **Identification Data** | Name, email | Account management | Contract |
| **Authentication Data** | Password (hashed), session tokens | Login/security | Contract |
| **Payment Data** | Billing address, payment method | Subscription billing | Contract |
| **Usage Data** | API calls, page views, feature usage | Service provision | Legitimate interest |
| **Technical Data** | IP address, browser, device | Security, troubleshooting | Legitimate interest |
| **Communication Data** | Support tickets, emails | Customer support | Contract |
| **AI Agent Data** | Prompts, configurations, conversations | Service provision | Contract |

### 5.2 Special Categories (Article 9)
We **do not intentionally collect** special category data (race, religion, health, biometric, genetic). If such data is inadvertently included in AI agent prompts, it is processed solely for the purpose of fulfilling the service request.

---

## 6. Data Retention

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Active account data | Duration of account | Service provision |
| Closed account data | 90 days | Dispute resolution, legal obligations |
| Payment records | 7 years | Tax and accounting laws |
| Logs (access, error) | 30-90 days | Security, debugging |
| Backups | 30 days (Starter/Pro), 1 year (Enterprise) | Disaster recovery |
| Marketing consent records | 3 years after withdrawal | Compliance |

---

## 7. International Data Transfers

### 7.1 Transfer Locations
Data may be transferred to and processed in:
- **European Union** (Railway servers - Amsterdam)
- **India** (Supabase database - AWS Asia-Pacific)
- **United States** (OpenAI, Anthropic APIs)

### 7.2 Safeguards for Non-EU Transfers

#### Standard Contractual Clauses (SCCs)
We use **EU-approved Standard Contractual Clauses** for transfers to third countries (Commission Implementing Decision 2021/914).

#### Adequacy Decisions
Transfers to countries with adequacy decisions (if applicable).

#### Privacy Shield (Historical)
Note: EU-US Privacy Shield was invalidated (Schrems II). We rely on SCCs instead.

#### Supplementary Measures
- End-to-end encryption (TLS 1.3)
- Data minimization
- Pseudonymization where feasible
- Access controls and logging

### 7.3 Third-Party Processors

| Processor | Service | Location | Safeguard |
|-----------|---------|----------|-----------|
| Railway | Hosting | EU (Amsterdam) | GDPR-compliant, EU-based |
| Supabase | Database | India | SCCs, encryption |
| OpenAI | AI API | USA | SCCs, DPA available |
| Anthropic | AI API | USA | SCCs, DPA available |
| Google Cloud | AI API | Multi-region | SCCs, GDPR-compliant |
| Stripe | Payments | USA | PCI-DSS, GDPR-certified |
| Sentry | Error tracking | USA | SCCs, data minimization |
| Cloudflare | CDN | Global | SCCs, EU Data Localization option |

### 7.4 Data Processing Agreements (DPAs)
We have signed DPAs with all processors containing GDPR-required clauses (Article 28).

---

## 8. Security Measures (Article 32)

### 8.1 Technical Measures
- **Encryption:** TLS 1.3 for data in transit, AES-256 for data at rest
- **Authentication:** Session-based with HttpOnly cookies, rate limiting
- **Access Control:** Role-based access control (RBAC)
- **Firewalls:** Web Application Firewall (Cloudflare)
- **Monitoring:** Real-time error tracking (Sentry), security audits

### 8.2 Organizational Measures
- **Staff Training:** GDPR awareness training for all employees
- **Access Policies:** Least privilege principle
- **Incident Response Plan:** Data breach notification within 72 hours
- **Regular Audits:** Annual security audits (see [Security Audit Report](./SECURITY_AUDIT_20260106.md))
- **Vendor Management:** Due diligence on all third-party processors

### 8.3 Pseudonymization and Anonymization
- Analytics data is anonymized
- User IDs are pseudonymized in logs
- IP addresses are truncated for analytics

---

## 9. Data Breach Notification (Article 33-34)

### 9.1 Breach Response Timeline
- **Detection:** Real-time monitoring (Sentry alerts)
- **Assessment:** Within **24 hours**
- **Supervisory Authority Notification:** Within **72 hours** of awareness
- **Data Subject Notification:** Without undue delay (if high risk)

### 9.2 Notification Procedure
1. Contain and assess breach
2. Notify DPO and management
3. Document breach details
4. Notify supervisory authority (via online portal or email)
5. Notify affected users (email, in-app notification)
6. Post-incident review and remediation

### 9.3 Breach Records
We maintain records of all data breaches, including:
- Nature of breach
- Categories and number of data subjects affected
- Consequences and remedial actions taken

---

## 10. Data Protection by Design and Default (Article 25)

### 10.1 Privacy-Enhancing Technologies
- Minimal data collection (only what's necessary)
- Pseudonymization of user IDs in logs
- Session expiration (30 days default)
- Automatic logout after inactivity

### 10.2 Default Settings
- Marketing communications: **Opt-in** (explicit consent required)
- Analytics cookies: **Opt-in**
- Data retention: Minimum necessary
- Account visibility: Private by default

---

## 11. Cookies and Tracking (ePrivacy Directive)

### 11.1 Cookie Consent
We comply with the **ePrivacy Directive** (Directive 2002/58/EC):
- **Essential Cookies:** Allowed without consent (authentication)
- **Non-Essential Cookies:** Require explicit opt-in consent

### 11.2 Cookie Types
| Cookie Name | Type | Purpose | Expiry | Consent Required |
|-------------|------|---------|--------|------------------|
| `arc.sid` | Session | Authentication | 30 days | No (essential) |
| `_csrf` | Security | CSRF protection | Session | No (essential) |
| `analytics` | Analytics | Usage statistics | 1 year | Yes (opt-in) |

### 11.3 Cookie Management
Users can manage cookies via:
- In-app: Account Settings → Privacy → Cookie Preferences
- Browser settings (may affect functionality)

---

## 12. Children's Privacy (Article 8)

The Service is **not intended for children under 16** (or under 13 in jurisdictions with lower age limits).

We do not knowingly collect data from children. If we discover such data:
- We will delete it within **72 hours**
- We will notify the parent/guardian (if contact info is available)

**Parental Consent:** Not required as the Service is not directed at children.

---

## 13. Automated Decision-Making and Profiling (Article 22)

### 13.1 Automated Decisions
We **do not** use solely automated decision-making (without human intervention) that produces legal or similarly significant effects.

### 13.2 Profiling
We may use profiling for:
- Service improvement (e.g., suggesting relevant AI agent templates)
- Fraud detection (e.g., unusual API usage patterns)

**Your Rights:** You may object to profiling and request human review of decisions.

---

## 14. Compliance Monitoring

### 14.1 Data Protection Impact Assessments (DPIAs) (Article 35)
We conduct DPIAs for high-risk processing activities, including:
- New AI integrations
- Large-scale data processing
- Use of new technologies

### 14.2 Records of Processing Activities (Article 30)
We maintain records of:
- Data categories processed
- Purposes of processing
- Data recipients and transfers
- Retention periods
- Security measures

### 14.3 Regular Audits
- **Internal Audits:** Quarterly
- **External Audits:** Annually (by independent third party)
- **Penetration Testing:** Bi-annually

---

## 15. Supervisory Authority

Our lead supervisory authority is:
- **[To Be Determined based on company establishment]**
- Example: CNIL (France), ICO (UK if applicable post-Brexit), BfDI (Germany)

**Contact:** Refer to your local supervisory authority if you wish to file a complaint.

---

## 16. Contact for GDPR Inquiries

**Data Protection Officer (DPO):**  
Email: dpo@arctechnologies.io (to be configured)

**Privacy Team:**  
Email: privacy@arctechnologies.io (to be configured)

**Postal Address:** [To Be Determined]

**Response Time:** Within 30 days of receipt

---

## 17. Updates to This Statement

We will review and update this statement at least **annually** or when:
- GDPR guidance evolves
- Our processing activities change
- New technologies are adopted

**Version History:**
- v1.0 - January 6, 2026: Initial publication

---

## 18. Certification and Seals

We are committed to obtaining:
- [ ] **ISO 27001** (Information Security Management) - Target: Q3 2026
- [ ] **SOC 2 Type II** (Security, Availability, Confidentiality) - Target: Q4 2026
- [ ] **GDPR Certification** (if available) - Target: Q4 2026

---

## 19. Acknowledgment

By using the Service, you acknowledge that you have read and understood this GDPR Compliance Statement and our [Privacy Policy](./PRIVACY_POLICY.md).

---

**Last Updated:** January 6, 2026  
**Version:** 1.0  
**Document Owner:** ARC Technologies Data Protection Team
