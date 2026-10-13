Sanchi Dugdh WhatsApp Automation & Order Management PWA

Master Project Handoff Document for Claude

Purpose: Continue development of the existing Sanchi Dugdh WhatsApp Automation & Order Management Progressive Web App (PWA) while preserving its architecture, business rules, UI design, database integrity, security, and repository conventions.

Document role: This is a project continuation guide. It contains confirmed project requirements, established conventions, recommended technical practices, and implementation details that must be verified against the actual source code.

---

1. Instructions for Claude

Before making any changes:

1. Inspect the actual repository and identify its current folder structure, software stack, dependencies, backend framework, database, APIs, authentication, service worker, migrations, and deployment configuration.
2. Locate and read "WHATSAPP_CLOUD_API_META_CATALOG_SOURCE_OF_TRUTH_README.md" in full.
3. Determine which features are implemented, partially implemented, missing, or only represented by frontend prototypes.
4. Preserve existing architecture and naming conventions.
5. Do not create duplicate pages, duplicate services, or parallel implementations when an existing component can be extended.
6. Never assume a feature is implemented simply because it appears in the UI.
7. Never claim a file has been modified unless it has actually been edited.
8. Do not invent database schemas, credentials, hosting information, hardware specifications, API routes, or completed security controls.
9. Make database changes through new, numbered migrations and preserve existing data.
10. If a new requirement conflicts with the source-of-truth README, identify the conflict and ask which requirement should take precedence.

Important: The source-of-truth README is the authority for business behavior. This handoff document is a technical companion, not a replacement for that README.

2. Project Overview

The project is a responsive, mobile-first PWA for Sanchi Dugdh. It integrates WhatsApp Cloud API and the Meta Commerce Catalog to manage customer communications, order requests, customer records, administrator workflows, broadcasts, reminders, and reports.

Main application modules

1. Dashboard
2. Orders
3. Customers
4. WhatsApp Inbox
5. Catalog
6. Broadcasts
7. Reminders
8. Reports
9. Settings

The existing WhatsApp page must serve as the Inbox. Extend it rather than creating a second WhatsApp Inbox page.

Core technology areas

- HTML, CSS, and JavaScript-based frontend structure.
- Progressive Web App functionality.
- WhatsApp Cloud API.
- WhatsApp Webhooks.
- Meta Commerce Catalog and native WhatsApp Cart.
- Backend APIs and database persistence.
- Authentication and administrator authorization.
- Reminder scheduling and email reporting.

Not yet verified: Exact backend language/framework, database engine, hosting provider, email provider, package manager, domain, deployment topology, and hardware specifications. Discover these from the repository and deployment configuration.

3. Fixed Business Rules

3.1 Deterministic WhatsApp system

This project must remain a deterministic system.

Do not introduce:

- AI chatbot or LLM.
- NLP or intent detection.
- Intent classification or inferred customer intent.
- Semantic search or embeddings.
- AI interpretation of arbitrary customer messages.
- Chat-based product selection or quantity collection.
- AI-based customer behavior classification.
- Chat-enabled administrator access control.

Use predefined commands, interactive buttons, fixed responses, and database-backed conversation state.

Unsupported or random messages must follow a predefined fallback. Never guess what the customer intends.

3.2 Single shared catalog

- Use one shared Meta Commerce Catalog for all customers.
- Do not create individual catalogs for customers.
- Do not implement customer-specific catalog pricing.
- Product selection and quantity are handled by the native WhatsApp Catalog Cart.

3.3 Order request versus confirmed order

A customer submitting a cart creates an order request, not a confirmed sale.

The required process is:

1. Customer selects products using the Meta Catalog.
2. Customer submits the native WhatsApp Cart.
3. Backend receives and processes the order request.
4. System acknowledges receipt without claiming final confirmation.
5. Business contacts the customer by phone or through a physical meeting.
6. Administrator confirms or cancels the request in the Admin Portal.
7. The system records the administrator action and its timestamp.
8. The customer may then receive an appropriate message through the shared messaging system.

Never automatically mark an order as confirmed merely because a cart was submitted.

3.4 Customer identity

- WhatsApp phone number is the primary customer identity.
- Reuse existing customer information whenever possible.
- A new customer initially provides name and city.
- Store customer identity separately from individual orders and messages.

