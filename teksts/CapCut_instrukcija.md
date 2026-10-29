# Kā pabeigt video CapCut programmā

Video fails: `output/Muzikas_attistiba_video.mp4` (1920×1080, 30 kadri/s, 9:45).
Tajā jau ir visi attēli, video fragmenti, teksti ekrānā un **klusa** fona mūzika.
Tev jāpievieno tikai **balss ieraksts** un **karaoke dziesma ar vārdiem**.

## 1. Balss ieraksts (voiceover)

1. CapCut → *New project* → importē `Muzikas_attistiba_video.mp4`.
2. Teksts ar laika kodiem ir failā `teksts/voiceover_teksts.md`. Katrs bloks sākas, kad ekrānā parādās
   attiecīgais kadrs (piem., **01:12–01:22**).
3. Ieraksti balsi:
   * tieši CapCut: *Audio → Record / Voiceover* (mikrofona ikona) un runā, skatoties video; vai
   * ieraksti atsevišķi (telefonā) un ievelc audio failu laika joslā.
4. Ja kāds teikums iznāk garāks par kadru, nekas — vari to nedaudz pabīdīt vai video vietā izmantot
   *Split* un *Freeze frame*, lai kadrs ilgāk paliktu ekrānā.
5. Fona mūzika jau ir klusa (ap −30 LUFS). Ja tomēr traucē: iezīmē video celiņu → *Volume* → piem. 60 %.
   Vari arī ieslēgt *Audio → Reduce noise* balss celiņam un *Normalize loudness* (*Loudness*).

## 2. Karaoke daļa (pēc „Bohemian Rhapsody” analīzes)

Video ir sagatavota karaoke daļa:

| Laiks | Kas ekrānā |
|---|---|
| 09:10–09:18 | ievads: **KARAOKE! · Queen — „Bohemian Rhapsody” · Piedalieties arī jūs — dziediet kopā ar mums!** |
| 09:17–09:39 | karaoke „skatuve” (~22 s) ar tukšu joslu dziesmas vārdiem, laika joslu un uzrakstu **„Piedalieties arī jūs — dziediet līdzi!”** |
| 09:38–09:45 | **„Paldies par uzmanību!”** |

(Precīzos laikus skaties `teksts/voiceover_teksts.md`.)

**Kāpēc dziesma un vārdi nav ielikti jau gatavi:** Queen ieraksts un dziesmas vārdi ir aizsargāti ar
autortiesībām, tāpēc es tos nevaru iekļaut gatavajā failā. CapCut tos var pievienot likumīgi un
pats sinhronizē vārdus ar dziesmu:

1. Novieto laika joslas kursoru karaoke skatuves sākumā.
2. *Audio → Music / Sounds* → meklē **„Bohemian Rhapsody” Queen** (ja CapCut bibliotēkā tavā valstī tās nav,
   izmanto savu likumīgi iegādātu ierakstu: *Import → Extract audio*).
3. Izvēlies ~20 sekunžu fragmentu. Ieteikums: **dziesmas pats sākums (0:00–0:20)** — lēns *a cappella* ievads,
   ko zina visi un var viegli dziedāt līdzi. Alternatīva — operas daļa (~3:03), kur skan tieši tie vārdi,
   ko analizējām (Scaramouche, Galileo, Figaro, Bismillah).
4. Apgriez audio, lai tas beidzas, kad beidzas karaoke skatuve; beigās pieliec *Fade out* ~1 s.
5. Iezīmē dziesmas audio → *Text → Auto lyrics* (valoda: English) → CapCut izveido vārdus, kas parādās
   sinhroni ar dziesmu.
6. Iezīmē izveidotos vārdus → *Animation* → izvēlies **Karaoke** efektu (vārdi iekrāsojas līdz ar dziedāšanu).
   Novieto tekstu rozā rāmī ekrāna vidū (fonts ~ 60–70 px, balts ar rozā izcēlumu).
7. Pārbaudi, ka vārdi atbilst dzirdētajam — automātiskais teksts dažkārt kļūdās; izlabo ar *Edit text*.

> Ja video publicēsiet internetā (YouTube, TikTok), platforma var izslēgt skaņu vai bloķēt video Queen
> ieraksta dēļ. Prezentācijai klasē tas nav aktuāli.

## 3. Eksports

*Export* → 1080p, 30 fps. Gatavs!
