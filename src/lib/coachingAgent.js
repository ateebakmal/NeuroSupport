// ============================================================
// NeuroSupport — Adaptive Coaching Agent
// Primary: Groq LLM (llama-3.3-70b-versatile) when API key present
// Fallback: Rule-based engine considering 8 contextual factors:
//   1. Current detected state
//   2. How many consecutive detections of same state
//   3. Trend over last 6 detections (improving / stable / worsening)
//   4. State the learner just transitioned FROM
//   5. Hint escalation level (how many hints already given)
//   6. Session progress (early / mid / near-end)
//   7. Total stress count this session
//   8. Learner difficulty profile (Beginner / Intermediate / Advanced)
// ============================================================

import OpenAI from 'openai'

const groqClient = import.meta.env.VITE_GROQ_API_KEY
  ? new OpenAI({
      apiKey: import.meta.env.VITE_GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
      dangerouslyAllowBrowser: true,
    })
  : null

export const hasGroq = Boolean(groqClient)

export async function getCoachingResponseAI(ctx) {
  if (!groqClient) return getCoachingResponse(ctx)

  const { state, history, step, totalSteps, hints, stressCount, learner, scenarioId } = ctx
  const consecutive = countConsecutive(history, state)
  const trend = getTrend(history)

  const prompt = `You are a warm, supportive coach in a social skills training app for neurodiverse learners (autism, ADHD, anxiety).

Learner: ${learner.name}, difficulty: ${learner.difficulty}
Scenario: ${scenarioId}, Step ${step + 1} of ${totalSteps}
Current emotional state: ${state}
Consecutive detections of this state: ${consecutive}
Emotion trend over last 6 detections: ${trend}
Total stress moments this session: ${stressCount}
Total hints given so far: ${hints}

Reply ONLY with a JSON object in this exact shape:
{"message": "...", "actions": ["..."]}

Rules:
- message: 1-2 warm sentences tailored to the context. Use the learner's name occasionally.
- actions: 0-3 short labels like "Slowing pacing" or "Breathing exercise". Use [] if state is Calm.
- Stressed: calming and grounding. Escalate warmth if consecutive >= 3 or stressCount >= 4.
- Confused: specific guidance. Offer a concrete tip if hints >= 3.
- Calm: brief encouraging praise. Strong praise if recovering from Stressed or Confused.
- Never be patronizing. Sound human, not robotic.`

  try {
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    })
    const parsed = JSON.parse(completion.choices[0].message.content)
    return {
      message: parsed.message || 'Keep going, you are doing well.',
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    }
  } catch (err) {
    console.warn('[groq] API error, falling back to rule-based:', err.message)
    return getCoachingResponse(ctx)
  }
}

// Step-specific fallback hints per scenario — used when learner is very stuck
const STEP_HINTS = {
  'order-cafe': [
    'Walk calmly up to the counter and wait until the cashier looks at you.',
    'Make eye contact and say: "Hello."',
    'Look at the menu board and choose one item you like.',
    'Say clearly: "I would like a [item], please."',
    'If they ask something, it is fine to say: "Sorry, could you repeat that?"',
    'Finish with: "Thank you very much." and collect your order.',
  ],
  'ask-teacher': [
    'Wait for a quiet moment when the teacher is not busy with someone else.',
    'Approach calmly and say: "Excuse me, could I ask you something?"',
    'Say: "I did not fully understand [topic]. Could you explain it again, please?"',
    'Listen carefully. Nodding shows you are paying attention.',
    'If you still do not understand, say: "Could I try a practice question?"',
    'Say: "Thank you so much for helping me."',
  ],
  'wait-queue': [
    'Find the end of the queue and stand there.',
    'Stand about one arm\'s length from the person in front.',
    'Keep your hands relaxed by your sides and breathe slowly.',
    'If someone joins behind you — that is completely normal.',
    'When the queue moves, take one calm step forward.',
    'When it is your turn, step up confidently. You have done it.',
  ],
  'ask-shop-worker': [
    'Look around for someone wearing a store uniform or name badge.',
    'Approach them calmly and say: "Excuse me, can you help me please?"',
    'Say: "I am looking for [item]. Could you tell me where to find it?"',
    'Listen to their directions. It is fine to ask them to repeat.',
    'Say: "Thank you so much — that is really helpful."',
    'Follow the directions they gave you at your own pace.',
  ],
}

// How many consecutive detections share the same state
function countConsecutive(history, state) {
  let count = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i] === state) count++
    else break
  }
  return count
}

