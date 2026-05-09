NeuroSupport Prototype Implementation Guide

1. Project Overview
   NeuroSupport is a browser-based support system for autistic learners. The full proposed system includes VR scenarios, behavior/emotion detection, adaptive coaching, progress tracking, and secure data storage.
   For the implementation prototype, we are not building the full VR system. Instead, we are building a simplified but meaningful version that demonstrates the core intelligence of the project:
   Webcam-based emotion detection + adaptive coaching inside a placeholder scenario flow.
   The prototype will show how the system could detect learner state in real time and adapt guidance during a practice session.

---

2. Prototype Scope
   Implemented properly
   Module 1: Behavior & Emotion Detector
   This module uses the webcam to detect the learner’s facial expression/emotional state.
   It should:
   • access webcam through browser permission
   • run emotion detection in the frontend
   • classify learner state into simple categories:
   o calm
   o confused
   o stressed
   • show current detected emotion/state on screen
   • optionally show confidence score
   Module 2: Adaptive Coaching Agent
   This module reacts to the detected learner state and selected scenario step.
   It should:
   • read the current detected state from the emotion detector
   • read the current scenario and current step
   • provide a suitable coaching message
   • adapt guidance based on learner state
   Example:
   If learner is calm:
   “Great job. Continue to the next step.”

If learner is confused:
“Take your time. Try reading the instruction again.”

If learner is stressed:
“Let’s slow down. Take a short pause before continuing.”

---

3. Placeholder / Demo-only Modules
   These modules are not fully implemented. They are represented with simple UI and hardcoded data.
   Scenario Builder
   Not building real 3D/VR scenes.
   Instead:
   • use hardcoded sample scenarios
   • allow user to browse scenarios
   • allow user to configure basic settings
   • show scenario steps as text
   Example scenarios:
   • Order at Café
   • Ask Teacher for Help
   • Ask Shop Worker for Assistance
   • Wait in Queue
   Each scenario can have:
   • title
   • description
   • category
   • difficulty
   • steps
   • allowed configuration settings
   Skill Practice Generator
   Not implementing full generation.
   Instead:
   • adaptive agent can recommend next scenario or easier settings
   • recommendation is rule-based
   • no new scenarios are generated
   Example:
   If learner is stressed often, recommend lower noise level next time.
   If learner is calm, recommend trying a slightly harder scenario.
   Progress Dashboard / Reports
   Not building full analytics dashboard.
   Instead:
   • at the end of session, show a simple generated session summary
   • no need to store behavior events in database
   • no need for full progress tracking
   Example summary:
   Scenario: Order at Café
   Dominant State: Calm
   Stress Moments: 2
   Hints Given: 4
   Recommendation: Try the same scenario with lower noise level.
   Secure Storage
   Only basic auth/profile storage is needed.
   No need to implement full ERD/database for:
   • behavior events
   • session reports
   • progress reports
   • feedback notes

---

4. Recommended Tech Stack
   Frontend
   Use:
   React + Vite
   Tailwind CSS
   React Router
   Frontend handles:
   • UI
   • webcam
   • emotion detection model
   • scenario session flow
   • adaptive coaching
   Database/Auth
   Use:
   Supabase
   Use Supabase only for:
   • user authentication
   • learner profiles
   Keep database work minimal.
   Backend
   Optional.
   For this prototype, you can skip Express unless required by your assignment.
   Best simple architecture:
   React Frontend + Supabase Auth/DB
   If your teacher expects backend code, add a small Express server later, but for now keep it simple.

---

5. Application Flow
   Main user journey
   Login / Signup
   ↓
   Select or Create Learner Profile
   ↓
   Dashboard
   ↓
   Browse Prebuilt Scenarios
   ↓
   Select Scenario
   ↓
   Configure Session Settings
   ↓
   Start Practice Session
   ↓
   Webcam Emotion Detection Runs
   ↓
   Adaptive Coaching Agent Gives Guidance
   ↓
   End Session
   ↓
   Show Simple Session Summary

---

6. Pages / Screens to Build
1. Login / Signup Page
   Purpose:
   • allow caregiver/therapist to sign in
   • use Supabase Auth
   Fields:
   • email
   • password
1. Learner Profile Selection Page
   Purpose:
   • show learner profiles linked to logged-in user
   • user selects one learner profile before using the system
   Basic learner fields:
   • name
   • age/date of birth
   • difficulty level
   • sensory preference
   • goals
   This should feel like Netflix profile selection:
   Who are you supporting today?
   [Ali] [Sara] [+ Add Learner]
1. Dashboard Page
   Purpose:
   • show selected learner
   • show quick actions:
   o Browse Scenarios
   o Start Practice
   o View Prototype Summary
   For prototype, dashboard can be simple.
1. Scenario Library Page
   Purpose:
   • list prebuilt sample scenarios
   Example cards:
   Order at Café
   Category: Social Communication
   Difficulty: Easy
   Duration: 5 min

Ask Teacher for Help
Category: School Interaction
Difficulty: Medium
Duration: 6 min 5. Scenario Configuration Page
Purpose:
• user selects allowed settings before starting
Settings:
• noise level: 1–5
• virtual people count: 0–8
• task complexity: simple / standard / detailed
• pacing mode: slow / normal
• hint level: low / medium / high
• enable webcam detection: yes/no
These are not changing the core scenario. They simulate allowed configuration. 6. Practice Session Page
This is the main demo screen.
It should show:
• scenario title
• current step
• instruction text
• webcam panel
• detected emotion/state
• adaptive coaching message
• next step button
• end session button
Example layout:
Scenario: Order at Café

Step 1: Walk to the counter and greet the cashier.

[Webcam Feed]
Detected State: Confused
Confidence: 78%

Coaching Agent:
“Take your time. You can start by saying: Hello, I would like to order.”

[Next Step] [End Session] 7. Session Summary Page
Purpose:
• show final generated summary from the current session
Fields:
• scenario completed
• steps completed
• dominant detected state
• stress/confusion moments
• hints given
• recommendation for next practice
No DB required unless you want to save it later.

---

7. Data Storage Plan
   Store in Supabase
   Keep only simple tables:
   learner_profiles
   Fields:
   id
   user_id
   name
   date_of_birth
   difficulty_level
   sensory_settings
   goals
   created_at
   Optional:
   avatar_color
   notes
   That is enough for prototype.
   Hardcoded in frontend
   Scenarios
   Keep scenarios in a JS file:
   export const scenarios = [
   {
   id: "order-cafe",
   title: "Order at Café",
   category: "Social Communication",
   difficulty: "Easy",
   duration: "5 min",
   description: "Practice ordering food politely at a café counter.",
   steps: [
   "Approach the café counter.",
   "Greet the cashier.",
   "Choose an item from the menu.",
   "Place your order clearly.",
   "Respond to a follow-up question.",
   "Say thank you."
   ]
   }
   ];
   Store in React state only
   During active session:
   • current step
   • detected emotion
   • number of hints
   • stress moments
   • confusion moments
   • coaching messages
   Session summary can be generated from this temporary state.
