export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 bg-bg-card border border-border-subtle rounded px-3 py-1.5 mb-7">
            <span className="w-5 h-px bg-orange" />
            <span className="text-xs text-text-muted uppercase tracking-widest">О платформе</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-5">
            Мы меняем то, как люди<br /><span className="text-orange">бронируют спорт</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-xl">
            SportBook — первая в Кыргызстане платформа для мгновенного бронирования спортивных объектов. Никаких звонков, никакого ожидания — только спорт.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { n: '48', l: 'Объектов' },
            { n: '1 200+', l: 'Броней' },
            { n: '4.8', l: 'Средний рейтинг' },
            { n: '2026', l: 'Год основания' },
          ].map(s => (
            <div key={s.l} className="bg-bg-secondary border border-border-subtle rounded-card p-5 text-center">
              <div className="text-2xl font-extrabold text-orange mb-1">{s.n}</div>
              <div className="text-xs text-text-muted uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="text-xl font-bold tracking-tight mb-8">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Найди объект', desc: 'Используй поиск и фильтры чтобы найти подходящее поле, корт или зал рядом с тобой.' },
              { step: '02', title: 'Выбери время', desc: 'Посмотри доступные слоты в реальном времени и выбери удобное время для игры.' },
              { step: '03', title: 'Играй', desc: 'Получи подтверждение мгновенно. Никаких звонков и ожиданий — просто приходи и играй.' },
            ].map(s => (
              <div key={s.step} className="bg-bg-secondary border border-border-subtle rounded-card p-6">
                <div className="text-3xl font-extrabold text-orange/20 mb-4 tracking-tight">{s.step}</div>
                <h3 className="text-sm font-bold mb-2">{s.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="bg-bg-secondary border border-border-subtle rounded-card p-8 mb-16">
          <h2 className="text-xl font-bold tracking-tight mb-4">Наша миссия</h2>
          <p className="text-text-muted text-sm leading-relaxed mb-4">
            Мы верим что доступ к спорту должен быть простым и удобным для каждого. SportBook создан чтобы убрать барьеры между людьми и спортом — сложные звонки, неудобные графики и непрозрачные цены остались в прошлом.
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            Платформа объединяет владельцев спортивных объектов и спортсменов в единую экосистему, делая процесс бронирования прозрачным, быстрым и честным.
          </p>
        </div>

        {/* Tech stack */}
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-6">Технологии</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'React', desc: 'Frontend' },
              { name: 'NestJS', desc: 'Backend' },
              { name: 'MongoDB', desc: 'База данных' },
              { name: 'TanStack Query', desc: 'Кеширование' },
            ].map(t => (
              <div key={t.name} className="bg-bg-secondary border border-border-subtle rounded-card p-4">
                <div className="text-sm font-bold mb-1">{t.name}</div>
                <div className="text-xs text-text-muted">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}