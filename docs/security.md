# DPIS Security & Compliance Guide
## HIPAA & GDPR Architecture Overview

### 1. Regulatory Alignment

The Diabetes Prediction Intelligence System (DPIS) operates as a **Class II Clinical Decision Support (CDS)** software platform. As such, architectural controls strictly comply with:

- **HIPAA Security Rule (45 CFR Part 160 and Part 164, Subparts A and C)**
- **GDPR (General Data Protection Regulation - Regulation (EU) 2016/679)**
- **FDA Guidance on Clinical Decision Support Software (September 2022)**

---

### 2. Core Security Pillars

#### 2.1 Encryption Standards
- **In Transit**: All HTTP interactions are strictly enforced via **TLS 1.3** with forward secrecy cipher suites (`TLS_AES_256_GCM_SHA384`).
- **At Rest**: Patient databases and model stores utilize **AES-256** transparent database encryption.

#### 2.2 Role-Based Access Control (RBAC)
User permissions are compartmentalized into three primary roles:
1. `patient`: Access restricted strictly to own clinical record, self-prediction runs, and educational chatbot.
2. `clinician`: Access to assigned patient rosters, clinical waterfall charts, and treatment simulation sandbox.
3. `admin`: Access restricted to system telemetry, federated learning cycle management, and compliance audit inspection.

#### 2.3 Immutable Append-Only Audit Logging
To satisfy §164.312(b) (Audit Controls):
- The `audit_logs` table operates under strict append-only constraints.
- No `UPDATE` or `DELETE` API endpoints or database grants exist for audit tables.
- Captured data elements: `timestamp`, `user_id`, `action`, `resource_type`, `resource_id`, `ip_address`, and `extra_data`.

#### 2.4 Algorithmic Fairness & Bias Auditing
- Continuous monitoring of prediction disparities across age, biological sex, and demographic strata.
- Class rebalancing using **SMOTE (Synthetic Minority Over-sampling Technique)** prevents majority class overfitting in rare diabetic conditions (MODY / GDM).

