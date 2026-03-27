---
name: "env-secrets-manager"
description: "Manage environment variables and secrets safely. Audit for leaks, detect hardcoded credentials, plan secret rotation, and implement secure storage. Use when: managing .env files, securing credentials, auditing for leaks, planning rotation, setting up secret stores."
---

# Env & Secrets Manager

Manage environment-variable hygiene and secrets safely across development and production.

## Core Capabilities

### Secret Leak Detection

**Repository Scanning**
- Detects hardcoded API keys
- Finds exposed credentials
- Identifies database passwords
- Scans for tokens and secrets

**Severity Classification**
- **Critical:** Active credentials, immediate exposure risk
- **High:** Sensitive config, likely credentials
- **Medium:** Suspicious patterns, context needed
- **Low:** False positives, requires validation

**Operational Guidance**
- Rotation recommendations
- Containment procedures
- CI integration points
- Prevention strategies

### Environment Validation

**.env vs .env.example Lifecycle**
- Validates .env file structure
- Checks .env.example for safety
- Verifies .gitignore coverage
- Detects missing variables

**Consistency Checks**
- Required vs optional variables
- Type validation (URI format, JSON, etc.)
- Cross-service variable consistency
- Documentation alignment

## When to Use

- Before pushing commits with env/config changes
- During security audits and incident triage
- Onboarding contributors needing env conventions
- Validating no secrets are hardcoded
- Planning credential rotation

## Quick Start

```bash
# Scan repository for secret leaks
python3 scripts/env_auditor.py /path/to/repo

# JSON output for CI pipelines
python3 scripts/env_auditor.py /path/to/repo --json

# Scan specific directories
python3 scripts/env_auditor.py /path/to/repo --include-paths src,config
```

## Recommended Workflow

1. **Scan repository** with `env_auditor.py`
2. **Prioritize findings** — critical/high first
3. **Rotate credentials** — revoke exposed values
4. **Update files** — .env.example, .gitignore
5. **Tighten CI** — add pre-commit/CI gates
6. **Verify** — rescan to confirm fixes

## Common Patterns

### API Keys

```bash
# Typical formats to detect
STRIPE_KEY=sk_live_abc123xyz...
GITHUB_TOKEN=ghp_abc123xyz...
AWS_SECRET_ACCESS_KEY=abc123xyz...
OPENAI_API_KEY=sk-abc123xyz...
```

### Database Credentials

```bash
DATABASE_URL=postgresql://user:password@host:5432/db
MONGO_URI=mongodb://user:password@cluster.mongodb.net/db
REDIS_URL=redis://:password@host:6379
```

### OAuth & Tokens

```bash
JWT_SECRET=your-secret-key
SESSION_SECRET=random-string
OAUTH_CLIENT_SECRET=secret123
ACCESS_TOKEN=eyJhbGciOiJIUzI1NiI...
```

## Best Practices

### Development Workflow

1. **Use .env files locally** (gitignored)
2. **Commit .env.example** with placeholder values
3. **Document required variables** in README
4. **Never commit real secrets** in version control
5. **Rotate frequently** (quarterly minimum)

### CI/CD Injection

**GitHub Actions:**
```yaml
- name: Deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    API_KEY: ${{ secrets.API_KEY }}
  run: ./deploy.sh
```

GitHub automatically masks secret values in logs.

**GitLab CI:**
```yaml
deploy:
  variables:
    DATABASE_URL: $DATABASE_URL  # Marked protected
    API_KEY: $API_KEY
  script:
    - ./deploy.sh
```

Mark variables as `protected` and `masked` in settings.

**Universal Rules:**
- Never echo/print secret values
- Use short-lived tokens (OIDC, STS) instead of static keys
- Restrict PR access (no secrets to fork PRs)
- Rotate CI secrets on same schedule as application secrets
- Audit pipeline logs for accidental leaks

## Secret Storage Solutions

### Cloud-Native Options

| Provider | Best For | Key Features |
|----------|----------|-------------|
| **AWS Secrets Manager** | AWS workloads | Native Lambda/ECS integration, RDS auto-rotation |
| **Azure Key Vault** | Azure workloads | Managed HSM, Azure AD RBAC, certificate mgmt |
| **GCP Secret Manager** | GCP workloads | IAM-based access, replication, versioning |
| **HashiCorp Vault** | Multi-cloud/hybrid | Uniform API, dynamic secrets, policy engine |

### Selection Guidance

**Single Cloud Provider:**
- Use cloud-native secret manager
- Tighter integration with IAM
- Lower operational overhead
- Cost-effective

**Multi-Cloud or Hybrid:**
- Use HashiCorp Vault
- Uniform API across environments
- Supports dynamic secret generation
- Database credentials auto-expire

**Kubernetes Heavy:**
- Combine External Secrets Operator with any backend
- Syncs secrets into K8s Secret objects
- Avoids hardcoding in manifests
- Automatic refresh on secret rotation

## Access Patterns

### SDK/API Pull

Application fetches secret at startup or on-demand:

```python
import boto3

client = boto3.client('secretsmanager')
response = client.get_secret_value(SecretId='prod/db-password')
secret = response['SecretString']
```

Pros: Simple, explicit control.
Cons: Network dependency at startup.

### Sidecar Injection

Sidecar container writes secrets to volume or env vars:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: secrets
      mountPath: /etc/secrets
  - name: vault-agent
    image: vault:latest
    volumeMounts:
    - name: secrets
      mountPath: /etc/secrets
