export const Goals = {
  list: [
    { id: 'wealthGoal', label: 'Yüksek servete ulaş' },
    { id: 'doktorOl', label: 'Doktor ol' },
    { id: 'muhendisOl', label: 'Mühendis ol' },
    { id: 'mimarOl', label: 'Mimar ol' },
    { id: 'dunyayiGez', label: 'Bütün dünyayı gez' },
    { id: 'olympicAthlete', label: 'Olimpik sporcu ol' },
    { id: 'entrepreneur', label: 'Girişimci olarak başarı' },
    { id: 'academician', label: 'Akademisyen ol' },
    { id: 'importExport', label: 'İthalat/İhracat' },
  ],

  pickRandom(rng) {
    const idx = Math.floor(rng() * this.list.length);
    return this.list[idx].id;
  },

  requirements(goalId) {
    // Geriye dönük uyumluluk: eski kimlikleri yeni hedeflere eşle
    if (goalId === 'basariyaUlas') goalId = 'wealthGoal';
    if (goalId === 'huzurluOlum') goalId = 'doktorOl';
    if (goalId === 'abroadCareer') goalId = 'importExport';
    switch (goalId) {
      case 'wealthGoal':
        return [
          { kind: 'stat', key: 'money', min: 5000 },
          { kind: 'stat', key: 'confidence', min: 60 },
        ];
      case 'doktorOl':
        return [
          { kind: 'flag', key: 'uniField', equals: 'stem', label: 'Tıp/sağlıkla ilişkili temel' },
          { kind: 'stat', key: 'intelligence', min: 78 },
          { kind: 'stat', key: 'discipline', min: 72 },
          { kind: 'stat', key: 'focus', min: 70 },
          { kind: 'stat', key: 'empathy', min: 60 },
        ];
      case 'muhendisOl':
        return [
          { kind: 'flag', key: 'uniField', equals: 'stem', label: 'STEM bölüm' },
          { kind: 'stat', key: 'intelligence', min: 70 },
          { kind: 'stat', key: 'focus', min: 60 },
          { kind: 'stat', key: 'discipline', min: 60 },
        ];
      case 'mimarOl':
        return [
          { kind: 'flag', key: 'uniField', equals: 'design', label: 'Tasarım/Sanat bölüm' },
          { kind: 'stat', key: 'creativity', min: 72 },
          { kind: 'stat', key: 'focus', min: 55 },
          { kind: 'stat', key: 'confidence', min: 55 },
        ];
      case 'dunyayiGez':
        return [
          { kind: 'number', key: 'travelCount', min: 5, label: 'Seyahat' },
          { kind: 'stat', key: 'money', min: 4000 },
        ];
      case 'olympicAthlete':
        return [
          { kind: 'stat', key: 'health', min: 80 },
          { kind: 'stat', key: 'endurance', min: 75 },
          { kind: 'stat', key: 'confidence', min: 60 },
          { kind: 'number', key: 'training', min: 5, label: 'Antrenman' },
        ];
      case 'entrepreneur':
        return [
          { kind: 'stat', key: 'confidence', min: 65 },
          { kind: 'stat', key: 'social', min: 55 },
          { kind: 'stat', key: 'money', min: 2500 },
        ];
      case 'academician':
        return [
          { kind: 'stat', key: 'intelligence', min: 78 },
          { kind: 'stat', key: 'focus', min: 70 },
          { kind: 'stat', key: 'discipline', min: 70 },
        ];
      case 'importExport':
        return [
          { kind: 'stat', key: 'social', min: 65 },
          { kind: 'stat', key: 'confidence', min: 65 },
          { kind: 'stat', key: 'money', min: 3000 },
          { kind: 'number', key: 'travelCount', min: 2, label: 'Seyahat' },
        ];
      default:
        return [];
    }
  },

  evaluate(goalId, state) {
    // Geriye dönük uyumluluk
    if (goalId === 'basariyaUlas') goalId = 'wealthGoal';
    if (goalId === 'huzurluOlum') goalId = 'doktorOl';
    if (goalId === 'abroadCareer') goalId = 'importExport';
    const s = state.data.stats;
    const f = state.data.flags;
    switch (goalId) {
      case 'wealthGoal': {
        return s.money >= 5000 && s.confidence >= 60;
      }
      case 'doktorOl': {
        return f.uniField === 'stem' && s.intelligence >= 78 && s.discipline >= 72 && s.focus >= 70 && s.empathy >= 60;
      }
      case 'muhendisOl': {
        return f.uniField === 'stem' && (s.intelligence >= 70 && s.focus >= 60 && s.discipline >= 60);
      }
      case 'mimarOl': {
        return f.uniField === 'design' && (s.creativity >= 72 && s.focus >= 55 && s.confidence >= 55);
      }
      case 'dunyayiGez': {
        return (state.data.flags.travelCount || 0) >= 5 || s.money >= 4000;
      }
      case 'olympicAthlete': {
        return s.health >= 80 && s.endurance >= 75 && s.confidence >= 60 && (state.data.flags.training || 0) >= 5;
      }
      case 'entrepreneur': {
        return s.confidence >= 65 && s.social >= 55 && s.money >= 2500;
      }
      case 'academician': {
        return s.intelligence >= 78 && s.focus >= 70 && s.discipline >= 70;
      }
      case 'importExport': {
        return s.social >= 65 && s.confidence >= 65 && s.money >= 3000 && ((state.data.flags.travelCount || 0) >= 2);
      }
      default:
        return false;
    }
  }
};


