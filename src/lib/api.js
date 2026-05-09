// Unified data layer: uses Supabase when configured, otherwise localStorage.
import { hasSupabase, supabase } from './supabaseClient.js'

const LS_LEARNERS = 'ns_learners'
const LS_SESSIONS = 'ns_sessions'

const read = (k) => JSON.parse(localStorage.getItem(k) || '[]')
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const uid = () => Math.random().toString(36).slice(2, 10)

export const api = {
  async listLearners(userId) {
    if (hasSupabase) {
      const { data, error } = await supabase.from('learners').select('*').order('created_at')
      if (error) throw error
      return data
    }
    return read(LS_LEARNERS).filter((l) => l.user_id === userId)
  },

  async createLearner(userId, payload) {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('learners')
        .insert({ ...payload, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return data
    }
    const all = read(LS_LEARNERS)
    const learner = { id: uid(), user_id: userId, created_at: new Date().toISOString(), ...payload }
    all.push(learner)
    write(LS_LEARNERS, all)
    return learner
  },

  async updateLearner(id, patch) {
    if (hasSupabase) {
      const { data, error } = await supabase.from('learners').update(patch).eq('id', id).select().single()
      if (error) throw error
      return data
    }
    const all = read(LS_LEARNERS)
    const idx = all.findIndex((l) => l.id === id)
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...patch }
      write(LS_LEARNERS, all)
      return all[idx]
    }
  },

  async listSessions(learnerId) {
    if (hasSupabase) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('learner_id', learnerId)
        .order('completed_at', { ascending: false })
      if (error) throw error
      return data
    }
    return read(LS_SESSIONS).filter((s) => s.learner_id === learnerId)
  },

  async createSession(payload) {
    if (hasSupabase) {
      const { data, error } = await supabase.from('sessions').insert(payload).select().single()
      if (error) throw error
      return data
    }
    const all = read(LS_SESSIONS)
    const s = { id: uid(), completed_at: new Date().toISOString(), ...payload }
    all.push(s)
    write(LS_SESSIONS, all)
    return s
  },
}
