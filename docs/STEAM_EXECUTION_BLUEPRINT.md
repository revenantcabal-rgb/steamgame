# Steam Early Access Execution Blueprint

Prepared for: Mat  
Purpose: A transfer-ready implementation brief for another AI or developer to adapt an existing GitHub build into a Steam-ready Early Access release for an online browser-like idle game with web and Steam distribution.

---

## 1) Recommended transfer format

**Best format:** `.md` (Markdown)

Why Markdown is the best handoff format:
- Easy for most AIs to parse cleanly
- Easy to diff in GitHub
- Easy to break into sections and checklists
- Easy to convert later into docs, tickets, or PRD files
- Good for copy-pasting into Cursor, Claude, ChatGPT, GitHub Copilot, Windsurf, or internal agents

### Recommended package to hand to another AI
Use **3 files**, not just one giant file:

1. `STEAM_EXECUTION_BLUEPRINT.md`  
   Master product/engineering plan

2. `STEAM_CHANGELOG_TASKS.md`  
   Concrete implementation checklist with priorities

3. `STEAM_PROMPT_FOR_BUILDER_AI.md`  
   A direct instruction file for the coding AI to act on

If you only want **one** file, then use:
- `STEAM_EXECUTION_BLUEPRINT.md`

---

## 2) What this blueprint is for

This blueprint is for a game that:
- already exists in a GitHub repository
- is browser-like or web-based in architecture
- will be accessible through browsers and Steam
- is online and server-backed
- is idle or semi-idle in design
- includes real-money purchases for in-game goods/services
- is planned for Steam Early Access

This blueprint is designed to help another AI or engineer:
- audit the current build
- identify gaps for Steam compliance
- implement Steam-specific changes
- separate web and Steam monetization correctly
- prepare the product, store page, and operations for Early Access launch

---

## 3) High-level product strategy

### Recommended shipping model

Use **one shared backend** and **two client surfaces**:

#### A. Web client
- Existing browser-accessible version
- Uses your own site auth and/or site payments
- Serves standard browser users

#### B. Steam client
- Native desktop wrapper/client around the same core game
- Integrates Steam authentication
- Integrates Steam ownership checks
- Integrates Steam Wallet / Steam in-game purchase flow
- Has Steam-specific UX support (overlay, controller navigation, text input, etc.)

### Core rule
Do **not** treat Steam like “just another web browser tab.”

The Steam version must behave like a real Steam product, not just a link to a website.

---

## 4) Primary business risks to solve first

Before touching polish, solve these:

1. **Monetization compliance risk**  
   Steam users must not be routed to outside payment flows for in-game purchases inside the Steam build.

2. **Economy abuse risk**  
   Idle games get torn apart if timers, currencies, drops, and grants are client-trusted.

3. **Auth/account fragmentation risk**  
   Users may play on web and Steam. Identity linking must be deliberate and safe.

4. **Early Access expectation risk**  
   The launch build must already be playable and worth buying/trying in its current state.

5. **Live ops risk**  
   An online game release is an operations problem as much as a coding problem.

---

## 5) Required architectural target state

### 5.1 Core architecture

Target architecture:

- **Frontend app**
  - existing web UI/game client
  - reusable in browser and Steam wrapper

- **Native Steam shell**
  - desktop executable
  - embeds the web game
  - exposes a small Steam integration bridge

- **Backend API**
  - game logic endpoints
  - auth/session handling
  - inventory/progression APIs
  - purchases/entitlements APIs

- **Realtime layer**
  - WebSocket or equivalent if needed for chat, events, sync, notifications

- **Database**
  - accounts
  - characters/profiles
  - currencies
  - items and inventory
  - jobs/tasks/timers
  - purchases
  - entitlement grants
  - audit logs
  - anti-fraud events

- **Admin tools**
  - player lookup
  - purchase lookup
  - grant/revoke
  - suspend/freeze
  - economy investigation logs

### 5.2 Client model

The game client should handle:
- rendering
- user input
- local settings
- UI preferences
- local cache where safe

The backend should control:
- inventory truth
- premium currency balances
- progression truth
- offline progress calculation
- timers
- drop results
- crafting outcomes
- purchase grants
- trade/market actions
- fraud decisions

