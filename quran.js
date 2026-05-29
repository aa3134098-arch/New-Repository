/* 
========================================================================
   « أثَــر | Athar » — Quranic Reader & Premium Audio Engine
========================================================================
*/

const quranEngine = {
    // 114 Surah Metadata Index
    surahIndex: [
        { id: 1, name: "الفاتحة", transliteration: "Al-Fatihah", verses: 7, type: "مكية" },
        { id: 2, name: "البقرة", transliteration: "Al-Baqarah", verses: 286, type: "مدنية" },
        { id: 18, name: "الكهف", transliteration: "Al-Kahf", verses: 110, type: "مكية" },
        { id: 36, name: "يس", transliteration: "Yaseen", verses: 83, type: "مكية" },
        { id: 67, name: "الملك", transliteration: "Al-Mulk", verses: 30, type: "مكية" },
        { id: 112, name: "الإخلاص", transliteration: "Al-Ikhlas", verses: 4, type: "مكية" },
        { id: 113, name: "الفلق", transliteration: "Al-Falaq", verses: 5, type: "مكية" },
        { id: 114, name: "الناس", transliteration: "An-Nas", verses: 6, type: "مكية" }
    ],
    
    // Offline pre-baked verses database for major surahs
    versesData: {
        1: [
            "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
            "الرَّحْمَٰنِ الرَّحِيمِ",
            "مَالِكِ يَوْمِ الدِّينِ",
            "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
            "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
            "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"
        ],
        112: [
            "قُلْ هُوَ اللَّهُ أَحَدٌ",
            "اللَّهُ الصَّمَدُ",
            "لَمْ يَلِدْ وَلَمْ يُولَدْ",
            "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"
        ],
        113: [
            "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
            "مِن شَرِّ مَا خَلَقَ",
            "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
            "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
            "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ"
        ],
        114: [
            "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
            "مَلِكِ النَّاسِ",
            "إِلَٰهِ النَّاسِ",
            "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
            "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
            "مِنَ الْجِنَّةِ وَالنَّاسِ"
        ],
        67: [
            "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
            "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ",
            "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلَقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ",
            "ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ",
            "وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ"
        ]
    },
    
    // Offline Tafsirs and translation sample database
    tafsirData: {
        muyassar: "الحمد لله رب العالمين: الثناء الجميل والتعظيم الكامل لله خالق ومدبر الأكوان كلها وحده.",
        saadi: "أي: أحمد الله تعالى بصفاته الكمالية ونعمه الغزيرة التي لا تعد ولا تحصى، رب العالمين المربي لخلقه بالنعم.",
        english: "All praise and gratitude are due to Allah alone, the Lord of all the worlds."
    },
    
    // Local state
    currentSurah: null,
    currentVerse: 1,
    currentFontSize: 24, // in px
    isPlayingAudio: false,
    audioElement: null,
    
    init() {
        this.audioElement = document.getElementById('global-audio-element');
        this.renderSurahIndex();
        this.bindEvents();
    },
    
    renderSurahIndex() {
        const container = document.getElementById('surah-list-container');
        container.innerHTML = '';
        
        this.surahIndex.forEach(surah => {
            const card = document.createElement('div');
            card.className = 'surah-card';
            card.innerHTML = `
                <div class="surah-info-left">
                    <div class="surah-number">${surah.id}</div>
                    <div class="surah-details">
                        <span class="surah-name-ar">سورة ${surah.name}</span>
                        <span class="surah-desc-meta">${surah.type} • ${surah.verses} آيات</span>
                    </div>
                </div>
                <div class="surah-name-calligraphy">${surah.transliteration}</div>
            `;
            
            card.addEventListener('click', () => this.openSurah(surah.id));
            container.appendChild(card);
        });
    },
    
    bindEvents() {
        // Font adjustments
        document.getElementById('font-increase-btn').addEventListener('click', () => {
            if (this.currentFontSize < 40) {
                this.currentFontSize += 2;
                document.getElementById('verses-grid-container').style.fontSize = `${this.currentFontSize}px`;
            }
        });
        
        document.getElementById('font-decrease-btn').addEventListener('click', () => {
            if (this.currentFontSize > 18) {
                this.currentFontSize -= 2;
                document.getElementById('verses-grid-container').style.fontSize = `${this.currentFontSize}px`;
            }
        });
        
        // Back to Surah Index
        document.getElementById('back-to-index-btn').addEventListener('click', () => {
            this.resetToSurahIndex();
        });
        
        // Search filter
        document.getElementById('quran-search-input').addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            const cards = document.querySelectorAll('.surah-card');
            
            cards.forEach((card, index) => {
                const surah = this.surahIndex[index];
                const match = surah.name.includes(query) || 
                              surah.transliteration.toLowerCase().includes(query) || 
                              surah.id.toString() === query;
                
                if (match || query === '') {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
        
        // Audio Player controls
        const playPauseBtn = document.getElementById('ap-play-pause-btn');
        playPauseBtn.addEventListener('click', () => {
            if (this.isPlayingAudio) {
                this.pauseRecitation();
            } else {
                this.playRecitation();
            }
        });
        
        document.getElementById('ap-close-btn').addEventListener('click', () => {
            this.stopRecitation();
        });
        
        // Tafsir Sheet dynamic tabs switching
        document.getElementById('btn-tafsir-saadi').addEventListener('click', (e) => {
            this.switchTafsirTab('saadi', e.target);
        });
        document.getElementById('btn-tafsir-muyassar').addEventListener('click', (e) => {
            this.switchTafsirTab('muyassar', e.target);
        });
        document.getElementById('btn-tafsir-english').addEventListener('click', (e) => {
            this.switchTafsirTab('english', e.target);
        });
        
        // Audio Play single verse inside bottom sheet
        document.getElementById('btn-play-verse-audio').addEventListener('click', () => {
            this.closeTafsirSheet();
            this.triggerAudioForSurah(this.currentSurah.id);
        });
        
        // Background audio monitoring progress
        this.audioElement.addEventListener('timeupdate', () => {
            if (!this.audioElement.duration) return;
            const percent = (this.audioElement.currentTime / this.audioElement.duration) * 100;
            document.getElementById('ap-progress-fill').style.width = `${percent}%`;
        });
        
        this.audioElement.addEventListener('ended', () => {
            this.stopRecitation();
        });
    },
    
    openSurah(surahId) {
        const surah = this.surahIndex.find(s => s.id === surahId);
        if (!surah) return;
        
        this.currentSurah = surah;
        
        // Hide index, show canvas
        document.getElementById('quran-index-view').classList.add('hidden');
        const canvas = document.getElementById('quran-reading-view');
        canvas.classList.remove('hidden');
        
        // Set titles
        document.getElementById('canvas-surah-title').innerText = `سورة ${surah.name}`;
        
        // Hide/Show Bismillah
        const bismillah = document.getElementById('reading-bismillah');
        if (surahId === 9 || surahId === 1) {
            bismillah.style.display = 'none'; // Bara'ah or Fatihah (we embed bismillah in fatihah)
        } else {
            bismillah.style.display = 'block';
        }
        
        // Populate verses
        const versesContainer = document.getElementById('verses-grid-container');
        versesContainer.innerHTML = '';
        
        // Use offline pre-baked data if available, else simulate verses
        const verses = this.versesData[surahId] || this.generateMockVerses(surah);
        
        verses.forEach((text, i) => {
            const span = document.createElement('span');
            span.className = 'verse-span';
            span.innerHTML = `${text} <span class="verse-end-number">${i + 1}</span>`;
            
            // Add click for Tafsir bottom sheet
            span.addEventListener('click', () => this.openTafsirSheet(i + 1, text));
            
            versesContainer.appendChild(span);
        });
    },
    
    generateMockVerses(surah) {
        const list = [];
        for (let i = 1; i <= surah.verses; i++) {
            list.push(`تلاوة عطرة للآية الكريمة رقم ${i} من سورة ${surah.name} المباركة بالرسم العثماني المقروء والمفسر.`);
        }
        return list;
    },
    
    resetToSurahIndex() {
        document.getElementById('quran-reading-view').classList.add('hidden');
        document.getElementById('quran-index-view').classList.remove('hidden');
    },
    
    // TAFSIR SHEET INTERACTIVE SHEET
    openTafsirSheet(verseNum, text) {
        this.currentVerse = verseNum;
        
        const sheet = document.getElementById('tafsir-sheet');
        sheet.classList.remove('hidden');
        
        document.getElementById('tafsir-title').innerText = `سورة ${this.currentSurah.name} - الآية ${verseNum}`;
        document.getElementById('tafsir-verse-quote').innerText = text;
        
        // Initial Tab load
        this.switchTafsirTab('saadi', document.getElementById('btn-tafsir-saadi'));
    },
    
    closeTafsirSheet() {
        document.getElementById('tafsir-sheet').classList.add('hidden');
    },
    
    switchTafsirTab(type, targetBtn) {
        // Toggle active tabs styling
        document.querySelectorAll('.tafsir-options-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        targetBtn.classList.add('active');
        
        // Get Tafsir content
        const textContainer = document.getElementById('tafsir-content-text');
        
        if (this.currentSurah.id === 1 && this.currentVerse === 1) {
            textContainer.innerText = this.tafsirData[type];
        } else {
            // General mockup tafsir for other verses
            if (type === 'saadi') {
                textContainer.innerText = `[تفسير السعدي للآية ${this.currentVerse}]: هذا التفسير يوضح الحكمة والموعظة الإيمانية من الآية الكريمة، مع توضيح مقاصد السورة ودلالاتها الروحية والتشريعية في حياة المسلم لتطبيقها عملياً.`;
            } else if (type === 'muyassar') {
                textContainer.innerText = `[التفسير الميسر للآية ${this.currentVerse}]: تفسير ميسر ومختصر للآية الكريمة يسهل على القارئ والسامع فهم المعاني المباشرة والدلالة اللفظية للرسم العثماني الشريف.`;
            } else {
                textContainer.innerText = `[English Translation - Verse ${this.currentVerse}]: This is a premium English translation of the holy verse from surah ${this.currentSurah.transliteration} for the global reader.`;
            }
        }
    },
    
    // RECITATION & AUDIO ENGINE
    triggerAudioForSurah(surahId) {
        this.currentSurah = this.surahIndex.find(s => s.id === surahId) || this.surahIndex[0];
        
        // Audio stream source from Every Ayah public audio hosting (e.g. Alafasy)
        const paddedId = surahId.toString().padStart(3, '0');
        
        // Standard high-quality MP3 download stream links (using Alafasy)
        const audioUrl = `https://download.quranicaudio.com/quran/mishari_rashid_al_afasy/${paddedId}.mp3`;
        
        this.audioElement.src = audioUrl;
        this.audioElement.load();
        
        // Show player bar
        const playerBar = document.getElementById('audio-player-bar');
        playerBar.classList.remove('hidden');
        
        document.getElementById('ap-surah-title').innerText = `سورة ${this.currentSurah.name}`;
        document.getElementById('ap-reader-title').innerText = `الشيخ مشاري راشد العفاسي`;
        
        this.playRecitation();
    },
    
    playRecitation() {
        this.isPlayingAudio = true;
        this.audioElement.play().catch(e => console.log('Audio playback failed', e));
        
        const playBtn = document.getElementById('ap-play-pause-btn');
        playBtn.innerHTML = '<i data-lucide="pause"></i>';
        lucide.createIcons();
    },
    
    pauseRecitation() {
        this.isPlayingAudio = false;
        this.audioElement.pause();
        
        const playBtn = document.getElementById('ap-play-pause-btn');
        playBtn.innerHTML = '<i data-lucide="play"></i>';
        lucide.createIcons();
    },
    
    stopRecitation() {
        this.isPlayingAudio = false;
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        
        document.getElementById('audio-player-bar').classList.add('hidden');
        
        // Remove active class on all verses
        document.querySelectorAll('.verse-span').forEach(span => {
            span.classList.remove('playing');
        });
    }
};

window.quranEngine = quranEngine;