3.5 Separate status concepts

Keep these independent:

- Customer status.
- Order status.
- Marketing opt-in status.
- Conversation state.
- Message delivery status.
- Reminder status.
- Administrator account status.

For example, a customer opting out of marketing must not automatically cancel their order or deactivate their customer record.

3.6 Message status

Message statuses must come from WhatsApp webhook events where applicable:

- Sent.
- Delivered.
- Read.
- Failed.

Persist provider message IDs and process repeated webhook events safely.

3.7 Backend authority

The backend must be authoritative for:

- Whether a message can be sent.
- Whether an administrator can perform an action.
- Whether an order can transition to a new status.
- Whether a broadcast recipient is eligible.
- Whether a reminder can be sent.
- Whether a session is valid.
- Whether a request is permitted.

Frontend controls are not security boundaries.

4. Architecture Overview

Expected logical architecture:

CUSTOMER
   |
   v
WHATSAPP
   |
   +----------------------------+
   |                            |
   v                            v
Customer Messages          Catalog Cart
   |                            |
   v                            v
WhatsApp Webhooks          Order Request
   |                            |
   +-------------+--------------+
                 |
                 v
           BACKEND API
                 |
      +----------+----------+
      |          |          |
      v          v          v
  Customer     Order      Message
  Service     Service     Service
      |          |          |
      v          v          v
 Customer DB  Order DB   Message DB
      |          |          |
      +----------+----------+
                 |
                 v
            ADMIN PORTAL
                 |
      +----------+----------+
      |          |          |
      v          v          v
    Inbox      Orders   Broadcasts
      |          |          |
      +----------+----------+
                 |
                 v
       Shared Message Composer
                 |
                 v
         WhatsApp Cloud API

Scheduler
   |
   +----> Reminders
   |
   +----> Daily 4 PM Email Report

This is the logical design. Verify the actual services and deployment structure before implementing it.

5. Database Design

5.1 General database rules

The database should be relational where appropriate, with:

- Primary keys.
- Foreign keys.
- Unique constraints.
- Appropriate indexes.
- Explicit status values.
- Transactions for multi-record business operations.
- Incremental SQL migrations.
- Audit records for sensitive administrator actions.
- Idempotent webhook processing.

Do not assume a particular database engine until the repository confirms it.

5.2 Customers

Suggested logical table: "customers".

Possible fields:

- "id"
- "whatsapp_number"
- "name"
- "city"
- "customer_status"
- "marketing_opt_in"
- "marketing_opt_in_at"
- "marketing_opt_in_source"
- "created_at"
- "updated_at"

Requirements:

- Normalize WhatsApp numbers consistently.
- Enforce uniqueness on the canonical number.
- Reuse existing customer information.
- Store marketing consent separately from customer status and order status.
- Record opt-out events when applicable.
- Do not unnecessarily collect personal data.

Exact column names and consent rules must be checked against existing migrations and the source README.

5.3 Orders

Suggested logical table: "orders".

Possible fields:

- "id"
- "customer_id"
- "source"
- "order_status"
- "submitted_at"
- "confirmed_at"
- "confirmed_by"
- "cancelled_at"
- "cancelled_by"
- "admin_notes"
- "created_at"
- "updated_at"

The exact schema may differ. Preserve the business requirement that a submitted cart is a request, not a confirmed order.

Possible lifecycle:

REQUESTED
    |
    +----> CONFIRMED
    |
    +----> CANCELLED

Add other states only if they are required by the documented workflow.

The confirmation operation should:

1. Authenticate the administrator.
2. Authorize the action.
3. Verify that the order is eligible for confirmation.
4. Update the order transactionally.
5. Record who performed the action and when.
6. Create the required audit event.
7. Trigger any configured notification reliably.

Cancellation requires equivalent authorization, validation, and auditing.

5.4 Order items

If normalized separately, an "order_items" table can contain:

- "id"
- "order_id"
- "catalog_product_id"
- "product_name_snapshot"
- "sku_snapshot", if available
- "quantity"
- "unit_price_snapshot", only when a meaningful price is actually supplied
- "created_at"

Store an appropriate product snapshot so later catalog changes do not silently rewrite historical order information.

Do not invent prices or introduce customer-specific catalog pricing.

5.5 Messages

Suggested logical table: "messages".

