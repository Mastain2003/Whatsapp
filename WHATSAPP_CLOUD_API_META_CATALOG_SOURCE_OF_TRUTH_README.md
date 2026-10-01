# WhatsApp Cloud API + Meta Catalog Order System

## Master README / Source of Truth

**Version:** 1.0\
**Purpose:** Baseline architecture and requirements for the WhatsApp
ordering, customer messaging, admin, broadcast, reminder, and reporting
system.

> **Source-of-truth rule:** When this README is provided in a future
> conversation, treat it as the baseline architecture and requirements.
> Do not silently remove, replace, or reinterpret existing requirements.
> Any new requirement is an addition/change to this blueprint.

------------------------------------------------------------------------

# 1. Core Principle

This is a **simple, deterministic WhatsApp ordering system**.

The system must NOT use:

-   AI chatbot
-   LLM
-   NLP
-   Intent detection
-   Intent classification
-   Semantic search
-   Embeddings
-   Customer-intention inference

The system is based on:

-   WhatsApp Cloud API
-   WhatsApp Webhooks
-   WhatsApp interactive buttons
-   Predefined commands
-   Predefined responses
-   Meta Commerce Catalog
-   Native WhatsApp Catalog Cart
-   Database-backed conversation state
-   Customer database
-   Order database
-   Reminder scheduler
-   Admin Portal
-   Customer chat/inbox
-   Message composer
-   Broadcast system
-   Daily 4 PM email report

------------------------------------------------------------------------

# 2. Fixed Business Requirements

## 2.1 Catalog

Use **ONE Meta Commerce Catalog**.

The same catalog is available to all customers.

Do not create:

-   Separate catalogs per customer
-   Customer-specific catalogs
-   Customer-specific catalog pricing

Product selection and quantity are handled by the native WhatsApp
Catalog Cart.

------------------------------------------------------------------------

## 2.2 Ordering

WhatsApp is used to take an **order request**.

A customer submitting a catalog cart does NOT mean the order is finally
confirmed.

Final confirmation happens only through:

-   Phone call, OR
-   Physical meeting

The administrator then confirms or cancels the request through the Admin
Portal.

------------------------------------------------------------------------

## 2.3 Customer Communication

There are two main entry points.

### Business initiated

The business may initiate communication using an approved WhatsApp
promotional/template message.

### Customer initiated

A customer may initiate the conversation by sending any message.

Both paths eventually enter the same deterministic system.

------------------------------------------------------------------------

# 3. Main WhatsApp Flow

## Case A --- Business Initiates

``` text
Approved Promotional / Template Message
                |
                v
          [ View Catalog ]
                |
                v
        Meta Commerce Catalog
                |
                v
              Cart
                |
                v
        Customer submits Cart
                |
                v
         ORDER REQUESTED
```

------------------------------------------------------------------------

## Case B --- Customer Initiates

Example:

``` text
Customer:
Hi
```

System:

``` text
Welcome. Please select an option.

[ View Catalog ]
[ Help ]
```

Customer selects:

``` text
[ View Catalog ]
```

Then:

``` text
MAIN MENU
    |
    v
VIEW CATALOG
    |
    v
META CATALOG
    |
    v
CART
    |
    v
CART SUBMITTED
    |
    v
ORDER REQUEST
```

No intent detection is required.

------------------------------------------------------------------------

# 4. Main Menu

Example:

``` text
Welcome!

Please select an option:

[ View Catalog ]
[ Help ]
[ Language ]
```

The normal order path is:

``` text
MAIN_MENU
    |
    v
VIEW_CATALOG
    |
    v
CATALOG
    |
    v
CART
    |
    v
ORDER_REQUESTED
```

------------------------------------------------------------------------

# 5. Meta Catalog + Cart

Use the native Meta Commerce Catalog.

The catalog handles:

-   Product display
-   Product selection
-   Quantity
-   Cart
-   Cart submission

Do NOT build chat steps such as:

``` text
Which product?
How many?
Do you want 2?
```

The catalog/cart handles these operations.

The backend receives the cart/order information through WhatsApp webhook
events and creates an internal order request.

------------------------------------------------------------------------

# 6. Order Request vs Confirmed Order

A WhatsApp Cart submission is **never automatically a confirmed order**.

Lifecycle:

``` text
CART_SUBMITTED
      |
      v
ORDER_REQUESTED
      |
      v
PENDING_CONFIRMATION
      |
      +----------------+
      |                |
      v                v
  CONFIRMED         CANCELLED
      |
      v
CONFIRMATION_SENT
```

