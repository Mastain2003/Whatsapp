WhatsApp Cloud API + Meta Catalog Order System

Master Blueprint / Source of Truth

Purpose:
A simple, deterministic WhatsApp ordering system using WhatsApp Cloud API and one Meta Commerce Catalog.

Core principle:
NO AI, NO NLP, NO intent detection, NO customer-intention classification.

The system uses:

- WhatsApp Quick Reply / built-in buttons
- Meta Commerce Catalog + native Cart
- Predefined keywords
- Database-backed conversation state
- Reminder scheduler
- Admin portal
- Daily 4 PM email report

---

1. FIXED BUSINESS REQUIREMENTS

Catalog

- Use ONE Meta Commerce Catalog.
- The same catalog is available to all customers.
- Do not create separate catalogs/prices for individual customers.
- Product selection and quantity are handled by the native WhatsApp Catalog Cart.

Ordering

WhatsApp is used only to TAKE an order request.

A customer submitting a catalog cart does NOT mean the order is finally confirmed.

Final confirmation happens only through:

- Phone call, OR
- Physical meeting

The admin performs the final confirmation through the Admin Portal.

Customer communication

There are two entry points:

1. Business initiates conversation using an approved promotional/template message.
2. Customer initiates conversation by sending any message.

Both eventually enter the same deterministic system.

Random messages

Do NOT use AI or intent detection.

If a customer sends unsupported/random text:

- Do not try to understand the intention.
- Send a predefined fallback response appropriate to the current state.

Global commands

The following commands work from anywhere in the conversation:

- MENU
- HELP
- LANGUAGE / LANG
- UNSUBSCRIBE
- STOP
- CANCEL

These are exact predefined commands/variants only.

---

2. HIGH-LEVEL ARCHITECTURE

WhatsApp Cloud API
|
| Webhook
v
Application Backend
|
+------------------+
|                  |
v                  v
Customer Database      Order/Session Database
|
v
Deterministic State Machine
|
+------------------+
|                  |
v                  v
Reminder Scheduler    Admin Portal
|
v
Final Confirmation
|
v
WhatsApp Confirmation

Additional service:

Scheduler
|
v
Daily 4 PM Email
|
v
Administrator

---

3. MAIN WHATSAPP FLOW

Case A — Business initiates

Promotional Template
|
v
[ View Catalog ]
|
v
Meta Commerce Catalog
|
v
Customer selects products
|
v
Customer adds products to Cart
|
v
Customer submits Cart
|
v
ORDER REQUESTED

---

4. CASE B — CUSTOMER INITIATES

Customer sends any message.

Example:

Customer:
"Hi"

System:

"Welcome. Please select an option."

Buttons:

[ View Catalog ]
[ Help ]

Customer selects:

[ View Catalog ]

    |
    v

Meta Commerce Catalog
|
v
Cart
|
v
Cart Submitted
|
v
Order Request

No intent detection is required.

---

5. MAIN MENU

Example:

Welcome!

Please select an option:

[ View Catalog ]
[ Help ]
[ Language ]

Depending on the implementation, additional buttons/options may be provided.

The normal order path is:

MAIN MENU
|
v
VIEW CATALOG
|
v
CATALOG
|
v
CART
|
v
ORDER REQUESTED

---

6. META CATALOG + CART

Use the native Meta Commerce Catalog.

The catalog handles:

- Product display
- Product selection
- Quantity
- Cart
- Cart submission

Therefore DO NOT build chat steps such as:

"Which product?"

"How many?"

"Do you want 2?"

The catalog/cart handles these.

The backend receives the cart/order information through the WhatsApp webhook and creates an internal order request.

---

7. ORDER REQUEST VS CONFIRMED ORDER

IMPORTANT:

A WhatsApp Cart submission is NOT a confirmed order.

Correct lifecycle:

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
CONFIRMED          CANCELLED

Only after the admin talks to the customer by phone or meets them physically can the request become CONFIRMED.

---

8. CUSTOMER INFORMATION

When the cart is submitted:

First identify the customer using their WhatsApp number.

Existing customer

