# Financial Compass

I am attaching our "Financial Master Plan" document for Andrew & Maria. Build a modern, interactive web application that serves as a 1:1 digital replica and operational dashboard for this exact document.

Recreate the visual styling using the document's original dark navy theme (#0B1E3D cover, #123A6B deep blue, #C9A24B gold accents, #1F8A70 emerald green, and clean white card containers). 

The app must feature a persistent top metric strip and 5 primary view sections matching the 5 pages of the document:

1. PERSISTENT TOP METRIC STRIP

   - Display 4 real-time calculated summary cards:

     * Target Budget (Sum of Venue, Honeymoon, Dress, Desserts, Makeup) -> Default: $35,000.00

     * Total Available (Sum of Personal Cash [Checking + Savings] + Family Contributions) -> Default: $42,102.30

     * Surplus Reserve (Total Available - Target Budget) -> Default: +$7,102.30

     * Baseline Monthly Overhead (Sum of Spotify, Cinemark, Phone, Health Insurance, Life Insurance, Groceries, Lifestyle Service) -> Default: $584.78

2. SECTION 1: TARGET BUDGET & AVAILABLE FUNDS

   - Left Column (Target Budget Required Table):

     * Marriage (Venue & Operations): $24,000.00

     * Honeymoon Budget: $8,000.00

     * Wedding Dress Budget: $1,000.00

     * Desserts Budget: $1,000.00

     * Makeup & Beauty Budget: $1,000.00

     * Calculated Total: $35,000.00

   - Right Column (Available Funds & Cash Position Table):

     * Checking (Acct ****3574): $20,146.00

     * Savings (Acct ****7748): $8,013.05

     * Personal Cash On Hand (Subtotal): $28,159.05

     * Her Parents' Support: $7,864.12

     * Your Parents' Support: $6,079.13

     * Family Contributions (Subtotal): $13,943.25

     * Total Sum Available: $42,102.30

   - Capital Surplus Banner: Styled callout box showing live calculated surplus (+$7,102.30).

3. SECTION 2: MONTHLY EXPENSES & LEASE RESERVE

   - Recurring Monthly Overhead Table: Include itemized rows for Spotify ($7.00), Cinemark ($24.00), Mobile Phone Plan ($68.00), Health Insurance ($112.00), Life Insurance ($55.00), Groceries ($131.78), and Lifestyle Service ($185.00). Total: $584.78/mo.

   - Apartment Lease Allocation Tracker:

     * Interactive progress bar: $3,075.00 saved of $5,000.00 goal (61.5% complete, $1,925.00 remaining).

     * Profile bullets: 800–1200 sq ft Florida apartment (~$1,800.00/mo rent). Capital structure breakdown for first month + security deposit/last month ($3,200.00).

4. SECTION 3: SAVINGS ROADMAP & MILESTONES

   - Milestone Table with Target Dates & Countdowns:

     * Apartment Lease & Move-In (Target: Sept 30, 2026 | Est. Allocation: $5,000.00)

     * Honeymoon Reserve Fund (Status: Fully Allocated in Master Budget | Est: $8,000.00)

     * Wedding & Venue Finalization (Status: Fully Allocated in Master Budget | Est: $24,000.00)

     * Apartment Furnishing & Setup (Target: Nov 30, 2026 | Est: $5,000 – $8,000)

   - Include dynamic countdown timer tags (e.g., "in X days").

   - Callout Box: Highlight the 3 Key Savings Principles for First Year (Zero Unnecessary Debt, Phase Furniture Purchases, 3-Month Emergency Buffer).

5. SECTION 4: FLORIDA APARTMENT FURNISHING BUDGET

   - Itemized Room-by-Room Breakdown Table comparing Conservative vs. Mid-Range Tiers:

     * Bedroom (Queen Mattress, Frame, 2 Nightstands, Dresser, Bedding): $1,400.00 (Cons) / $2,200.00 (Mid)

     * Living Room (Sofa, Media Console, Coffee Table, Rug, Lamp): $1,200.00 / $2,000.00

     * Dining Room & Kitchen (4-Person Table, Cookware, Cutlery, Appliances): $750.00 / $1,200.00

     * Bathroom & Cleaning (Towels, Storage, Vacuum, Mop): $350.00 / $550.00

     * Work & Essentials (Desk, Ergonomic Chair, Lighting, Blinds): $450.00 / $750.00

     * Delivery, Tax (6-7%) & Misc: $450.00 / $700.00

     * Calculated Total Furnishing Budget: $4,600.00 (Conservative) vs. $7,400.00 (Mid-Range)

6. SECTION 5: THE FINAL GOAL & EMERGENCY FUND

   - Milestone Checklist Grid: 4 cards showing checked-off status for Apartment Lease ($5,000), Honeymoon ($8,000), Wedding ($24,000), and Furnishing ($4,600–$7,400).

   - Emergency & Buffer Fund Card: Featured display for the $20,000.00 goal targeted for Jan 31, 2027 with a live countdown timer.

7. INTERACTIVITY & FEATURES

   - All monetary amounts and date fields should be editable inputs. When an input changes, instantly update all total calculations, progress bars, surplus figures, and milestone status text.

   - Include an Activity Tab at the bottom with a live Edit History Log and a Shared Notes/Comments section where notes can be posted.

   - State Persistence: Save all data changes to local browser storage so updates are preserved across reloads, and include a "Reset to original numbers" button.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dreamplan-dashboard.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bf6719c9-b77a-4540-ad23-4ed0ea596269).

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
