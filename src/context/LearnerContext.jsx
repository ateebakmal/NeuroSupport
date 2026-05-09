import { createContext, useContext, useEffect, useState } from 'react'

const LearnerCtx = createContext(null)
export const useLearner = () => useContext(LearnerCtx)

const LS_KEY = 'ns_active_learner'

export function LearnerProvider({ children }) {
  const [learner, setLearnerState] = useState(() => {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  })

  const setLearner = (l) => {
    if (l) localStorage.setItem(LS_KEY, JSON.stringify(l))
    else localStorage.removeItem(LS_KEY)
    setLearnerState(l)
  }

  return <LearnerCtx.Provider value={{ learner, setLearner }}>{children}</LearnerCtx.Provider>
}
