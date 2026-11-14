# Find Me Puzzle

Türkçe ve İngilizce kelime bulmaca oyunu. 5, 6, 7 veya 8 harfli gizli kelimeyi 5 ya da 6 denemede bulmaya çalışırsın. Harf doğru yerdeyse yeşil, kelimede var ama yanlış yerdeyse sarı, kelimede yoksa gri olur.

A Turkish and English word puzzle game. Guess the hidden 5 to 8 letter word in 5 or 6 tries.

- Varsayılan dil Türkçe, ayarlar yan panelden değişir (dil, kelime uzunluğu, deneme hakkı).
- Sözlükte olmayan kelimeler kabul edilmez, yani "abcde" gibi denemelerle harf avlanamaz.
- Her turda yeni bir kelime gelir. Aynı kelime, liste bitmeden tekrar gelmez.

## Veri kaynakları ve lisanslar

Sözlük dosyaları için bu kaynaklara atıf yapmak gerekir:

- Türkçe kelime listesi: [mertemin/turkish-word-list](https://github.com/mertemin/turkish-word-list), kaynağı [Vikisözlük](https://tr.wiktionary.org/) sözcük listesi (CC BY-SA). Reponun kendi lisans dosyası yok.
- Türkçe çekimli biçimler ve yaygınlık sıralaması: [wordfreq](https://github.com/rspeer/wordfreq) (kod Apache-2.0, veri CC BY-SA 4.0). Yaygınlık sıralaması iki dilde de cevapları seçmek için kullanılır.
- İngilizce kelime listesi: [sindresorhus/word-list](https://github.com/sindresorhus/word-list) (MIT).
- İngilizce cevaplardan isimleri çıkarmak için: [names](https://pypi.org/project/names/) paketi (ABD nüfus sayımı isim verileri).
