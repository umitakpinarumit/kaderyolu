# Kaderyolu — Veri Şeması

## GameState

`GameState.data` nesnesi oyunun tüm durumunu tutar. `localStorage`'a JSON olarak kaydedilir.

```ts
interface GameData {
  visitCounts : Record<SceneId, number>;   // her sahneye kaç kez girildi
  flags       : FlagMap;                   // boolean / string / number bayraklar
  stats       : StatMap;                   // 0-100 arası istatistikler (para hariç)
  traits      : string[];                  // kalıcı özellik etiketleri
  inventory   : string[];                  // eşya listesi (equip için)
  outfit      : Record<Slot, string>;      // takılan kıyafetler { slot: item }
  travelCount : number;                    // toplam seyahat sayısı
  training    : number;                    // spor antrenman puanı
}
```

---

## StatMap — 15 istatistik

| Anahtar       | Açıklama                        | Başlangıç (RNG)     | Sınır    |
|---------------|---------------------------------|---------------------|----------|
| `health`      | Fiziksel sağlık                 | `randomClamped()`   | 0–100    |
| `endurance`   | Dayanıklılık                    | `randomClamped()`   | 0–100    |
| `strength`    | Güç                             | `randomClamped()`   | 0–100    |
| `agility`     | Çeviklik                        | `randomClamped()`   | 0–100    |
| `intelligence`| Zekâ / Öğrenme                  | `randomClamped()`   | 0–100    |
| `creativity`  | Yaratıcılık                     | `randomClamped()`   | 0–100    |
| `discipline`  | Disiplin                        | `randomClamped()`   | 0–100    |
| `focus`       | Odak                            | `randomClamped()`   | 0–100    |
| `confidence`  | Özgüven                         | `randomClamped()`   | 0–100    |
| `charisma`    | Karizma                         | `randomClamped()`   | 0–100    |
| `empathy`     | Empati                          | `randomClamped()`   | 0–100    |
| `social`      | Sosyallik                       | `randomClamped()`   | 0–100    |
| `happiness`   | Mutluluk                        | `randomClamped()`   | 0–100    |
| `luck`        | Şans (pitch/piyango hesaplar)   | `randomClamped(50, 30, 25, 90)` | 25–90 |
| `money`       | Para (₺ birimi)                 | `0`                 | sınırsız (negatif olabilir) |

> `randomClamped(rng, mean=50, spread=20, min=20, max=85)` — 3 RNG ortalamasıyla yaklaşık normal dağılım.

---

## FlagMap — Bayraklar

### Boolean Bayraklar

| Anahtar              | Ne zaman `true`                                   |
|----------------------|---------------------------------------------------|
| `babaDestek`         | "Babama daha yakınım" seçildi                     |
| `anneDestek`         | "Anneme daha yakınım" seçildi                     |
| `savingsDiscipline`  | 2008'de "Harcamaları kıs" seçildi                 |
| `tookItEasy2012`     | 2012'de "Rahat al" seçildi                        |
| `smallBizTried`      | Çıraklıkta erken dükkan denemesi yapıldı          |
| `startupTrack`       | Girişim yoluna girildi                            |
| `startupFunded`      | Girişim yatırımı alındı (4000₺ eklenir)           |
| `academiaTrack`      | Akademi yoluna girildi                            |
| `abroadAccepted`     | Yurt dışı program kabulü alındı                   |

### String Bayraklar

| Anahtar      | Olası Değerler                          | Açıklama                    |
|--------------|-----------------------------------------|-----------------------------|
| `goal`       | `basariyaUlas` · `huzurluOlum` · `muhendisOl` · `mimarOl` · `dunyayiGez` | Seçilen hedef (GOALS ile eşleşir) |
| `uniField`   | `stem` · `econ` · `design`             | Üniversite bölüm grubu      |
| `vocField`   | `elektrik` · `bilisim` · `motor`       | Meslek lisesi alanı         |
| `milBranch`  | `hava` · `kara` · `deniz`              | Askerî branş                |
| `milPath`    | `short` · `exam` · `commando`          | Askerî kariyer hedefi       |
| `engField`   | `soft` · `elec` · `mech`              | Mühendislik alanı (mobile)  |
| `returnScene`| herhangi bir sahne ID'si               | Rastgele olay sonrası dönüş |

### Number Bayraklar (flags içinde)

| Anahtar | Açıklama                           |
|---------|------------------------------------|
| `seed`  | Doğumda kullanılan RNG tohumu      |