Possible fields:

- "id"
- "customer_id"
- "conversation_id", if supported by the schema
- "direction"
- "message_type"
- "text_content"
- "template_id"
- "media_metadata"
- "whatsapp_message_id"
- "message_status"
- "sent_at"
- "delivered_at"
- "read_at"
- "failed_at"
- "error_code"
- "created_at"

Requirements:

- Track inbound and outbound messages.
- Keep provider IDs for correlation.
- Update delivery state from webhooks.
- Prevent duplicate records from repeated events.
- Do not log access tokens or other secrets in message metadata.

5.6 Conversation state

Persist deterministic conversation state in a table or equivalent durable storage.

Potential fields:

- "id"
- "customer_id" or conversation key
- "current_state"
- "conversation_window_expires_at"
- "updated_at"

Do not rely exclusively on in-memory state. The system must recover correctly after a server restart.

5.7 Message library and templates

A database-backed message library should support predefined responses such as:

- Order Received.
- Order Confirmation.
- Order Cancelled.
- Payment Information.
- Delivery Information.
- Thank You.
- Follow-up.
- Customer Visit Reminder.

Where appropriate, store:

- Message identifier.
- Message type.
- Content.
- Language.
- WhatsApp template identifier.
- Variable definitions.
- Active status.
- Created/updated timestamps.

Template names, language, parameters, and status must be validated against the configured WhatsApp/Meta templates.

5.8 Broadcasts

Consider separate logical tables for:

- "broadcasts"
- "broadcast_recipients"

The broadcast record stores campaign configuration and overall status. Recipient records track individual delivery outcomes.

Recipient selection should support relevant customer filters.

Important requirements:

- Recheck marketing opt-in and recipient eligibility at send time.
- Validate messaging-window/template restrictions.
- Track success and failure per recipient.
- Avoid duplicate sending on retries.
- Do not treat initial audience selection as permanent authorization to send.

5.9 Reminders

Suggested logical table: "reminders".

Possible fields:

- "id"
- "customer_id"
- "order_id", if applicable
- "reminder_type"
- "scheduled_at"
- "reminder_status"
- "attempt_count"
- "last_attempt_at"
- "last_error"
- "created_at"
- "updated_at"

Reminder eligibility must follow the configured policy and applicable WhatsApp rules.

5.10 Users, sessions, and roles

See the Login Module section.

Potential entities:

- "users"
- "roles"
- "permissions"
- "user_roles"
- "role_permissions"
- "user_sessions"
- "auth_audit_logs"

Use only the tables needed by the actual authorization design. Avoid duplicating existing functionality.

5.11 Database integrity and migrations

- Use transactions for confirmation, cancellation, and other multi-record state changes.
- Make webhook processing idempotent.
- Use unique constraints for identifiers that must not repeat.
- Index frequently queried fields, such as customer WhatsApp number, order status/time, foreign keys, provider message ID, due reminder time, and session expiry.
- Store timestamps consistently, preferably in UTC, and configure the reporting/display timezone explicitly.
- Preserve historical audit information.
- Never silently edit a migration already applied in an environment. Create a new numbered migration.
- Plan and test backups before production schema changes.
- Document rollback considerations for every significant migration.

The precise schema must be derived from the actual repository and source-of-truth README, not generated from this suggested model without verification.

6. Login and Authentication Module

6.1 Verify the existing implementation first

A prior prototype was described as having simulated login/logout and a PWA shell without a backend. This is historical context, not proof of the current repository state.

Inspect whether login is:

- UI-only.
- Connected to a backend.
- Session-based.
- Role-aware.
- Protected by server-side authorization.
- Connected to a persistent user database.

Never consider a frontend-only login secure.

6.2 File naming

Subject to the existing backend structure, proposed frontend files are:

public/
  pages/
    page_login.html
  js/
    page_login.js
  css/
    page_login.css

A backend authentication module may follow the existing convention:

api_auth.js

Place it according to the repository's established backend layout. Do not create a new backend architecture just to match this example.

6.3 User table

A logical "users" table may include:

- "id"
- "username" or normalized email
- "password_hash"
- "account_status"
- "created_at"
- "updated_at"
- Security metadata required by the implementation.

Passwords must never be stored in plaintext or reversibly encrypted.

6.4 Session design