If the WhatsApp number exists in the customer database, use the existing information.

Possible information:

- WhatsApp number
- Name
- Post
- Department
- City
- Other stored customer information

Do NOT ask the customer again for information already available.

Example:

WhatsApp:
919876543210

Database:

Name: Rajesh Kumar
Post: Manager
Department: Purchase
City: Indore

Use those details with the order request.

---

9. NEW CUSTOMER

If the WhatsApp number is NOT in the customer database:

Ask:

"Please enter your name."

Customer provides name.

Then:

"Please enter your city."

Customer provides city.

Save:

- WhatsApp number
- Name
- City

Post and Department are NOT required in the agreed initial flow.

The customer then receives:

"Thank you. Your order request has been received. Final confirmation will be done by phone or in person."

---

10. CUSTOMER DATABASE

Suggested structure:

customers

- id
- whatsapp_number
- name
- post
- department
- city
- language
- marketing_opt_in
- created_at
- updated_at

The WhatsApp number should be the primary lookup identifier for the customer.

---

11. CONVERSATION SESSION DATABASE

Suggested structure:

conversation_sessions

- id
- customer_id
- current_state
- previous_state
- last_customer_message_at
- last_business_message_at
- conversation_window_expires_at
- created_at
- updated_at

The state machine is deterministic.

---

12. ORDER DATABASE

Suggested structure:

orders

- id
- customer_id
- whatsapp_order_id
- whatsapp_message_id
- status
- cart_items
- requested_at
- confirmed_at
- cancelled_at
- confirmation_method
- confirmed_by
- confirmation_message_sent_at
- created_at
- updated_at

Possible confirmation_method:

- PHONE
- PHYSICAL_MEETING

---

13. ORDER STATES

Recommended:

CART_SUBMITTED
|
v
ORDER_REQUESTED
|
v
PENDING_CONFIRMATION
|
+--------------------+
|                    |
v                    v
CONFIRMED                CANCELLED
|
v
CONFIRMATION_SENT

CONFIRMATION_SENT is optional as a separate status if desired.

---

14. GLOBAL COMMANDS

Global commands are available ANYWHERE in the conversation.

MENU

Action:

Return to MAIN_MENU.

Example:

Customer:
MENU

System:

MAIN MENU

[ View Catalog ]
[ Help ]
[ Language ]

---

HELP

Action:

Show all available options/commands.

Example:

Available options:

MENU — Main menu
HELP — Show help
LANGUAGE — Change language
CANCEL — Cancel current order/flow
STOP — Stop current flow
UNSUBSCRIBE — Stop promotional messages

[ Main Menu ]

---

LANGUAGE / LANG

Action:

Open language selection.

Example:

Please select your language:

[ English ]
[ हिन्दी ]

Store the selected language in the customer record.

Example:

customers.language = "hi"

After selecting language:

Return to the state that existed before LANGUAGE was invoked.

Example:

CART
|
v
LANGUAGE
|
v
Select Hindi
|
v
Return to CART

Use:

previous_state

for this purpose.

---

15. UNSUBSCRIBE

UNSUBSCRIBE is a marketing preference.

When received:

marketing_opt_in = false

This means:

- Stop promotional/marketing communication.
- Do NOT automatically cancel an existing order.
- Do NOT necessarily prevent the customer from using the normal order flow.

Example:

Customer:
UNSUBSCRIBE

System:

"You have been unsubscribed from promotional messages."

[ Main Menu ]

Important:

marketing_opt_in and order state are separate concepts.

---

16. STOP

STOP means stop the current conversational flow.

Possible behavior:

current_state = IDLE

Clear temporary conversation data if appropriate.

STOP does NOT necessarily mean:

- Cancel a confirmed order
- Unsubscribe from all marketing
- Delete customer record

---

17. CANCEL

CANCEL means cancel the current active order/flow where applicable.

If an active order request exists:

Current state:
PENDING_CONFIRMATION

Customer:
CANCEL

Then:

Order status:
CANCELLED

Send:

"Your current order request has been cancelled."

[ Main Menu ]

If there is no cancellable request:

"There is no active order request to cancel."

