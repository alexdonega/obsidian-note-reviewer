<!-- agent-update:start:security -->
# Security & Compliance Notes

Capture the policies and guardrails that keep this project secure and compliant.

## Authentication & Authorization
- **Identity Providers**: The project integrates with Auth0 as the primary identity provider for user authentication. This supports social logins (e.g., Google, GitHub) and email/password flows. For internal services, API keys are managed via Auth0's machine-to-machine authentication.
- **Token Formats**: JSON Web Tokens (JWTs) are used for access tokens, signed with RS256 algorithm. Refresh tokens are opaque strings stored securely.
- **Session Strategies**: Stateless sessions are implemented using JWTs stored in HTTP-only, secure cookies to mitigate XSS risks. Server-side session validation occurs via token introspection with Auth0.
- **Role/Permission Models**: Role-Based Access Control (RBAC) is enforced using roles such as `admin`, `developer`, `user`, and `guest`. Permissions are defined in a centralized policy file (`packages/core/src/permissions.ts`) and checked via middleware in app routes. Fine-grained permissions (e.g., read/write on specific resources) are handled through custom claims in JWTs.

## Secrets & Sensitive Data
- **Storage Locations**: Secrets are stored in AWS Secrets Manager for cloud deployments and HashiCorp Vault for local/on-prem environments. Environment variables are used for development, loaded via `.env` files (gitignored). Database credentials and API keys follow a naming convention like `proj/app-name/secret-type`.
- **Rotation Cadence**: Automated rotation is configured every 90 days using AWS Lambda functions or Vault policies. Manual rotation is required for high-sensitivity secrets like root database credentials.
- **Encryption Practices**: All sensitive data is encrypted at rest using AES-256 in databases (e.g., PostgreSQL with pgcrypto) and AWS RDS. In-transit encryption uses TLS 1.3. Client-side encryption is applied for PII in frontend apps via libraries like crypto-js.
- **Data Classifications**: Data is classified as Public, Internal, Confidential, or Restricted. Examples: API keys (Restricted), user emails (Confidential), build artifacts (Internal). Scanning for secrets in code is enforced via pre-commit hooks using tools like git-secrets.

## Compliance & Policies
- **Applicable Standards**: The project adheres to GDPR for personal data processing (e.g., consent management in user onboarding) and SOC 2 Type II for security, availability, and confidentiality controls. Internal policies include a Code of Conduct and Data Handling Guidelines, aligned with ISO 27001 principles. HIPAA is not currently applicable but monitored for future healthcare integrations.
- **Evidence Requirements**: Compliance is tracked via annual third-party audits (e.g., SOC 2 reports stored in `references/compliance/`). Data processing agreements (DPAs) with vendors like Auth0 are maintained. Evidence includes vulnerability scan reports from Snyk (integrated in CI) and access logs reviewed quarterly. For GDPR, DPIAs (Data Protection Impact Assessments) are documented for new features handling PII.

## Incident Response
- **On-Call Contacts**: Primary on-call is the DevOps team, reachable via PagerDuty (integration in Slack channel `#incidents`). Security incidents escalate to the Security Lead (security@project.org) or external hotline for critical breaches.
- **Escalation Steps**: 
  1. Detection: Alerts from monitoring tools trigger initial triage.
  2. Triage: On-call assesses severity (using CVSS scoring) within 15 minutes.
  3. Containment: Isolate affected systems (e.g., revoke tokens, firewall rules).
  4. Eradication/Recovery: Patch vulnerabilities and restore from backups.
  5. Post-Incident: Root cause analysis in a blameless postmortem, documented in Jira.
- **Tooling for Detection, Triage, and Analysis**: Detection uses Datadog for anomaly monitoring and AWS GuardDuty for threat intelligence. Triage involves Slack bots for notifications and Runbook automation in Opsgenie. Post-incident analysis leverages ELK Stack (Elasticsearch, Logstash, Kibana) for log correlation, with reports filed in `docs/incident-reports/`.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Confirm security libraries and infrastructure match current deployments.
2. Update secrets management details when storage or naming changes.
3. Reflect new compliance obligations or audit findings.
4. Ensure incident response procedures include current contacts and tooling.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Security architecture docs, runbooks, policy handbooks.
- IAM/authorization configuration (code or infrastructure).
- Compliance updates from security or legal teams.

<!-- agent-update:end -->