Recommended approach: server-side sessions with cryptographically random, opaque session tokens in secure cookies.

Cookie attributes should normally include:

HttpOnly
Secure
SameSite=Lax
Path=/

Use the "__Host-" cookie prefix when its requirements are met. Such cookies must not specify a "Domain" attribute.

Recommended controls:

- Store only a hash of the session token in the database.
- Never store or log the raw token.
- Regenerate the session after successful login.
- Revoke sessions on logout, expiry, account disable, or relevant password/security changes.
- Use sensible session expiration and idle-timeout policies.
- Revalidate user status and permissions on protected requests.

If a different authentication approach is already established in the repository, assess it before replacing it.

6.5 Password security

- Use Argon2id or another reviewed password-hashing implementation appropriate to the selected backend stack.
- Use established libraries rather than inventing a password hashing algorithm.
- Apply login rate limits.
- Use generic authentication error messages.
- Prevent account enumeration in login and recovery flows.
- Record authentication events without logging passwords or tokens.
- Require HTTPS in production.
- Store secrets in environment variables or a suitable secret manager.

Password recovery should use short-lived, single-use random tokens whose hashes are stored server-side, if recovery is included in the requirements.

6.6 Roles and permissions

Use role-based access control if multiple levels of administrator access are needed.

Possible roles might include:

- Super Administrator.
- Administrator.
- Order Manager.
- Customer Communication Manager.
- Report Viewer.

These are examples, not confirmed business roles. Confirm actual roles and permissions before implementing them.

Possible permission groups:

- View customers.
- Edit customers.
- View orders.
- Confirm or cancel orders.
- Send individual messages.
- Create and send broadcasts.
- Manage templates.
- Manage reminders.
- View reports.
- Manage users and system settings.

The backend must authorize every protected action. Hiding buttons or pages in JavaScript is not sufficient.

6.7 Suggested API routes

These are examples only; inspect current routes before adding anything:

POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Session renewal, session revocation, and password recovery routes should be added only as required.

Use consistent error handling. Never trust user IDs, roles, or permission claims supplied by the frontend.

6.8 CSRF and authentication

For cookie-based sessions:

- Protect state-changing requests against CSRF.
- Validate requests using a suitable CSRF defense.
- Use SameSite cookie settings as an additional defense, not the sole defense.
- Validate "Origin" or other appropriate request metadata where suitable for the architecture.
- Ensure logout and other state-changing actions cannot be triggered improperly by cross-site requests.

7. Repository Structure and File Naming

Established directory conventions:

public/
  pages/
  js/
  css/
  components/
worker/
migrations/

7.1 Page files

HTML:

public/pages/page_<feature>.html

JavaScript:

public/js/page_<feature>.js

CSS:

public/css/page_<feature>.css

Example login files:

public/pages/page_login.html
public/js/page_login.js
public/css/page_login.css

7.2 Shared components

Reusable components belong in:

public/components/

Examples:

chat.js
message_composer.js
message_preview.js

Use shared components for common messaging behavior instead of copying the same code into Inbox, Broadcasts, and Orders.

7.3 Backend API files

Use the established pattern:

api_<feature>.js

Examples might include "api_auth.js", "api_orders.js", or "api_customers.js", depending on the actual repository structure.

Do not move existing backend modules or introduce another folder convention without a concrete reason.

7.4 Migrations

SQL changes must use incrementally numbered migration filenames that follow the existing naming pattern.

Before creating a migration:

1. Inspect all relevant existing migrations.
2. Determine whether the entity or column already exists.
3. Confirm how migrations are applied and tracked.
4. Avoid destructive schema changes unless explicitly approved.
5. Preserve production data.
6. Document deployment and rollback considerations.

7.5 Development workflow

Before changing a feature:

1. Inspect the relevant HTML, JavaScript, CSS, backend, and migration files.
2. Identify reusable utilities and components.
3. Follow existing naming and code style.
4. Make a focused change.
5. Validate backend behavior and frontend behavior separately.
6. Test responsive and offline states where applicable.
7. Report exactly which files were changed and what remains incomplete.

8. Security Requirements

8.1 Input and database security

- Validate inputs on the backend.
- Use parameterized queries or safe ORM methods.
- Do not construct SQL from untrusted input.
- Enforce business rules in backend services.
- Validate identifiers and status transitions.
- Return safe error messages without exposing stack traces or secrets.

