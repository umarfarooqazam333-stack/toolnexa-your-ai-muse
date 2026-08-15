# ToolNexa: Your AI Muse

Build a complete, modern, professional web application called:

# ToolNexa — AI Tools Finder & Prompt Studio

Tagline:

"Discover AI Tools. Create Better Prompts."

==================================================

1. BRAND IDENTITY

==================================================

Brand Name:

ToolNexa

The brand should feel:

- Modern

- Professional

- AI-focused

- Trustworthy

- Fast

- Innovative

- Minimal

- Premium SaaS

Do NOT use generic robot imagery, generic AI brains, or copied logos.

==================================================

2. LOGO DESIGN

==================================================

Create an original professional logo for ToolNexa.

Logo concept:

Create a clean abstract technology symbol inspired by:

- The letter "T"

- The letter "N"

- Connected AI/data nodes

- Tool discovery

- Digital networks

- Intelligence

The icon should be simple enough to recognize at small sizes.

Logo requirements:

- Original design

- Minimal geometric style

- Modern AI/SaaS appearance

- Works on dark and light backgrounds

- Works as icon-only and icon + wordmark

- Professional enough for a commercial startup

Wordmark:

ToolNexa

Use a modern clean sans-serif typeface.

The logo should NOT contain the tagline.

Create these versions:

1. Full logo:

   Icon + ToolNexa wordmark

2. Compact logo:

   Icon + short wordmark

3. Icon-only logo:

   Symbol without text

==================================================

3. FAVICON

==================================================

Create a favicon based on the ToolNexa logo.

Use only the simplified ToolNexa symbol.

The favicon must:

- Be recognizable at 16x16

- Be recognizable at 32x32

- Work in browser tabs

- Work as a mobile shortcut icon

- Work on light and dark backgrounds

- Avoid tiny text

- Use the same visual identity as the main logo

Generate appropriate favicon assets and configure:

favicon.ico

apple-touch-icon

web app icons where appropriate

==================================================

4. BRAND COLOR SYSTEM

==================================================

Create a professional AI SaaS color system.

Use a dark premium primary interface with subtle futuristic accents.

Suggested palette:

Background:

#0B1020

Secondary background:

#111827

Primary accent:

#6366F1

Secondary accent:

#06B6D4

Text:

#F8FAFC

Muted text:

#94A3B8

Success:

#22C55E

Warning:

#F59E0B

Error:

#EF4444

Do not overuse gradients.

Keep the design professional and readable.

Create CSS variables/design tokens so the color system can easily be changed later.

==================================================

5. CORE PURPOSE

==================================================

Build two major products inside one platform:

A) AI TOOLS FINDER

B) AI PROMPT STUDIO

The homepage should clearly communicate:

"Discover AI Tools. Create Better Prompts."

Users should be able to discover AI tools by category, search for tools, filter them, and generate multiple specialized prompts from one idea.

==================================================

6. AI TOOLS FINDER

==================================================

Create a complete AI tools directory.

Categories:

1. AI Image

2. AI Video

3. AI Writing

4. AI Coding

5. AI Voice

6. AI Education

7. AI PDF

8. AI Design

9. Free AI Tools

Each tool should have:

- Tool name

- Logo/icon

- Short description

- Detailed description

- Category

- Features

- Free / Freemium / Paid

- Pricing information

- Website URL

- Rating

- Number of reviews

- Tags

- Date added

- Last verified date

- Featured status

- Popular status

Tool cards should include:

[Visit Tool]

[View Details]

[Save]

IMPORTANT:

Only use real tool information when actual data is available.

Never invent fake tool URLs, ratings, reviews, pricing, or features.

==================================================

7. AI TOOL SEARCH

==================================================

Create a powerful search system.

Users can search:

"free AI video generator"

"AI image generator"

"AI coding tools"

"free PDF AI"

etc.

Search should match:

- Tool name

- Description

- Category

- Features

- Tags

Add filters:

Category

Pricing

Rating

Free only

Featured

Popular

Newest

Add sorting:

Most Popular

Highest Rated

Newest

A-Z

==================================================

8. INTERNET AI TOOL DISCOVERY

==================================================

Create the architecture for an AI Tool Discovery system.

The system should be capable of finding new AI tools from the internet when a proper search/API provider is configured.

IMPORTANT:

Do NOT fake internet search.

If no search API is configured, show:

"Live tool discovery is not configured yet."

Provide a clean API/service abstraction so a search provider can be added later.

Discovered tools should NOT automatically become public.

Create an admin review workflow:

DISCOVERED

→ REVIEW

→ APPROVED

→ PUBLISHED

Admin must be able to edit information before publishing.

==================================================

