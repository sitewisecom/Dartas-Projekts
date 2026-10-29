"""Content of the video: every clip with its on-screen text and the matching voice-over text,
plus the background-music cues. Durations follow the voice-over length (see vlib.vo_duration)."""
from vlib import (DiscAnim, ImageSlide, InfoCard, KaraokeIntro, KaraokeStage, StructureCard,
                  ThanksCard, TitleCard, VideoSlide, WorkCard)

G, C, D, Q = "greece", "classic", "digital", "queen"


def build(envs):
    S = {}  # named clips, used for music cues and the script document

    def add(name, clip, section):
        clip.section = section
        S[name] = clip
        return clip

    clips = [
        # ------------------------------------------------------------ ievads
        add("intro", TitleCard("intro", "", "Mūzikas attīstība", "Trīs pieturpunkti un viens 20. gadsimta piemērs",
            vo="Sveiki! Mūsu tēma ir mūzika un tās attīstība.", dur=6.0), "Ievads"),
        add("agenda", InfoCard("intro", "Mūsu ceļš", [
            "Antīkā Grieķija — mūzikas pirmsākumi",
            "Klasicisms (ap 1750–1820)",
            "Skaņu ieraksts un digitalizācija",
            "Queen — „Bohemian Rhapsody” (1975)",
        ], vo="Mēs izvēlējāmies trīs, mūsuprāt, nozīmīgākos pieturpunktus: Antīko Grieķiju, klasicismu un "
              "digitalizāciju. Beigās analizēsim Queen dziesmu „Bohemian Rhapsody”."), "Ievads"),

        # ------------------------------------------------------------ 1. Antīkā Grieķija
        add("g_title", TitleCard(G, "01", "Antīkā Grieķija", "Mūzikas pirmsākumi Eiropā · ~8. gs. p. m. ē. – 2. gs. m. ē.",
            vo="Pirmais pieturpunkts — Antīkā Grieķija."), "1. Antīkā Grieķija"),
        add("g_muses", ImageSlide("g_muses", "Mousikē — mūzu māksla",
            "No grieķu vārda mousikē cēlies vārds „mūzika”. Grieķiem tā nozīmēja dziesmu, dzeju un deju kopā.", G,
            vo="Mūzika ir senāka par grieķiem, taču tieši Senā Grieķija ir Eiropas mūzikas vēstures sākums. Pat vārds "
               "„mūzika” cēlies no grieķu „mousikē” — mūzu māksla.",
            c0=(0.3, 0.5), c1=(0.7, 0.5), zoom=(1.05, 1.15)), "1. Antīkā Grieķija"),
        add("g_lyre", ImageSlide("g_lyre_pan", "Lira",
            "Korpuss no bruņurupuča bruņām, parasti 7 stīgas · dieva Apollona instruments · to mācījās skolā", G,
            vo="Populārākais instruments bija lira. Tās korpusu darināja no bruņurupuča bruņām. Lira bija dieva Apollona "
               "instruments, un to mācījās spēlēt skolā."), "1. Antīkā Grieķija"),
        add("g_kithara", ImageSlide("g_apollo_kithara", "Kitara",
            "Lielāka un skaļāka lira ar koka korpusu — profesionālu mūziķu instruments sacensībās un svētkos", G,
            vo="Kitara bija lielāka un skaļāka liras māsa ar koka korpusu. To spēlēja profesionāli mūziķi."), "1. Antīkā Grieķija"),
        add("g_aulos", ImageSlide("g_aulos_munich", "Auloss",
            "Dubultā pūšamā stabule ar niedres mēlīti — nevis flauta! Skanējums līdzīgs obojai · dieva Dionīsa instruments", G,
            vo="Otrs svarīgākais instruments bija auloss — dubultā stabule ar niedres mēlīti, kas skanēja līdzīgi obojai. "
               "Tas bija vīna un teātra dieva Dionīsa instruments.",
            c0=(0.45, 0.5), c1=(0.55, 0.45)), "1. Antīkā Grieķija"),
        add("g_theatre", VideoSlide("v_epidaurus", 6.0, "Mūzika teātrī",
            "Traģēdija radās no dityramba — kora dziesmas Dionīsam. Koris dziedāja un dejoja aulosa pavadījumā. · Epidauras teātris",
            G, vo="Kur izmantoja mūziku? Teātrī. Grieķu traģēdija radās no dityramba — kora dziesmas Dionīsam, un koris "
                  "izrādēs dziedāja un dejoja aulosa pavadījumā."), "1. Antīkā Grieķija"),
        add("g_delphi", ImageSlide("g_delphi", "Reliģija un sacensības",
            "Delfos notika Pītijas spēles — mūzikas sacensības par godu Apollonam (no 586. g. p. m. ē. arī aulosa sacensības)", G,
            vo="Mūzika bija reliģisko rituālu un svētku daļa. Delfos notika Pītijas spēles, kas sākās tieši kā mūzikas "
               "sacensības par godu Apollonam.", zoom=(1.0, 1.12), c0=(0.5, 0.6), c1=(0.5, 0.45)), "1. Antīkā Grieķija"),
        add("g_symposium", ImageSlide("g_symposium", "Dzīres, skola un karš",
            "Simpozijos dziedāja dziesmas · mūzika bija izglītības pamatā · spartieši gāja kaujā aulosa pavadījumā (418. g. p. m. ē.)", G,
            vo="Mūzika skanēja dzīrēs jeb simpozijos, kāzās un bērēs. Tā bija izglītības pamatā, un spartieši pat devās "
               "kaujā aulosa skaņās, lai noturētu soli.", c0=(0.35, 0.5), c1=(0.6, 0.5)), "1. Antīkā Grieķija"),
        add("g_pythagoras", ImageSlide("g_pythagoras", "Pitagors un skaitļi",
            "Oktāva 2 : 1 · kvinta 3 : 2 · kvarta 4 : 3 — saskaņas atbilst skaitļu attiecībām. Eiropas mūzikas teorijas sākums.", G,
            vo="Grieķi mūziku arī pētīja. Pitagora sekotāji atklāja, ka saskaņas atbilst skaitļu attiecībām: oktāva ir "
               "divi pret viens, kvinta — trīs pret divi."), "1. Antīkā Grieķija"),
        add("g_delphic", ImageSlide("g_delphic_hymn", "Notis akmenī",
            "Delfu himnas Apollonam, 128. g. p. m. ē. — virs teksta iekaltas nošu zīmes (burti)", G,
            vo="Grieķi izgudroja arī nošu pierakstu ar burtu zīmēm. Delfu himnas Apollonam iekaltas akmenī 128. gadā "
               "pirms mūsu ēras.", zoom=(1.0, 1.18), c0=(0.4, 0.5), c1=(0.6, 0.5)), "1. Antīkā Grieķija"),
        add("g_seikilos", ImageSlide("g_seikilos", "Seikila epitāfija",
            "1.–2. gs. m. ē. · vecākais pilnībā saglabātais pierakstītais skaņdarbs · glabājas Dānijas Nacionālajā muzejā", G,
            vo="Bet Seikila epitāfija — kapa piemineklis ar dziesmu — ir vecākais pilnībā saglabātais pierakstītais "
               "skaņdarbs, ko var nodziedāt vēl šodien.", zoom=(1.0, 1.14), c0=(0.5, 0.5), c1=(0.5, 0.4)),
            "1. Antīkā Grieķija"),
        add("g_why", InfoCard(G, "Kāpēc izvēlējāmies Antīko Grieķiju?", [
            "Deva vārdu „mūzika” (mousikē)",
            "Pirmā mūzikas teorija (Pitagors)",
            "Pirmais nošu pieraksts un vecākās dziesmas",
            "Mūzika teātrī, reliģijā, skolā un sportā",
        ], vo="Kāpēc izvēlējāmies Antīko Grieķiju? Grieķi Eiropai deva vārdu „mūzika”, pirmo mūzikas teoriju, nošu "
              "pierakstu un vecākās dziesmas, ko varam atskaņot vēl šodien.",
            bg_key="g_seikilos_score"), "1. Antīkā Grieķija"),

        # ------------------------------------------------------------ 2. Klasicisms
        add("c_title", TitleCard(C, "02", "Klasicisms", "Aptuveni 1750–1820 · Vīne · Apgaismības laikmets",
            vo="Otrais pieturpunkts — klasicisms, aptuveni no 1750. līdz 1820. gadam."), "2. Klasicisms"),
        add("c_vienna", ImageSlide("c_vienna", "Skaidrība un līdzsvars",
            "Pēc sarežģītā baroka mūzika kļūst vienkāršāka, skaidrāka, ar dziedošu melodiju · centrs — Vīne", C,
            vo="Tas ir Apgaismības laikmets. Pēc sarežģītā baroka mūzika kļuva skaidrāka un līdzsvarotāka, ar viegli "
               "uztveramu melodiju. Galvenais mūzikas centrs bija Vīne.", zoom=(1.02, 1.14), c0=(0.35, 0.5), c1=(0.6, 0.5)),
            "2. Klasicisms"),
        add("c_what", InfoCard(C, "Kas svarīgs notika?", [
            "Sonātes forma",
            "Simfonija",
            "Stīgu kvartets",
            "Klasiskais koncerts solistam ar orķestri",
            "Stabils orķestra sastāvs",
            "Operas reforma (Gluks, 1762)",
        ], vo="Kas svarīgs notika? Izveidojās formas, kas pastāv vēl šodien: sonātes forma, simfonija, stīgu kvartets "
              "un koncerts. Nostabilizējās orķestris, un Kristofs Vilibalds Gluks reformēja operu.", bg_key="c_esterhaza_hall"),
            "2. Klasicisms"),
        add("c_quartet", VideoSlide("v_quartet", 5.0, "Stīgu kvartets",
            "Divas vijoles, alts un čells · J. Haidns — „stīgu kvarteta tēvs” · fonā: Haidna kvartets op. 54 Nr. 2", C,
            vo="Stīgu kvartets — divas vijoles, alts un čells — kļuva par iecienītāko kamermūzikas žanru. Tagad skan "
               "Haidna kvartets."), "2. Klasicisms"),
        add("c_piano", ImageSlide("c_fortepiano", "Fortepiano",
            "Klavieres aizstāj klavesīnu: var spēlēt gan klusi (piano), gan skaļi (forte) — no tā arī nosaukums", C,
            vo="Klavesīnu nomainīja fortepiano — instruments, uz kura var spēlēt gan klusi, gan skaļi. No tā cēlies "
               "arī nosaukums."), "2. Klasicisms"),
        add("c_haydn", ImageSlide("c_haydn", "Jozefs Haidns (1732–1809)",
            "106 simfonijas · 68 stīgu kvarteti · gandrīz 30 gadus kalpoja Esterhāzi kņazu galmā", C,
            vo="Laikmeta lielākie komponisti ir Vīnes klasiķi. Jozefs Haidns uzrakstīja simt sešas simfonijas un "
               "sešdesmit astoņus stīgu kvartetus."), "2. Klasicisms"),
        add("c_mozart", ImageSlide("c_mozart", "Volfgangs Amadejs Mocarts (1756–1791)",
            "Brīnumbērns · simfonijas, koncerti, operas „Figaro kāzas”, „Dons Žuans”, „Burvju flauta”", C,
            vo="Volfgangs Amadejs Mocarts bija brīnumbērns, kas jau bērnībā koncertēja pa Eiropu. Viņš rakstīja visos "
               "žanros, īpaši slavenas ir viņa operas."), "2. Klasicisms"),
        add("c_beethoven", ImageSlide("c_beethoven", "Ludvigs van Bēthovens (1770–1827)",
            "Klasicisma virsotne un tilts uz romantismu · 9 simfonijas", C,
            vo="Ludvigs van Bēthovens sāka kā klasiķis, bet kļuva par tiltu uz romantismu. Viņa deviņas simfonijas "
               "mainīja priekšstatu par to, ko spēj mūzika."), "2. Klasicisms"),
        add("c_court", ImageSlide("c_esterhaza", "Kur skanēja mūzika? Galmos",
            "Esterhāzi pils, Ungārija — Haidns kalpoja Esterhāzi dzimtai no 1761. gada", C,
            vo="Kur izmantoja mūziku? Vispirms aristokrātu galmos — Haidns gandrīz trīsdesmit gadus vadīja Esterhāzi "
               "kņazu orķestri.", zoom=(1.0, 1.1), c0=(0.4, 0.5), c1=(0.6, 0.5)), "2. Klasicisms"),
        add("c_opera", ImageSlide("c_estates", "Operas nami",
            "Stāvu teātris Prāgā — šeit 1787. gadā notika Mocarta „Dona Žuana” pirmizrāde", C,
            vo="Operas namos — Mocarta „Dona Žuana” pirmizrāde 1787. gadā notika tieši šajā Prāgas teātrī, kas "
               "darbojas vēl šodien.", c0=(0.45, 0.55), c1=(0.55, 0.5)), "2. Klasicisms"),
        add("c_public", ImageSlide("c_salon", "Saloni, baznīcas un publiski koncerti",
            "Koncerti par biļetēm (Parīze, Londona) · nošu izdevniecības · komponists kā brīvmākslinieks (Mocarts no 1781)", C,
            vo="Mūzika skanēja arī baznīcās, salonos un mājās. Un pats svarīgākais — radās publiski koncerti, uz kuriem "
               "varēja nopirkt biļeti. Komponisti pamazām kļuva par brīvmāksliniekiem.", c0=(0.4, 0.5), c1=(0.55, 0.5)),
            "2. Klasicisms"),
        add("c_why", InfoCard(C, "Kāpēc izvēlējāmies klasicismu?", [
            "Forma: simfonija, sonāte, kvartets",
            "Skanējums: orķestris un klavieres",
            "Sabiedrība: mūzika plašai publikai",
        ], vo="Kāpēc izvēlējāmies klasicismu? Šajā laikā radās formas, orķestris un koncertu kultūra, kas pastāv vēl "
              "šodien. Mūzika no galma pārcēlās pie plašas publikas.", bg_key="c_vienna"), "2. Klasicisms"),
        add("c_works", TitleCard(C, "", "Populārākie skaņdarbi", "Pieci fragmenti no klasicisma laikmeta",
            vo="Un tagad — pieci populārākie šī laikmeta skaņdarbi.", dur=5.0), "2. Klasicisms"),
        add("w1", WorkCard(1, 5, "c_mozart_family", "Eine kleine Nachtmusik", "„Mazā naktsmūzika”, serenāde Sol mažorā, K. 525 · 1. daļa",
            "Volfgangs Amadejs Mocarts", "1787", envs["a_nachtmusik"], dur=14.0, vo="Mocarts, „Mazā naktsmūzika”."), "2. Klasicisms"),
        add("w2", WorkCard(2, 5, "c_mozart", "Simfonija Nr. 40", "sol minorā, K. 550 · 1. daļa (Molto allegro)",
            "Volfgangs Amadejs Mocarts", "1788", envs["a_sym40"], dur=14.0, vo="Mocarta Četrdesmitā simfonija."), "2. Klasicisms"),
        add("w3", WorkCard(3, 5, "c_haydn", "Simfonija Nr. 94 „Pārsteigums”", "Sol mažorā, Hob. I:94 · 2. daļa (Andante)",
            "Jozefs Haidns", "1791", envs["a_surprise"], dur=15.0, vo="Haidna simfonija „Pārsteigums” — klausieties!",
            hint="Klausieties — pēkšņs skaļš akords!"), "2. Klasicisms"),
        add("w4", WorkCard(4, 5, "c_beethoven", "Simfonija Nr. 5", "do minorā, op. 67 · 1. daļa (Allegro con brio)",
            "Ludvigs van Bēthovens", "1804–1808", envs["a_beet5"], dur=14.0, vo="Bēthovena Piektā simfonija."), "2. Klasicisms"),
        add("w5", WorkCard(5, 5, "c_mozart_family", "„Alla turca”", "Rondo turku stilā no Klaviersonātes Nr. 11, K. 331",
            "Volfgangs Amadejs Mocarts", "ap 1783", envs["a_turca"], dur=14.0, vo="Un Mocarta „Turku maršs”."), "2. Klasicisms"),

        # ------------------------------------------------------------ 3. Digitalizācija
        add("d_title", TitleCard(D, "03", "Skaņu ieraksts un digitalizācija", "No pirmās pierakstītās skaņas līdz straumēšanai · 1860 → šodien",
            vo="Trešais pieturpunkts — skaņu ieraksts un digitalizācija."), "3. Digitalizācija"),
        add("d_1860", ImageSlide("d_phonautograph", "1860 · Fonautogrāfs",
            "Skots de Martenvils skaņu pirmo reizi pieraksta uz papīra — atskaņot to izdevās tikai 2008. gadā", D,
            vo="Ilgu laiku mūziku varēja dzirdēt tikai dzīvajā. 1860. gadā francūzis Skots de Martenvils skaņu pirmo "
               "reizi pierakstīja, bet atskaņot to izdevās tikai 2008. gadā."),
            "3. Digitalizācija"),
        add("d_1877", ImageSlide("d_edison", "1877 · Edisona fonogrāfs",
            "Pirmā ierīce, kas skaņu gan ieraksta, gan atskaņo", D,
            vo="1877. gadā Tomass Edisons radīja fonogrāfu — pirmo ierīci, kas skaņu gan ierakstīja, gan atskaņoja."),
            "3. Digitalizācija"),
        add("d_1887", ImageSlide("d_berliner", "1887 · Gramofons un skaņuplate",
            "Emīls Berliners: plakano plati var pavairot tūkstošos eksemplāru — sākas ierakstu industrija", D,
            vo="1887. gadā Emīls Berliners patentēja gramofonu ar plakanu plati, ko varēja pavairot tūkstošiem "
               "eksemplāru. Tā sākās ierakstu industrija.", c0=(0.45, 0.5), c1=(0.55, 0.45)), "3. Digitalizācija"),
        add("d_78", ImageSlide("d_victrola", "Šellaka plates · 78 apgr./min.",
            "Mūzika ienāk katrās mājās · fonā: īsts 1911. gada ieraksts", D,
            vo="Pirmās plates bija no šellaka un griezās ar 78 apgriezieniem minūtē. Fonā skan īsts 1911. gada ieraksts."),
            "3. Digitalizācija"),
        add("d_tape", ImageSlide("d_magnetophon", "1935 · Magnētiskā lente",
            "Ierakstu var griezt, montēt un ierakstīt pa celiņiem — dzimst ierakstu studija", D,
            vo="1935. gadā Vācijā parādījās magnētiskā lente. Ierakstu varēja montēt un ierakstīt pa daļām — tā dzima "
               "mūsdienu ierakstu studija."), "3. Digitalizācija"),
        add("d_lp", DiscAnim("1948 · Vinila LP plate",
            "33⅓ apgr./min. · ap 20 minūtēm katrā pusē — sākas albumu laikmets", D, kind="vinyl", dur=8.1,
            vo="1948. gadā nāca vinila skaņuplate jeb LP ar 33 un trešdaļu apgriezieniem minūtē. Tajā ietilpa vesels albums."),
            "3. Digitalizācija"),
        add("d_walkman", ImageSlide("d_walkman", "1963–1979 · Kasete un Walkman",
            "Kompaktkasete (Philips, 1963) · Sony Walkman (1979) — mūzika kļūst pārnēsājama", D,
            vo="1963. gadā parādījās kompaktkasete, bet 1979. gadā Sony Walkman ļāva mūziku ņemt līdzi uz ielas."),
            "3. Digitalizācija"),
        add("d_cd", ImageSlide("d_cd_shop", "1982 · Kompaktdisks (CD)",
            "Pirmais digitālais masu formāts — skaņa pārvēršas skaitļos (0 un 1)", D,
            vo="Lielais pagrieziens notika 1982. gadā, kad veikalos nonāca kompaktdisks. Skaņa vairs nebija rieva platē, "
               "bet skaitļi — nulles un vieninieki, kas nenodilst."), "3. Digitalizācija"),
        add("d_mp3", ImageSlide("d_cassette_ipod", "1995–2003 · MP3, Napster, iPod, iTunes",
            "MP3 saspiež mūziku ap 10 reizēm · 1999 Napster · 2001 iPod · 2003 iTunes veikals", D,
            vo="Deviņdesmitajos gados Vācijā radīja MP3 formātu, kas mūziku saspieda tik ļoti, ka to varēja sūtīt "
               "internetā. Sekoja Napster, iPod ar tūkstoš dziesmām kabatā un iTunes veikals."), "3. Digitalizācija"),
        add("d_stream", ImageSlide("d_spotify", "2008 · Straumēšana",
            "Spotify (Zviedrija) — jebkura dziesma jebkurā brīdī · 2026. g.: ~788 milj. lietotāju mēnesī", D,
            vo="2008. gadā sāka darboties Spotify. Tagad mēs mūziku vairs nepērkam — mēs to straumējam."), "3. Digitalizācija"),
        add("d_stats", InfoCard(D, "Mūzikas industrija šodien", [
            ("31,7 mljrd. $", "ierakstu industrijas ieņēmumi 2025. gadā"),
            ("69,6 %", "no tiem — straumēšana"),
            ("837 milj.", "maksas abonementu pasaulē"),
        ], style="stats", note="Avots: IFPI Global Music Report 2026. Vinila pārdošana aug jau 19. gadu pēc kārtas.",
            vo="2025. gadā ierakstu industrija nopelnīja 31,7 miljardus dolāru, gandrīz 70 procentus — no straumēšanas. "
               "Un vinila plates atkal kļūst populāras."),
            "3. Digitalizācija"),
        add("d_why", InfoCard(D, "Kāpēc izvēlējāmies šo pieturpunktu?", [
            "Mūzika kļūst par priekšmetu, pēc tam — par datiem",
            "Pieejama ikvienam, jebkurā vietā",
            "Mūziku var radīt arī mājās ar datoru",
        ], vo="Kāpēc izvēlējāmies šo pieturpunktu? Ieraksts mūziku pārvērta priekšmetā, bet digitalizācija — datos. "
              "Mūzika kļuva pieejama ikvienam, jebkurā vietā, un to var radīt pat mājās ar datoru.", bg_key="d_studio"),
            "3. Digitalizācija"),

        # ------------------------------------------------------------ 4. Bohemian Rhapsody (2. etaps)
        add("q_title", TitleCard(Q, "", "„Bohemian Rhapsody”", "2. etaps · 20. gadsimta piemērs · Queen, 1975",
            vo="Otrajā etapā no mūsu piedāvātajiem piemēriem kopīgi izvēlējāmies Queen dziesmu „Bohemian Rhapsody”."), "4. Bohemian Rhapsody"),
        add("q_band", ImageSlide("b_queen_1975", "Queen, 1975",
            "Fredijs Merkūrijs, Braiens Mejs, Rodžers Teilors, Džons Dīkons · singls iznāca 1975. gada 31. oktobrī", Q,
            vo="Dziesmu uzrakstīja Fredijs Merkūrijs, un tā iznāca 1975. gada 31. oktobrī, albumā „A Night at the Opera”.",
            c0=(0.5, 0.45), c1=(0.5, 0.5)), "4. Bohemian Rhapsody"),
        add("q_record", ImageSlide("b_tracksheet", "Ieraksts",
            "5 studijas (sākums — Rockfield, Velsa) · ap 180 balss pārklājumu · 24 celiņu analogā lente", Q,
            vo="Ieraksts tapa piecās studijās. Balsis ierakstīja vienu virs otras ap 180 reizēm, tāpēc šķiet, ka dzied "
               "vesels koris.", c0=(0.3, 0.4), c1=(0.6, 0.55), zoom=(1.0, 1.2)), "4. Bohemian Rhapsody"),
        add("q_structure", StructureCard(Q,
            vo="Dziesma ilgst gandrīz sešas minūtes — divreiz ilgāk par tā laika singlu. Tajā ir sešas daļas: ievads, "
               "balāde, ģitāras solo, opera, hārdroks un noslēgums, bet nav piedziedājuma."), "4. Bohemian Rhapsody"),
        add("q_freddie", ImageSlide("b_freddie_1977", "Fredijs Merkūrijs (1946–1991)",
            "Dzimis kā Farohs Bulsara Zanzibārā, pārsu ģimenē · mācījies Indijā · 1964. g. pārcēlās uz Angliju", Q,
            vo="Merkūrijs dzimis Zanzibārā kā Farohs Bulsara, pārsu ģimenē, mācījies Indijā un 1964. gadā pārcēlies "
               "uz Angliju. Šis daudzu kultūru fons jūtams arī dziesmas simbolos."), "4. Bohemian Rhapsody"),
        add("q_rhapsody", ImageSlide("b_liszt", "Simbols: „Rhapsody” — rapsodija",
            "Izcelsme: grieķu rhapsōidos — eposu dziedonis · mūzikā brīvas formas viendaļas darbs (F. Lista „Ungāru rapsodijas”) · Eiropas klasiskā mūzika", Q,
            vo="Jau nosaukums ir zīme. Rapsodija ir brīvas formas skaņdarbs, kā Lista „Ungāru rapsodijas”, un vārds "
               "cēlies no grieķu „rhapsōidos” — eposu dziedonis."),
            "4. Bohemian Rhapsody"),
        add("q_bohemian", ImageSlide("b_boheme", "Simbols: „Bohemian” — bohēma",
            "No franču bohémien (Bohēmija) → brīvs, netradicionāls mākslinieka dzīvesveids · Pučīni opera „Bohēma” (1896) · Francija", Q,
            vo="Vārds „bohemian” cēlies no franču valodas un nozīmē brīvu, netradicionālu mākslinieka dzīvi, ko slavināja "
               "arī Pučīni opera „Bohēma”."), "4. Bohemian Rhapsody"),
        add("q_scaramouche", ImageSlide("b_scaramouche", "Kultūrvaronis: Scaramouche",
            "Skaramušs — itāļu masku komēdijas (commedia dell'arte) tēls, lielīgs gļēvulis · Itālija un Francija, 16.–17. gs.", Q,
            vo="Operas daļā parādās vesela kultūrvaroņu galerija. Skaramušs ir itāļu masku komēdijas klauns — lielīgs gļēvulis."),
            "4. Bohemian Rhapsody"),
        add("q_fandango", ImageSlide("b_fandango", "Zīme: fandango",
            "Spāņu un portugāļu pāru deja ar ģitāru un kastanetēm (18. gs.) · pārnestā nozīmē — „liela jezga”", Q,
            vo="Fandango ir dzīvespriecīga spāņu deja, bet pārnestā nozīmē — liela jezga.", c0=(0.4, 0.5), c1=(0.55, 0.5)),
            "4. Bohemian Rhapsody"),
        add("q_galileo", ImageSlide("b_galileo", "Kultūrvaronis: Galileo",
            "Galileo Galilejs (1564–1642), itāļu astronoms — zinātnes simbols · ģitārists Braiens Mejs ir astrofizikas doktors", Q,
            vo="Galileo ir itāļu astronoms Galileo Galilejs — zinātnes simbols. Interesanti, ka ģitārists Braiens Mejs ir "
               "astrofizikas doktors."), "4. Bohemian Rhapsody"),
        add("q_figaro", ImageSlide("c_mozart", "Kultūrvaronis: Figaro",
            "Bārddzinis no Bomaršē lugām → Rosīni „Seviļas bārddzinis” (1816) un Mocarta „Figaro kāzas” (1786) · Francija, Itālija", Q,
            vo="Figaro ir bārddzinis no Bomaršē lugām, kas kļuva par Rosīni un Mocarta operu varoni — tas ir tilts uz "
               "klasicismu. Fonā skan Rosīni „Seviļas bārddzinis”."), "4. Bohemian Rhapsody"),
        add("q_bismillah", ImageSlide("b_bismillah", "Zīme: Bismillah",
            "Arābu: „Dieva vārdā” — ar šiem vārdiem sākas Korāna sūras · islāma kultūra", Q,
            vo="Bismillah arābu valodā nozīmē „Dieva vārdā” — ar šiem vārdiem sākas Korāna nodaļas.", c0=(0.4, 0.5), c1=(0.6, 0.5)),
            "4. Bohemian Rhapsody"),
        add("q_beelzebub", ImageSlide("b_beelzebub", "Zīme: Beelzebub — Belcebuls",
            "Ebreju Ba'al zevuv — „mušu kungs”, filistiešu dievs (Bībele, 2. Ķēniņu grāmata) → kristietībā — ļauno garu valdnieks", Q,
            vo="Tam pretī stāv Belcebuls — ebreju valodā „mušu kungs”, Bībelē filistiešu dievs, vēlāk — velns. Dziesmā "
               "labais un ļaunais cīnās par vienu dvēseli."), "4. Bohemian Rhapsody"),
        add("q_story", InfoCard(Q, "Naratīvs: mini opera", [
            "Jauns vīrietis atzīstas mātei noziegumā",
            "Tiesa: kori cīnās par viņa dvēseli",
            "Dumpis un izmisums",
            "„Nekam nav nozīmes”",
        ], note="Merkūrijs dziesmas vārdus nekad neizskaidroja — katrs tos var saprast pa savam.",
            vo="Stāsts ir kā mini opera: jauns vīrietis atzīstas mātei noziegumā, nonāk tiesā, kur kori cīnās par viņa "
               "dvēseli, un beigās saka, ka nekam nav nozīmes. Merkūrijs vārdus nekad neizskaidroja.", bg_key="b_queen_1977"), "4. Bohemian Rhapsody"),
        add("q_why", InfoCard(Q, "Kāpēc tā ir nozīmīga?", [
            ("9 nedēļas", "Lielbritānijas topa 1. vietā (1975–76) + vēl 5 nedēļas 1991. g."),
            ("1 mljrd.", "skatījumu YouTube (2019) — klips padarīja videoklipus par standartu"),
            ("Nr. 1", "Ginesa rekords: 20. gs. visvairāk straumētā dziesma"),
        ], style="stats",
            vo="Kāpēc tā ir nozīmīga? Deviņas nedēļas topa pirmajā vietā, videoklips, kas kļuva par paraugu, un 20. gadsimta "
               "visvairāk straumētā dziesma. Tajā satiekas visi mūsu pieturpunkti: grieķu rapsodija, opera un ierakstu tehnoloģijas."), "4. Bohemian Rhapsody"),
        add("k_intro", KaraokeIntro(vo="Un tagad — karaoke! Piedalieties arī jūs un dziediet kopā ar mums!", dur=7.0),
            "5. Karaoke"),
        add("k_stage", KaraokeStage(dur=22.0), "5. Karaoke"),
        add("thanks", ThanksCard(dur=7.0), "6. Noslēgums"),
    ]
    return clips, S