8.2 Authorization

Apply authorization to all protected endpoints involving:

- Customer data.
- Orders and manual order confirmation.
- Messages and WhatsApp Inbox.
- Broadcasts.
- Reminders.
- Reports and exports.
- Templates.
- User management.
- System settings.

Do not rely on frontend route guards or disabled buttons.

8.3 WhatsApp webhook security

- Verify webhook authenticity/signatures according to Meta's current requirements.
- Validate the webhook subscription challenge.
- Process retries and duplicate events safely.
- Avoid allowing untrusted webhook data to perform unauthorized administrator actions.
- Keep webhook verification secrets private.
- Do not rely on browser CORS for server-to-server webhook security.

8.4 Secrets

- Keep ".env" files out of source control.
- Provide a sanitized ".env.example".
- Never commit WhatsApp access tokens, app secrets, webhook verification tokens, session secrets, database credentials, or SMTP credentials.
- Never request that production secrets be pasted into chat.
- Rotate compromised credentials promptly.
- Restrict access to production environment variables and secret stores.

8.5 Upload security

For images, videos, and documents:

- Enforce file-size limits.
- Validate MIME type and file content where feasible.
- Generate safe storage names.
- Restrict upload and download authorization.
- Avoid executing uploaded content.
- Do not expose private media URLs or metadata to unauthorized users.

8.6 Logging and audit

Audit important actions such as:

- Login success/failure.
- Account disablement.
- Permission changes.
- Order confirmation/cancellation.
- Broadcast creation and send operations.
- Message-send failures.
- Sensitive configuration changes.

Record actor, timestamp, target, and outcome as appropriate.

Do not log passwords, raw session tokens, API credentials, or unnecessary personal/message content.

8.7 Backups and maintenance

- Back up production data.
- Restrict access to backups.
- Test restoration periodically.
- Define appropriate retention and deletion rules.
- Keep dependencies patched.
- Use TLS for production communication.
- Monitor service health and background job failures.

9. CORS Configuration

The current backend framework, hosting topology, trusted frontend origins, and existing CORS policy have not been verified. Inspect the repository and deployment environment first.

9.1 Preferred arrangement

When practical, serve the frontend and backend from the same origin. This reduces cross-origin complexity.

If cross-origin requests are necessary, explicitly configure trusted origins.

9.2 Allowlist origins

Maintain an explicit list of approved origins, including scheme, hostname, and port.

Example placeholders:

http://localhost:<development-port>
https://<production-frontend-domain>

Replace placeholders with actual configured values.

Never reflect arbitrary request "Origin" values into "Access-Control-Allow-Origin".

9.3 Credentials

Do not combine:

Access-Control-Allow-Origin: *

with credentialed requests.

For cross-origin cookie sessions:

- Return the exact trusted origin.
- Configure "Access-Control-Allow-Credentials: true" when needed.
- Configure cookies according to the actual same-site or cross-site deployment.
- Truly cross-site cookies generally require "SameSite=None; Secure".
- Test browser behavior in the deployed environment.

9.4 Preflight

- Allow only necessary methods and headers.
- Handle "OPTIONS" requests correctly.
- Ensure CORS middleware ordering does not accidentally expose protected content.
- Add "Vary: Origin" when responses vary by origin.
- Keep production and development allowlists separate.

9.5 Important distinction

CORS is not authentication or authorization.

Even with a strict CORS policy, the backend must still validate sessions, permissions, input, and CSRF protections where applicable.

WhatsApp webhook security must rely on appropriate provider authenticity verification, not browser CORS rules.

10. PWA and Offline Behavior

The application should support:

- Installation.
- Branded application icon.
- Standalone display.
- Offline app-shell access.
- Clear connectivity state.
- A deliberate service-worker update strategy.

Offline caching

Cache only appropriate static assets, such as the application shell and versioned CSS/JavaScript files.

Do not cache:

- Login or session responses.
- Authentication tokens.
- Private API responses.
- Sensitive customer/order data without a carefully justified, secured design.
- Requests whose cached response could expose another user's information.

Server-side actions

While offline:

- Disable or prevent actions that require the backend.
- Clearly explain that connectivity is unavailable.
- Do not display a false success message.
- Recheck server response before reporting that an order or message action succeeded.
- If retrying is supported, design it to prevent duplicate orders and duplicate messages.

