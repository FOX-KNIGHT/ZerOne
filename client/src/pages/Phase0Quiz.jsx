import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, CheckCircle2, XCircle, Send, ChevronUp, ChevronDown, Trophy, Zap, Eye, EyeOff } from 'lucide-react'
import api from '../lib/axios'
import { GlassCard } from '../components/ui/GlassCard'

const SECTION_LABELS = { A: 'Section A — Easy (Q1–Q5)', B: 'Section B — Medium (Q6–Q10)', C: 'Section C — Hard (Q11–Q15)' }
const SECTION_COLORS = { A: 'text-green-400 border-green-500/30 bg-green-500/5', B: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5', C: 'text-red-400 border-red-500/30 bg-red-500/5' }

function Terminal_Log({ log }) {
  const [open, setOpen] = useState(true)
  const ref = useRef(null)

  const lines = log.split('\n')
  const getColor = (line) => {
    if (line.includes('WARN')) return 'text-yellow-400'
    if (line.includes('ERROR')) return 'text-red-400'
    if (line.includes('SYSTEM INTERNAL')) return 'text-cyan-300 font-bold'
    if (line.includes('INFO')) return 'text-green-300'
    return 'text-white/50'
  }

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 mb-0 pb-4 border-b border-primary/10"
      >
        <Terminal size={15} className="text-primary" />
        <span className="font-mono font-bold text-sm uppercase tracking-widest text-white">System Log — 150 Lines</span>
        <span className="ml-auto font-mono text-[10px] text-primary/50 uppercase">[Click to {open ? 'collapse' : 'expand'}]</span>
        {open ? <ChevronUp size={14} className="text-primary/40" /> : <ChevronDown size={14} className="text-primary/40" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              ref={ref}
              className="mt-4 max-h-72 overflow-y-auto bg-black/60 border border-primary/10 rounded-lg p-4 font-mono text-xs leading-relaxed"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,255,65,0.2) transparent' }}
            >
              {lines.map((line, i) => (
                <div key={i} className={`${getColor(line)} hover:bg-white/4 px-1 py-0.5 rounded transition-colors`}>
                  <span className="text-white/15 select-none mr-2">{String(i + 1).padStart(3, '0')}</span>
                  {line}
                </div>
              ))}
            </div>
            <p className="font-mono text-[10px] text-white/20 mt-2 text-center">
              Scroll through all 150 lines — SYSTEM INTERNAL entries contain important clues!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}

function QuestionCard({ q, selected, onSelect, submitted, result }) {
  const options = ['A', 'B', 'C', 'D']
  const isCorrect = submitted && result?.correct
  const isWrong   = submitted && !result?.correct && selected
  const correctAns = result?.answer

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: q.id * 0.03 }}
      className={`p-5 border rounded-xl backdrop-blur-md ${
        isCorrect ? 'border-green-500/40 bg-green-500/5' :
        isWrong   ? 'border-red-500/40 bg-red-500/5' :
        'border-white/8 bg-black/40 hover:border-white/15'
      } transition-all`}
    >
      <p className="font-mono text-sm text-white/90 mb-4">
        <span className="text-primary/60 font-bold mr-2">Q{q.id}.</span>
        {q.question}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          const letter = options[i]
          const isSelected  = selected === letter
          const isTheCorrect = submitted && letter === correctAns
          const isThisWrong  = submitted && isSelected && !isCorrect

          return (
            <button
              key={letter}
              disabled={submitted}
              onClick={() => onSelect(q.id, letter)}
              className={`flex items-center gap-3 p-3 rounded-lg border font-mono text-xs text-left transition-all duration-150 ${
                isTheCorrect   ? 'border-green-500/60 bg-green-500/15 text-green-300' :
                isThisWrong    ? 'border-red-500/50 bg-red-500/10 text-red-300' :
                isSelected     ? 'border-primary/60 bg-primary/10 text-primary' :
                submitted      ? 'border-white/5 bg-white/2 text-white/30 cursor-default' :
                                 'border-white/10 bg-white/2 text-white/60 hover:border-primary/30 hover:text-white/90 hover:bg-primary/5 cursor-pointer'
              }`}
            >
              <span className={`w-6 h-6 flex-shrink-0 rounded-md flex items-center justify-center text-[10px] font-black border ${
                isTheCorrect ? 'bg-green-500/30 border-green-500/50 text-green-300' :
                isThisWrong  ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                isSelected   ? 'bg-primary/20 border-primary/50 text-primary' :
                               'bg-white/5 border-white/10 text-white/30'
              }`}>
                {letter}
              </span>
              <span className="flex-1">{opt}</span>
              {isTheCorrect && <CheckCircle2 size={12} className="text-green-400 flex-shrink-0" />}
              {isThisWrong  && <XCircle size={12} className="text-red-400 flex-shrink-0" />}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default function Phase0Quiz() {
  const [log, setLog] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})       // { qId: "A"|"B"|"C"|"D" }
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)       // { correct, score, results, ... }
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAnswers, setShowAnswers] = useState(false)

  useEffect(() => {
    api.get('/phase0/log').then(r => setLog(r.data.log)).catch(() => {})
    api.get('/phase0/questions').then(r => setQuestions(r.data.questions)).catch(() => {})
    // Check if already submitted
    api.get('/phase0/status').then(r => {
      if (r.data.submitted) {
        setSubmitted(true)
        setResult({ correct: r.data.correct, score: r.data.score, results: r.data.results, alreadySubmitted: true })
      }
    }).catch(() => {})
  }, [])

  const handleSelect = (qId, letter) => {
    if (submitted) return
    setAnswers(a => ({ ...a, [qId]: letter }))
  }

  const answeredCount = Object.keys(answers).length
  const allAnswered   = answeredCount === 15

  const handleSubmit = async () => {
    if (!allAnswered) { setError('Please answer all 15 questions before submitting.'); return }
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/phase0/submit', { answers })
      setResult(data)
      setSubmitted(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed'
      if (err.response?.data?.alreadySubmitted) {
        setResult(err.response.data)
        setSubmitted(true)
      } else {
        setError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const sections = ['A', 'B', 'C']

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">&gt; phase_00 / log_analysis</p>
        <h1 className="font-heading font-black text-4xl text-white">
          Log Analysis <span className="shimmer-text">Challenge</span>
        </h1>
        <p className="font-mono text-white/30 text-sm mt-2">
          Study the system log below, then answer 15 multiple-choice questions. 1 attempt only · +10 pts per correct answer
        </p>

        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { label: '15 Questions', color: 'text-white/60' },
            { label: '+150 pts max', color: 'text-primary' },
            { label: '1 Attempt', color: 'text-yellow-400' },
            { label: 'Auto-Graded', color: 'text-cyan-400' },
          ].map(tag => (
            <span key={tag.label} className={`font-mono text-[10px] uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full ${tag.color}`}>
              {tag.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Log Viewer */}
      {log && <Terminal_Log log={log} />}

      {/* Score Result (if submitted) */}
      <AnimatePresence>
        {submitted && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-xl border ${
              result.alreadySubmitted
                ? 'border-yellow-500/30 bg-yellow-500/5'
                : (result.correct >= 12)
                  ? 'border-green-500/40 bg-green-500/8'
                  : 'border-primary/30 bg-primary/5'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <Trophy size={48} className={result.score >= 100 ? 'text-yellow-400' : 'text-primary'} 
                  style={{ filter: 'drop-shadow(0 0 15px rgba(0,255,65,0.4))' }} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                {result.alreadySubmitted && (
                  <p className="font-mono text-[10px] text-yellow-400 uppercase tracking-widest mb-1">Already Submitted</p>
                )}
                <p className="font-mono font-black text-3xl text-white">
                  {result.correct ?? '—'} / 15 Correct
                </p>
                <p className="font-mono text-primary text-lg font-bold mt-1">+{result.score} Points Earned</p>
              </div>
              <button
                onClick={() => setShowAnswers(a => !a)}
                className="flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white/80 border border-white/10 px-3 py-2 rounded-lg hover:border-white/20 transition-all"
              >
                {showAnswers ? <EyeOff size={12} /> : <Eye size={12} />}
                {showAnswers ? 'Hide' : 'Review'} Answers
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions by section */}
      {sections.map(sec => {
        const sectionQs = questions.filter(q => q.section === sec)
        if (!sectionQs.length) return null
        const colorClass = SECTION_COLORS[sec]
        return (
          <div key={sec} className="space-y-3">
            <div className={`border-l-2 border-l-current pl-4 py-1 rounded-r ${colorClass.split(' ')[0]}`}>
              <p className={`font-mono text-[11px] uppercase tracking-widest font-bold ${colorClass.split(' ')[0]}`}>
                {SECTION_LABELS[sec]}
              </p>
            </div>
            {sectionQs.map(q => (
              <QuestionCard
                key={q.id}
                q={q}
                selected={answers[q.id]}
                onSelect={handleSelect}
                submitted={submitted && showAnswers}
                result={result?.results?.[q.id]}
              />
            ))}
          </div>
        )
      })}

      {/* Submit */}
      {!submitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-6"
        >
          <GlassCard className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="font-mono text-sm text-white/60">
                <span className={`font-black text-xl mr-2 ${allAnswered ? 'text-primary' : 'text-white/40'}`}>{answeredCount}</span>
                <span className="text-white/30">/ 15 answered</span>
              </p>
              {error && <p className="font-mono text-xs text-red-400 mt-1">{error}</p>}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={submitting || !allAnswered}
              className={`flex items-center gap-2 px-8 py-3 font-mono font-bold text-sm uppercase tracking-widest rounded-lg border transition-all duration-200 ${
                !allAnswered
                  ? 'border-white/10 bg-white/5 text-white/20 cursor-not-allowed'
                  : submitting
                    ? 'border-primary/30 bg-primary/10 text-primary animate-pulse'
                    : 'border-primary/50 bg-primary/15 text-primary hover:bg-primary/25 hover:shadow-[0_0_25px_rgba(0,255,65,0.2)]'
              }`}
            >
              <Send size={14} />
              {submitting ? 'Submitting...' : 'Submit Phase 0'}
            </motion.button>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
