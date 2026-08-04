import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoraMark } from '../components/NoraMark';

const STEPS = [
  {
    title: 'Eu sou a Nora',
    text: 'Sua assistente financeira pessoal. Vou acompanhar sua vida financeira todo dia, sem julgamentos.',
  },
  {
    title: 'Fico de olho pra você',
    text: 'Aviso quando uma conta está perto de vencer, e comemoro junto quando você bate uma meta.',
  },
  {
    title: 'Vamos começar',
    text: 'Cadastre suas primeiras receitas e despesas para eu te ajudar a enxergar o quadro completo.',
  },
];

const ONBOARDING_KEY = 'nora_onboarded';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  function finish() {
    localStorage.setItem(ONBOARDING_KEY, '1');
    navigate('/');
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <button
          onClick={finish}
          className="btn btn--ghost"
          style={{ position: 'absolute', top: 16, right: 16, fontSize: 13 }}
        >
          Pular
        </button>

        <div style={{ margin: '8px auto 20px' }}>
          <NoraMark size={56} />
        </div>

        <div key={step} className="page-transition">
          <h1 className="page-title" style={{ fontSize: 22 }}>{STEPS[step].title}</h1>
          <p className="text-muted" style={{ marginTop: 8, marginBottom: 24 }}>{STEPS[step].text}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: i === step ? 'var(--color-emphasis)' : 'var(--color-subtle)',
              }}
            />
          ))}
        </div>

        <button
          className="btn btn--primary"
          style={{ width: '100%' }}
          onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
        >
          {isLast ? 'Começar' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === '1';
}
