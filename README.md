# Seçim Tabanlı 2D Oyun (Minimal Web Altyapı)

Bu proje, seçenekler üzerinden ilerleyen metin odaklı bir 2D oyunun temel altyapısını içerir. Saf HTML/CSS/JS kullanır, derleme gerektirmez.

## Çalıştırma

Statik bir sunucu ile açın (modül importları için gereklidir):

- Node.js ile: `npx serve -l 5173` ve sonra `http://localhost:5173`
- Python 3 ile: `python -m http.server 5173` ve sonra `http://localhost:5173`
- VS Code Live Server eklentisi

Not: `index.html` dosyasını tarayıcıda doğrudan (file://) açmak, ES module importları nedeniyle çalışmayabilir.

## Proje Yapısı

```
index.html
src/
  main.js
  styles/
    theme.css
  game/
    SceneManager.js
    State.js
    Storage.js
  scenes/
    index.js
```

## Özellikler

- Sahne kayıt defteri ve `SceneManager` ile geçişler
- `GameState` ile ziyaret sayıları ve bayrak (flag) yönetimi
- `localStorage` ile otomatik kaydetme/yükleme
- Koyu/Açık tema desteği ve tema anahtarı

## Geliştirme İpuçları

- Yeni sahne eklemek için `src/scenes/index.js` içindeki `getScenes()` sözlüğüne yeni bir anahtar ekleyin.
- Seçeneklere yan-etki eklemek için, seçime `action: (state) => { ... }` fonksiyonu tanımlayın.
- Oyunu sıfırlamak için üst çubuktaki "Yeni Oyun" butonunu kullanın.

## Lisans

MIT
