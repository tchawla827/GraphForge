---
name: "senior-devops"
description: "Design and implement CI/CD pipelines, infrastructure as code, and deployment strategies. Generate GitHub Actions/CircleCI pipelines, Terraform modules, and manage deployments. Use when: building CI/CD, provisioning infrastructure, deploying applications, managing cloud resources."
---

# Senior DevOps Engineer

Design and implement CI/CD pipelines, Infrastructure as Code, and deployment strategies.

## Core Capabilities

### Pipeline Generator
Creates production-grade CI/CD configurations:
- **GitHub Actions or CircleCI** configuration generation
- **Build stages** with compilation and artifact generation
- **Test stages** with unit, integration, and e2e tests
- **Security scanning** with SAST/DAST tools
- **Deployment stages** with approval gates
- **Notifications** and rollback procedures

### Terraform Scaffolder
Generates Infrastructure as Code modules:
- **AWS, GCP, Azure** resource definitions
- **Kubernetes** cluster provisioning
- **Database** infrastructure setup
- **Networking** and security group configuration
- **Load balancers** and auto-scaling
- **Module composition** for reusability

### Deployment Manager
Handles safe application deployments:
- **Blue/green deployments** with instant rollback
- **Rolling updates** with controlled rollout
- **Canary deployments** for gradual rollout
- **Health check validation** before traffic switching
- **Automatic rollback** on failure detection
- **Database migration** coordination

## Key Features

### CI/CD Pipelines

**Standard Stages:**
1. **Build** — Compile, bundle, containerize
2. **Test** — Unit tests, integration tests, e2e tests
3. **Security** — SAST, dependency scanning, secret detection
4. **Deploy to Staging** — Verify in staging environment
5. **Approval Gate** — Manual review before production
6. **Deploy to Production** — Safe deployment with rollback
7. **Smoke Tests** — Validate production deployment
8. **Notifications** — Slack, email, incident tracking

**Customization Options:**
- Branch-based deployments (main → production)
- Multi-environment pipelines
- Scheduled job triggers
- Manual deployment triggers
- Artifact retention policies

### Infrastructure as Code

**Terraform Modules:**
- **Compute:** EC2, GKE, App Service
- **Databases:** RDS, Cloud SQL, Cosmos DB
- **Storage:** S3, GCS, Azure Blob
- **Networking:** VPC, subnets, security groups
- **Kubernetes:** EKS, GKE, AKS with addons
- **Monitoring:** CloudWatch, Stackdriver, Monitor

**Features:**
- State management strategy
- Variable validation
- Output definitions
- Module composition
- Local testing with terraform plan

### Deployment Strategies

**Blue/Green Deployment:**
- No downtime deployment
- Instant traffic switching
- Quick rollback capability
- Parallel environment testing

**Rolling Update:**
- Gradual instance replacement
- Maintains service availability
- Configurable rollout speed
- Automatic rollback on failure

**Canary Deployment:**
- Deploy to small traffic percentage
- Monitor metrics for errors/latency
- Gradually increase traffic
- Rollback if thresholds exceeded

## Cloud Strategy Guidance

### Single vs. Multi-Cloud

**Start Single-Cloud:**
- Leverage cloud-native services
- Optimize for one provider's ecosystem
- Reduce operational complexity
- Use provider-specific tools

**Add Multi-Cloud Only When:**
- Regulatory requirements mandate it
- Concrete business redundancy need
- Specific service unavailable in primary cloud
- NOT for theoretical risk mitigation

### Terraform vs. Pulumi

**Choose Terraform:**
- Cross-cloud compatibility needed
- Team familiar with HCL
- Provider ecosystem is large
- Version control workflows important

**Choose Pulumi:**
- Team prefers traditional programming languages
- Complex logic and reuse needed
- Python/TypeScript developers available
- Fine-grained control required

## Typical Workflow

### Setting Up CI/CD

1. **Define Pipeline Stages**
   - Build, test, deploy configuration
   - Approval gates and notifications
   - Environment-specific variables
   - Rollback procedures

2. **Generate Configuration**
   - GitHub Actions or CircleCI YAML
   - Secret management setup
   - Artifact storage configuration
   - Notification channels

3. **Test Pipeline**
   - Dry-run on feature branch
   - Validate builds succeed
   - Verify tests run
   - Check deployment procedures

4. **Deploy & Monitor**
   - Enable on main branch
   - Monitor build times
   - Track deployment frequency
   - Measure lead time

### Provisioning Infrastructure

1. **Design Architecture**
   - Compute, storage, networking
   - High availability configuration
   - Security boundaries
   - Scaling requirements

2. **Generate Terraform**
   - Create reusable modules
   - Define variables and outputs
   - Add provider configuration
   - Document assumptions

3. **Plan & Validate**
   - Run terraform plan
   - Review changes
   - Validate syntax
   - Check for compliance

4. **Apply & Manage**
   - Apply infrastructure changes
   - Document infrastructure
   - Set up monitoring
   - Plan maintenance windows

## Supported Platforms

- **CI/CD:** GitHub Actions, CircleCI, GitLab CI, Jenkins
- **IaC:** Terraform, CloudFormation, ARM Templates, Pulumi
- **Containerization:** Docker, Kubernetes, ECS, AKS, GKE
- **Cloud Providers:** AWS, GCP, Azure, DigitalOcean
- **Monitoring:** Prometheus, Grafana, CloudWatch, Datadog

## Quick Commands

```bash
# CI/CD pipeline generation
/senior-devops pipeline-generate --platform github-actions --stages build,test,deploy

# Terraform scaffolding
/senior-devops terraform-scaffold --cloud aws --services eks,rds,s3

# Deployment management
/senior-devops deploy --strategy blue-green --environment production
```

---

**Source:** [Senior DevOps Engineer](https://github.com/alirezarezvani/claude-skills/tree/main/engineering-team/senior-devops)
**License:** MIT