// Trend across the last 6 detections
// Stress=2, Confused=1, Calm=0 — compare recent 3 vs older 3
function getTrend(history) {
  if (history.length < 4) return 'stable'
  const score = (s) => (s === 'Stressed' ? 2 : s === 'Confused' ? 1 : 0)
  const recent = history.slice(-3)
  const older  = history.slice(-6, -3)
  if (older.length === 0) return 'stable'
  const recentAvg = recent.map(score).reduce((a, b) => a + b, 0) / recent.length
  const olderAvg  = older.map(score).reduce((a, b) => a + b, 0) / older.length
  if (recentAvg > olderAvg + 0.4) return 'worsening'
  if (recentAvg < olderAvg - 0.4) return 'improving'
  return 'stable'
}

/**
 * Returns { message, actions } based on full session context.
 *
 * @param {object} ctx
 * @param {string}   ctx.state        — current state: 'Calm' | 'Confused' | 'Stressed'
 * @param {string[]} ctx.history      — full detection history array
 * @param {number}   ctx.step         — current step index (0-based)
 * @param {number}   ctx.totalSteps
 * @param {number}   ctx.hints        — total hints given so far
 * @param {number}   ctx.stressCount  — total stress moments this session
 * @param {object}   ctx.learner      — { name, difficulty }
 * @param {string}   ctx.scenarioId
 */
