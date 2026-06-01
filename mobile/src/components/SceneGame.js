/**
 * SceneGame — Sahne ID'sine ve seçenek içeriğine göre
 * en uygun görsel mini-oyun şablonunu seçer.
 */
import SwipeCards     from './games/SwipeCards';
import CharacterSelect from './games/CharacterSelect';
import EnergyMeter    from './games/EnergyMeter';
import PathCards      from './games/PathCards';
import RiskSlider     from './games/RiskSlider';

// ─── Sahne → Şablon haritası ───────────────────────────────────────────────

// CharacterSelect: aile/karakter seçim sahneleri
const CHARACTER_SCENES = new Set([
  'intro', 'y2001_outing_both', 'y2001_outing_father', 'y2001_outing_mother',
]);

// PathCards: büyük dal / okul / kariyer seçimleri
const PATH_SCENES = new Set([
  'y2015_high_school', 'y2019_uni_start', 'y2024_career', 'y2026_growth',
  'y2018_military_choice', 'y2018_mil_branch', 'y2019_mil_role',
  'y2016_voc_start', 'y2015_apprenticeship_start',
  'y2026_eng_intro', 'y2026_eng_field', 'y2026_med_intro',
  'y2026_arch_intro', 'y2026_trade_intro', 'y2026_wealth_intro',
  'y2027_startup', 'y2027_academia', 'y2027_travel',
]);

// EnergyMeter: yoğun/dengeli/rahat yoğunluk sahneleri
const ENERGY_SCENES = new Set([
  'y2006_primary_start', 'y2012_exam', 'y2018_uni_exam',
  'y2020_pandemic', 'y2027_sports',
  'y2027_tus_prep', 'y2028_sports_national',
]);

// RiskSlider: güvenli/dengeli/riskli seçimler
const RISK_SCENES = new Set([
  'y2027_wealth_invest', 'y2027_wealth_career', 'y2028_wealth_business',
  'y2028_wealth_shocks', 'y2029_wealth_tax', 'y2029_wealth_manage',
  'y2017_voc_practice', 'y2016_apprenticeship_progress',
  'y2020_trade_growth', 'y2024_trade_scale', 'y2024_startup_path',
  'y2028_startup_build',
]);

// ─── İçerik tabanlı tespit ─────────────────────────────────────────────────
function detectByContent(choices) {
  if (!choices || choices.length === 0) return 'swipe';
  const labels = choices.map(c => (c.label || '').toLowerCase()).join(' ');

  // Risk deseni
  if (/güvenli|riskli|dengeli/.test(labels) && choices.length <= 4) return 'risk';

  // Enerji/yoğunluk deseni
  if (/yoğun|dengeli|rahat|kısıtlı/.test(labels) && choices.length <= 4) return 'energy';

  // Karakter deseni
  if (/baba|anne|aile/.test(labels) && choices.length <= 4) return 'character';

  // Büyük dal deseni (4+ seçenek, emojili)
  if (choices.length >= 4 && choices.filter(c => /\p{Emoji_Presentation}/u.test(c.label)).length >= 3) return 'path';

  return 'swipe';
}

export function getGameType(sceneId, choices) {
  if (CHARACTER_SCENES.has(sceneId)) return 'character';
  if (PATH_SCENES.has(sceneId))      return 'path';
  if (ENERGY_SCENES.has(sceneId))    return 'energy';
  if (RISK_SCENES.has(sceneId))      return 'risk';
  return detectByContent(choices);
}

// ─── Ana bileşen ───────────────────────────────────────────────────────────
export default function SceneGame({ sceneId, scene, gameState, onChoose, buildStatPreview, Conditions }) {
  if (!scene || !scene.choices) return null;
  const type = getGameType(sceneId, scene.choices);

  const props = { scene, gameState, onChoose, buildStatPreview, Conditions };

  switch (type) {
    case 'character': return <CharacterSelect {...props} />;
    case 'path':      return <PathCards       {...props} />;
    case 'energy':    return <EnergyMeter     {...props} />;
    case 'risk':      return <RiskSlider      {...props} />;
    default:          return <SwipeCards      {...props} />;
  }
}