**Rule:** the client should not be the source of truth for anything players can exploit.

---

## 6) Steam-specific implementation blueprint

### 6.1 Build and packaging target

Create a **Steam-native desktop client**.

Recommended implementation options:

#### Option A: Electron-style wrapper (recommended for a browser-like game)
Use a desktop wrapper that:
- opens the game client inside an embedded browser/webview
- initializes Steam SDK on app startup
- bridges only required Steam features into the game

Best when:
- the game is already web-heavy
- the existing UI is browser-native
- you want fastest path to shipping

#### Option B: Engine shell with embedded web UI
Use a native game engine shell and render web content in a controlled layer.

Best when:
- major native features are needed
- controller support or rendering needs are extensive
- future migration away from web tech is likely

### 6.2 Mandatory Steam integration layer

The Steam wrapper must support:
- Steam client initialization
- user identity retrieval
- app ownership verification
- in-game purchase integration for Steam users
- overlay compatibility
- optional achievements/stats integration
- optional cloud support for settings/preferences
- text input support for Steam Deck/controller contexts

### 6.3 Steam wrapper security rules

The wrapper must:
- allow navigation only to approved domains or local trusted assets
- block arbitrary external navigation unless intentionally handled
- avoid exposing raw Steam calls directly to arbitrary page JS
- use a small and audited IPC bridge
- disable debug features in production
- isolate processes where possible
- validate all commands server-side anyway

---

## 7) Account and identity blueprint

### 7.1 Account strategy

Use one canonical backend account model.

Recommended fields:
- `user_id`
- `primary_login_method`
- `email` (nullable if Steam-only)
- `steam_id` (nullable)
- `web_account_id` or external auth identity
- `account_status`
- `ban_status`
- `created_at`
- `linked_at`
- `last_login_at`

### 7.2 Cross-platform account model

Support these cases:
- web-only player
- Steam-only player
- web player linking to Steam
- Steam player linking to web account

### 7.3 Rules to implement

- One Steam account should not silently attach to the wrong existing user profile
- Linking must require explicit confirmation
- If cross-progression is allowed, document the merge/link behavior clearly
- All platform entitlements must be recorded on the backend
- Ownership checks should occur when needed for Steam-specific access

### 7.4 Auth flows to support

Implement:
- normal web login/session flow
- Steam login/auth flow via Steam-integrated session validation
- account linking flow
- relinking/recovery flow
- logout/session revocation flow
- session anomaly handling

---

## 8) Monetization and in-game store blueprint

### 8.1 Absolute rule

The Steam build must not use your normal web checkout for in-game purchases.

### 8.2 Platform-aware commerce design

Design the store backend around **platform-aware pricing and fulfillment**.

Recommended entities:
- `catalog_items`
- `catalog_item_platform_prices`
- `purchase_orders`
- `payment_events`
- `grants`
- `wallet_balances`
- `refund_events`
- `chargeback_events`
- `audit_logs`

### 8.3 Purchase routing rules

#### On web:
- Use your normal site checkout/payment stack
- Grant items after backend verification

#### On Steam:
- Use Steam’s in-app purchase flow for Steam users
- Never link them to Stripe, PayPal, or your website store for in-game items from inside the Steam build
- Confirm the purchase server-side before granting

### 8.4 Must-have purchase protections

Implement:
- idempotent grant processing
- retry-safe purchase confirmation
- duplicate callback protection
- order reconciliation jobs
- entitlement revocation on valid refund/chargeback rules
- admin visibility into every premium purchase/grant

### 8.5 Economy design caution

Be careful with these monetization features:
- premium currency
- time skips
- resource boosts
- inventory expansions
- automation boosts
- convenience subscriptions
- tradable paid items

If any paid item can be traded, sold, or converted into economic value, abuse potential goes way up.

### 8.6 Strong recommendation

At launch, avoid overcomplicated monetization like:
- player-to-player premium gifting
- player market for premium currency-backed items
- recurring subscriptions across multiple storefronts unless necessary

Keep version 1 simple.

---