export function getCoachingResponse({ state, history, step, totalSteps, hints, stressCount, learner, scenarioId }) {
  const consecutive   = countConsecutive(history, state)
  const trend         = getTrend(history)
  const prevState     = history.length >= 2 ? history[history.length - 2] : null
  const hintLevel     = hints < 3 ? 'low' : hints < 7 ? 'medium' : 'high'
  const nearEnd       = totalSteps > 0 && step >= totalSteps - 2
  const isEarlyStep   = step <= 1
  const isBeginner    = learner.difficulty === 'Beginner'
  const isAdvanced    = learner.difficulty === 'Advanced'
  const stepHint      = STEP_HINTS[scenarioId]?.[step] ?? null
  const name          = learner.name

  let message = ''
  let actions = []

  // ─────────────────────────────────────────────────────────────
  // STRESSED
  // ─────────────────────────────────────────────────────────────
  if (state === 'Stressed') {

    if (consecutive >= 4) {
      // Persistently stressed — strongest intervention
      message = isBeginner
        ? `${name}, let's take a proper pause. Close your eyes, breathe in for 4 counts, out for 4. There is absolutely no rush.`
        : `You have been finding this very difficult for a while. Let's fully pause and reset — no pressure to continue immediately.`
      actions = ['Session paused', 'Resetting difficulty', 'Break recommended']

    } else if (stressCount >= 4 && trend === 'worsening') {
      // Multiple stress moments AND getting worse
      message = nearEnd
        ? `You are so close to finishing, ${name}. Just breathe and take it one tiny step at a time — you can do this.`
        : 'This session has been quite demanding. Let\'s slow everything down and look at just this one step together.'
      actions = ['Reducing complexity', 'Slowing pacing', 'Lowering noise level']

    } else if (prevState === 'Confused') {
      // Escalated: confusion turned into stress
      message = `Feeling confused is completely normal — it doesn't mean you are doing badly. Breathe slowly, and let's look at this step again together.`
      actions = ['Increasing guidance', 'Slowing pacing']

    } else if (consecutive >= 2) {
      // Second consecutive stressed detection
      message = nearEnd
        ? `Almost finished, ${name}. Take one deep breath — just ${totalSteps - step} step${totalSteps - step > 1 ? 's' : ''} left.`
        : 'Let\'s slow this down. Focus only on this one step — everything else can wait.'
      actions = ['Slowing pacing', 'Simplifying interaction']

    } else if (isEarlyStep) {
      // Stress very early in the session
      message = isBeginner
        ? `It is okay to feel a little nervous at the start, ${name}. We will go as slowly as you need.`
        : 'Starting something new can feel intense. Take a breath — you have done this kind of thing before.'
      actions = ['Slowing pacing']

    } else {
      // First stress detection — gentle, grounding response
      message = 'Take a slow, deep breath. You are doing better than you think. Whenever you are ready, try once more.'
      actions = ['Slowing pacing']
    }

  // ─────────────────────────────────────────────────────────────
  // CONFUSED
  // ─────────────────────────────────────────────────────────────
  } else if (state === 'Confused') {

    if (consecutive >= 3 || hintLevel === 'high') {
      // Stuck for a long time OR hints already heavily used → try a different approach
      message = stepHint
        ? `Let us try a different approach for this step: ${stepHint}`
        : `You have been working hard on this. Would you like to go back to the previous step and build up from there?`
      actions = ['Alternative approach offered', 'Increasing guidance', 'Simplifying interaction']

    } else if (consecutive >= 2 && trend === 'worsening') {
      // Getting progressively more confused
      message = isBeginner
        ? `No worries — let's go very slowly. ${stepHint ?? 'Read the instruction one sentence at a time.'}`
        : 'Think through this step carefully. What is the very first small action you could take right now?'
      actions = ['Increasing guidance', 'Simplifying interaction']

    } else if (prevState === 'Stressed') {
      // Just recovered from stress but now confused — acknowledge progress
      message = `Good — you are calmer now. Take your time reading the instruction again. There is no pressure at all.`
      actions = ['Gentle guidance']

    } else if (hintLevel === 'medium' && stepHint) {
      // Mid-range hint count — offer a specific step tip
      message = `Here is a tip for this step: ${stepHint}`
      actions = ['Step-specific hint provided']

    } else if (isAdvanced) {
      // Advanced learner confused — encourage self-directed thinking
      message = 'Pause and think about what the goal of this step is. What would be the most natural thing to do?'
      actions = ['Encouraging self-direction']

    } else {
      // First confusion — gentle, non-intrusive
      message = 'Take your time. Read the step instruction once more slowly — there is no hurry.'
      actions = ['Gentle guidance']
    }

  // ─────────────────────────────────────────────────────────────
  // CALM
  // ─────────────────────────────────────────────────────────────
  } else if (state === 'Calm') {

    if (prevState === 'Stressed') {
      // Just recovered from stress — strong acknowledgement
      message = `Great recovery, ${name}. Working through stress is genuinely hard — you did it. Keep going at your own pace.`

    } else if (prevState === 'Confused') {
      // Overcame confusion
      message = 'Well done for refocusing. You found your way through — keep going!'

    } else if (consecutive >= 5 && trend === 'improving') {
      // Sustained calm with consistent improvement
      message = isAdvanced
        ? `Excellent, ${name}. You are handling this very confidently — feel free to move at a faster pace if you are comfortable.`
        : `You are doing brilliantly, ${name}. Calm and consistent — this is exactly how you build confidence.`

    } else if (nearEnd && stressCount > 0) {
      // Near the end after a tough session — strong encouragement
      message = `You had some tough moments today but you kept going. Just a step or two left — this is impressive resilience, ${name}.`

    } else if (nearEnd) {
      // Near the end, smooth session
      message = `Almost there, ${name}. Just a couple of steps left — you have done a wonderful job today.`

    } else if (stressCount > 0 && consecutive >= 3) {
      // Found calm rhythm after earlier difficulty
      message = 'After some challenges earlier, you have found your rhythm. That takes real strength.'

    } else if (isEarlyStep) {
      // Calm at the start — warm encouragement
      message = `Great start, ${name}. You are calm and focused — a perfect way to begin.`

    } else {
      // Steady calm — simple positive message, rotates by step to avoid repetition
      const options = [
        `You are doing well. Move to the next step whenever you feel ready.`,
        `Great focus, ${name}. You are right on track.`,
        'Nice and steady — you are doing exactly what is needed.',
        `Keep it up, ${name}. Each step you complete builds your confidence.`,
      ]
      message = options[step % options.length]
    }
  }

  return { message, actions }
}

// Maps raw face-api expression scores to our 3 learner states.
//
// Key design choice: neutral is weighted very low (0.15) because face-api returns
// neutral as the dominant score (~0.6-0.8) for almost any face, causing a strong
// calm bias. Non-neutral expressions are boosted so moderate facial changes register.
export function mapExpressionsToState(expressions) {
  const {
    neutral   = 0, happy    = 0, sad       = 0,
    angry     = 0, fearful  = 0, disgusted = 0, surprised = 0,
  } = expressions

  const calmScore     = neutral * 0.15 + happy * 1.2
  const confusedScore = surprised * 1.1 + sad * 0.6 + disgusted * 0.4
  const stressedScore = fearful   * 1.3 + angry * 1.1 + sad * 0.7 + disgusted * 0.5

  const total = calmScore + confusedScore + stressedScore || 1
  const scores = {
    Calm:     calmScore     / total,
    Confused: confusedScore / total,
    Stressed: stressedScore / total,
  }

  const state      = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  const confidence = Math.round(scores[state] * 100)
  const expression = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0]

  return { state, confidence, expression }
}