`CONFIRMATION_SENT` can be treated as a separate status if useful.

Only the administrator can move `PENDING_CONFIRMATION` to `CONFIRMED`
after a phone call or physical meeting.

------------------------------------------------------------------------

# 7. Customer Information

When the cart is submitted:

1.  Identify the customer using the WhatsApp number.
2.  Look up the customer in the database.

## Existing Customer

If the WhatsApp number exists, use existing information.

Possible information:

-   WhatsApp number
-   Name
-   Post
-   Department
-   City
-   Language
-   Marketing preference
-   Other stored customer information

Do not ask again for information already stored.

Example:

``` text
WhatsApp: 919876543210

Name: Rajesh Kumar
Post: Manager
Department: Purchase
City: Indore
```

------------------------------------------------------------------------

# 8. New Customer

If the WhatsApp number does not exist:

Ask:

``` text
Please enter your name.
```

Then:

``` text
Please enter your city.
```

Save:

-   WhatsApp number
-   Name
-   City

Post and Department are not required in the initial new-customer flow.

Then send:

``` text
Thank you. Your order request has been received.

Final confirmation will be done by phone or in person.
```

------------------------------------------------------------------------

# 9. Customer Database

Suggested structure:

``` text
customers

id
whatsapp_number
name
post
department
city
language
marketing_opt_in
status
created_at
updated_at
```

The WhatsApp number is the primary customer lookup identifier.

`status` may be used for administrative/broadcast filtering, but must
remain conceptually separate from order status.

------------------------------------------------------------------------

# 10. Conversation Session Database

Suggested structure:

``` text
conversation_sessions

id
customer_id
current_state
previous_state
last_customer_message_at
last_business_message_at
conversation_window_expires_at
created_at
updated_at
```

The conversation state machine is deterministic.

------------------------------------------------------------------------

# 11. Order Database

Suggested structure:

``` text
orders

id
customer_id
whatsapp_order_id
whatsapp_message_id
status
cart_items
requested_at
confirmed_at
cancelled_at
confirmation_method
confirmed_by
confirmation_message_sent_at
cancellation_reason
cancelled_by
created_at
updated_at
```

Confirmation method:

``` text
PHONE
PHYSICAL_MEETING
```

------------------------------------------------------------------------

# 12. Order States

Recommended:

``` text
CART_SUBMITTED
       |
       v
ORDER_REQUESTED
       |
       v
PENDING_CONFIRMATION
       |
       +------------------+
       |                  |
       v                  v
  CONFIRMED            CANCELLED
       |
       v
CONFIRMATION_SENT
```

------------------------------------------------------------------------

# 13. Global Commands

Global commands work from anywhere in the conversation.

Supported exact predefined commands/variants:

-   MENU
-   HELP
-   LANGUAGE
-   LANG
-   UNSUBSCRIBE
-   STOP
-   CANCEL

These are exact commands/variants only.

Do not use AI or NLP to interpret similar sentences.

------------------------------------------------------------------------

# 14. MENU

Action:

Return to `MAIN_MENU`.

Example:

``` text
Customer:
MENU
```

System:

``` text
MAIN MENU

[ View Catalog ]
[ Help ]
[ Language ]
```

------------------------------------------------------------------------

# 15. HELP

Show available commands/options.

Example:

``` text
Available options:

MENU — Main menu
HELP — Show help
LANGUAGE — Change language
CANCEL — Cancel current order/flow
STOP — Stop current flow
UNSUBSCRIBE — Stop promotional messages

[ Main Menu ]
```

------------------------------------------------------------------------

# 16. LANGUAGE / LANG

Open language selection.

Example:

``` text
Please select your language:

[ English ]
[ हिन्दी ]
```

Store selected language in the customer record.

Example:

``` text
customers.language = "hi"
```

After selecting a language, return to the state that existed before
language selection.

Example:

``` text
CART
  |
  v
LANGUAGE_MENU
  |
  v
Select Hindi
  |
  v
Return to CART
```

Use `previous_state`.

------------------------------------------------------------------------

# 17. UNSUBSCRIBE

`UNSUBSCRIBE` controls the marketing preference.

When received:

``` text
marketing_opt_in = false
```

This means:

-   Stop promotional/marketing communication.
-   Do not automatically cancel an existing order.
-   Do not delete the customer.
-   Do not necessarily prevent normal customer-initiated ordering.

Customer and order state remain separate.

Example:

``` text
You have been unsubscribed from promotional messages.

[ Main Menu ]
```

------------------------------------------------------------------------

