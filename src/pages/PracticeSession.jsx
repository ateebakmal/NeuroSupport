import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as faceapi from '@vladmandic/face-api'
import { findScenario } from '../data/scenarios.js'
import { useLearner } from '../context/LearnerContext.jsx'
import { api } from '../lib/api.js'
import { getCoachingResponseAI, getCoachingResponse, mapExpressionsToState, hasGroq } from '../lib/coachingAgent.js'

// Mock expressions used when webcam is off
const MOCK_EXPRESSIONS = ['Neutral', 'Happy', 'Sad', 'Surprised']
const DETECT_INTERVAL_REAL = 800    // ms between real detections
const DETECT_INTERVAL_MOCK = 1500   // ms between mock detections

export default function PracticeSession() {
  const { id } = useParams()
  const nav = useNavigate()
  const scenario = findScenario(id)
  const { learner } = useLearner()
  const cfg = JSON.parse(sessionStorage.getItem('ns_session_cfg') || '{}')

  // ── Session state ──────────────────────────────────────────────
  const [step, setStep]           = useState(0)
  const [state, setState]         = useState('Calm')
  const [confidence, setConf]     = useState(72)
  const [expression, setExpr]     = useState('Neutral')
  const [faceVisible, setFaceVis] = useState(true)
  const [timeline, setTimeline]   = useState([])
  const [hints, setHints]         = useState(0)
  const [stress, setStress]       = useState(0)
  const [actions, setActions]     = useState([])
  const [coach, setCoach]         = useState('Whenever you are ready, let\'s begin. Take your time.')
  const [paused, setPaused]       = useState(false)

  // ── Model loading state ────────────────────────────────────────
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [modelStatus, setModelStatus]   = useState('loading') // 'loading' | 'ready' | 'error'

  // ── Refs (keep latest values accessible inside intervals) ──────
  const videoRef      = useRef(null)
  const streamRef     = useRef(null)
  const prevState     = useRef('Calm')
  const timelineRef   = useRef([])
  const hintsRef      = useRef(0)
  const stressRef     = useRef(0)
  const noFaceCount   = useRef(0)         // consecutive frames with no face detected
  const NO_FACE_THRESHOLD = 3             // frames before treating absence as Stressed (~2.4s at 800ms)

  // Sync mutable refs so interval closures stay fresh
  useEffect(() => { timelineRef.current = timeline }, [timeline])
  useEffect(() => { hintsRef.current  = hints  }, [hints])
  useEffect(() => { stressRef.current = stress }, [stress])

  // ── Load face-api models ───────────────────────────────────────
  useEffect(() => {
    if (!cfg.webcam) { setModelStatus('ready'); return }

    // Force CPU backend — bypasses WebGL/WASM which fail on many devices
    console.log('[face-api] Setting CPU backend...')
    faceapi.tf.setBackend('cpu')
      .then(() => faceapi.tf.ready())
      .then(() => {
        console.log('[face-api] CPU backend ready. Loading models from /models...')
        return Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ])
      })
      .then(() => {
        console.log('[face-api] Models loaded successfully. Detection starting.')
        setModelsLoaded(true)
        setModelStatus('ready')
      })
      .catch((err) => {
        console.error('[face-api] Model load failed:', err)
        setModelStatus('error')
      })
  }, [])

  // ── Webcam stream ──────────────────────────────────────────────
  useEffect(() => {
    if (!cfg.webcam) return
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then((s) => {
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setModelStatus('error'))
    return () => streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  // ── Detection + coaching loop ──────────────────────────────────
  useEffect(() => {
    if (paused || modelStatus === 'loading') return

    const useReal = cfg.webcam && modelsLoaded && modelStatus === 'ready'
    const interval = setInterval(async () => {
      let next, conf, expr

      if (useReal && videoRef.current?.readyState >= 2) {
        // ── Real face detection ─────────────────────────────────
        let result = null
        try {
          result = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
            .withFaceExpressions()
        } catch { result = null }

        if (!result) {
          noFaceCount.current += 1
          console.log(`[face-api] No face detected (${noFaceCount.current}/${NO_FACE_THRESHOLD} before Stressed)`)
          setFaceVis(false)
          if (noFaceCount.current < NO_FACE_THRESHOLD) return // hold last state briefly
          // Prolonged face absence (hand covering, looking away) → treat as Stressed
          next = 'Stressed'; conf = 70; expr = 'face-hidden'
        } else {
          noFaceCount.current = 0
          setFaceVis(true)
          ;({ state: next, confidence: conf, expression: expr } = mapExpressionsToState(result.expressions))
        }
        if (expr === 'face-hidden') {
          console.log('[face-api] Face hidden → forcing Stressed')
        } else {
          console.log('[face-api] Detected:', {
            state: next,
            confidence: conf + '%',
            topExpression: expr,
            rawScores: Object.fromEntries(
              Object.entries(result.expressions).map(([k, v]) => [k, (v * 100).toFixed(1) + '%'])
            ),
          })
        }
      } else {
        // ── Mock detection (webcam off or models failed) ────────
        const r = Math.random() + (cfg.noise || 2) * 0.05 + (step >= 3 ? 0.1 : 0)
        next = r > 0.78 ? 'Stressed' : r > 0.55 ? 'Confused' : 'Calm'
        conf = 60 + Math.floor(Math.random() * 35)
        expr = MOCK_EXPRESSIONS[Math.floor(Math.random() * MOCK_EXPRESSIONS.length)]
      }

      // ── Update detection state ──────────────────────────────
      setState(next); setConf(conf); setExpr(expr)
      setTimeline((tl) => { const u = [...tl.slice(-19), next]; timelineRef.current = u; return u })

      if (next !== 'Calm')     setHints((h)  => { hintsRef.current  = h + 1;  return h + 1 })
      if (next === 'Stressed') setStress((s) => { stressRef.current = s + 1;  return s + 1 })

      // ── Adaptive coaching — fires only on state change ──────
      if (next !== prevState.current) {
        console.log(`[coach] State changed: ${prevState.current} → ${next} (hints:${hintsRef.current} stress:${stressRef.current} step:${step}) source:${hasGroq ? 'groq' : 'rules'}`)
        prevState.current = next
        const coachCtx = {
          state:       next,
          history:     [...timelineRef.current],
          step,
          totalSteps:  scenario.steps.length,
          hints:       hintsRef.current,
          stressCount: stressRef.current,
          learner,
          scenarioId:  scenario.id,
        }
        const { message, actions: acts } = await getCoachingResponseAI(coachCtx)
        console.log(`[coach] Message: "${message}"`, acts.length ? `| Actions: ${acts.join(', ')}` : '')
        setCoach(message)
        setActions(acts)
      }
    }, useReal ? DETECT_INTERVAL_REAL : DETECT_INTERVAL_MOCK)

    return () => clearInterval(interval)
  }, [paused, modelsLoaded, modelStatus, step, cfg.webcam, cfg.noise])

  if (!scenario) return <div className="p-8 text-slate-500">Scenario not found.</div>

  // ── End session ────────────────────────────────────────────────
  const end = async () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    const counts   = timelineRef.current.reduce((a, s) => ((a[s] = (a[s] || 0) + 1), a), {})
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Calm'
    await api.createSession({
      learner_id:    learner.id,
      scenario_id:   scenario.id,
      scenario_title: scenario.title,
      dominant_state: dominant.toLowerCase(),
      stress_moments: stressRef.current,
      hints_given:   hintsRef.current,
      config:        cfg,
    })
    sessionStorage.setItem('ns_last_summary', JSON.stringify({ dominant, stress: stressRef.current, hints: hintsRef.current }))
    nav(`/scenarios/${id}/summary`)
  }

  const stateColor = state === 'Calm'
    ? 'bg-emerald-100 text-emerald-700'
    : state === 'Confused'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-rose-100 text-rose-700'

  const detectionMode = cfg.webcam && modelsLoaded ? 'live' : 'simulated'

  return (
    <div className="grid lg:grid-cols-2 gap-6 max-w-6xl">

      {/* ── LEFT: Scenario panel ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 uppercase">Scenario</div>
              <h1 className="text-xl font-bold">{scenario.title}</h1>
            </div>
            <span className="chip">Step {step + 1} / {scenario.steps.length}</span>
          </div>
          {/* Step progress bar */}
          <div className="mt-3 h-1.5 rounded-full bg-brand-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
              style={{ width: `${((step + 1) / scenario.steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="card text-center min-h-[120px] flex flex-col items-center justify-center">
          <div className="text-xs text-slate-500 uppercase mb-3">Current Instruction</div>
          <p className="text-2xl font-semibold leading-snug">{scenario.steps[step]}</p>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Session Environment</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Info label="Noise level"  value={`${cfg.noise ?? 3}/5`} />
            <Info label="People"       value={cfg.people ?? 2} />
            <Info label="Pacing"       value={cfg.pacing ?? 'Normal'} />
            <Info label="Complexity"   value={cfg.complexity ?? 'Standard'} />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="btn-secondary flex-1"
            disabled={step === 0}
          >
            Previous
          </button>
          {step < scenario.steps.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn-primary flex-1">Next Step</button>
          ) : (
            <button onClick={end} className="btn-primary flex-1">Finish Session</button>
          )}
        </div>
        <button onClick={end} className="w-full text-sm text-rose-600 hover:underline">End Session Early</button>
      </div>

      {/* ── RIGHT: AI assistance panel ───────────────────────── */}
      <div className="space-y-4">

        {/* Webcam */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Webcam</h3>
            {cfg.webcam && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                modelStatus === 'loading' ? 'bg-amber-100 text-amber-700' :
                modelStatus === 'error'   ? 'bg-rose-100 text-rose-600'   :
                                            'bg-emerald-100 text-emerald-700'
              }`}>
                {modelStatus === 'loading' ? 'Loading models…' :
                 modelStatus === 'error'   ? 'Model error — using simulation' :
                                            'Live detection active'}
              </span>
            )}
          </div>
          {cfg.webcam ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay playsInline muted
                className="w-full rounded-xl bg-slate-900 aspect-video object-cover"
              />
              {!faceVisible && modelsLoaded && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/60">
                  <span className="text-white text-sm font-medium">No face detected — move into frame</span>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-slate-100 grid place-items-center text-slate-500 text-sm">
              Webcam disabled — using simulated detection
            </div>
          )}
        </div>

        {/* Emotion Detection */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Emotion Detection</h3>
            <span className="text-xs text-slate-400 capitalize">{detectionMode}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full font-semibold ${stateColor}`}>{state}</span>
            <span className="text-sm text-slate-500">Confidence {confidence}%</span>
          </div>
          <div className="text-sm text-slate-500 mt-2">
            Raw expression: <strong className="capitalize">{expression}</strong>
          </div>

          {/* State badges */}
          <div className="flex gap-2 mt-3">
            {['Calm', 'Confused', 'Stressed'].map((s) => (
              <span key={s} className={`chip transition-all ${state === s ? 'ring-2 ring-offset-1 ring-brand-400 opacity-100' : 'opacity-40'}`}>
                {s}
              </span>
            ))}
          </div>

          {/* Realtime timeline */}
          <div className="mt-4">
            <div className="text-xs uppercase text-slate-500 mb-1">Real-time emotion timeline</div>
            <div className="flex items-end gap-0.5 h-10">
              {timeline.map((s, i) => (
                <div
                  key={i}
                  title={s}
                  className={`flex-1 rounded-sm transition-all ${
                    s === 'Calm' ? 'bg-emerald-400' : s === 'Confused' ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                  style={{ height: s === 'Calm' ? '35%' : s === 'Confused' ? '68%' : '100%' }}
                />
              ))}
              {timeline.length === 0 && (
                <div className="text-xs text-slate-400 self-center">Waiting for first detection…</div>
              )}
            </div>
          </div>
        </div>

        {/* Adaptive Coaching Agent */}
        <div className="card bg-gradient-to-br from-brand-500 to-brand-700 text-white border-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase opacity-80 font-semibold">Adaptive Coach</div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full opacity-80">{hasGroq ? 'Llama 3.3 · Groq' : 'Rule-based · Fallback'}</span>
          </div>
          <p className="text-lg font-medium leading-snug">{coach}</p>
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {actions.map((a) => (
                <span key={a} className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">{a}</span>
              ))}
            </div>
          )}
        </div>

        {/* Session controls */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPaused((p) => !p)}
            className="btn-secondary text-sm"
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={async () => {
              setHints((h) => h + 1)
              const { message } = await getCoachingResponseAI({ state, history: timelineRef.current, step, totalSteps: scenario.steps.length, hints: hintsRef.current + 1, stressCount: stressRef.current, learner, scenarioId: scenario.id })
              setCoach(message)
            }}
            className="btn-secondary text-sm"
          >
            Retry Step
          </button>
          <button
            onClick={() => setActions(['Lowered difficulty'])}
            className="btn-secondary text-sm"
          >
            Lower Difficulty
          </button>
        </div>

      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-brand-50 border border-brand-100 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}
