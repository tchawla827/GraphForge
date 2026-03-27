---
name: "senior-security"
description: "Implement security engineering practices. Threat modeling with STRIDE, security architecture design, vulnerability assessment, secure code review, and incident response. Use when: designing secure systems, assessing vulnerabilities, reviewing code security, responding to incidents, implementing defense-in-depth."
---

# Senior Security Engineer

Implement comprehensive security practices across the entire system lifecycle.

## Core Capabilities

### Threat Modeling (STRIDE)
Systematically identifies potential threats:

**STRIDE Categories:**
- **Spoofing:** Identity spoofing (weak authentication)
- **Tampering:** Data modification (integrity attacks)
- **Repudiation:** Denying actions (audit trail gaps)
- **Information Disclosure:** Data exposure (encryption)
- **Denial of Service:** Service unavailability (rate limiting)
- **Elevation of Privilege:** Unauthorized access (authorization)

**DREAD Risk Assessment:**
- **Damage:** How bad if exploited?
- **Reproducibility:** How easily can it be reproduced?
- **Exploitability:** How difficult to exploit?
- **Affected Users:** How many users impacted?
- **Discoverability:** How easily found by attackers?

### Security Architecture
Implements defense-in-depth across five layers:

**Layer 1: Perimeter**
- Network boundaries
- WAF (Web Application Firewall)
- DDoS protection
- API rate limiting
- CORS configuration

**Layer 2: Network**
- VPC/Virtual Networks
- Network segmentation
- Security groups/NSGs
- VPN/Bastion hosts
- Encrypted connections

**Layer 3: Host**
- OS hardening
- Patch management
- Antivirus/Malware protection
- File integrity monitoring
- Port hardening

**Layer 4: Application**
- Secure coding practices
- Input validation
- Authentication/Authorization
- Session management
- Error handling

**Layer 5: Data**
- Encryption at rest
- Encryption in transit
- Key management
- Data classification
- Access controls

**Zero Trust Principles:**
- Verify every access request
- Assume breach mindset
- Least privilege access
- Continuous authentication
- Encrypted communication

### Vulnerability Assessment
Combines automated and manual testing:

**Automated Scanning:**
- **SAST** (Static Application Security Testing)
  - Code analysis without execution
  - Identify patterns and weaknesses
  - Tools: Semgrep, CodeQL, SonarQube

- **DAST** (Dynamic Application Security Testing)
  - Runtime testing while running
  - Test actual behavior
  - Tools: OWASP ZAP, Burp Suite

- **Dependency Scanning**
  - Known vulnerabilities in libraries
  - Version analysis
  - Tools: Snyk, Dependabot, npm audit

- **Secret Detection**
  - Hardcoded API keys, credentials
  - Prevent accidental exposure
  - Tools: GitLeaks, TruffleHog, Detect Secrets

**Manual Testing:**
- Business logic flaws
- Complex attack scenarios
- User behavior exploitation
- Integration issues

**Classification & Tracking:**
- **Critical:** Immediate exploitation, data breach risk
- **High:** Significant impact, should fix quickly
- **Medium:** Moderate impact, plan remediation
- **Low:** Minor impact, fix in regular sprint

### Secure Code Review
Examines code for security issues:

**Authentication Review:**
- Proper authentication mechanisms
- Multi-factor authentication support
- Session token management
- Password storage (Argon2id or bcrypt)
- Account lockout protection

**Authorization Review:**
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Principle of least privilege
- Resource-level permissions
- Admin functionality protection

**Data Handling Review:**
- PII protection
- Data encryption
- Secure deletion
- Data classification compliance
- Backup security

**Cryptography Review:**
- Modern algorithms: AES-256-GCM, ChaCha20
- Key derivation: PBKDF2, scrypt, Argon2
- Digital signatures: Ed25519, RSA-4096
- Certificate validation
- TLS 1.3 configuration

**Injection Prevention:**
- **SQL Injection:** Parameterized queries with placeholders
- **Command Injection:** Avoid shell execution, use APIs
- **Template Injection:** Escape variables, use safe templating
- **LDAP Injection:** Escape special characters
- **XML Injection:** Use XML parsers safely

**Encoding & Output:**
- HTML encoding for web output
- URL encoding for URLs
- Base64 for data encoding
- JSON escaping
- Avoid double encoding

