# ReVive - Application Design System
> Application: ReVive
> Tagline: Giving E-Waste a Second Life
> Goal: Build a simple, trusted, and low-friction platform that helps informal collectors identify, value, and sell e-waste to verified recyclers.
---
# 1. Design Philosophy
ReVive is designed for the realities of the Indian informal scrap ecosystem. The product must feel familiar and useful to a kabadiwala, waste collector, or local scrap dealer who may:
- be comfortable with voice, images, and direct actions
- prefer Hindi or Marathi over English
- use affordable Android phones
- operate in weak or intermittent connectivity
- care more about fast cash flow than digital complexity
The interface must prioritize:
- clarity over novelty
- speed over form depth
- trust over branding polish
- visual recognition over long text
- step-by-step task completion over dashboard-heavy UX
---
# 2. Design Principles
## 2.1 Simple and task-led
Every screen should help the user answer three questions:
- Where am I?
- What do I do next?
- What is the next button?
Avoid:
- deep menu trees
- long forms
- technical language
- hidden workflows
- overloaded dashboards
Prefer:
- one primary action per screen
- large touch targets
- short labels
- icon-led navigation
- guided transaction flow
---
## 2.2 Visual-first interaction
Users should recognize scrap types by visual elements before they read text. A material card should include:
- photo preview
- icon or symbol
- material category
- hazardous warning if relevant
- name in local language
Example:
```text
PCB
[ image preview ]
Battery
[ image preview ]
Mobile
[ image preview ]
Copper Wire
[ image preview ]
```
---
## 2.3 Trust-first commerce
The app deals with money, recycler verification, safety, and pickup coordination. Trust signals should be visible at every transaction stage.
Recycler cards should show:
- verified status
- location or distance
- accepted materials
- rate per kg
- pickup availability
- response time
Example:
```text
EcoCycle Pune
Verified recycler
Rs. 145 / kg
5.2 km away
Pickup today
```
---
## 2.4 Offline-first behavior
Connectivity may be inconsistent in the field. The design should treat offline mode as a normal operating condition, not a failure mode.
The app should clearly indicate:
- online
- offline cached data
- sync pending
- last sync timestamp
---
## 2.5 Language-first accessibility
Minimum supported languages:
- Hindi
- Marathi
- English
The collector experience should support:
- language selection during first use
- bilingual labels where needed
- voice prompts for low-literacy users
- simplified sentence structure
---
# 3. Brand Identity
## Name
ReVive
## Tagline
Giving E-Waste a Second Life
## Intent
The brand should communicate:
- recycling
- trust
- sustainability
- practicality
- local relevance
The visual language should feel dependable, clean, and grounded in local commerce rather than overly tech-heavy.
---
# 4. Design System
## 4.1 Color palette
### Primary
```text
Primary Green: #1B8A5A
Dark Green: #126B45
Light Green: #E8F5EE
Background: #F7F9F8
White: #FFFFFF
Primary Text: #17211C
Secondary Text: #66736C
```
### Status
```text
Success: #2E9D61
Warning: #E6A23C
Error: #D64545
Info: #3B82C4
```
### Usage guidance
- green for trust, sustainability, and success states
- white for neutral surfaces and cards
- light green for soft informational blocks
- dark green for primary CTA buttons
- warning/error colors for hazardous material warnings and rejected offers
---
## 4.2 Typography
Recommended families:
- Noto Sans
- Noto Sans Devanagari
- Inter
Suggested scale:
```text
Display: 32px / Bold
Heading 1: 26px / Bold
Heading 2: 22px / SemiBold
Heading 3: 18px / SemiBold
Body: 16px / Regular
Secondary: 14px / Regular
Caption: 12px / Regular
```
Keep text large, high-contrast, and readable on low-cost Android devices.
---
## 4.3 Component patterns
### Cards
Rounded cards for:
- material info
- lot summaries
- recycler offers
- earnings cards
- transaction history
### Buttons
Primary button style:
- dark green background
- white text
- large tap target
- full-width on mobile screens
Secondary button style:
- white or light green background
- green text or border
- used for backup or less critical actions
### Chips
Use chips to show:
- material type
- recycler verification
- location tag
- hazardous warning
- pick-up available
---
# 5. Collector App UX
## 5.1 Primary navigation
Recommended bottom navigation for the collector app:
```text
Home   Add Lot   Earnings   Profile
```
Secondary sections:
- price board
- recycler offers
- my lots
- safety guide
- transaction history
---
## 5.2 Core app flow
```text
Splash
  |
Language selection
  |
Login / OTP
  |
Home dashboard
  +-- Create lot
  |    +-- Select material
  |    +-- Take photo
  |    +-- Enter weight
  |    +-- View estimated value
  |    +-- Compare recycler offers
  |    +-- Accept offer
  |
  +-- Price board
  +-- Active lots
  +-- Earnings
  +-- Safety guide
  +-- Profile
```
---
## 5.3 Home dashboard
The home screen should feel like a working utility screen, not a lifestyle app.
Example:
```text
Hello, Asha
Online
Rs. 12,450
Total earnings
[ + Create New Lot ]
Price Board       Recycler Offers
Recent lots
PCB       10 kg       Rs. 1,450
Cable     8 kg        Rs. 1,120
Battery   5 kg        Rs. 900
```
The Create New Lot CTA should be the most dominant action on the screen.
---
## 5.4 Create lot flow
### Material selection
- material cards with large icons
- Hindi and Marathi labels
- hazardous badges for batteries, PCBs, printers, and other risky items
### Photo capture
- camera-first, simple user flow
- allow multiple photos in a lot when needed
- show preview and allow retake
### Quantity and condition
- enter weight in kg
- condition tags such as good / damaged / mixed / hazardous
- optional notes via voice input preferred
### Estimate screen
- show market estimate range
- show estimated value
- show safety reminder if hazardous
- allow user to confirm or adjust
### Recycler offers
- show top offers ranked by value and trust
- display verified badge
- allow compare before accepting
---
## 5.5 Offer comparison pattern
```text
Recycler A
Verified
Rs. 150 / kg
5.2 km away
Pickup today
Recycler B
Verified
Rs. 142 / kg
3.1 km away
Pickup tomorrow
Recycler C
Not verified
Rs. 160 / kg
2.0 km away
```
Users should compare based on:
1. price
2. trust
3. pickup convenience
4. distance
---
# 6. Recycler Portal UX
The recycler portal is designed for verified recyclers to:
- browse available lots
- filter by material and location
- review lot photos and metadata
- submit or negotiate offers
- schedule pickup
- confirm handover
- record payment
Recommended dashboard widgets:
- new nearby lots
- active offers
- pickup pending
- payments due
- transaction history
---
# 7. Admin Panel UX
The admin panel should support trust and platform integrity:
- verify recycler onboarding
- review suspicious transactions
- update price windows and material data
- monitor handover compliance
- review platform-level analytics
---
# 8. Dataset and AI Design
The repository includes a dataset folder at dataset/balanced_waste_images. It is intended to support waste-material recognition and classification workflows.
Current categories include:
- Battery
- cardboard
- glass
- Keyboard
- metal
- Microwave
- Mobile
- Mouse
- organic
- paper
- PCB
- plastic
- Player
- Printer
- Television
- trash
- Washing Machine
These categories align with the core ReVive use case of identifying scrap materials quickly and safely.
## AI workflow
```text
Capture photo
  |
Predict material category
  |
User confirms or corrects selection
  |
Estimate value for lot
```
The design should make AI feel optional and assistive, not opaque or intimidating. The user should always retain final confirmation control.
---
# 9. API and product integration
The project API contract in api.md should guide the digital product flow across:
- auth
- materials
- lot creation
- recycler listing
- offer flow
- handover
- payment
- traceability
- sync
The design should support both:
- local-first mobile operation
- server-backed validation and accountability
---
# 10. Accessibility and usability notes
The product must support users with low literacy and limited digital confidence.
Recommended patterns:
- icon-led flow
- large buttons and high contrast
- short audio prompts
- voice or speech-based assistance where possible
- simple success states like:
```text
Lot created
Offer accepted
Pickup scheduled
Payment received
```
Each success or status message should be explicit and action-oriented.
---
# 11. Final Design Direction
ReVive should feel like a trustworthy local utility app for waste collection and recycling, not like a generic marketplace app.
The experience should feel:
- simple
- local
- trustworthy
- mobile-first
- offline-aware
- action-focused
- easy for low-literacy users
This is the design standard the app MVP, recycler portal, and admin workflows should all follow.
