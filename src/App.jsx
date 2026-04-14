import { useEffect, useRef, useState } from 'react'
import './App.css'

const bmiBands = [
  {
    key: 'under',
    label: 'ผอม',
    range: 'น้อยกว่า 18.5',
    min: 0,
    max: 18.5,
    tone: 'sky',
    note: 'อาจลองเพิ่มพลังงานและพักผ่อนให้เพียงพอ',
  },
  {
    key: 'normal',
    label: 'สมส่วน',
    range: '18.5 - 22.9',
    min: 18.5,
    max: 23,
    tone: 'mint',
    note: 'อยู่ในช่วงที่สมดุลดี รักษาพฤติกรรมนี้ต่อได้เลย',
  },
  {
    key: 'overweight',
    label: 'น้ำหนักเกิน',
    range: '23.0 - 24.9',
    min: 23,
    max: 25,
    tone: 'pink',
    note: 'ลองขยับร่างกายเพิ่มขึ้นอีกนิดอย่างสม่ำเสมอ',
  },
  {
    key: 'obese-1',
    label: 'อ้วนระดับ 1',
    range: '25.0 - 29.9',
    min: 25,
    max: 30,
    tone: 'peach',
    note: 'ควรเริ่มปรับอาหารและการเคลื่อนไหวอย่างจริงจัง',
  },
  {
    key: 'obese-2',
    label: 'อ้วนระดับ 2',
    range: '30.0 ขึ้นไป',
    min: 30,
    max: Number.POSITIVE_INFINITY,
    tone: 'berry',
    note: 'หากสะดวก ควรปรึกษาผู้เชี่ยวชาญเพื่อวางแผนที่เหมาะสม',
  },
]

const defaultValues = {
  weight: '52',
  height: '160',
}

function BunnyMark(props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <path
        d="M24 25C20.7 19.5 18.9 12.5 20.9 8.5C22.1 6 24.9 5 27.2 7C29.8 9.1 30.9 14.7 31.2 20.5"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 25C43.3 19.5 45.1 12.5 43.1 8.5C41.9 6 39.1 5 36.8 7C34.2 9.1 33.1 14.7 32.8 20.5"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 37C16 26 23 20 32 20C41 20 48 26 48 37C48 47.5 41.1 54 32 54C22.9 54 16 47.5 16 37Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 36.5H27.1M37 36.5H37.1"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M29 42C30.8 43.8 33.2 43.8 35 42"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function calculateBmiData(weightInput, heightInput) {
  const weightKg = Number(weightInput)
  const heightCm = Number(heightInput)

  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm)) {
    return null
  }

  if (weightKg <= 0 || heightCm <= 0) {
    return null
  }

  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  const healthyMin = 18.5 * heightM * heightM
  const healthyMax = 22.9 * heightM * heightM

  return {
    weightKg,
    heightCm,
    bmi,
    healthyMin,
    healthyMax,
  }
}

function validateForm(weightInput, heightInput) {
  const fieldErrors = {}
  const weightKg = Number(weightInput)
  const heightCm = Number(heightInput)

  if (!weightInput) {
    fieldErrors.weight = 'กรุณากรอกน้ำหนัก'
  } else if (!Number.isFinite(weightKg) || weightKg <= 0) {
    fieldErrors.weight = 'น้ำหนักต้องมากกว่า 0'
  }

  if (!heightInput) {
    fieldErrors.height = 'กรุณากรอกส่วนสูง'
  } else if (!Number.isFinite(heightCm) || heightCm <= 0) {
    fieldErrors.height = 'ส่วนสูงต้องมากกว่า 0'
  }

  return {
    fieldErrors,
    hasErrors: Object.keys(fieldErrors).length > 0,
  }
}

function getBmiBand(bmi) {
  return bmiBands.find((band) => bmi >= band.min && bmi < band.max) ?? bmiBands[0]
}

function formatNumber(value) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)
}