# 18. STOP

`STOP` means stop the current conversational flow.

Possible behavior:

``` text
current_state = IDLE
```

Clear temporary conversation data when appropriate.

STOP does NOT necessarily mean:

-   Cancel a confirmed order
-   Unsubscribe from all marketing
-   Delete customer record

------------------------------------------------------------------------

# 19. CANCEL

`CANCEL` means cancel the current active order/flow where applicable.

If an active order request is pending:

``` text
PENDING_CONFIRMATION
        |
        v
      CANCEL
        |
        v
    CANCELLED
```

Example:

``` text
Your current order request has been cancelled.

[ Main Menu ]
```

If there is no cancellable request:

``` text
There is no active order request to cancel.

[ Main Menu ]
```

------------------------------------------------------------------------

# 20. Random / Unsupported Text

No AI.

No intent detection.

No NLP.

If unsupported text is received, send a fixed fallback appropriate to
the current state.

Example:

Customer is in CART state:

``` text
Hello, what is happening?
```

System:

``` text
Please select an option below.

[ Main Menu ]
[ Help ]
```

The system does not attempt to understand the sentence.

------------------------------------------------------------------------

# 21. Button IDs

Always use internal IDs instead of relying on visible button text.

Example IDs:

``` text
VIEW_CATALOG
MAIN_MENU
HELP
LANGUAGE
LANG_EN
LANG_HI
UNSUBSCRIBE
STOP
CANCEL
CONFIRM_ORDER
SEND_CONFIRMATION
```

Backend logic should use:

``` text
VIEW_CATALOG
```

not:

``` text
View Catalog
```

This allows translations without changing backend logic.

------------------------------------------------------------------------

# 22. State Machine

Minimal state machine:

``` text
IDLE
 |
 v
MAIN_MENU
 |
 +---- VIEW_CATALOG ----> CATALOG
 |
 +---- HELP ------------> HELP
 |
 +---- LANGUAGE --------> LANGUAGE_MENU
 |
 v
CATALOG
 |
 v
CART
 |
 v
CART_SUBMITTED
 |
 v
ORDER_REQUESTED
 |
 v
PENDING_CONFIRMATION
 |
 +---- CONFIRM ----> CONFIRMED
 |
 +---- CANCEL ------> CANCELLED
```

Utility states such as `LANGUAGE_MENU` remember `previous_state`.

------------------------------------------------------------------------

# 23. Global Command Priority

Every incoming message is processed conceptually as:

``` text
INCOMING MESSAGE
       |
       v
Is it a global command?
       |
   +---+---+
   |       |
  YES      NO
   |       |
   v       v
Execute   Check
command   message type/state
```

Supported message types may include:

-   Interactive/button reply
-   Catalog/product/cart event
-   Text
-   Other supported WhatsApp event

Do not use intent detection.

------------------------------------------------------------------------

# 24. Abandoned Flow / Reminders

Reminders are separate from the core state machine.

Track:

``` text
last_customer_message_at
reminder_stage
next_reminder_at
sent_at
cancelled_at
```

Example:

``` text
Customer opens catalog
       |
       v
No activity
       |
       v
Reminder 1
       |
       v
Still inactive
       |
       v
Optional Reminder 2
       |
       v
Customer returns
       |
       v
Cancel/reschedule reminders
```

Reminders must respect the applicable WhatsApp
messaging/customer-service window and configured reminder policy.

If the customer returns, do not send an outdated reminder.

After the applicable window/policy ends, stop normal reminder messages.

------------------------------------------------------------------------

# 25. Abandoned Cart vs Order Request

These are different concepts.

## Abandoned Catalog/Cart

Customer starts shopping but does not submit the cart.

Possible reminder:

``` text
Your shopping session is still available.
```

## Submitted Cart

Customer submits the cart.

Create:

``` text
ORDER_REQUESTED
       |
       v
PENDING_CONFIRMATION
```

Do not repeatedly ask the customer to confirm the order in WhatsApp.

Final confirmation happens by phone or physical meeting.

------------------------------------------------------------------------

# 26. Customer Acknowledgement After Cart

After successful cart submission:

``` text
Thank you. Your order request has been received.

Our team will contact you by phone or discuss it with you personally for final confirmation.
```

Never state that the order is confirmed merely because the cart was
submitted.

------------------------------------------------------------------------

# 27. Admin Portal

The Admin Portal is the human control point.

Original order functions:

-   View pending order requests
-   View customer details
-   View products and quantities
-   Confirm order
-   Cancel order
-   Record confirmation method
-   Record administrator
-   Send WhatsApp confirmation
-   Maintain audit trail