**Secure Cookie Flags:**
- **HttpOnly:** Prevents JavaScript access
- **Secure:** Only HTTPS transmission
- **SameSite=Strict:** CSRF protection
- **Max-Age:** Session expiration
- **Domain/Path:** Scope restrictions

### Incident Response
Follows structured response workflow:

**Phases:**

1. **Containment (Immediate)**
   - Isolate affected systems
   - Stop active exploitation
   - Preserve evidence
   - Notify stakeholders
   - Escalate as needed

2. **Eradication (Short-term)**
   - Remove attacker access
   - Patch vulnerabilities
   - Reset compromised credentials
   - Update security rules
   - Verify completeness

3. **Recovery (Medium-term)**
   - Restore clean systems
   - Restore from backups
   - Monitor for re-infection
   - Verify functionality
   - Restore normal operations

4. **Post-Mortem (Long-term)**
   - Document timeline
   - Identify root cause
   - List failures and successes
   - Recommend improvements
   - Update incident response plan

**Severity Escalation:**
- **Critical:** Executive notification, media response
- **High:** Security leadership involved, customer notification
- **Medium:** Team awareness, customer communication
- **Low:** Log and track, communicate when appropriate

## Security Best Practices

### Password Storage
```
✅ Correct: hash = Argon2id(password, salt, iterations=3)
✅ Good: hash = bcrypt(password, rounds=12)
❌ Wrong: hash = SHA256(password)
❌ Wrong: plaintext passwords in database
```

### SQL Query Safety
```typescript
// ✅ Parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// ❌ String concatenation
const user = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

### Secure Cookie Configuration
```typescript
// ✅ Secure flags
res.cookie('sessionId', token, {
  httpOnly: true,      // No JavaScript access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 3600000,     // 1 hour
  domain: 'example.com'
});
```

### TLS Configuration
- Use TLS 1.3 (minimum 1.2)
- Prefer ECDHE key exchange
- Use AES-256-GCM cipher
- Enable HSTS header
- Certificate pinning where appropriate

## Supported Tools

### SAST Tools
- **Semgrep:** Pattern-based analysis, multiple languages
- **CodeQL:** GitHub security analysis
- **SonarQube:** Code quality and security
- **Checkmarx:** Enterprise static analysis

### DAST Tools
- **OWASP ZAP:** Open-source, comprehensive
- **Burp Suite:** Industry standard proxy
- **Acunetix:** Commercial vulnerability scanner

### Dependency Scanning
- **Snyk:** Continuous vulnerability monitoring
- **Dependabot:** GitHub-integrated dependency updates
- **npm audit:** Built-in Node.js package auditing

### Secret Detection
- **GitLeaks:** Git repository scanning
- **TruffleHog:** Deep Git scanning
- **Detect Secrets:** Pre-commit hook checking

## Typical Workflow

### Security Design Phase

1. **Identify Assets**
   - Data to protect
   - Systems critical to business
   - Users affected
   - Compliance requirements

2. **Threat Modeling**
   - Apply STRIDE methodology
   - Identify threats per component
   - Assess with DREAD
   - Prioritize mitigations

3. **Design Controls**
   - Defense-in-depth layers
   - Zero Trust architecture
   - Authentication/Authorization
   - Encryption strategy

4. **Document Architecture**
   - Security diagrams
   - Control mapping
   - Risk acceptance
   - Compliance evidence

### Code Review Phase

1. **Static Analysis**
   - Run SAST tools
   - Review findings
   - Fix critical issues
   - Document exceptions

2. **Manual Code Review**
   - Authentication flows
   - Data handling
   - Injection points
   - Cryptography usage

3. **Dynamic Testing**
   - Run DAST tools
   - Manual penetration testing
   - Attack pattern testing
   - Verify controls

4. **Remediation**
   - Fix vulnerabilities
   - Update code
   - Re-test
   - Document fixes

## Quick Commands

```bash
# Threat modeling
/senior-security threat-model --system <diagram> --method stride

# Vulnerability assessment
/senior-security assess --type full --include sast,dast,dependencies

# Secure code review
/senior-security code-review --language typescript --focus auth

# Incident response
/senior-security incident-response --severity critical --phase containment
```

---

**Source:** [Senior Security Engineer](https://github.com/alirezarezvani/claude-skills/tree/main/engineering-team/senior-security)
**License:** MIT