## 9) Core game code changes likely needed

### 9.1 Server-authoritative progression

Move or confirm server authority for:
- XP gain
- currencies
- drops
- loot rolls
- idle timer progress
- task queue completion
- item crafting
- upgrades
- premium grants
- marketplace actions

### 9.2 Offline idle progress system

Implement or audit:
- last authoritative active timestamp
- last server heartbeat
- offline progress calculation window
- offline claim cap
- anti-clock manipulation logic
- reconnect reconciliation
- partial claim and retry safety
- desync handling

### 9.3 Anti-cheat and anti-abuse logic

Implement or improve:
- rate limiting per session/user/IP/device as appropriate
- suspicious request pattern detection
- impossible progression detection
- duplicate session handling
- suspicious store activity detection
- alt-account abuse tracking if relevant
- market anomaly flags if trading exists
- immutable purchase and grant logging

### 9.4 Transaction safety

Anything involving economy must be atomic and logged.

Examples:
- spending currency
- claiming rewards
- buying items
- converting currencies
- opening loot containers
- crafting/upgrading
- marketplace listing and purchase

### 9.5 Save model

For an online idle game:
- progression and economy belong on backend storage
- local save should only store safe client-side settings/preferences/cache

---

## 10) Steam UX support blueprint

### 10.1 Minimum UX expectations

Even if the game is mostly mouse-based, the Steam version should support:
- clean window launch behavior
- overlay compatibility
- readable interface scaling
- basic controller navigation for menus where practical
- proper focus handling
- text entry support where needed

### 10.2 Steam Deck / controller readiness

Prepare for:
- focus-based UI navigation
- selectable controls in menus
- readable font sizes
- proper keyboard invocation for text fields
- no mandatory hidden hover-only functionality
- no “must use browser dev-style UI tricks” to access core flows

### 10.3 Accessibility and practical comfort

Implement:
- UI scale settings
- font size options where possible
- animation reduction if useful
- color and contrast review
- sound volume channel controls
- notification toggles

---

## 11) Live operations blueprint

This is non-negotiable for an online game.

### 11.1 Required ops components

Set up:
- central application logs
- error logs
- crash reporting
- backend metrics
- purchase pipeline monitoring
- account/auth monitoring
- deployment rollback path
- feature flags where possible

### 11.2 Required dashboards

Track at minimum:
- DAU/MAU
- retention
- average session count
- average progression pace
- premium conversion rate
- purchase failure rate
- top error classes
- login failure rate
- support ticket categories
- suspected exploit counts

### 11.3 Incident response basics

Prepare procedures for:
- payment failures
- duplicate grants
- auth outage
- server downtime
- exploit discovery
- rollback after bad patch
- emergency disablement of a store item
- emergency disabling of a broken feature

---

## 12) Early Access readiness blueprint

### 12.1 What Early Access means internally

Do not launch just because the repo “works.”

Launch only if the current build already has:
- a functional core loop
- real progression
- stable login/account behavior
- purchase flow working safely
- enough content to sustain real users
- support process in place
- honest communication for unfinished parts

### 12.2 Internal Early Access quality gate

Require all of these to be green before launch:
- install/launch works
- login works
- store works correctly by platform
- no critical progression loss bugs
- no known duplication exploit in premium/grant systems
- no dependency on external website purchase flow for Steam users
- support email/form exists
- patching path tested
- wipe/reset policy documented if needed

### 12.3 Honest expectation setting

Prepare a written internal list of:
- what is complete now
- what is incomplete now
- what may reset later
- what systems are unstable
- what future work is intended but not guaranteed

---

## 13) Store page and publishing preparation blueprint

### 13.1 Materials to prepare

You or the other AI should prepare drafts for:
- game short description
- long description
- Early Access disclosure copy
- feature list for current build only
- monetization disclosure text
- community/support links
- screenshots plan
- trailer script or capture brief
- FAQ copy

### 13.2 Store copy rules

Do not claim:
- unsupported features
- unimplemented controller support if it does not exist
- cloud support if not implemented
- promised dates you may miss
- roadmap items as guarantees

### 13.3 Asset prep list