The service worker must not bypass authentication or permission checks.

11. Software, Hosting, and Hardware

11.1 Known project requirements

- HTML/CSS/JavaScript-oriented frontend.
- WhatsApp Cloud API integration.
- WhatsApp Webhooks.
- Meta Commerce Catalog.
- Database-backed customer, order, message, and conversation-state management.
- Admin Portal.
- Reminder scheduling.
- Daily 4 PM email report.
- PWA installation and offline app-shell behavior.

11.2 Details requiring repository verification

Do not assume or invent:

- Backend language and framework.
- Database engine and version.
- Node.js or other runtime version.
- Package manager.
- Hosting provider.
- Operating system.
- Domain and TLS configuration.
- Email provider or SMTP service.
- Scheduler technology.
- Physical or virtual server specifications.
- Production deployment topology.
- Expected traffic or concurrent user count.

Determine these from package files, source code, migrations, environment configuration, deployment documentation, and actual infrastructure settings.

11.3 Infrastructure planning

Assess:

- Expected concurrent administrators.
- Daily and peak WhatsApp message volume.
- Webhook bursts and retries.
- Database growth.
- Media storage requirements.
- Scheduled job reliability.
- Backup and recovery requirements.
- Monitoring and alerting.
- Acceptable downtime.
- Secure connectivity to Meta APIs, database, and email provider.

A production system requires a publicly reachable HTTPS webhook endpoint and reliable outbound HTTPS access to the required services.

Do not prescribe CPU, RAM, disk, or bandwidth numbers without workload evidence.

12. Scheduler, Reminders, and Email Reporting

The system must preserve:

- Scheduled reminders.
- WhatsApp messaging-window and template restrictions.
- The configured reminder policy.
- Daily email reporting at 4:00 PM.

Inspect the repository to identify the actual scheduler and email mechanism.

For reliable operation:

- Use durable jobs or a persistent scheduling strategy where necessary.
- Avoid relying on a process-local timer that disappears when a server restarts.
- Track job execution and failure.
- Avoid duplicate reminder sends after retries.
- Record attempts and outcomes.
- Define timezone behavior explicitly.
- Verify whether the 4 PM schedule uses the business's local timezone.
- Keep email credentials outside source control.

Do not invent report contents, recipients, provider, or retry policy. Read the source README and configuration.

13. Messaging Composer and Broadcasts

Use one shared Message Composer for:

- Inbox replies.
- Broadcasts.
- Order confirmation.
- Other administrator messages.

A possible draft model is:

MessageDraft
  type
  template_id
  text
  buttons[]
  media
  variables[]
  preview
  recipients[]

This is a logical model, not a confirmed existing implementation.

The live preview should update as the administrator changes message type, content, buttons, or media.

Before sending, the backend validates:

- Message type and content.
- Recipient identity and eligibility.
- Marketing opt-in.
- Applicable WhatsApp messaging window.
- Template requirements.
- Required variables.
- Media metadata.
- Administrator permissions.
- Duplicate-send protection.

Track each broadcast recipient's outcome and report aggregate statistics without losing per-recipient details.

14. Testing Requirements

Test at least the following.

Authentication

- Valid and invalid login.
- Rate limiting.
- Session expiration.
- Logout and revocation.
- Disabled users.
- Role/permission enforcement.
- CSRF protections.
- Password recovery, if implemented.

Database

- Unique WhatsApp number.
- Foreign-key integrity.
- Valid order transitions.
- Duplicate webhook events.
- Transaction rollback.
- Migration behavior with existing data.
- Backup restoration.

WhatsApp

- Webhook authenticity.
- Webhook retries.
- Duplicate messages/events.
- Delivery-status updates.
- Unsupported-message fallback.
- Exact predefined commands.
- Cart submission versus final confirmation.
- Messaging-window restrictions.
- Template validation.
- Marketing opt-out filtering.

Broadcasts and reminders

- Eligible and ineligible recipients.
- Partial send failures.
- Retry behavior.
- Duplicate-send prevention.
- Reminder policy enforcement.
- Correct 4 PM scheduling and timezone.

CORS and deployment