```

Pros: No network call needed.
Cons: Additional sidecar container.

### Init Container

Kubernetes init container fetches secrets before app starts:

```yaml
initContainers:
- name: fetch-secrets
  image: vault:latest
  command:
  - /bin/sh
  - -c
  - |
    vault kv get -format=json secret/app | jq '.data' > /etc/secrets/config.json
volumeMounts:
- name: secrets
  mountPath: /etc/secrets
```

### CSI Driver

Secrets mount as filesystem volume via Secrets Store CSI Driver:

```yaml
volumeMounts:
- name: secrets-store
  mountPath: /mnt/secrets
volumes:
- name: secrets-store
  csi:
    driver: secrets-store.csi.k8s.io
    readOnly: true
    volumeAttributes:
      provider: vault
```

## Secret Rotation Workflow

### Phase 1: Detection

- Track secret creation/expiry in secret store metadata
- Set alerts at 30, 14, 7 days before expiry
- Use `env_auditor.py` to flag unrotated secrets
- Review rotation dates quarterly

### Phase 2: Rotation

1. **Generate** new credential (API key, password, certificate)
2. **Deploy** to all consumers (apps, services, pipelines) in parallel
3. **Verify** each consumer authenticates with new credential
4. **Revoke** old credential after all consumers confirmed healthy
5. **Update** metadata with rotation timestamp

### Phase 3: Automation

**AWS Secrets Manager:**
- Built-in Lambda-based rotation
- Supports RDS, Redshift, DocumentDB
- Automatic execution on schedule

**HashiCorp Vault:**
- Dynamic secrets with TTLs
- Auto-generated and auto-expired
- Database credentials generated on-demand

**Azure Key Vault:**
- Event Grid notifications
- Trigger rotation via Cloud Functions
- Manual or automated procedures

**GCP Secret Manager:**
- Pub/Sub notifications
- Cloud Functions for rotation logic
- Custom rotation scripts

### Emergency Rotation

When a secret is confirmed leaked:

1. **Immediately revoke** at provider level
2. **Generate & deploy** replacement to all consumers
3. **Audit access logs** for unauthorized usage
4. **Scan git history** for leaked value
5. **File incident report** — timeline, scope, remediation
6. **Tighten detection** — prevent recurrence

## Pre-Commit Detection

### gitleaks

Catch secrets before they reach version control:

```toml
# .gitleaks.toml
[extend]
useDefault = true

[[rules]]
id = "internal-token"
description = "Internal service token"
regex = '''INTERNAL_TOKEN_[A-Za-z0-9]{32}'''
secretGroup = 0
```

Install:
```bash
brew install gitleaks
```

Pre-commit hook:
```bash
gitleaks git --pre-commit --staged
```

Baseline scan:
```bash
gitleaks detect --source . --report-path report.json
```

Manage false positives in `.gitleaksignore`.

### detect-secrets

```bash
# Generate baseline
detect-secrets scan --all-files > .secrets.baseline

# Pre-commit hook (.pre-commit-config.yaml)
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

Supports custom plugins for organization-specific patterns.

Audit workflow:
```bash
detect-secrets audit .secrets.baseline
```

## Audit Logging

### Cloud Audit Trails

| Provider | Service | Captures |
|----------|---------|----------|
| **AWS** | CloudTrail | GetSecretValue, DescribeSecret, RotateSecret |
| **Azure** | Activity Log | Key Vault access, caller, IP, timestamp |
| **GCP** | Audit Logs | Secret Manager access, principal, timestamp |
| **Vault** | Audit Backend | Full request/response logging |

### Alerting Strategy

- Alert on access from **unknown IP ranges**
- Alert on **bulk secret reads** (N secrets in time window)
- Alert on access **outside deployment windows**
- Feed logs into SIEM (Splunk, Datadog, Elastic)
- Review logs quarterly for access recertification

### Common Violations to Alert

```
- Access from new country/IP
- Batch access to multiple secrets
- Access from user account (should be service account)
- Access outside business hours
- Access immediately after credential rotation
```

## File Structure Best Practices

### .env File

```bash
# Development configuration (local only, gitignored)
DATABASE_URL=postgresql://localhost/myapp_dev
REDIS_URL=redis://localhost:6379
API_KEY=dev-key-for-local-testing
DEBUG=true
LOG_LEVEL=debug
```

### .env.example

```bash
# Template for developers (committed to git)
DATABASE_URL=postgresql://user:password@localhost/mydb
REDIS_URL=redis://localhost:6379
API_KEY=your-api-key-here
DEBUG=false
LOG_LEVEL=info
SECRET_KEY=generate-a-random-string
```

### .gitignore

```bash
# Never commit .env files
.env
.env.local
.env.*.local

# Secrets and credentials
*.pem
*.key
*.cert
.ssh/
```

## Typical Workflow

1. **Setup detection** — gitleaks or detect-secrets pre-commit
2. **Create .env templates** — .env.example with safe values
3. **Document requirements** — List all required variables
4. **Configure secret store** — AWS/Azure/GCP/Vault
5. **Integrate with CI/CD** — Pass secrets safely to pipelines
6. **Setup rotation** — Automated or manual procedures
7. **Monitor access** — Audit logs and alerts
8. **Regular audits** — Quarterly security reviews

---

**Source:** [Env & Secrets Manager](https://github.com/alirezarezvani/claude-skills/tree/main/engineering/env-secrets-manager)
**License:** MIT
