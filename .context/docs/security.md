<!-- agent-update:start:security -->
# Security & Compliance Notes

Capture the policies and guardrails that keep this project secure and compliant.

## Authentication & Authorization
- **Identity Providers**: The project leverages **Supabase Auth** as the primary identity provider. This provides built-in support for social logins (e.g., Google, GitHub), email/password flows, and magic links. For machine-to-machine (M2M) authentication, API keys are managed as Supabase secrets and validated in Edge Functions or middleware.
- **Token Formats**: JSON Web Tokens (JWTs) are issued by Supabase upon successful authentication. These tokens are signed using the project's JWT secret and are used to authorize API requests.
- **Session Strategies**: The Supabase client-side libraries handle session management, securely storing JWTs and automatically refreshing them. For web applications, tokens are stored in cookies to mitigate XSS risks, while mobile clients use secure native storage.
- **Role/Permission Models**: Authorization is primarily enforced using PostgreSQL's **Row-Level Security (RLS)**. RLS policies are defined directly on database tables to control data access based on the authenticated user's ID and role, which are extracted from the JWT. This provides fine-grained, data-centric access control.

## Secrets & Sensitive Data
- **Storage Locations**:
    - **Supabase Project Secrets**: Used for environment variables required by the Supabase backend, such as API keys for third-party services used in Edge Functions. Managed via the Supabase Dashboard or CLI (`supabase secrets set ...`).
    - **AWS Secrets Manager**: Used for secrets external to the Supabase ecosystem, such as credentials for other AWS services or third-party platforms.
    - **Local Development**: Environment variables are loaded via `.env` files, which are excluded from version control via `.gitignore`.
- **Rotation Cadence**: Automated rotation is configured for secrets in AWS Secrets Manager every 90 days. Secrets stored in Supabase are rotated manually as needed, with alerts configured to remind administrators of upcoming expirations for critical keys.
- **Encryption Practices**: All sensitive data is encrypted at rest using AES-256 within the Supabase PostgreSQL database and associated storage. In-transit encryption is enforced using TLS 1.3 for all API and database connections. Supabase secrets are encrypted at rest using AWS KMS.
- **Data Classifications**: Data is classified as Public, Internal, Confidential, or Restricted. Examples: API keys (Restricted), user emails (Confidential), build artifacts (Internal). Automated secret scanning is enforced in the CI/CD pipeline using tools like `trufflehog` or `gitleaks`.

## Compliance & Policies
- **Applicable Standards**: The project adheres to GDPR for personal data processing (e.g., consent management, data access/deletion requests handled via Supabase Auth and RLS). The underlying infrastructure provider (AWS) maintains SOC 2 Type II compliance, and our security controls are designed to align with its principles for security, availability, and confidentiality.
- **Evidence Requirements**: Compliance is tracked via regular internal reviews and vendor compliance reports. Data processing agreements (DPAs) with vendors like Supabase are maintained. Evidence includes vulnerability scan reports from Snyk (integrated in CI), passing RLS policy tests, and quarterly access log reviews from the Supabase platform and application logs. Data Protection Impact Assessments (DPIAs) are documented for new features handling PII.

## Incident Response
- **On-Call Contacts**: Primary on-call is the DevOps team, reachable via PagerDuty (integration in Slack channel `#incidents`). Security incidents escalate to the Security Lead (security@project.org).
- **Escalation Steps**: 
  1. Detection: Alerts from monitoring tools (Datadog, AWS GuardDuty, Supabase platform alerts) trigger initial triage.
  2. Triage: On-call assesses severity (using CVSS scoring) within 15 minutes.
  3. Containment: Isolate affected systems (e.g., pause the Supabase project, revoke user sessions, apply network restrictions).
  4. Eradication/Recovery: Patch vulnerabilities (e.g., update an Edge Function, modify RLS policy) and restore data from Supabase's Point-in-Time Recovery (PITR) backups if necessary.
  5. Post-Incident: Root cause analysis in a blameless postmortem, documented in our wiki/Jira.
- **Tooling for Detection, Triage, and Analysis**: Detection uses Datadog for application performance monitoring and AWS GuardDuty for infrastructure threat intelligence. The **Supabase Log Explorer** is a primary tool for analyzing API requests, database queries, and function logs. Triage involves Slack bots for notifications and automated runbooks. Post-incident analysis leverages our centralized logging platform (e.g., ELK Stack or Datadog Logs) for log correlation.

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
