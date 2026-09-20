# AI Creator Suite

Build a complete production-ready AI SaaS web application.

IMPORTANT:

This is NOT an AI tool directory. This is a paid AI software product where users come to the website, create an account, purchase a plan, and use the AI tool.

Use the attached screenshot only as visual inspiration for the overall premium SaaS aesthetic. Do not copy its content or create a tool-submission directory.

PRODUCT NAME:

[YOUR TOOL NAME]

CORE PRODUCT:

[DESCRIBE WHAT YOUR AI TOOL DOES]

Example:

An AI content generator that allows users to enter an idea and automatically generate high-quality YouTube scripts, titles, descriptions, hooks, and thumbnail concepts.

DESIGN:

Create a modern, premium SaaS interface.

Style:

- Clean white/light background

- Very subtle lavender/purple accents

- Rounded cards

- Soft shadows

- Modern typography

- Spacious layout

- Professional AI startup aesthetic

- Minimal but visually polished

- Responsive on desktop, tablet and mobile

- Smooth hover animations

- Subtle transitions

- No unnecessary visual clutter

TECH STACK:

Use a modern full-stack architecture.

Frontend:

- React

- TypeScript

- Tailwind CSS

- Modern component architecture

Backend:

- Secure server-side API

- PostgreSQL database

- User authentication

- Secure environment variables

PAYMENTS:

Integrate Stripe for payments.

Implement:

- Free plan

- Pro monthly plan

- Pro yearly plan

- Stripe Checkout

- Stripe customer portal

- Subscription management

- Upgrade

- Downgrade

- Cancel subscription

- Payment status

- Webhook handling

Never expose Stripe secret keys or AI API keys in the frontend.

AUTHENTICATION:

Create:

- Sign up

- Login

- Logout

- Forgot password

- Reset password

- Google authentication if supported

After login, redirect users to /dashboard.

LANDING PAGE:

Create a polished SaaS homepage with:

Hero section:

"Create Better Results With AI"

Subtitle:

"An intelligent AI tool that helps you create high-quality results in seconds."

Primary CTA:

"Start for Free"

Secondary CTA:

"See How It Works"

Add:

- Product preview/mockup

- Feature section

- How it works section

- Example results

- Benefits

- Pricing

- FAQ

- Final CTA

- Professional footer

Do not make fake claims about the product.

DASHBOARD:

Create a logged-in dashboard with:

Sidebar:

- Dashboard

- AI Tool

- History

- Saved Results

- Billing

- Account

Top navigation:

- User profile

- Current plan

- Remaining credits

MAIN AI TOOL:

Create a beautiful workspace.

Left/input panel:

- Large text input

- Relevant options/settings

- Dropdowns

- Tone/style options where appropriate

- Generate button

Example:

"Describe what you want to create..."

Generate button:

"Generate with AI"

Right/output panel:

- AI-generated result

- Copy button

- Regenerate button

- Save button

- Download button

Show a loading state while AI generation is running.

Show useful error messages if generation fails.

USAGE SYSTEM:

Implement a credit/usage system.

Example:

FREE:

3 generations per month

PRO:

100 generations per month

Display:

"82 / 100 generations remaining"

When a user reaches their limit:

Show a friendly upgrade modal:

"You've reached your monthly limit."

"Upgrade to Pro to continue creating."

Button:

"Upgrade to Pro"

Do NOT allow users to bypass usage limits through frontend manipulation.

Enforce limits server-side.

AI INTEGRATION:

Create a secure server-side AI API layer.

Do not put AI API keys in client-side code.

Create a reusable function such as:

generateAIResult()

The function should:

- Validate the authenticated user

- Check subscription

- Check usage limits

- Send the request to the AI provider

- Return the generated result

- Record the usage in the database

Keep the AI provider configurable through environment variables.

DATABASE:

Create tables/models for:

users

subscriptions

plans

usage

generations

saved_results

payments

Store:

- User ID

- Email

- Subscription status

- Plan

- Credits/usage

- Generation history

- Created timestamps

- Payment information references

Do not store sensitive payment card information.

PRICING PAGE:

Create three pricing cards.

FREE

$0/month

- 3 AI generations

- Basic features

- Generation history

PRO

$19/month

- 100 AI generations

- Advanced features

- Priority processing

- Saved results

- Download results

PRO YEARLY

$190/year

- Everything in Pro

- Annual billing

- Clearly show annual savings

Make pricing values configurable rather than hard-coded throughout the application.

BILLING:

Create a billing page showing:

Current plan

Subscription status

Next billing date

Usage

Payment history

Buttons:

"Upgrade"

"Manage Subscription"

"Cancel Subscription"

Use Stripe Customer Portal for billing management where appropriate.

STRIPE WEBHOOKS:

Implement secure webhook handling for:

checkout.session.completed

customer.subscription.created

customer.subscription.updated

customer.subscription.deleted

invoice.payment_succeeded

invoice.payment_failed

Update the user's subscription status in the database.

ADMIN DASHBOARD:

Create a protected /admin section.

Admin can see:

- Total users

- Active subscriptions

- Monthly recurring revenue

- Total AI generations

- Free users

- Paid users

- Failed payments

Add user management:

- Search users

- View user

- View subscription

- View usage

- Disable account if necessary

Add plan management:

- Plan name

- Price

- Monthly limits

- Features

- Stripe price ID

SECURITY:

Implement:

- Server-side authentication checks

- Authorization

- Rate limiting

- Server-side usage enforcement

- Input validation

- Secure API routes

- Environment variables

- Stripe webhook signature verification

- Protection against unauthorized API usage

Do not expose private API keys.

RESPONSIVE DESIGN:

The entire application must work properly on:

- Desktop

- Laptop

- Tablet

- Mobile

MOBILE:

Create a mobile navigation menu and make the AI workspace easy to use on small screens.

UX:

Make the product feel like a real commercial SaaS product.

Include:

- Empty states

- Loading states

- Error states

- Success notifications

- Confirmation dialogs

- Upgrade prompts

- Tooltips where useful

Do not use placeholder buttons that do nothing.

All important buttons should have working functionality or clearly indicate what remains to be configured.

ENVIRONMENT VARIABLES:

Create an .env.example containing placeholders for:

DATABASE_URL

AI_API_KEY

STRIPE_SECRET_KEY

STRIPE_PUBLISHABLE_KEY

STRIPE_WEBHOOK_SECRET

STRIPE_PRO_MONTHLY_PRICE_ID

STRIPE_PRO_YEARLY_PRICE_ID

AUTH_SECRET

DOCUMENTATION:

Create a README explaining:

1. How to install the project

2. How to configure the database

3. How to configure the AI API

4. How to create Stripe products

5. How to add Stripe price IDs

6. How to configure Stripe webhooks

7. How to run the application locally

8. How to deploy it

9. How to create the first admin account

IMPORTANT:

Build the application architecture so the AI functionality, pricing, credits, authentication, database and Stripe payments are actually connected.

Do not merely create a static frontend mockup.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://crystal-idea-flow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6c47f819-829c-5f97-bccb-b96d3812b303).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
