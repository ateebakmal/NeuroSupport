NeuroSupport — Complete UI/UX Design & Application Flow Guide
This document defines the complete UI structure, navigation flow, page layouts, and interaction logic for the NeuroSupport prototype.
The prototype represents the full application experience, while the actual implemented intelligent functionality focuses mainly on:
• Behavior & Emotion Detection
• Adaptive Coaching Agent
Everything else acts as a realistic but simplified application shell around those core modules.

---

1. Overall Application Concept
   NeuroSupport should feel like:
   • calm
   • supportive
   • modern
   • accessible
   • emotionally safe
   • easy for caregivers/therapists to use
   Visual Style
   Design should feel:
   • minimal
   • soft
   • emotionally calming
   Recommended Theme
   • soft purple / blue gradients
   • rounded cards
   • large spacing
   • accessible typography
   • clean dashboard UI
   • modern healthcare + educational feel
   Design Inspiration
   Mix between:
   • Headspace
   • Duolingo
   • modern healthcare dashboard
   • Netflix profile selection

---

2. Complete Application Flow
   Landing Page
   ↓
   Login / Signup
   ↓
   Learner Profile Selection
   ↓
   Dashboard
   ↓
   Scenario Library
   ↓
   Scenario Configuration
   ↓
   Practice Session
   ↓
   Session Summary
   ↓
   Back to Dashboard

---

3. Application Structure
   Main Navigation Areas
   Public
   • Landing Page
   • Login
   • Signup
   Protected
   • Learner Profile Selection
   • Dashboard
   • Scenario Library
   • Scenario Configuration
   • Practice Session
   • Session Summary
   • Profile Management
   • Settings

---

4. LANDING PAGE
   Purpose
   Introduce NeuroSupport and explain the system briefly.

---

Layout
Top Navbar
Contains:
• Logo
• About
• Features
• Login
• Get Started button

---

Hero Section
Large emotional hero section.
Left Side
Headline:
Safe AI-Powered Practice for Social & Communication Skills
Subtext:
NeuroSupport helps autistic learners practice real-life situations through adaptive guided sessions.
Buttons:
• Get Started
• Watch Demo

---

Right Side
Illustration/mockup:
• learner practicing
• coaching assistant UI
• emotion detection visualization

---

Features Section
Cards for:
• Adaptive Coaching
• Emotion Detection
• Personalized Practice
• Scenario-Based Learning
• Progress Tracking

---

Footer
• contact
• university/project info
• GitHub/demo links

---

5. LOGIN / SIGNUP PAGE
   Purpose
   Authenticate caregiver/therapist.

---

Layout
Centered auth card.
Fields
• Email
• Password
Buttons
• Login
• Signup
Extra
• “Continue as Demo User”
• “Forgot Password?”

---

Visual Style
• centered card
• soft background gradient
• minimal distractions

---

6. LEARNER PROFILE SELECTION PAGE
   VERY IMPORTANT PAGE
   This should feel like Netflix profile selection.

---

Purpose
One caregiver/therapist may manage multiple learners.
After login:
• user chooses which learner profile to work with

---

Layout
Header
Who are you supporting today?
Subtext:
Select a learner profile to continue.

---

Profile Grid
Large rounded learner cards.
Each card contains:
• avatar/icon
• learner name
• age
• difficulty level
• small sensory preference tag

---

Example Cards
[ Ali ]
Age: 10
Difficulty: Beginner
Prefers low-noise environments

[ Sara ]
Age: 14
Difficulty: Intermediate
Sensitive to crowd density

[ + Add Learner ]

---

Clicking Learner
Selecting learner:
• stores active learner in global state/context
• redirects to Dashboard

---

Add Learner Modal/Page
Fields
Basic Info
• learner name
• date of birth
• age
Difficulty Level
Dropdown:
• Beginner
• Intermediate
• Advanced
Sensory Preferences
Checkboxes/sliders:
• noise sensitivity
• crowd sensitivity
• pacing preference
Goals
Textarea:
Improve social interaction confidence
Buttons
• Save Profile
• Cancel

---

7. MAIN DASHBOARD
   Purpose
   Central home for selected learner.

---

Layout
Top Navbar
Contains:
• logo
• selected learner
• switch learner button
• notifications
• settings
• logout

---

Dashboard Sections

---

A. Welcome Banner
Welcome back, Ali
Ready for today’s practice session?
Buttons:
• Continue Practice
• Browse Scenarios

---

B. Quick Stats Cards
Small cards:
• Sessions Completed
• Last Emotion Trend
• Current Difficulty
• Last Practiced Scenario
These can be mock/prototype values.

---

C. Recommended Next Scenario
Large featured card:
Recommended:
Ask Teacher for Help

Reason:
Ali performed well in guided communication tasks.
Button:
• Start Session

---

D. Recent Sessions
Simple table/list:
• Scenario name
• Date
• Comfort trend
• Completion status

---

E. Progress Overview
Simple charts or placeholder analytics:
• comfort trend
• session frequency
• stress moments
Can be static/mock.

---

Sidebar Navigation
Sidebar items:
• Dashboard
• Scenario Library
• Reports
• Learner Profile
• Settings

---

8. SCENARIO LIBRARY PAGE
   Purpose
   Browse available prebuilt scenarios.

---

Layout
Top Search Bar
Search:
Search scenarios...