def music_cues(S):
    """(audio key, first clip, last clip, source offset s, level LUFS, fade in, fade out, on-screen credit)."""
    return [
        ("syn_lyre", "intro", "g_why", 0.0, -30, 2.0, 3.0,
         "♪ Lira sengrieķu doriskajā ladā — oriģināla sintēze šim video"),
        ("a_romance", "c_title", "c_what", 0.0, -30, 2.0, 2.5,
         "♪ V. A. Mocarts — „Mazā naktsmūzika”, 2. daļa (Romance) · publiskais īpašums (Internet Archive)"),
        ("v_quartet", "c_quartet", "c_quartet", 5.0, -27, 1.0, 1.5,
         "♪ J. Haidns — Stīgu kvartets op. 54 Nr. 2 · Danish String Quartet, CC BY 3.0"),
        ("a_romance", "c_piano", "c_why", 95.0, -30, 2.0, 2.5,
         "♪ V. A. Mocarts — „Mazā naktsmūzika”, 2. daļa (Romance) · publiskais īpašums (Internet Archive)"),
        ("a_ragtime", "d_title", "d_tape", 0.0, -29, 2.0, 3.0,
         "♪ „Alexander's Ragtime Band” — A. Collins & B. Harlan, 1911 · publiskais īpašums (ASV Kongresa bibliotēka)"),
        ("syn_digital", "d_lp", "d_why", 0.0, -30, 3.0, 3.0,
         "♪ Elektroniska mūzika — oriģināla sintēze šim video"),
        ("a_barber", "q_title", "q_why", 0.0, -33, 2.5, 3.5,
         "♪ Dž. Rosīni — „Seviļas bārddzinis”, uvertīra · A. Toskanīni, Ņujorkas filharmonija, ap 1930 · publiskais īpašums ES"),
        ("a_romance", "thanks", "thanks", 0.0, -28, 1.0, 2.5, ""),
    ]


# showcase excerpts: (clip, audio key, source offset seconds, credit)
WORK_EXCERPTS = [
    ("w1", "a_nachtmusik", 0.0, "♪ Mocarts — Eine kleine Nachtmusik, K. 525 · publiskais īpašums (Internet Archive)"),
    ("w2", "a_sym40", 0.0, "♪ Mocarts — Simfonija Nr. 40 · Victor Concert Orchestra, 1915. g. ieraksts · publiskais īpašums"),
    ("w3", "a_surprise", None, "♪ Haidns — Simfonija Nr. 94 · Bostonas simfoniskais orķestris, S. Kusevickis, 1929 · publiskais īpašums ES"),
    ("w4", "a_beet5", 0.0, "♪ Bēthovens — Simfonija Nr. 5 · F. Karks, Odeon, 1910. g. ieraksts · publiskais īpašums"),
    ("w5", "a_turca", 0.0, "♪ Mocarts — „Alla turca” · spēlē Sergejs Rahmaņinovs, 1925. g. ieraksts · publiskais īpašums"),
]
WORK_LUFS = -21