9. AI PROMPT STUDIO

==================================================

Create a separate powerful section called:

"Prompt Studio"

The user enters ONE simple idea.

Example:

"I want to create a realistic YouTube image of a lion and rabbit becoming friends in a forest."

The application should transform the idea into multiple specialized prompts.

Generate:

1. IMAGE PROMPT

2. VIDEO PROMPT

3. YOUTUBE THUMBNAIL PROMPT

4. CHARACTER PROMPT

5. ANIME PROMPT

6. REALISTIC PROMPT

Each generated prompt should have:

[Copy]

[Regenerate]

[Save]

The output should be detailed, structured and ready to paste into external AI tools.

==================================================

10. PROMPT GENERATION ENGINE

==================================================

Do NOT create fake AI API calls.

Initially implement a reliable rule/template-based prompt generation engine that works without a GPU.

Create separate prompt templates for:

Image

Video

Thumbnail

Character

Anime

Realistic

The engine should analyze the user's basic idea and intelligently expand it using:

- Subject

- Environment

- Action

- Composition

- Camera

- Lighting

- Mood

- Style

- Color

- Detail level

- Quality

- Aspect ratio

- Character appearance

- Background

- Cinematic elements

The generated prompts should remain faithful to the user's original idea.

==================================================

11. OPTIONAL AI API ARCHITECTURE

==================================================

Design the application so a real AI API can be connected later.

Create a provider abstraction such as:

PromptProvider

Possible future providers:

OpenAI-compatible API

Gemini-compatible API

Other LLM APIs

But DO NOT require a paid API for the initial version.

The application must work without an external AI API.

If no provider is configured, use the local rule-based prompt engine.

==================================================

12. PROMPT HISTORY

==================================================

Create:

"My Prompts"

Users should be able to:

- Save prompts

- Delete prompts

- Copy prompts

- Search prompts

- Filter prompts

- View creation date

Prompt history should be stored in the database.

==================================================

13. TOOL DETAILS PAGE

==================================================

Create a professional tool details page.

Show:

Tool logo

Tool name

Category

Description

Features

Pricing

Rating

Tags

Last verified date

Buttons:

[Visit Official Website]

[Save Tool]

Also show:

"Similar AI Tools"

==================================================

14. HOMEPAGE

==================================================

Create a premium modern homepage.

Hero section:

ToolNexa

"Discover AI Tools. Create Better Prompts."

Subtitle:

"Find the right AI tools and turn your ideas into powerful prompts — all in one place."

Large search box:

"Search AI tools..."

Buttons:

[Explore AI Tools]

[Create a Prompt]

Add popular categories.

Use the ToolNexa logo prominently in the hero/navigation.

==================================================

15. PROMPT STUDIO HOMEPAGE SECTION

==================================================

Add a prominent section:

"One Idea. Six Powerful Prompts."

Input:

"Describe what you want to create..."

Button:

[Generate Prompts]

After generation display six cards:

IMAGE

VIDEO

THUMBNAIL

CHARACTER

ANIME

REALISTIC

Each card has:

Prompt text

Copy button

Save button

Regenerate button

==================================================

16. AI TOOLS DIRECTORY PAGE

==================================================

Create:

/tools

Features:

Search

Category filters

Pricing filters

Rating filters

Sorting

Tool cards

Pagination or infinite loading

Design should be clean and fast.

==================================================

17. CATEGORY PAGES

==================================================

Create SEO-friendly category pages:

/tools/ai-image

/tools/ai-video

/tools/ai-writing

/tools/ai-coding

/tools/ai-voice

/tools/ai-education

/tools/ai-pdf

/tools/ai-design

/tools/free-ai-tools

Each page should have:

Category title

Description

Search

Filters

Tool listing

FAQ section

==================================================

18. ADMIN DASHBOARD

==================================================

Create a secure admin dashboard.

Admin features:

Dashboard statistics

Add tool

Edit tool

Delete tool

Approve discovered tools

Reject discovered tools

Feature/unfeature tool

Manage categories

Manage pricing

Manage ratings

Manage users

Manage prompts

View tool verification dates

Tool status:

DRAFT

DISCOVERED

PENDING_REVIEW

APPROVED

PUBLISHED

REJECTED

==================================================

19. DATABASE

==================================================

Use a clean relational database.

Tables:

users

tools

categories

tool_features

tool_tags

tool_reviews

saved_tools

prompts

saved_prompts

prompt_generations

discovered_tools

admin_actions

Use proper:

Primary keys

Foreign keys

Indexes

Timestamps

Status fields

Make the database compatible with MySQL.

==================================================

20. TECH STACK

==================================================

Frontend:

React

TypeScript

Tailwind CSS