[ Main Menu ]

---

18. RANDOM / UNSUPPORTED TEXT

No AI.

No intent detection.

No NLP.

Example:

Customer is in CART state.

Customer:
"Hello, what is happening?"

The system does not try to understand the sentence.

Instead:

"Please select an option below."

[ Main Menu ]
[ Help ]

The exact fallback can depend on the current state.

---

19. BUTTON IDs

Use internal IDs instead of relying on button text.

Example:

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

Backend logic should use IDs such as:

VIEW_CATALOG

rather than:

"View Catalog"

This makes the system easier to maintain and allows text translations without changing backend logic.

---

20. STATE MACHINE

Minimal state machine:

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

Utility states such as LANGUAGE_MENU should remember previous_state and return to it.

---

21. GLOBAL COMMAND PRIORITY

Every incoming message should first be checked for global commands.

Conceptually:

INCOMING MESSAGE
|
v
Is it a global command?
|
+----+----+
|         |
YES        NO
|         |
v         v
Execute     Check
command     message type/state

Message types can include:

- Interactive/button reply
- Catalog/product/cart event
- Text
- Other supported WhatsApp event

Do not use intent detection.

---

22. ABANDONED FLOW / REMINDERS

Reminders are separate from the main state machine.

Track:

- last_customer_message_at
- reminder_stage
- next_reminder_at
- sent_at
- cancelled_at

Example:

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

Reminders must respect the applicable WhatsApp messaging/customer-service window and the configured reminder policy.

If the customer returns, do not send an outdated reminder.

After the applicable 24-hour window/policy ends, stop normal reminder messages.

---

23. ABANDONED CART VS ORDER REQUEST

These are different.

Abandoned catalog/cart

Customer starts shopping but does not submit the cart.

Possible reminder:

"Your shopping session is still available."

Submitted cart

Customer submits cart.

Now the system creates:

ORDER_REQUESTED
|
v
PENDING_CONFIRMATION

Do NOT repeatedly ask:

"Please confirm your order"

because final confirmation is done by phone or physical meeting.

---

24. CUSTOMER ACKNOWLEDGEMENT AFTER CART

After successful cart submission:

"Thank you. Your order request has been received.

Our team will contact you by phone or discuss it with you personally for final confirmation."

Do NOT say:

"Your order is confirmed."

---

25. ADMIN PORTAL

The Admin Portal is the human control point.

It should show:

- Order ID
- Order date/time
- Customer WhatsApp number
- Customer name
- Post
- Department
- City
- Other available customer information
- Products
- Quantities
- Order status
- Confirmation status

Example:

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

---

26. FINAL CONFIRMATION

Admin contacts the customer by:

- Phone call, OR
- Physical meeting

If the customer agrees:

Admin Portal:

[ Confirm Order ]

System:

PENDING_CONFIRMATION
|
v
CONFIRMED

Store:

confirmed_at
confirmed_by
confirmation_method

confirmation_method:

PHONE

or:

PHYSICAL_MEETING

---

27. WHATSAPP CONFIRMATION FROM ADMIN PORTAL

After the admin confirms:

Show:

"Send WhatsApp confirmation?"