Prepare and track:
- capsule art variants
- library hero assets
- screenshots
- trailer/video assets
- patch announcement templates
- launch announcement templates

---

## 14) Legal and policy preparation blueprint

### 14.1 Internal documents needed

Prepare or update:
- Terms of Service
- Privacy Policy
- refund/help policy references for your own site version
- community rules if chat/user content exists
- moderation policy if multiplayer/community features exist

### 14.2 Data/privacy checklist

Audit whether the build handles:
- account data storage
- cookies or local identifiers
- analytics tracking
- purchase history
- support-related personal data
- deletion/export requests if relevant to your jurisdictions

### 14.3 User-generated content review

If players can do any of these, extra moderation design is needed:
- chat
- usernames
- guild names
- market listings with text
- forum/community integration
- player profile text

---

## 15) QA blueprint

### 15.1 Test matrix

The other AI or QA team should test:

#### Account tests
- new web account creation
- new Steam-first account creation
- account linking
- duplicate link prevention
- logout/login recovery

#### Economy tests
- reward claims
- premium purchase success
- premium purchase cancellation
- duplicate callback scenarios
- refund handling
- retry handling

#### Idle tests
- short offline periods
- long offline periods
- capped offline rewards
- reconnect after disconnect
- concurrent login edge cases

#### Steam tests
- Steam client launch
- ownership verification
- overlay behavior
- in-app purchase flow
- text input flow
- controller navigation smoke test

#### Resilience tests
- API timeout during purchase
- reconnect after store call
- partial backend outage
- stale session replay attempt

### 15.2 Release branches

Use branch strategy such as:
- `main`
- `staging`
- `steam-integration`
- `release-candidate`
- `hotfix`

### 15.3 Release gates

A build should not be promoted unless:
- smoke tests pass
- purchase tests pass
- account tests pass
- rollback path exists
- known critical issues are documented and accepted intentionally

---

## 16) Recommended repo/work planning structure

Have the other AI organize work into these epics:

### Epic 1 — Steam wrapper/client integration
- native shell setup
- Steam SDK init
- launch flow
- ownership flow
- overlay and lifecycle support

### Epic 2 — Account and auth
- Steam-linked auth
- account linking
- session handling
- account recovery flows

### Epic 3 — Platform-aware store
- item catalog refactor
- platform price routing
- Steam purchase flow
- backend confirmation and grants
- refund/revoke logic

### Epic 4 — Server authority and economy hardening
- move trusted logic to backend
- transaction safety
- anti-duplication
- idle progress hardening

### Epic 5 — Steam UX / Deck readiness
- navigation improvements
- text entry support
- UI readability
- settings polish

### Epic 6 — Publishing and launch prep
- store copy
- Early Access disclosures
- support docs
- screenshots/trailer
- QA checklists

### Epic 7 — Observability and live ops
- logs
- dashboards
- admin tools
- incident procedures

---

## 17) Concrete implementation task list

### Priority 0 — Audit the existing build
Ask the builder AI to first inspect and report on:
- current frontend stack
- current backend stack
- current auth model
- current payment model
- current save/progression trust model
- current deployment architecture
- whether game logic is mostly client-side or server-side
- whether a Steam wrapper already exists
- whether cross-platform account linking already exists

### Priority 1 — Blocker fixes for Steam viability
Implement first:
- platform-aware payment separation
- Steam purchase flow for Steam build
- ownership/auth integration
- backend authoritative purchase grants
- removal/prevention of external in-game purchase links inside Steam client

### Priority 2 — Economy hardening
Implement next:
- server-authoritative progression where missing
- offline reward validation
- atomic economy actions
- anti-duplication logging
- admin purchase audit tools

### Priority 3 — Steam client polish
Implement next:
- native shell quality improvements
- overlay compatibility checks
- text input support
- settings and scaling
- basic controller navigation

### Priority 4 — Early Access prep
Implement next:
- store copy drafts
- support and FAQ docs
- issue triage labels
- crash/error logging
- internal launch checklist

---

## 18) Deliverables the other AI should produce

Instruct the builder AI to output these deliverables:

1. **Architecture audit report**  
   Current state vs target state