---

## Traits — Özellik Etiketleri

### Aile / Çocukluk
| Etiket        | Nereden                              |
|---------------|--------------------------------------|
| `babaSevgisi` | "Babama daha yakınım"                |
| `anneSevgisi` | "Anneme daha yakınım"                |
| `sabirli`     | Tasarruf / öz bakım yolları          |
| `yatirimciAdayi` | 2010 erken yatırım seçimi         |

### Meslek / Çıraklık
| Etiket         | Nereden                             |
|----------------|-------------------------------------|
| `vocElektrik`  | Meslek lisesi elektrik alanı        |
| `vocBilisim`   | Meslek lisesi bilişim alanı         |
| `vocMotor`     | Meslek lisesi motor alanı           |
| `elektrikCirak`| Çıraklık — elektrik                 |
| `mobilyaCirak` | Çıraklık — mobilya                  |
| `otoCirak`     | Çıraklık — oto tamir                |
| `elBecerisi`   | Baba ile tamirci ziyareti (mobile)  |
| `techMerak`    | Baba ile bilgisayar fuarı (mobile)  |

### Askerî
| Etiket         | Açıklama                            |
|----------------|-------------------------------------|
| `mil_enlisted` | Er / kısa dönem                     |
| `mil_nco`      | Uzman çavuş                         |
| `mil_officer`  | Subay (zekâ ≥ 65 gerekli)           |
| `mil_commando` | Komando (sağlık ≥ 65 gerekli)       |
| `mil_special`  | Özel birlik (2024 seçimi)           |

### Akademi / Kariyer
| Etiket            | Nereden                          |
|-------------------|----------------------------------|
| `englishB2`       | Dil kursu veya yurt dışı kabul   |
| `athlete`         | 2026 spor disiplini seçimi       |
| `olympian`        | Uluslararası turnuva (sağlık ≥ 85) |
| `multiDisciplinary` | Alan değiştirme (mobile)       |

---

## Sayısal Alanlar — `state.data` üst düzeyi

| Alan          | Tür    | Açıklama                              |
|---------------|--------|---------------------------------------|
| `travelCount` | number | Seyahat edilen ülke/bölge sayısı      |
| `training`    | number | Spor antrenman puanı (seçme eşiği: 3) |

> Mobile versiyonda bu alanlar `state.data.numbers` altında bulunur.

---

## Effects — Efekt Türleri

Bir seçeneğin `effects: Effect[]` dizisi sahne geçişinden **önce** uygulanır.

```ts
type Effect =
  | { statDelta: Partial<Record<StatKey, number>> }   // stat değiştir (0-100 clamp, para hariç)
  | { setFlag: Record<string, string | boolean | number> } // bayrak ata
  | { addTrait: string }                              // özellik ekle (tekrar eklenmez)
  | { removeTrait: string }                           // özellik kaldır
  | { numberDelta: Record<string, number> }           // sayısal alan artır/azalt
  | { addItem: string }                               // envantere ekle
  | { removeItem: string }                            // envanterden çıkar
  | { equip: { slot: string; item: string } }         // kıyafet sloту
```

---

## Conditions — Görünürlük Koşulları

Bir seçeneğin `conditions?: Condition[]` dizisindeki **tümü** sağlanmazsa buton gizlenir.

```ts
type Condition =
  | { statGte: { key: StatKey; value: number } }      // stat >= value
  | { statLte: { key: StatKey; value: number } }      // stat <= value
  | { numberGte: { key: string; value: number } }     // sayısal alan >= value
  | { numberLte: { key: string; value: number } }     // sayısal alan <= value
  | { flagEquals: { key: string; value: any } }       // flag === value
  | { traitIncludes: string }                         // traits dizisinde var mı
  | { hasItem: string }                               // inventory'de var mı
```

---

## GOALS — Hedef Değerlendirme Formülleri

