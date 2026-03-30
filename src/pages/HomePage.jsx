import { Link } from 'react-router-dom'
import tr from '../i18n'

const { home: t } = tr

const HOW_STEPS = [
  {
    num: '01',
    icon: '📝',
    title: 'Ne arıyorsun?',
    desc: 'Birlikte çalışmak istediğin dersi, seviyeni ve müsait olduğun vakti seç .',
  },
  {
    num: '02',
    icon: '🤖',
    title: 'Yapay zeka analiz eder',
    desc: 'Sistemimiz, seninle aynı derste çalışan, aynı saatlerde müsait olan ve uyumlu kişileri tespit eder.',
  },
  {
    num: '03',
    icon: '🎯',
    title: 'Partnerini seç ve başla',
    desc: 'Sana özel oluşturulan haftalık çalışma planıyla birlikte oturumuna anında başlayabilirsin.',
  },
]

const BENEFITS = [
  {
    icon: '🤝',
    title: 'Uyumlu partner',
    desc: 'Sadece aynı dersi değil — aynı seviyeyi, vakti ve çalışma tarzını paylaşan biriyle eşleşiyorsun.',
  },
  {
    icon: '📅',
    title: 'Hazır çalışma planı',
    desc: 'Her eşleştirmede sana özel 5 oturumlu haftalık bir program otomatik oluşturuluyor.',
  },
  {
    icon: '⏱️',
    title: 'Hızlı sonuç',
    desc: 'Formu doldurmana yetecek düzeyden fazla süre beklemiyor, sonuçlar anlık gelmeye başlıyor.',
  },
]

function HomePage() {
  return (
    <div className="homepage">

      {/* ─── HERO ─── */}
      <section className="hero-section">
        <h1 className="hero-title">
          Doğru ders partnerini{' '}
          <span className="hero-gradient">saniyeler içinde</span> bul
        </h1>
        <p className="hero-subtitle">
          Dersini, seviyeni ve müsait olduğun vakti gir — yapay zeka sana en uygun çalışma
          partnerini bulup kişiselleştirilmiş bir haftalık plan oluştursun.
        </p>
        <div className="hero-actions">
          <Link to="/create-request" className="primary-button hero-cta">
            {t.cta} →
          </Link>
          <a href="#how-it-works" className="secondary-button hero-secondary">
            Nasıl çalışır?
          </a>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className="features-section">
        <div className="features-grid">
          {BENEFITS.map((b, i) => (
            <div key={b.title} className={`feature-card feature-card-${i + 1}`}>
              <div className="feature-icon">{b.icon}</div>
              <div className="feature-title">{b.title}</div>
              <div className="feature-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-section" id="how-it-works">
        <h2 className="section-title">Nasıl çalışır?</h2>
        <p className="section-subtitle">3 basit adımda doğru ders partnerini bul ve çalışmaya başla.</p>
        <div className="steps-container">
          {HOW_STEPS.map((step, i) => (
            <div key={step.title} className="step-item">
              <div className="step-icon-wrap">
                <div className="step-icon">{step.icon}</div>
                <div className="step-number">{i + 1}</div>
              </div>
              {i < HOW_STEPS.length - 1 && <div className="step-connector" aria-hidden="true" />}
              <div className="step-label">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHAT AI DOES ─── */}
      <section className="agents-section">
        <h2 className="section-title">Senin için neler yapılıyor?</h2>
        <p className="section-subtitle">Bir eşleştirme istedikten sonra sistemin arka planda gerçekleştirdiği adımlar</p>
        <div className="agents-grid">
          {[
            { icon: '🔍', name: 'Profil Analizi', desc: 'Seçtiğin derse ve seviyene göre ihtiyaçların ve olası eksikliklerin tespit edilir.', color: 'violet' },
            { icon: '🤝', name: 'Uyumluluk Değerlendirmesi', desc: 'Kandidat partnerler seninle ne kadar örtüştüğüne göre 0-100 arası puanlanır.', color: 'blue' },
            { icon: '📅', name: 'Haftalık Plan', desc: 'Eşleştirdiğin kişiyle 5 oturumdan oluşan, vaktinize ve düzeyinize özel bir çalışma takvimi hazırlanır.', color: 'green' },
            { icon: '✅', name: 'Son Kalite Kontrolü', desc: 'Tüm analizler gözden geçirilir; eşleştirme çok zayıfsa sana bildirilir, güçlüyse öncelikli gösterilir.', color: 'orange' },
          ].map((agent) => (
            <div key={agent.name} className={`agent-card agent-${agent.color}`}>
              <div className="agent-card-icon">{agent.icon}</div>
              <div className="agent-card-name">{agent.name}</div>
              <div className="agent-card-desc">{agent.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Hemen dene</h2>
          <p className="cta-sub">Kayıt gerekmez. Sadece ne istediğini söyle, gerisini biz halledelim.</p>
          <Link to="/create-request" className="primary-button cta-btn">
            Partner Bulmaya Başla →
          </Link>
        </div>
      </section>

    </div>
  )
}

export default HomePage