Modern component architecture

Backend:

Use a clean API architecture.

If backend is required:

Python

FastAPI

Database:

MySQL

Compatible with XAMPP/phpMyAdmin

IMPORTANT:

The website itself must remain lightweight.

Do not require GPU.

Do not install local image/video/voice AI models.

==================================================

21. DESIGN

==================================================

Create a premium SaaS-style design.

Use:

- Dark modern theme

- Clean typography

- Subtle gradients

- Rounded cards

- Professional spacing

- Smooth hover animations

- Responsive layout

- Consistent ToolNexa branding

Do NOT make it look like a basic template.

It should look like a professional commercial AI startup.

Desktop:

Full navigation and spacious layout.

Mobile:

Fully responsive mobile navigation.

==================================================

22. NAVIGATION

==================================================

Navbar:

ToolNexa logo

Tools

Prompt Studio

Categories

Free AI Tools

Saved

Search

Login / Sign Up

Use the ToolNexa icon as the mobile menu/logo mark where appropriate.

==================================================

23. FOOTER

==================================================

Footer sections:

AI Tools

Prompt Studio

Categories

Resources

Company

Privacy

Terms

Contact

Show the ToolNexa logo in the footer.

==================================================

24. SEO

==================================================

Implement strong SEO foundations.

Each tool should have:

Unique title

Meta description

Canonical URL

Open Graph metadata

Category pages should be indexable.

Generate SEO-friendly URLs.

Add structured data where appropriate.

Create:

sitemap.xml

robots.txt

==================================================

25. PERFORMANCE

==================================================

Optimize for low-end computers.

Avoid:

Heavy animations

Huge images

Unnecessary JavaScript

Large local AI models

GPU dependencies

Use lazy loading.

Optimize images.

Keep the application fast.

==================================================

26. SECURITY

==================================================

Implement:

Input validation

Authentication

Authorization

Admin role protection

Secure password handling

SQL injection protection

XSS protection

Rate limiting where appropriate

Never expose admin functionality to normal users.

==================================================

27. IMPORTANT DATA RULES

==================================================

Never invent:

AI tool websites

Ratings

Reviews

Pricing

Features

Company information

When tool data comes from an external source, store:

source

source_url

last_verified

Allow admin verification before publication.

==================================================

28. NO FAKE FUNCTIONALITY

==================================================

Do not create buttons that pretend to work.

Do not create fake AI generation.

Do not return fake search results.

Do not create fake tool URLs.

If a feature requires an external API that is not configured, clearly show:

"Not configured yet"

and provide the correct integration point.

==================================================

29. PROJECT STRUCTURE

==================================================

Create a clean production-ready structure:

frontend/

backend/

database/

services/

components/

pages/

api/

utils/

public/

assets/

Include:

README.md

.env.example

database.sql

Document how to:

install

configure

run

connect MySQL

add tools

configure search API

configure optional AI provider

==================================================

30. FINAL USER EXPERIENCE

==================================================

The final user experience should be:

USER WANTS AN AI TOOL

Search:

"free AI video generator"

↓

ToolNexa

↓

Relevant AI tools

↓

Compare tools

↓

Choose tool

↓

Visit official website

OR

USER HAS AN IDEA

"I want a realistic YouTube image of a lion and rabbit."

↓

Prompt Studio

↓

IMAGE PROMPT

VIDEO PROMPT

THUMBNAIL PROMPT

CHARACTER PROMPT

ANIME PROMPT

REALISTIC PROMPT

↓

Copy Prompt

↓

Paste into the AI tool of their choice.

==================================================

31. FINAL BRAND REQUIREMENT

==================================================

The entire application must consistently use:

Brand:

ToolNexa

Tagline:

"Discover AI Tools. Create Better Prompts."

Use the same ToolNexa logo system across:

- Navbar

- Homepage

- Footer

- Login page

- Signup page

- Admin dashboard

- Favicon

- Browser metadata

- Mobile app icon

- Social/Open Graph preview

Do not use the old name "AIHUB" anywhere in the application.

==================================================

32. FINAL REQUIREMENT

==================================================

Build the application as a real, functional product.

Do not build a fake demo.

Prioritize:

Performance

Clean architecture

Real search

Real database

Real authentication

Real CRUD

Real prompt generation

Real admin workflow

SEO

Mobile responsiveness

Professional ToolNexa branding

The initial version must work without:

GPU

Local AI models

Paid AI APIs

External APIs should be optional integrations.

Make the UI polished enough to look like a real commercial AI startup product.

Most importantly:

Do not sacrifice functionality for visual design.

Build the complete working application, not just a landing page.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/258b980c-b4ce-4b90-8a40-01079f96ec10).

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