| ID              | Başarı Koşulu                                                    |
|-----------------|------------------------------------------------------------------|
| `basariyaUlas`  | `intelligence + confidence + money/50 >= 180`                   |
| `huzurluOlum`   | `(happiness*1.2 + health + social*0.6) / 2 >= 100`              |
| `muhendisOl`    | `intelligence + (stem+zekâ≥65 ? 30 : 0) + confidence/2 >= 120` |
| `mimarOl`       | `intelligence + happiness/2 + (design+zekâ≥60 ? 30 : 0) >= 110`|
| `dunyayiGez`    | `travelCount*10 + happiness/2 + money/100 >= 120`               |
| `olimpikSporcu` | `olympian` trait var, ya da `health*1.2 + ... >= 160`           |
| `girisimci`     | `startupFunded` flag var, ya da formül >= 160                   |
| `akademisyen`   | `academiaTrack` flag + `intelligence >= 70` veya `abroadAccepted`|
| `yurtdisiKariyer`| `abroadAccepted` flag var, ya da formül >= 170                 |

---

## Sahne Kimlik Şeması

Sahne isimleri `y{yıl}_{konu}[_{alt}]` formatındadır.

```
goal_select              → Başlangıç: hedef seçimi
intro                    → 2000: doğum sahnesi
y2000_2006_caretaking    → 2000–2006: erken çocukluk
y2006_primary_start      → 2006: ilkokul başlangıcı
y2008_family_finance     → 2008: aile ekonomisi
y2010_hobby              → 2010: hobi seçimi
y2011_savings            → 2011: erken yatırım (koşullu)
y2012_exam               → 2012: sınav hazırlığı
y2013_reflect            → 2013: dinlenme (rahat yol koşullu)
y2015_high_school        → 2015: lise DAL SEÇİMİ (6 dal)
  ├─ y2016_projects      → Fen/Anadolu lisesi
  ├─ y2016_voc_start     → Meslek lisesi
  │    └─ y2017_voc_progress → y2019_voc_outcome → {y2021_voc_myo, y2021_voc_job, y2018_uni_exam}
  ├─ y2016_artist_portfolio → Güzel sanatlar
  │    └─ y2017_artist_stage → y2018_uni_exam
  ├─ y2015_apprenticeship_start → Çıraklık
  │    └─ y2016_apprenticeship_progress → y2018_apprenticeship_outcome
  │         └─ {y2019_trade_track, y2018_uni_exam}
  └─ y2018_military_choice → Askerî yol
       └─ y2018_mil_branch → y2019_mil_role → y2020_mil_training → y2020_mil_check
            └─ {y2021_mil_assignment → y2024_mil_career → y2025_mil_outcome}

Trade akışı (meslek/çıraklık/ticaret):
  y2019_trade_track → y2020_trade_growth → y2022_trade_outcome → y2024_trade_scale

Üniversite akışı:
  y2018_uni_exam → y2019_uni_start → y2019_uni_check → {y2020_pandemic, y2019_uni_prep}

Ortak akış (2020–2024):
  y2020_pandemic → y2021_remote_intern → y2022_economy → y2023_volunteer → y2024_career

2025 çıktı:
  y2025_outcome → {goal_select, y2026_growth}

2026–2030 dalları:
  y2026_growth → {y2027_sports, y2027_startup, y2027_academia, y2027_travel}
  her dal → y2030_outcome

Rastgele olaylar (%6 ihtimalle tetiklenir):
  rand_meet / rand_lottery / rand_inheritance → rand_resume → returnScene
```

---

## Storage Anahtarları

```
choice-game:theme    → "light" | "dark"
choice-game:state    → JSON.stringify(GameData)
choice-game:scene    → SceneId (string)
```

---

## RNG — Mulberry32

```js
createRng(seed: number): () => number
// Her çağrıda 0-1 arası deterministik sayı üretir.
// Tohum: Date.now() % 2147483647

randomClamped(rng, mean=50, spread=20, min=20, max=85): number
// 3 RNG değerinin ortalaması → yaklaşık normal dağılım
```

---

## Platform Farkları

| Konu                    | Web (`src/`)               | Mobile (`mobile/src/`)         |
|-------------------------|----------------------------|--------------------------------|
| Çerçeve                 | Vanilla JS + ES modules    | React Native + Expo            |
| Kaydetme                | `localStorage`             | Yok (memory-only)              |
| Sayısal alanlar         | `state.data.travelCount`   | `state.data.numbers.travelCount` |
| `next` callback desteği | Evet (sonradan eklendi)    | Evet                           |
| Hedef seçimi            | Oyuncu seçer (goal_select) | Rastgele (`Goals.pickRandom`)  |
| Rastgele olay olasılığı | %6                         | %10                            |
| Min-stat kontrolü       | Yok                        | `fail_random` sahnesi          |
| Arka plan görseli       | Yok                        | Yaşam dönemine göre `e1-e5`    |
