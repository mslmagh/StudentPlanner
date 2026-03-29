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
    darkMode: 'Karanlık Mod',
    lightMode: 'Aydınlık Mod',
  },

  home: {
    title: 'Doğru ders partnerini hızla bul',
    desc1:
      'AI Ders Partneri Bulucu, ögrencilere yönelik akıllı bir eşleştirme platformudur. Ders, seviye, müsait olduğun zaman dilimi ve çalışma tarzını girerek sana en uygun partneri dakikalar içinde bulursun.',
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
    overallScore: 'Genel Eşleşme Kalitesi',
    skillAnalysis: '🔍 Beceri Analizi',
    compatibility: '🤝 Uyumluluk Değerlendirmesi',
    studyPlan: '📅 1 Haftalık Çalışma Planı',
    evaluation: '⚖️ Değerlendirici Kararı',
    viewSessions: 'Aktif Oturumları Görüntüle',
  },

  sessions: {
    title: 'Aktif Oturumlar',
    subtitle: 'AI tarafından eşleştirilen partnerleriniz:',
    empty: 'Henüz aktif oturumunuz yok. Partner bulmak için istek oluşturun.',
    createLink: 'İstek Oluştur',
    level: { Beginner: 'Başlangıç', Intermediate: 'Orta', Advanced: 'İleri' },
    time: { Morning: 'Sabah', Afternoon: 'Öğleden Sonra', Evening: 'Akşam', Night: 'Gece' },
    type: { Online: 'Online', 'In-person': 'Yüz Yüze' },
  },
}

export default tr
