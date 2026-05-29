export const GOALS = {
  basariyaUlas: {
    id: 'basariyaUlas',
    title: 'Başarıya Ulaş',
    description: 'Yüksek başarı ve özgüven odaklı bir yaşam sür.',
    evaluate(state) {
      const s = state.data.stats;
      const score = (s.intelligence + s.confidence + s.money / 50);
      return { achieved: score >= 180, score: Math.round(score) };
    }
  },
  olimpikSporcu: {
    id: 'olimpikSporcu',
    title: 'Olimpik Sporcu Ol',
    description: 'Uzun yıllar disiplinli çalış, milli takım ve olimpiyat hedefi.',
    evaluate(state) {
      const s = state.data.stats;
      const isAthlete = state.data.traits?.includes('athlete');
      const isOlympian = state.data.traits?.includes('olympian');
      const score = (s.health * 1.2) + (isAthlete ? 20 : 0) + (isOlympian ? 60 : 0) + (s.confidence / 2);
      return { achieved: isOlympian || score >= 160, score: Math.round(score) };
    }
  },
  girisimci: {
    id: 'girisimci',
    title: 'Başarılı Girişimci Ol',
    description: 'MVP geliştir, yatırım al, ölçekle.',
    evaluate(state) {
      const s = state.data.stats;
      const hasStartup = state.data.flags?.startupTrack === true;
      const funded = state.data.flags?.startupFunded === true;
      const score = s.confidence * 1.1 + (hasStartup ? 25 : 0) + (funded ? 40 : 0) + (s.money / 80);
      return { achieved: funded || score >= 160, score: Math.round(score) };
    }
  },
  akademisyen: {
    id: 'akademisyen',
    title: 'Akademisyen Ol',
    description: 'Araştırma, lisansüstü ve yayınlarla akademide yer edin.',
    evaluate(state) {
      const s = state.data.stats;
      const track = state.data.flags?.academiaTrack === true;
      const abroad = state.data.flags?.abroadAccepted === true;
      const score = s.intelligence * 1.2 + (track ? 30 : 0) + (abroad ? 20 : 0) + (s.confidence / 2);
      return { achieved: track && (s.intelligence >= 70 || abroad), score: Math.round(score) };
    }
  },
  yurtdisiKariyer: {
    id: 'yurtdisiKariyer',
    title: 'Yurt Dışında Kariyer',
    description: 'Dil, beceri ve ağ ile yurt dışında kabul gör ve çalış.',
    evaluate(state) {
      const s = state.data.stats;
      const abroad = state.data.flags?.abroadAccepted === true;
      const english = state.data.traits?.includes('englishB2');
      const score = (english ? 20 : 0) + (abroad ? 60 : 0) + s.intelligence + s.confidence;
      return { achieved: abroad || score >= 170, score: Math.round(score) };
    }
  },
  huzurluOlum: {
    id: 'huzurluOlum',
    title: 'Huzurlu ve Mutlu Ölüm',
    description: 'Mutluluk ve sağlık dengesini koru, stresli yollardan uzak dur.',
    evaluate(state) {
      const s = state.data.stats;
      const score = (s.happiness * 1.2 + s.health * 1.0 + s.social * 0.6) / 2.0;
      return { achieved: score >= 100, score: Math.round(score) };
    }
  },
  muhendisOl: {
    id: 'muhendisOl',
    title: 'Mühendis Ol',
    description: 'STEM becerilerini geliştirip mühendislik kariyerine adım at.',
    evaluate(state) {
      const s = state.data.stats;
      const hasStem = s.intelligence >= 65 && state.data.flags?.uniField === 'stem';
      const score = s.intelligence + (hasStem ? 30 : 0) + (s.confidence / 2);
      return { achieved: score >= 120, score: Math.round(score) };
    }
  },
  mimarOl: {
    id: 'mimarOl',
    title: 'Mimar Ol',
    description: 'Tasarım ve teknik disiplinde uzmanlaşıp mimarlığa yönel.',
    evaluate(state) {
      const s = state.data.stats;
      const hasArch = s.intelligence >= 60 && state.data.flags?.uniField === 'design';
      const score = s.intelligence + s.happiness / 2 + (hasArch ? 30 : 0);
      return { achieved: score >= 110, score: Math.round(score) };
    }
  },
  dunyayiGez: {
    id: 'dunyayiGez',
    title: 'Bütün Dünyayı Gez',
    description: 'Keşif ve macera odaklı bir yaşam: seyahat puanı topla.',
    evaluate(state) {
      const travel = state.data.travelCount ?? 0;
      const s = state.data.stats;
      const score = travel * 10 + s.happiness / 2 + s.money / 100;
      return { achieved: score >= 120, score: Math.round(score) };
    }
  }
};