function App() {
  const [form, setForm] = useState(defaultValues)
  const [result, setResult] = useState(() =>
    calculateBmiData(defaultValues.weight, defaultValues.height),
  )
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isCalculating, setIsCalculating] = useState(false)
  const [isFreshResult, setIsFreshResult] = useState(false)
  const timerRef = useRef(null)
  const pulseRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      if (pulseRef.current) {
        clearTimeout(pulseRef.current)
      }
    }
  }, [])

  const activeBand = result ? getBmiBand(result.bmi) : null

  const handleChange = (field) => (event) => {
    const nextValue = event.target.value

    setForm((current) => ({
      ...current,
      [field]: nextValue,
    }))

    setFieldErrors((current) => ({
      ...current,
      [field]: '',
    }))

    if (error) {
      setError('')
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const validation = validateForm(form.weight, form.height)

    if (validation.hasErrors) {
      setFieldErrors(validation.fieldErrors)
      setError('กรุณาตรวจข้อมูลให้ครบก่อนคำนวณ')
      return
    }

    const nextResult = calculateBmiData(form.weight, form.height)

    if (!nextResult) {
      setError('กรุณากรอกข้อมูลให้ถูกต้อง')
      return
    }

    setFieldErrors({})
    setError('')
    setIsCalculating(true)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setResult(nextResult)
      setIsCalculating(false)
      setIsFreshResult(true)

      if (pulseRef.current) {
        clearTimeout(pulseRef.current)
      }

      pulseRef.current = setTimeout(() => {
        setIsFreshResult(false)
      }, 1200)
    }, 420)
  }

  const handleReset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (pulseRef.current) {
      clearTimeout(pulseRef.current)
    }

    setForm(defaultValues)
    setResult(calculateBmiData(defaultValues.weight, defaultValues.height))
    setError('')
    setFieldErrors({})
    setIsCalculating(false)
    setIsFreshResult(false)
  }

  const jumpToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div className="brand">
          <BunnyMark className="brand-icon" />
          <span className="brand-text">Bmi Bunny</span>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">เว็บคำนวณ BMI</p>
            <h1>เช็กสุขภาพง่ายๆ ใน 3 วินาที</h1>
            <p className="hero-text">กรอกน้ำหนักและส่วนสูงเพื่อดูค่า BMI ทันที</p>
            <button className="hero-button" type="button" onClick={jumpToForm}>
              เริ่มคำนวณ
            </button>
          </div>

          <div className="hero-aside">
            <div className="hero-note">
              <span>ใช้งานง่าย</span>
              <strong>ไม่ต้องสมัคร ใช้ได้ทันที</strong>
            </div>
            <div className="hero-note">
              <span>ผลลัพธ์ทันที</span>
              <strong>รู้ผลทันทีในไม่กี่วินาที</strong>
            </div>
          </div>
        </div>
      </header>

      <main className="main-grid">
        <section ref={formRef} className="panel form-panel">
          <div className="section-head">
            <p className="section-kicker">เริ่มคำนวณ</p>
            <h2>กรอกข้อมูลของคุณ</h2>
          </div>

          <form className="bmi-form" onSubmit={handleSubmit}>
            <label className={`field ${fieldErrors.weight ? 'has-error' : ''}`}>
              <span>น้ำหนัก</span>
              <div className="input-shell">
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  inputMode="decimal"
                  value={form.weight}
                  onChange={handleChange('weight')}
                  placeholder="เช่น 52.0"
                />
                <em>kg</em>
              </div>
              <small className="field-note">{fieldErrors.weight || 'ใส่ค่าน้ำหนักเป็นกิโลกรัม'}</small>
            </label>

            <label className={`field ${fieldErrors.height ? 'has-error' : ''}`}>
              <span>ส่วนสูง</span>
              <div className="input-shell">
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  inputMode="decimal"
                  value={form.height}
                  onChange={handleChange('height')}
                  placeholder="เช่น 160.0"
                />
                <em>cm</em>
              </div>
              <small className="field-note">{fieldErrors.height || 'ใส่ค่าส่วนสูงเป็นเซนติเมตร'}</small>
            </label>

            <div className="formula-box">
              <span>สูตร BMI</span>
              <strong>
                BMI = น้ำหนัก (kg) / (ส่วนสูง (m))
                <sup>2</sup>
              </strong>
            </div>

            {error ? (
              <p className="error-text" role="alert">
                {error}
              </p>
            ) : null}

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={isCalculating}>
                {isCalculating ? (
                  <span className="button-loading">
                    <span className="button-spinner" aria-hidden="true" />
                    กำลังคำนวณ...
                  </span>
                ) : (
                  'คำนวณ BMI'
                )}
              </button>
              <button className="secondary-button" type="button" onClick={handleReset}>
                รีเซ็ต
              </button>
            </div>
          </form>
        </section>

        <section
          className={`panel result-panel ${activeBand ? `tone-${activeBand.tone}` : ''} ${
            isFreshResult ? 'is-fresh' : ''
          }`}
          aria-live="polite"
        >
          {result && activeBand ? (
            <>
              <div className="result-head">
                <p className="result-kicker">ผลลัพธ์</p>
                <span className={`result-badge result-badge-${activeBand.tone}`}>
                  {activeBand.label}
                </span>
              </div>

              <div className="result-value-wrap">
                <p key={`${activeBand.key}-${result.bmi.toFixed(1)}`} className="result-value">
                  {formatNumber(result.bmi)}
                </p>
              </div>

              <p className="result-note">{activeBand.note}</p>

              <div className="result-list">
                <article>
                  <span>เกณฑ์</span>
                  <strong>{activeBand.range}</strong>
                </article>
                <article>
                  <span>ช่วงน้ำหนักที่เหมาะสม</span>
                  <strong>
                    {formatNumber(result.healthyMin)} - {formatNumber(result.healthyMax)} kg
                  </strong>
                </article>
              </div>
            </>
          ) : (
            <p className="result-note">กรอกข้อมูลเพื่อดูผลลัพธ์</p>
          )}
        </section>
      </main>

      <section className="panel guide-panel">
        <div className="section-head">
          <p className="section-kicker">เกณฑ์อ้างอิง</p>
          <h2>เกณฑ์ BMI (ไทย/เอเชีย)</h2>
        </div>

        <div className="guide-grid">
          {bmiBands.map((band) => {
            const isActive = activeBand?.key === band.key

            return (
              <article
                key={band.key}
                className={`guide-card tone-${band.tone} ${isActive ? 'is-active' : ''}`}
              >
                <span className="guide-dot" />
                <strong>{band.label}</strong>
                <p>{band.range}</p>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default App