Example:

``` text
ORDER #10452

Status:
PENDING CONFIRMATION

Customer:
Rajesh Kumar

WhatsApp:
919876543210

Post:
Manager

Department:
Purchase

City:
Indore

Products:

Product A × 2
Product C × 1

Actions:

[ Confirm Order ]
[ Cancel Order ]
```

------------------------------------------------------------------------

# 28. Final Confirmation

Administrator contacts the customer through:

-   Phone call, OR
-   Physical meeting

If customer agrees:

``` text
PENDING_CONFIRMATION
        |
        v
     CONFIRMED
```

Store:

``` text
confirmed_at
confirmed_by
confirmation_method
```

Confirmation method:

``` text
PHONE
PHYSICAL_MEETING
```

------------------------------------------------------------------------

# 29. WhatsApp Confirmation From Admin Portal

After admin confirms, show:

``` text
Send WhatsApp confirmation?

[ Send Confirmation ]
[ Don't Send ]
```

If Send Confirmation is selected, send the appropriate WhatsApp
confirmation.

Example:

``` text
Your order has been confirmed.

Order #10452

Product A × 2
Product C × 1

Our team will contact you regarding the next steps.
```

Record:

``` text
confirmation_message_sent_at
```

The confirmation is triggered by the Admin Portal action, not
automatically by cart submission.

------------------------------------------------------------------------

# 30. Admin Cancellation

Admin can cancel from the portal.

``` text
PENDING_CONFIRMATION
        |
        v
     CANCELLED
```

Optionally send a WhatsApp cancellation message.

Record:

``` text
cancelled_at
cancelled_by
cancellation_reason
```

------------------------------------------------------------------------

# 31. Customer Chat / WhatsApp Inbox

Add an Admin Portal `Inbox` module with a chat-style UI.

Example:

``` text
+---------------------------------------------------------------+
| WhatsApp Inbox                                                |
+----------------------+----------------------------------------+
| Customers / Chats    | Chat with Rajesh Kumar                 |
|                      |                                        |
| Rajesh Kumar         | Rajesh: Hi                             |
| 2 min ago            |                         10:31 ✓✓       |
|                      |                                        |
| Amit Sharma          | Business: Welcome...                 |
| Yesterday            |                         10:32 ✓✓       |
|                      |                                        |
| Suresh Patel         | Rajesh: I need Product A             |
| 2 days ago           |                         10:33 ✓✓       |
+----------------------+----------------------------------------+
| Search               | [ Type message... ] [Attach] [Send]  |
+----------------------+----------------------------------------+
```

The inbox must display WhatsApp delivery/read state based on actual
webhook events.

Typical indicators:

``` text
✓       Sent
✓✓      Delivered
✓✓ blue Read
```

Do not fabricate delivery/read states.

------------------------------------------------------------------------

# 32. Message Database

Introduce a dedicated message table.

Suggested structure:

``` text
messages

id
customer_id
order_id
whatsapp_message_id
direction
sender_type
message_type
message_text
media_type
media_id
media_url
template_name
button_id
status
sent_at
delivered_at
read_at
failed_at
error_code
created_at
```

Suggested values:

``` text
direction:
INBOUND
OUTBOUND

sender_type:
CUSTOMER
SYSTEM
ADMIN

message_type:
TEXT
IMAGE
VIDEO
DOCUMENT
TEMPLATE
INTERACTIVE
CATALOG
ORDER

status:
PENDING
SENT
DELIVERED
READ
FAILED
```

This creates a proper persistent conversation history.

------------------------------------------------------------------------

# 33. Automated vs Admin Messages

The chat history should distinguish:

``` text
SYSTEM / AUTOMATED
ADMIN
CUSTOMER
```

Example:

``` text
AUTOMATED
Thank you for your order request...

ADMIN
I'll call you shortly.

CUSTOMER
Okay.
```

This is useful for auditing and support.

------------------------------------------------------------------------

# 34. Admin Message Composer

Create one reusable `Message Composer`.

It should be used by:

-   Customer Inbox
-   Broadcasts
-   Order confirmation
-   Other administrator-triggered WhatsApp communication

Message types:

``` text
Template
Text
Interactive
Image
Video
Document
Predefined Message
```

The UI changes according to the selected message type.

------------------------------------------------------------------------

# 35. 24-Hour Customer-Service Window

The system should track:

``` text
conversation_window_expires_at
```

The UI should clearly show the current messaging condition.