[ Send Confirmation ]
[ Don't Send ]

If Send Confirmation is selected:

Send the appropriate WhatsApp confirmation message.

Then record:

confirmation_message_sent_at

The confirmation is sent FROM THE ADMIN PORTAL action, not automatically merely because the cart was submitted.

Example:

"Your order has been confirmed.

Order #10452

Product A × 2
Product C × 1

Our team will contact you regarding the next steps."

---

28. ADMIN CANCELLATION

Admin can also cancel from the portal.

PENDING_CONFIRMATION
|
v
CANCELLED

Optionally send a WhatsApp cancellation message.

Record:

cancelled_at
cancelled_by
cancellation_reason (optional)

---

29. DAILY 4 PM EMAIL

Every day at 4:00 PM run a scheduled job.

Find orders where:

status = PENDING_CONFIRMATION

Generate email to the administrator.

Example subject:

WhatsApp Order Requests — YYYY-MM-DD

Example:

WhatsApp Order Requests
23 September 2026

---

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

---

30. EMAIL CUSTOMER INFORMATION RULE

If customer exists in database:

Include available database information:

- WhatsApp number
- Name
- Post
- Department
- City
- Other relevant fields

If customer does not exist:

Include:

- WhatsApp number
- Name
- City

Also include:

- Order ID
- Requested products
- Quantities
- Requested time
- Current status

---

31. DAILY EMAIL PURPOSE

The 4 PM email is a work queue for the administrator.

Purpose:

1. See all pending WhatsApp order requests.
2. Review customer information.
3. Call or meet customers.
4. Decide whether to confirm or cancel.
5. Use the Admin Portal to update the status.
6. Send WhatsApp confirmation when appropriate.

Once an order is CONFIRMED or CANCELLED, it should no longer appear in the next pending-confirmation report.

---

32. IMPORTANT SEPARATION OF CONCERNS

WhatsApp Layer

Responsible for:

- Receiving messages
- Sending messages
- Buttons
- Catalog
- Cart
- Webhooks

State Machine

Responsible for:

- Current conversation state
- Next fixed response
- Button handling
- Global commands

Customer Database

Responsible for:

- Customer identity
- Name
- Post
- Department
- City
- Language
- Marketing preference

Order Database

Responsible for:

- Cart/order request
- Products
- Quantities
- Status
- Confirmation
- Cancellation
- Admin audit information

Reminder Scheduler

Responsible for:

- Abandoned activity
- Reminder timing
- Cancelling reminders when customer returns
- Respecting messaging windows

Email Service

Responsible for:

- Daily 4 PM report

Admin Portal

Responsible for:

- Viewing pending requests
- Calling/meeting customer
- Confirming
- Cancelling
- Sending confirmation message
- Audit trail

---

33. EXPLICITLY EXCLUDED

Do NOT introduce these unless requirements are intentionally changed:

- AI chatbot
- LLM
- NLP
- Intent detection
- Semantic search
- Embeddings
- Customer intent classification
- Chat-based product selection
- Chat-based quantity collection
- Per-customer catalogs
- Per-customer catalog pricing
- Automatic final order confirmation
- Customer confirmation through WhatsApp
- Automatic assumption that cart submission equals confirmed sale

---

34. FINAL SYSTEM DIAGRAM

                     WHATSAPP
                        |
         +--------------+--------------+
         |                             |
   BUSINESS MESSAGE              CUSTOMER MESSAGE
         |                             |
         +--------------+--------------+
                        |
                        v
                   MAIN MENU
                        |
                 [VIEW CATALOG]
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
                ORDER REQUESTED
                        |
                        v
             CUSTOMER LOOKUP
                /             \
         EXISTS               NEW
            |                   |
            v                   v
     Use DB information    Ask Name + City
            |                   |
            +---------+---------+
                      |
                      v
             PENDING CONFIRMATION
                      |
            +---------+---------+
            |                   |
            v                   v
      ADMIN PORTAL          4 PM EMAIL
            |
    Phone / Physical Meeting
            |
      +-----+-----+
      |           |
      v           v
   CONFIRM     CANCEL
      |
      v

SEND WHATSAPP CONFIRMATION

GLOBAL COMMANDS — ANYWHERE

MENU
HELP
LANGUAGE / LANG
UNSUBSCRIBE
STOP
CANCEL

RANDOM TEXT

Random/unsupported text
|
v
Fixed fallback response
|
v
No AI / No intent detection

REMINDERS

Inactive customer
|
v
Reminder according to configured schedule/window
|
+---- Customer returns → cancel/reschedule
|
+---- Window/policy ends → stop

35. SOURCE-OF-TRUTH RULE

This document represents the agreed design for the WhatsApp ordering system.

When this blueprint is provided in a future conversation, use it as the baseline architecture and requirements.

Do not reintroduce removed features such as:

- chat-based product demand collection
- AI/intent detection
- per-customer catalogs
- chat-enabled access control

unless explicitly requested.

Any new requirement should be treated as an addition/change to this blueprint rather than silently replacing existing requirements.