- Allowed origin.
- Disallowed origin.
- Preflight.
- Credentialed requests.
- HTTPS and cookie settings.
- Production configuration.
- Secret handling.

PWA

- Installation.
- Offline shell.
- Update behavior.
- Cache isolation between users.
- Server actions blocked while offline.
- Correct error handling after reconnection.

15. UI and Branding Consistency

Preserve the established Sanchi-inspired design:

Primary Blue:       #172A9B
Cyan:               #29A9C7
White:              #FFFFFF
Soft Blue-Gray:     #F3F7FA
Dark Navy:          #172033
Amber / Warning:    #E9A23B

Keep:

- Responsive layouts.
- Mobile-first design.
- Touch-friendly controls.
- Consistent spacing and typography.
- Reusable components.
- Consistent status colors.
- Clear loading, empty, error, success, and offline states.

On mobile, favor stacked cards and bottom navigation. On desktop, use the established sidebar and multi-column layout. Extend existing pages and components rather than rebuilding the application unnecessarily.

16. Repository Audit: First Task for Claude

Before implementing new features, provide an audit report with these sections:

A. Repository

- Actual folder tree.
- Entry points.
- Package files and dependencies.
- Frontend/backend structure.
- Service worker and PWA files.

B. Database

- Database engine, if identifiable.
- Existing migrations and tables.
- Relationships and constraints.
- Indexes and uniqueness rules.
- Missing or inconsistent schema elements.
- Migration application process.

C. Authentication

- Existing login implementation.
- Whether it is real or simulated.
- Session/token design.
- Password hashing.
- Authorization and roles.
- CSRF and rate limiting.
- Identified vulnerabilities.

D. APIs and security

- API route map.
- Authentication middleware.
- Authorization model.
- Webhook verification.
- Input validation.
- Secret management.
- Logging and auditing.

E. CORS and deployment

- Actual frontend and backend origins.
- Current CORS middleware/configuration.
- Credential and cookie behavior.
- Production versus development configuration.
- Hosting/runtime details, marking unknowns explicitly.

F. PWA

- Manifest and icons.
- Service-worker strategy.
- Cache rules.
- Offline behavior.
- Update mechanism.
- Risk of private data being cached.

G. Background work

- Reminder scheduler.
- Email report implementation.
- Timezone.
- Retry and duplicate-send handling.
- Logging and monitoring.

H. Implementation plan

List the next tasks in priority order. For each task, identify:

- Why it is required.
- Existing files that will be reused.
- Files that need to be created or changed.
- Whether a database migration is required.
- Security implications.
- Tests required.
- Dependencies and deployment considerations.

Separate confirmed facts from assumptions and recommendations.

17. Permanent Project Invariants

These rules must remain true unless explicitly changed:

1. One shared Meta Commerce Catalog.
2. Native WhatsApp Cart handles product selection and quantity.
3. Cart submission is an order request, not final confirmation.
4. Final confirmation/cancellation requires human contact and an explicit Admin Portal action.
5. WhatsApp number is the primary customer identity.
6. Existing customer information should be reused where possible.
7. New customers initially provide name and city.
8. Commands are exact predefined commands.
9. Unsupported/random text never triggers AI or inferred intent.
10. Marketing opt-in is separate from order status.
11. Customer status is separate from order status.
12. WhatsApp webhook events determine message delivery/read status.
13. Backend validation controls message-send eligibility.
14. Broadcasts respect marketing preferences and recipient eligibility.
15. Admin-triggered confirmation is separate from automatic cart acknowledgement.
16. Reminders respect messaging windows and configured policy.
17. The shared Message Composer and live preview are reused.
18. The daily 4 PM email report is preserved.
19. The existing WhatsApp page remains the Inbox.
20. Database changes use the repository's incremental migration convention.
21. Authentication and authorization are enforced on the backend.
22. CORS is configured deliberately and is not treated as a security substitute.
23. Secrets are not committed or exposed.
24. PWA offline behavior never falsely reports server-side success.
25. New requirements are additions or explicit changes; conflicts are surfaced instead of silently resolved.

---

Final instruction

Begin by auditing the actual repository and reading the full source-of-truth README. Do not immediately rewrite the application or generate replacement files. First establish the current state, report gaps, and propose a prioritized plan. Then implement changes incrementally while preserving all existing business rules, design conventions, database integrity, and security requirements.