Example when the applicable customer-service window is open:

``` text
🟢 Customer service window open

Free-form customer-service messages are available.
```

When it is closed:

``` text
🔴 Customer service window closed

Use an approved WhatsApp template to initiate/reopen communication.
```

The backend must be the final authority on whether a message can be
sent.

The administrator should not have to manually determine which message
types are permitted.

------------------------------------------------------------------------

# 36. Templates

For approved WhatsApp templates:

``` text
Message Type
[ WhatsApp Template ]

Template
[ festival_offer ]

Language
[ English ]

Parameters

Customer Name
[ {{customer_name}} ]

Offer
[ {{offer_name}} ]
```

Templates should be validated against the configured WhatsApp/Meta
template configuration.

------------------------------------------------------------------------

# 37. Predefined Custom Messages

Create a database-driven Message Library.

Example:

``` text
Order Received
Order Confirmation
Order Cancelled
Payment Information
Delivery Information
Thank You
Follow-up
Customer Visit Reminder
```

Selecting one loads its predefined content.

Example:

``` text
Message:

Thank you. Your order request has been received.

Our team will contact you by phone or discuss it
with you personally for final confirmation.
```

The admin sees the preview before sending.

------------------------------------------------------------------------

# 38. Interactive Messages With Buttons

Example:

``` text
Your order request has been received.

[ View Catalog ]
[ Main Menu ]
[ Help ]
```

Buttons use internal IDs:

``` text
VIEW_CATALOG
MAIN_MENU
HELP
```

Never make backend logic depend on translated button labels.

------------------------------------------------------------------------

# 39. Media Messages

Support:

## Image

``` text
Upload Image
Caption
Preview
```

## Video

``` text
Upload Video
Caption
Preview
```

## Document

``` text
Upload Document
Caption
Preview
```

Store the resulting WhatsApp media identifiers and message metadata.

------------------------------------------------------------------------

# 40. Message Preview

The Message Composer must include a WhatsApp-style live preview.

Recommended two-panel layout:

``` text
+-----------------------------+-----------------------------+
| MESSAGE CONFIGURATION       | WHATSAPP PREVIEW            |
|                             |                             |
| Type: [Interactive ▼]       | Rajesh Kumar                |
|                             |                             |
| Text:                       | ┌─────────────────────────┐ |
| [Your order is ready...]    | │ Your order is ready.    │ |
|                             | │                         │ |
| Buttons:                    | │ Please select an        │ |
| [View Order]                | │ option below.           │ |
| [Help]                      | │                         │ |
|                             | │ [View Order]            │ |
| [Send Test] [Send]          | │ [Help]                  │ |
|                             | └─────────────────────────┘ |
+-----------------------------+-----------------------------+
```

When the administrator changes the message type, content, buttons, or
media, the preview updates.

------------------------------------------------------------------------

# 41. Broadcast System

Create an Admin Portal `Broadcasts` module.

Flow:

``` text
CREATE BROADCAST
       |
       v
SELECT CUSTOMERS
       |
       v
SELECT MESSAGE
       |
       v
PREVIEW
       |
       v
VALIDATE RECIPIENTS
       |
       v
SEND
       |
       v
TRACK RESULTS
```

------------------------------------------------------------------------

# 42. Customer Broadcast Filters

The administrator must be able to filter customers.

Possible filters:

``` text
Status
City
Language
Marketing Opt-In
Last Activity
Customer Type
Order Status
```

Example:

``` text
Status:
[ Active ]

City:
[ All ]

Language:
[ Hindi ]

Marketing Opt-in:
[ Yes ]

Last Activity:
[ Within 30 days ]

Selected:
1,284 customers
```

Filters can be expanded later.

------------------------------------------------------------------------

# 43. Customer Status vs Order Status

Keep these separate.

Customer:

``` text
customer status
marketing_opt_in
language
city
```

Orders:

``` text
PENDING_CONFIRMATION
CONFIRMED
CANCELLED
```

Do not merge customer lifecycle state with order lifecycle state.

------------------------------------------------------------------------

# 44. Broadcast Message Types

The broadcast composer should support the same reusable Message
Composer:

``` text
Template
Predefined Message
Image
Video
Document
Interactive
```

However, the backend must validate each recipient against applicable
WhatsApp rules and marketing preferences.

------------------------------------------------------------------------

# 45. Marketing Opt-In

Promotional broadcasts must respect:

``` text
marketing_opt_in
```

A customer who has unsubscribed should not receive promotional
broadcasts.

Example:

