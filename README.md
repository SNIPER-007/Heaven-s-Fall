# HEAVEN'S FALL — RISE & FALL (HALLOWEEN EDITION)
### Rotaract Club of Mumbai Ghatkopar (RCMG)

A live treasury and points tracker website for an interactive Halloween strategy game.

Designed and engineered for live Game Master operation, with dual treasury scoreboard, dramatic rise & fall overthrow detection, task tracker (names only), auditable ledger, and high-contrast Projector Mode for big-screen TVs.

---

## 🎭 The Factions & Player Balance

- **THE RULERS:** 7 Players holding the throne.
- **THE WORKERS:** 8 Players seeking to overthrow the throne.
- **TOTAL PLAYERS:** Exactly 15 players.

---

## ⚡ Core Rules & Mechanics

1. **Treasury Tracking:**
   - Real-time comparison in Indian Rupee (`₹`) format (e.g. `₹10,500`).
   - Starting balances are entered manually by the Game Master (supports ₹0 or any custom amount).
   - Treasury values can never fall below ₹0.

2. **Rise & Fall Overthrow Condition:**
   - **"THE WORKERS ARE RISING" / "THE THRONE IS UNDER THREAT"**: Active when Workers' total treasury **strictly exceeds** Rulers' total treasury (`Workers > Rulers`).
   - **"THE RULERS HOLD THE THRONE"**: Active when Rulers lead (`Rulers > Workers`).
   - **"THE KINGDOM IS IN BALANCE"**: Active when both totals are equal (`Workers === Rulers`).
   - **Strict Rule:** A tie is **NOT** an overthrow.
   - **Dramatic Announcements:** When Workers overtake Rulers, an announcement banner and gothic audio overlay trigger automatically ("THE THRONE HAS FALLEN — THE WORKERS HAVE RISEN"). When Rulers reclaim the lead, "THE CROWN HAS BEEN RECLAIMED" triggers.
   - **Official Role Reversal:** The `"CONFIRM ROLE REVERSAL"` button is enabled **only** when Workers strictly exceed Rulers. Requiring explicit Game Master confirmation before ratifying into history.

3. **Task Tracker (Names Only):**
   - **No task instructions, descriptions, predefined points, or reward tables are displayed.**
   - All amounts are manually entered by the Game Master during the live event.
   - **Initial Workers' Tasks:**
     1. The Halloween Factory
     2. The Monster's Memory
     3. The Haunted Charades
     4. The Ultimate Halloween
   - **Initial Rulers' Tasks:**
     1. The Royal Prediction
     2. The House Always Wins
   - Game Master can add custom tasks, rename tasks, reorder tasks, and remove tasks.
   - **Duplicate Payment Protection:** Warns the Game Master if a task already has a recorded payment before allowing an additional transaction.

4. **Auditable Transaction Ledger & CSV Export:**
   - Record rewards, bonuses, penalties, manual adjustments, and corrections.
   - Auditable reversals: Instead of deleting historical records, creating an offsetting transaction linked to the original.
   - Instant 1-click CSV export of the entire ledger.

5. **Projector Mode (Big Screen / TV Scoreboard):**
   - High-contrast typography readable across an auditorium or banquet hall.
   - Hides all GM forms and administrative controls.
   - Live synchronization across devices.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run test suite
npm test

# Build production bundle
npm run build
```

---

## ☁️ Firebase Firestore Setup (Multi-Device Live Sync)

The application works 100% out of the box with **Local Cross-Tab Sync** (via `BroadcastChannel` and `localStorage`).

To sync live across different physical devices (e.g. Game Master laptop and TV Projector screen):

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In **Project Settings**, register a Web App and copy the `firebaseConfig` object.
3. In **Firestore Database**, create a database and set these security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read, write: if true;
    }
  }
}
```
4. In the app, click the **Sync** button in the header and paste your Firebase config. All connected screens will now sync in real time!