2. **Gap analysis**  
   What is missing for Steam Early Access readiness

3. **Implementation plan**  
   Ordered by blockers, high priority, medium priority, polish

4. **Repo-level task breakdown**  
   File/module/service changes needed

5. **Steam wrapper integration spec**  
   How Steam talks to the client and backend

6. **Monetization compliance plan**  
   How Steam and web payment systems remain separated safely

7. **QA checklist**  
   Test cases for account, store, idle progression, and edge cases

8. **Launch readiness checklist**  
   What must be true before Early Access release

---

## 19) Recommended direct prompt for the other AI

Copy this into your coding AI:

```md
You are auditing and upgrading an existing GitHub game build for Steam Early Access.

The game is:
- browser-like/web-based
- online and server-backed
- idle or semi-idle
- available through web browsers
- planned for release on Steam too
- intended to include real-money purchases for in-game goods/services

Your job is to inspect the current repository and produce an implementation plan, then apply changes where possible.

Goals:
1. Preserve one shared core game/backend where practical
2. Prepare a Steam-native client/wrapper for the Steam release
3. Separate web payments from Steam in-game purchase flow correctly
4. Ensure the backend is authoritative for economy/progression-critical systems
5. Prepare the build for Steam Early Access readiness
6. Avoid platform-compliance issues in the Steam version

Required outputs:
- current architecture audit
- Steam readiness gap analysis
- file/module level implementation plan
- concrete code changes where possible
- QA checklist
- launch checklist

Specific areas to inspect:
- frontend stack and rendering model
- backend game logic and trust boundaries
- auth/account system
- purchase/payment system
- save/progression model
- offline idle progression logic
- anti-cheat/anti-abuse protections
- deployment model
- whether a Steam wrapper exists already

Non-negotiable constraints:
- Steam build must not route players to external payment pages for in-game purchases
- purchase grants must be server-authoritative
- progression-critical systems must not trust client claims blindly
- the final plan must distinguish web-specific behavior from Steam-specific behavior
- do not claim unsupported Steam features

Please start by auditing the repo and summarizing:
1. what already exists
2. what is missing
3. what is risky
4. what should be implemented first
```

---

## 20) Recommended companion file structure

If you want a cleaner handoff package, create these files:

### File 1 — `STEAM_EXECUTION_BLUEPRINT.md`
Contains:
- the full strategy
- technical target state
- compliance-sensitive requirements
- launch readiness rules

### File 2 — `STEAM_CHANGELOG_TASKS.md`
Contains:
- blocker tasks
- high priority tasks
- medium priority tasks
- optional polish tasks
- checkboxes

### File 3 — `STEAM_PROMPT_FOR_BUILDER_AI.md`
Contains:
- a direct prompt for the coding AI to inspect repo and act

### File 4 — `STEAM_QA_CHECKLIST.md`
Contains:
- test cases
- smoke tests
- release gate checks

### File 5 — `STEAM_STORE_PREP.md`
Contains:
- store page copy placeholders
- Early Access messaging
- feature disclosures
- launch content checklist

---

## 21) My recommendation on what I should give you next

Best next deliverable from me:

### Recommended pack
I should generate these as markdown files:
- `STEAM_EXECUTION_BLUEPRINT.md`
- `STEAM_CHANGELOG_TASKS.md`
- `STEAM_PROMPT_FOR_BUILDER_AI.md`
- `STEAM_QA_CHECKLIST.md`
- `STEAM_STORE_PREP.md`

That is the cleanest package to hand off to another AI.

If you want the fastest single-file handoff, use only:
- `STEAM_EXECUTION_BLUEPRINT.md`

---

## 22) Final recommendation

**Yes, `.md` is the right move.**

For AI-to-AI transfer, Markdown is better than PDF and usually better than DOCX because:
- less formatting junk
- easier parsing
- easier copy/paste into code assistants
- easier version control in GitHub
- easier for your builder bot to turn into tasks automatically

If you want maximum usefulness, don’t hand the other bot a vague summary. Hand it:
- one strategy file
- one implementation checklist
- one direct builder prompt

That’s the sharp way to run this.