``` text
Customer A
marketing_opt_in = true
=> eligible

Customer B
marketing_opt_in = false
=> excluded
```

Do not allow an administrator to bypass the stored marketing preference
through a normal broadcast selection.

------------------------------------------------------------------------

# 46. Broadcast Preview

Before sending:

``` text
BROADCAST PREVIEW

Audience

1,284 selected
1,240 eligible
44 excluded

Exclusion reasons:

Marketing opt-out       32
Invalid recipient        7
Other                    5

Message:

┌─────────────────────────────┐
│ Hello {{customer_name}},    │
│                             │
│ We have new products        │
│ available.                  │
│                             │
│ [ View Catalog ]            │
└─────────────────────────────┘

[ Send Broadcast ]
```

The preview must show the actual message structure as closely as
practical.

------------------------------------------------------------------------

# 47. Broadcast Database

Suggested:

``` text
broadcasts

id
name
message_type
template_id
message_content
media_id
created_by
status
scheduled_at
started_at
completed_at
created_at
```

And:

``` text
broadcast_recipients

id
broadcast_id
customer_id
whatsapp_message_id
status
failure_reason
sent_at
delivered_at
read_at
created_at
```

Recipient status:

``` text
PENDING
SENDING
SENT
DELIVERED
READ
FAILED
SKIPPED
```

------------------------------------------------------------------------

# 48. Broadcast Statistics

Example:

``` text
Broadcast #52

Recipients: 1,284
Sent:       1,240
Delivered:  1,180
Read:         932
Failed:        60
Skipped:       44
```

Allow the administrator to open the recipient list and inspect
individual results.

------------------------------------------------------------------------

# 49. Broadcast History

Example:

``` text
Broadcast #52
New Product Announcement

Created:
01 Oct 2026 11:32

Audience:
Customers in selected segment
Marketing opted-in

Statistics:

Sent       1,240
Delivered  1,180
Read         932
Failed        60
Skipped       44

[ View Recipients ]
```

------------------------------------------------------------------------

# 50. Daily 4 PM Email

Every day at 4:00 PM, run a scheduled job.

Find:

``` text
status = PENDING_CONFIRMATION
```

Generate an email to the administrator.

Example subject:

``` text
WhatsApp Order Requests — YYYY-MM-DD
```

Example:

``` text
WhatsApp Order Requests
23 September 2026

1. Rajesh Kumar

WhatsApp:
919876543210

Post:
Manager

Department:
Purchase

City:
Indore

Products:
Product A × 2
Product C × 1

Status:
Pending Confirmation

---

2. Amit Sharma

WhatsApp:
919812345678

Name:
Amit Sharma

City:
Bhopal

Products:
Product B × 5

Status:
Pending Confirmation

---

Total pending requests: 2
```

------------------------------------------------------------------------

# 51. Email Customer Information Rule

If the customer exists in the database, include available information:

-   WhatsApp number
-   Name
-   Post
-   Department
-   City
-   Other relevant fields

If the customer was newly created, include:

-   WhatsApp number
-   Name
-   City

Also include:

-   Order ID
-   Requested products
-   Quantities
-   Requested time
-   Current status

------------------------------------------------------------------------

# 52. Daily Email Purpose

The 4 PM email is a work queue.

Purpose:

1.  See pending WhatsApp order requests.
2.  Review customer information.
3.  Call or meet customers.
4.  Decide whether to confirm or cancel.
5.  Use Admin Portal to update status.
6.  Send WhatsApp confirmation when appropriate.

Once an order is `CONFIRMED` or `CANCELLED`, it must not appear in the
next pending-confirmation report.

------------------------------------------------------------------------

# 53. Separation of Concerns

## WhatsApp Layer

Responsible for:

-   Receiving messages
-   Sending messages
-   Buttons
-   Templates
-   Catalog
-   Cart
-   Media
-   Webhooks
-   Message statuses

## State Machine

Responsible for:

-   Current conversation state
-   Next fixed response
-   Button handling
-   Global commands
-   Fallback responses

## Customer Database

Responsible for:

-   Customer identity
-   Name
-   Post
-   Department
-   City
-   Language
-   Marketing preference
-   Customer status

## Order Database

Responsible for:

-   Cart/order request
-   Products
-   Quantities
-   Status
-   Confirmation
-   Cancellation
-   Admin audit information

## Message Database

Responsible for:

-   Conversation history
-   Incoming/outgoing messages
-   Message type
-   WhatsApp message ID
-   Delivery state
-   Read state
-   Failure state
-   Admin/system/customer sender type

