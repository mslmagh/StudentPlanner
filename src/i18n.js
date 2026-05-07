/**
 * Merkezi Türkçe çeviri dosyası.
 * Tüm UI metinleri buradan yönetilir — kod içinde sabit string kullanılmaz.
 */
const tr = {
  nav: {
    brand: '🎓 Ders Partneri Bul',
    home: 'Ana Sayfa',
    createRequest: 'İstek Oluştur',
    matching: 'Eşleştirme',
    activeSessions: 'Aktif Oturumlar',
    assistant: 'AI Asistan',
    darkMode: 'Karanlık Mod',
    lightMode: 'Aydınlık Mod',
  },

  home: {
    title: 'Doğru ders partnerini hızla bul',
    desc1:
      'AI Ders Partneri Bulucu, öğrencilere yönelik akıllı bir eşleştirme platformudur. Ders, seviye, müsait olduğun zaman dilimi ve çalışma tarzını girerek sana en uygun partneri dakikalar içinde bulursun.',
    desc2:
      'AI versiyonu, CrewAI çok-ajanlı sistemi kullanır: Beceri Analizcisi, Uyumluluk Ajanı, Çalışma Planlayıcısı ve Maç Değerlendiricisi birlikte kişiselleştirilmiş eşleşmeler ve çalışma planları üretir.',
    cta: 'Partner Bulmaya Başla',
    features: [
      { icon: '🤖', title: 'Yapay Zeka Destekli', desc: '4 ajanın işbirliğiyle akıllı eşleştirme' },
      { icon: '📅', title: 'Haftalık Plan', desc: 'Kişiselleştirilmiş 5 oturumlu çalışma takvimi' },
      { icon: '⚡', title: 'Hızlı Sonuç', desc: 'Formu doldur, birkaç saniyede partnerin hazır' },
    ],
  },

  create: {
    title: 'Çalışma İsteği Oluştur',
    subtitle: 'Bilgilerini gir, yapay zeka sana en uygun partneri bulsun.',
    courseLabel: 'Ders',
    coursePlaceholder: 'Ders seç',
    courses: [
      'Matematik',
      'Fizik',
      'Algoritmalar',
      'Lineer Cebir',
      'İstatistik',
      'Veri Yapıları',
      'Makine Öğrenmesi',
      'Ayrık Matematik',
      'İşletim Sistemleri',
      'Veritabanı Sistemleri',
      'Bilgisayar Ağları',
    ],
    levelLabel: 'Seviye',
    levels: [
      { value: 'Beginner', label: 'Başlangıç' },
      { value: 'Intermediate', label: 'Orta' },
      { value: 'Advanced', label: 'İleri' },
    ],
    timeLabel: 'Tercih Edilen Zaman',
    times: [
      { value: 'Morning', label: 'Sabah' },
      { value: 'Afternoon', label: 'Öğleden Sonra' },
      { value: 'Evening', label: 'Akşam' },
      { value: 'Night', label: 'Gece' },
    ],
    typeLabel: 'Çalışma Türü',
    types: [
      { value: 'Online', label: 'Online' },
      { value: 'In-person', label: 'Yüz Yüze' },
    ],
    submit: '🔍 Partner Bul',
    required: 'Lütfen ders adını girin.',
    recentSearches: 'Son Aramalar',
    clearHistory: 'Temizle',
  },

  matching: {
    title: 'AI Eşleştirme Sonuçları',
    loadingSteps: [
      'Beceri profilin analiz ediliyor...',
      'En uygun partner aranıyor...',
      'Çalışma planın hazırlanıyor...',
      'Eşleşme kalitesi değerlendiriliyor...',
    ],
    loadingMatch: (n) => `#${n}. eşleşme analiz ediliyor...`,
    allDone: (n) => `${n} eşleşme bulundu — en iyi eşleşmeyi seç`,
    rankLabel: (n) => `#${n}`,
    expand: '▼ Detayları Gör',
    collapse: '▲ Gizle',
    errorTitle: 'Hata',
    errorHint: 'Python backend\'in çalıştığından emin ol:',
    errorCmd: 'cd crew_backend && uvicorn main:app --reload',
    matchedPartner: '✅ Eşleşen Partner',
    scores: 'Eşleşme Puanları',
    compatibilityScore: 'Uyumluluk Puanı',
    skillAnalysis: '🔍 Beceri Analizi',
    compatibility: '🤝 Uyumluluk Değerlendirmesi',
    studyPlan: '📅 1 Haftalık Çalışma Planı',
    evaluation: '⚖️ Değerlendirici Kararı',
    viewSessions: 'Aktif Oturumları Görüntüle',
    rematch: '🔄 Farklı Partner Bul',
    // MatchCard pill labels
    pillCompat: 'Uyum',
    // Readable error from backend
    serverError: 'Sunucu hatası oluştu. Lütfen tekrar dene.',
  },

  sessions: {
    title: 'Adaylar & Aktif Oturumlar',
    subtitle: 'Aşağıda en son yaptığınız aramadan dönen adaylar yer alıyor. Bir adayı "Ana Partner Yap"arak kendisiyle aktif bir oturum başlatabilir ve programına erişebilirsiniz.',
    empty: 'Henüz aktif oturumunuz yok. Partner bulmak için istek oluşturun.',
    createLink: 'İstek Oluştur',
    level: { Beginner: 'Başlangıç', Intermediate: 'Orta', Advanced: 'İleri' },
    time: { Morning: 'Sabah', Afternoon: 'Öğleden Sonra', Evening: 'Akşam', Night: 'Gece' },
    type: { Online: 'Online', 'In-person': 'Yüz Yüze' },
    primaryBadge: '⭐ Ana Partner',
    setPrimary: 'Ana Partner Yap',
    planTitle: '1 Haftalık Çalışma Planı',
    startSession: '🚀 Oturumu Başlat',
    addToCalendar: '📅 Takvime Ekle',
    sendMessage: '💬 Mesaj Gönder',
  },

  assistant: {
    title: '🤖 AI Çalışma Asistanı',
    subtitle: 'Yapay zeka destekli akıllı asistan — ders partneri bulmada, çalışma planı oluşturmada ve akademik sorularınızda yardımcı olur.',
    emptyState: 'Merhaba! Size nasıl yardımcı olabilirim? Aşağıdaki önerilerden birini seçebilir veya kendi sorunuzu yazabilirsiniz.',
    suggestions: [
      'Matematik dersi için partner öner',
      'Hangi dersler mevcut?',
      'Algoritmalar dersi için akşam çalışabilecek partner var mı?',
      'Veri Yapıları dersinin partner istatistiklerini göster',
    ],
    you: 'Sen',
    assistant: 'Asistan',
    placeholder: 'Mesajınızı yazın...',
    send: 'Gönder',
    reset: 'Sıfırla',
    infoTitle: 'LangGraph Nasıl Çalışır?',
    infoDesc: 'Bu asistan LangGraph\'ın Worker → Evaluator döngüsünü kullanır. Worker mesajını işler, gerekirse araçları çağırır. Evaluator cevabı denetler — yetersizse Worker\'a geri gönderir (self-correction).',
    processTitle: 'MCP Nasıl Gösteriliyor?',
    processDesc: 'Aşağıdaki cevap kartlarında asistanın araçları doğrudan mı yoksa MCP server üzerinden mi kullandığı, hangi araç çağrılarının yapıldığı ve dönen sonuç özeti görünür.',
    modeLabel: 'Araç Kaynağı',
    modeMcp: 'MCP Server',
    modeLocal: 'Yerel Tool',
    modeLocalFallback: 'Yerel Tool (MCP fallback)',
    graphLabel: 'Akış',
    toolCallsLabel: 'Araç Çağrıları',
    noToolCalls: 'Bu yanıtta araç çağrısı yapılmadı.',
    warningLabel: 'Not',
    argsLabel: 'Parametreler',
    resultLabel: 'Sonuç Özeti',
  },

  health: {
    checking: 'Backend kontrol ediliyor...',
    offline: '⚠️ Backend çevrimdışı — AI özellikleri devre dışı',
    online: '✅ Backend bağlı',
  },
}

export default tr