---

Filter Row
Filters:
• category
• difficulty
• duration

---

Scenario Cards Grid
Each card contains:
• title
• category
• difficulty
• estimated duration
• short description
• Start button

---

Example Cards
Order at Café
Practice ordering politely in a café environment.
Difficulty: Easy
Duration: 5 min
Ask Teacher for Help
Practice asking for classroom assistance.
Difficulty: Medium
Duration: 6 min
Wait in Queue
Practice waiting calmly in crowded situations.
Difficulty: Medium
Duration: 4 min

---

Clicking Scenario
Redirects to:
Scenario Configuration Page

---

9. SCENARIO CONFIGURATION PAGE
   VERY IMPORTANT PAGE
   This page simulates the “Scenario Builder”.

---

Purpose
User configures allowed settings before starting session.
The actual scenario stays fixed.

---

Layout
Left Side
Scenario info:
• title
• category
• description
• learning objectives
• estimated duration
• scenario steps preview

---

Right Side
Configuration panel.

---

Configuration Options
Noise Level
Slider:
1 — 5

---

Virtual People Count
Slider:
0 — 8

---

Task Complexity
Dropdown:
• Simple
• Standard
• Detailed

---

Pacing Mode
Options:
• Slow
• Normal

---

Hint Level
Options:
• High Guidance
• Moderate Guidance
• Minimal Guidance

---

Enable Webcam Detection
Toggle:
• ON/OFF

---

Session Summary Preview
Environment Complexity: Moderate
Estimated Difficulty: Medium
Adaptive Guidance: Enabled

---

Buttons
• Start Practice Session
• Cancel

---

10. PRACTICE SESSION PAGE
    MOST IMPORTANT PAGE
    This is the core prototype implementation.

---

Layout
Split-screen layout.

---

LEFT SIDE → Scenario Interaction
Scenario Header
Scenario: Order at Café
Current Step: 2 / 6

---

Scenario Instruction Card
Large centered instruction.
Example:
Greet the cashier and ask for the menu.

---

Scenario Context Panel
Shows:
• current environment
• noise level
• pacing mode
• current difficulty

---

Navigation Buttons
• Previous Step
• Next Step
• End Session

---

RIGHT SIDE → AI Assistance Panel
This side demonstrates the implemented modules.

---

A. Webcam Feed
Live webcam preview.

---

B. Emotion Detection Panel
Displays:
Detected State: Confused
Confidence: 81%
Emotion state badges:
• Calm
• Confused
• Stressed
Optional:
show detected facial expression too:
Detected Expression: Sad

---

C. Real-Time Emotion Timeline (Optional)
Simple small graph/bars:
• calm moments
• stress spikes
• confusion events
Can be mock.

---

D. Adaptive Coaching Agent Panel
MOST IMPORTANT UI AREA.
Large coaching card.
Example:
Take your time.
You can start by saying:
“Hello, I would like to order.”

---

Adaptive Actions Display
Small chips:
• Slowing pacing
• Increasing guidance
• Simplifying interaction

---

E. Session Controls
Buttons:
• Pause Session
• Retry Step
• Lower Difficulty

---

11. SESSION SUMMARY PAGE
    Purpose
    Show generated outcome after session ends.

---

Layout
Header
Session Complete
Great work today!

---

Summary Cards
Scenario Completed
Order at Café
Dominant State
Calm
Stress Moments
2
Coaching Hints Given
4

---

Recommendations Section
Suggested Next Step:
Try the same scenario with slightly reduced noise level.
OR
Recommended Scenario:
Ask Shop Worker for Assistance

---

Reflection Section
Simple note:
The learner responded well to slower pacing and high guidance.

---

Buttons
• Return to Dashboard
• Retry Scenario
• Browse Scenarios

---

12. LEARNER PROFILE PAGE
    Purpose
    Manage learner settings/preferences.

---

Sections
Basic Info
• name
• age
• difficulty level

---

Sensory Preferences
• noise sensitivity
• crowd sensitivity
• pacing preference

---

Goals
Text areas/goals list.

---

Session History
Simple session list.

---

13. SETTINGS PAGE
    Purpose
    General app settings.

---

Contains
• theme
• accessibility
• webcam permissions
• notifications
• account settings

---

14. COMPLETE STATE FLOW

---

Authentication State
Not Logged In
↓
Authenticated

---

Learner State
No learner selected
↓
Select learner
↓
Learner active globally

---

Session State
Select Scenario
↓
Configure Session
↓
Session Running
↓
Emotion Detection Active
↓
Coaching Adaptation Active
↓
Session Ended
↓
Generate Summary

---

15. MAIN IMPLEMENTED FEATURES
    REAL IMPLEMENTATION
    Emotion Detection
    • webcam
    • face expression detection
    • learner state classification
    Adaptive Coaching
    • real-time coaching messages
    • pacing adaptation
    • guidance adaptation

---

PLACEHOLDER / MOCK FEATURES
Scenario Builder
Mock UI + hardcoded scenarios.
Dashboard Analytics
Simple placeholder charts/stats.
Reports
Simple generated session summary.
VR Environment
Text-based simulation only.

---

16. FINAL SYSTEM CONCEPT
    The prototype demonstrates:
    A caregiver/therapist selects a learner profile, chooses a prebuilt social practice scenario, configures the envir