## Reminder Scheduler

Responsible for:

-   Abandoned activity
-   Reminder timing
-   Cancelling reminders when customer returns
-   Respecting messaging windows

## Email Service

Responsible for:

-   Daily 4 PM report

## Admin Portal

Responsible for:

-   Customer Inbox
-   Chat history
-   Message sending
-   Message preview
-   Customer management
-   Pending requests
-   Confirmation
-   Cancellation
-   Broadcasts
-   Message Library
-   Template selection
-   Audit trail
-   Reports

------------------------------------------------------------------------

# 54. Recommended Admin Portal Structure

``` text
ADMIN PORTAL
│
├── Dashboard
│
├── Inbox
│   ├── Customer list
│   ├── Chat UI
│   ├── Message history
│   ├── Delivery/read indicators
│   └── Message Composer
│
├── Customers
│   ├── Customer list
│   ├── Filters
│   ├── Customer profile
│   └── Conversation history
│
├── Orders
│   ├── Pending confirmation
│   ├── Confirmed
│   ├── Cancelled
│   └── Order details
│
├── Broadcasts
│   ├── Create broadcast
│   ├── Customer filters
│   ├── Message selection
│   ├── Preview
│   ├── Send
│   └── Broadcast history
│
├── Message Library
│   ├── Predefined messages
│   ├── Buttons
│   ├── Images
│   ├── Videos
│   └── Documents
│
├── WhatsApp Templates
│   └── Approved templates
│
└── Reports
    └── Daily 4 PM pending orders
```

------------------------------------------------------------------------

# 55. Reusable Message Composer

Use one shared message-composer implementation for:

``` text
Inbox
  |
  v
Message Composer

Broadcasts
  |
  v
Message Composer

Order Confirmation
  |
  v
Message Composer

Other Admin Messages
  |
  v
Message Composer
```

Suggested internal model:

``` text
MessageDraft

{
    type,
    template_id,
    text,
    buttons[],
    media,
    variables[],
    preview,
    recipients[]
}
```

The backend validates the message draft against:

-   Message type
-   Customer context
-   WhatsApp messaging rules
-   Customer marketing preference
-   Template configuration
-   Recipient eligibility

------------------------------------------------------------------------

# 56. Recommended High-Level Architecture

``` text
                         WHATSAPP
                            |
             +--------------+--------------+
             |                             |
       Business Message              Customer Message
             |                             |
             +--------------+--------------+
                            |
                            v
                       WEBHOOK/API
                            |
                            v
                    APPLICATION BACKEND
                            |
       +--------------------+--------------------+
       |                    |                    |
       v                    v                    v
  State Machine       Message Service       Order Service
       |                    |                    |
       v                    v                    v
 Customer DB          Message DB            Order DB
       |                    |                    |
       +--------------------+--------------------+
                            |
                            v
                       ADMIN PORTAL
                            |
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
        Inbox            Orders           Broadcasts
          |                 |                  |
          +-----------------+------------------+
                            |
                            v
                    Message Composer
                            |
                            v
                    WhatsApp Cloud API


Separate Services:

Scheduler
   |
   +--> Reminders
   |
   +--> Daily 4 PM Email

Meta Commerce Catalog
   |
   +--> Product Selection
   +--> Quantity
   +--> Cart
   +--> Cart Submission
```

------------------------------------------------------------------------

# 57. Complete Customer Order Flow

``` text
CUSTOMER / BUSINESS
        |
        v
WhatsApp
        |
        v
Webhook
        |
        v
Global Command Check
        |
        +---- Global command ---> Execute fixed command
        |
        v
State / Message Type Check
        |
        v
Main Menu
        |
        v
View Catalog
        |
        v
Meta Commerce Catalog
        |
        v
Native Cart
        |
        v
Cart Submitted
        |
        v
ORDER_REQUESTED
        |
        v
Customer Lookup
        |
       / \
      /   \
 EXISTS   NEW
   |        |
   |        +--> Ask Name
   |        |
   |        +--> Ask City
   |        |
   +--------+
        |
        v
PENDING_CONFIRMATION
        |
        +----------------------+
        |                      |
        v                      v
   Admin Portal            4 PM Email
        |
        v
Phone / Physical Meeting
        |
       / \
      /   \
 CONFIRM CANCEL
    |       |
    v       v
CONFIRMED CANCELLED
    |
    v
Admin chooses:
Send WhatsApp confirmation?
    |
    v
Message Composer / Confirmation
    |
    v
WhatsApp
```

------------------------------------------------------------------------

