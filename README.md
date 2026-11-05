# Mūzikas attīstība — prezentācijas video

Grupas darbs par mūzikas attīstību: **3 pieturpunkti** (1. etaps) un **20. gadsimta piemēra analīze** (2. etaps),
noslēgumā — karaoke un „Paldies par uzmanību!”.

| Fails | Kas tas ir |
|---|---|
| `output/Muzikas_attistiba_animacija.mp4` | **Jaunais** 5 min stickman animācijas video bez skaņas (Gvido no Areco, Bēthovens, Daft Punk, „Bohemian Rhapsody”) |
| `teksts/animacija_stastijums.md` | **Sakāmais teksts animācijai** ar laika kodiem |
| `reports/Gvido Bēthovens un Daft Punk.md` | Faktu pārbaude animācijas tēmām |
| `animacija/` | Animācijas avotkods (SVG + GSAP, renderē `node animacija/render.js video out.mp4`) |
| `output/Muzikas_attistiba_video.mp4` | Gatavais video (~9:45, 1080p, 30 kadri/s) ar klusu fona mūziku — imports CapCut |
| `output/fona_muzika_atseviski.m4a` | Tā pati fona mūzika atsevišķi (ja gribi to regulēt CapCut atsevišķi) |
| `teksts/voiceover_teksts.md` | **Sakāmais teksts** katram kadram ar laika kodiem |
| `teksts/CapCut_instrukcija.md` | Kā pievienot balsi un karaoke dziesmu ar vārdiem CapCut |
| `reports/Mūzikas vēstures fakti.md` | Pārbaudīto faktu apkopojums ar avotiem + mīti, ko labāk neteikt |
| `research_notes/` | Detalizētas izpētes piezīmes katrai tēmai |
| `CREDITS.md` | Visu attēlu, video un ierakstu autori un licences |

## Video saturs

1. **Ievads** — tēma un ceļa karte.
2. **Antīkā Grieķija** — mūzikas pirmsākumi: lira, kitara, auloss; mūzika teātrī, reliģijā, Pītijas spēlēs,
   dzīrēs, skolā un karā; Pitagors; Delfu himnas un Seikila epitāfija; kāpēc izvēlējāmies.
3. **Klasicisms (~1750–1820)** — kas notika (formas, orķestris, fortepiano, operas reforma), Haidns, Mocarts,
   Bēthovens, Gluks; kur skanēja mūzika (galmi, operas nami, saloni, publiski koncerti); kāpēc izvēlējāmies;
   **5 populārākie skaņdarbi** pa ~14 s ar nosaukumu un komponistu.
4. **Skaņu ieraksts un digitalizācija** — fonautogrāfs (1860), fonogrāfs (1877), gramofons (1887), šellaka
   plates, lente, vinila LP, kasete/Walkman, CD (1982), MP3/iPod/iTunes, straumēšana; 2025. gada dati; kāpēc izvēlējāmies.
5. **2. etaps: Queen — „Bohemian Rhapsody” (1975)** — fakti, uzbūve (6 daļas), Merkūrija daudzkultūru izcelsme,
   simboli un kultūrvaroņi ar izcelsmi un kultūrpiederību (rapsodija, bohēma, Scaramouche, fandango, Galileo,
   Figaro, Bismillah, Belcebuls), naratīvs, nozīme.
6. **Karaoke** — ievads ar izpildītāju un nosaukumu, ~22 s skatuve ar aicinājumu „Piedalieties arī jūs — dziediet līdzi!”.
7. **„Paldies par uzmanību!”**

Fona mūzika katrā daļā atbilst laikmetam: sengrieķu lira (sintēze), Mocarts/Haidns/Bēthovens (publiskā īpašuma
ieraksti, daļa no tiem vēsturiski — 1910–1929), 1911. gada gramofona ieraksts un elektroniskā mūzika digitālajam
laikmetam, Rosīni „Seviļas bārddzinis” (Figaro!) „Bohemian Rhapsody” daļā.

## Kā video tika izveidots

Viss ir atkārtojams ar `tools/`:

```bash
python3 tools/fetch_media.py      # attēli/video no Wikimedia Commons (+ media/credits.json)
python3 tools/fetch_archive.py    # publiskā īpašuma ieraksti no Internet Archive
python3 tools/synth.py            # oriģinālā lira un elektroniskā mūzika
python3 tools/build.py video      # renderē video, mūzikas miksu, voiceover tekstu un CREDITS.md
```

`tools/timeline.py` satur visu ekrāna tekstu un voiceover tekstu — to mainot un palaižot `build.py` no jauna,
video un teksts vienmēr paliek saskaņoti.
