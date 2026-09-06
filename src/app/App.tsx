import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { HomePage } from '../pages/home'
import loginAvatar from '../shared/assets/login-avatar.png'
import windowsXpLogo from '../shared/assets/windows-xp-logo.png'

export function App() {
  const [screen, setScreen] = useState<'loading' | 'login' | 'home'>('loading')

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen('login'), 2600)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      {screen === 'home' && <HomePage />}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'login' && <LoginScreen onSuccess={() => setScreen('home')} />}
    </>
  )
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [hasError, setHasError] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password === '0000') {
      onSuccess()
      return
    }
    setHasError(true)
    setPassword('')
  }

  return (
    <section className="login-screen" aria-label="로그인">
      <div className="login-orbit login-orbit-one" aria-hidden="true" />
      <div className="login-orbit login-orbit-two" aria-hidden="true" />
      <form className="login-panel" onSubmit={handleSubmit}>
        <img className="login-avatar" src={loginAvatar} alt="" aria-hidden="true" />
        <h1>Una</h1>
        <label className="sr-only" htmlFor="login-password">비밀번호</label>
        <div className="password-row">
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setHasError(false)
            }}
            autoFocus
            autoComplete="current-password"
            placeholder="비밀번호"
            aria-invalid={hasError}
            aria-describedby={hasError ? 'password-error' : undefined}
          />
          <button type="submit" aria-label="로그인">→</button>
        </div>
        {hasError && <p id="password-error" className="password-error">비밀번호가 올바르지 않습니다.</p>}
      </form>
      <p className="login-hint">비밀번호를 입력하여 시작하세요</p>
    </section>
  )
}

function LoadingScreen() {
  return (
    <section className="loading-screen" aria-label="interacta 불러오는 중" role="status">
      <div className="loading-brand">
        <img className="loading-logo" src={windowsXpLogo} alt="Windows XP" />
      </div>
      <div className="loading-progress" aria-hidden="true">
        <span><i /><i /><i /></span>
      </div>
    </section>
  )
}