# 58. Complete Messaging Flow

``` text
ADMIN
  |
  v
Inbox / Broadcast / Order
  |
  v
Message Composer
  |
  +--> Template
  |
  +--> Text
  |
  +--> Interactive
  |
  +--> Image
  |
  +--> Video
  |
  +--> Document
  |
  +--> Predefined Message
  |
  v
Live WhatsApp Preview
  |
  v
Backend Validation
  |
  +--> Window / template rules
  +--> Marketing preference
  +--> Recipient eligibility
  +--> Message configuration
  |
  v
WhatsApp Cloud API
  |
  v
Webhook Status Updates
  |
  +--> SENT
  +--> DELIVERED
  +--> READ
  +--> FAILED
  |
  v
Message Database
  |
  v
Admin Inbox / Broadcast Statistics
```

------------------------------------------------------------------------

# 59. Explicitly Excluded

Do NOT introduce these unless requirements are intentionally changed:

-   AI chatbot
-   LLM
-   NLP
-   Intent detection
-   Semantic search
-   Embeddings
-   Customer intent classification
-   Chat-based product selection
-   Chat-based quantity collection
-   Per-customer catalogs
-   Per-customer catalog pricing
-   Automatic final order confirmation
-   Customer confirmation through WhatsApp
-   Automatic assumption that cart submission equals confirmed sale
-   Chat-enabled access control
-   AI-based interpretation of random customer text

------------------------------------------------------------------------

# 60. Important Invariants

These must remain true unless explicitly changed:

### Invariant 1

One shared Meta Commerce Catalog.

### Invariant 2

Native WhatsApp Cart handles product selection and quantity.

### Invariant 3

Cart submission is an order request, not confirmation.

### Invariant 4

Final confirmation requires phone call or physical meeting plus Admin
Portal action.

### Invariant 5

Customer identity is based primarily on WhatsApp number.

### Invariant 6

Existing customer information should be reused instead of unnecessarily
asking again.

### Invariant 7

New customers initially provide name and city.

### Invariant 8

Global commands are exact predefined commands.

### Invariant 9

Unsupported/random text never triggers AI or intent inference.

### Invariant 10

Marketing opt-in is separate from order state.

### Invariant 11

Customer status is separate from order status.

### Invariant 12

Message delivery/read status comes from WhatsApp webhook events.

### Invariant 13

The backend, not the frontend, is the final authority for whether a
message can be sent.

### Invariant 14

Broadcasts must respect marketing preferences and recipient eligibility.

### Invariant 15

Admin-triggered confirmation is separate from automatic cart
acknowledgement.

### Invariant 16

Reminders must respect applicable WhatsApp messaging windows and the
configured reminder policy.

------------------------------------------------------------------------

# 61. Source-of-Truth Rule

This README is the agreed baseline design for the WhatsApp Cloud API +
Meta Catalog Order System.

When this document is provided in a future conversation:

1.  Treat it as the source of truth.
2.  Preserve the deterministic architecture.
3.  Preserve the no-AI/no-NLP/no-intent-detection rule.
4.  Preserve the one-catalog architecture.
5.  Preserve the cart-vs-confirmation separation.
6.  Preserve the human Admin Portal confirmation process.
7.  Preserve global commands and deterministic fallback handling.
8.  Preserve customer/order/message separation.
9.  Preserve the Admin Inbox, Message Composer, Preview, and Broadcast
    architecture.
10. Preserve marketing opt-in handling.
11. Preserve reminder and 4 PM report behavior.
12. Do not silently reintroduce excluded features.

Any future requirement should be treated as an explicit **addition,
modification, or replacement** to this blueprint.

When a new requirement conflicts with this README, identify the conflict
and ask/confirm which requirement should take precedence rather than
silently choosing one.

------------------------------------------------------------------------

# 62. Short System Summary

``` text
ONE CATALOG
    +
NATIVE WHATSAPP CART
    +
DETERMINISTIC STATE MACHINE
    +
CUSTOMER DATABASE
    +
ORDER DATABASE
    +
MESSAGE DATABASE
    +
ADMIN CHAT INBOX
    +
REUSABLE MESSAGE COMPOSER
    +
LIVE MESSAGE PREVIEW
    +
BROADCAST FILTERING
    +
WHATSAPP MESSAGE STATUS TRACKING
    +
REMINDER SCHEDULER
    +
ADMIN CONFIRMATION
    +
DAILY 4 PM EMAIL
    =
WHATSAPP ORDERING + CUSTOMER COMMUNICATION SYSTEM
```
