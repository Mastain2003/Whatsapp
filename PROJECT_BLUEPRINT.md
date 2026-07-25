# Jasper Market ERP + WhatsApp System
## Project Blueprint
## Version 1.0

## Purpose

Business management portal built with:

- Customer management
- Product management
- WhatsApp CRM
- Broadcast messaging
- Customer replies
- Quick replies
- Orders
- Future inventory and sales modules


# Technology

Frontend:
- HTML
- CSS
- Vanilla JavaScript

Backend:
- Cloudflare Workers

Database:
- Cloudflare D1 SQLite

Deployment:
- GitHub → Cloudflare


# Repository Structure

Whatsapp/

public/
- pages/
  - login.html
  - dashboard.html
  - customers.html
  - products.html
  - broadcast.html

- css/
  - page specific CSS files

- js/
  - frontend JavaScript files

- components/
  - shared HTML components


worker/

- worker.js
  Main API router

- auth.js
  Frontend authentication

- auth_service.js
  Backend authentication validation

- cors_helper.js
  Response helper

- api_customers.js
- api_products.js
- api_broadcast.js
- api_whatsapp.js
- api_whatsapp_webhook.js


migrations/

- Database changes only through migration files


# Request Flow

Frontend Page
    ↓
JavaScript
    ↓
worker.js
    ↓
Authentication Check
    ↓
API File
    ↓
D1 Database


# Authentication

Login:

login.html
    ↓
auth.js
    ↓
worker.js
    ↓
auth_service.js
    ↓
Access


All protected APIs must use:

checkAuth(request, env)


# API Rules

Backend API files:

worker/api_module_name.js


Examples:

api_customers.js
api_products.js
api_whatsapp.js


All routes are controlled by:

worker.js


# Database Rules

Never:

- Delete existing tables
- Rename existing columns
- Break existing APIs


Always:

- Add columns
- Add tables
- Use migrations


Migration format:

migrations/
0004_feature_name.sql


# Current Database Schema


## customers

id
customer_code
name
designation
department
city
phone
whatsapp_language
created_at
updated_at


## products

id
product_code
name
category
brand
unit
price
image_url
description
created_at
updated_at


## whatsapp_messages

Purpose:
Outgoing WhatsApp messages and status tracking

Columns:

id
customer_id
direction
template_name
whatsapp_message_id
message_type
status
message_text
language
customer_phone
button_payload
sent_at
delivered_at
read_at
failed_reason
created_at


## whatsapp_incoming_messages

Purpose:
Customer replies

Columns:

id
customer_id
whatsapp_message_id
message_type
message_text
button_id
created_at


## whatsapp_sessions

Purpose:
Track WhatsApp 24 hour window

Columns:

id
customer_id
last_customer_message
window_active
language
updated_at


## whatsapp_quick_replies

Purpose:
Button automation

Columns:

id
button_id
reply_message
language
created_at


## orders

id
customer_id
phone
total
status
created_at


## order_items

id
order_id
product_id
quantity
price


## carts

id
customer_id
phone
product_id
quantity
created_at


# WhatsApp Flow


## Send Template

Customer Selection

↓

api_whatsapp.js

↓

Meta WhatsApp API

↓

Customer

↓

Save whatsapp_messages


## Receive Customer Reply

Customer

↓

Meta Webhook

↓

api_whatsapp_webhook.js

↓

Save whatsapp_incoming_messages

↓

Update whatsapp_sessions


## Quick Reply

Customer clicks button

↓

Webhook receives button_id

↓

Find reply in whatsapp_quick_replies

↓

Send automatic response


# Future Modules


Sales:

- Orders
- Quotations
- Invoices
- Payments


Inventory:

- Stock
- Purchase
- Stock Movement


WhatsApp CRM:

- Chat Interface
- Auto Replies
- Campaigns
- Template Manager
- Analytics


Admin:

- Users
- Roles
- Permissions
- Logs


# Development Rules

Before adding any feature:

1. Check this blueprint.
2. Follow existing folder structure.
3. Use existing authentication.
4. Use migration files for database changes.
5. Do not break existing modules.
6. Keep API responses backward compatible.


# Current Status

Completed:

[X] Authentication
[X] Customer Module
[X] Product Module
[X] WhatsApp Template Sending
[X] WhatsApp Database Structure
[X] Broadcast Module


In Progress:

[ ] WhatsApp Webhook
[ ] Customer Reply Handling
[ ] Quick Reply Automation
[ ] Order Automation
[ ] CRM Chat


# Continuation Rule

This file is the project source of truth.

Maintain:

- Same architecture
- Same folders
- Same naming style
- Same database approach
- Same API flow
```
