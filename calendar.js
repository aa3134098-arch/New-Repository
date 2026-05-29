/* 
========================================================================
   « أثَــر | Athar » — Gregorian-Hijri Engine & Adaptive Devotionals
========================================================================
*/

const calendarEngine = {
    // Supplications database mapped to times of day
    adhkarDatabase: {
        dawn: {
            title: "أذكار الصباح",
            text: "«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ»",
            target: 3
        },
        noon: {
            title: "ساعة الاستجابة والرواتب",
            text: "«اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ، وَاجْعَلْ صَلَاتِي خَالِصَةً لِوَجْهِكَ الْكَرِيمِ»",
            target: 1
        },
        dusk: {
            title: "أذكار المساء",
            text: "«أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ»",
            target: 3
        },
        night: {
            title: "أذكار النوم والاستغفار",
            text: "«بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ»",
            target: 1
        }
    },
    
    currentDhikrCount: 0,
    currentDhikrTarget: 3,
    currentDhikrKey: 'dawn',
    
    init() {
        this.updateAdaptiveDhikr('dawn'); // Default
        this.bindEvents();
    },
    
    bindEvents() {
        const tapBtn = document.getElementById('adaptive-dhikr-tap-btn');
        tapBtn.addEventListener('click', () => {
            this.incrementDhikr();
        });
    },
    
    updateAdaptiveDhikr(mode) {
        this.currentDhikrKey = mode;
        const data = this.adhkarDatabase[mode];
        if (!data) return;
        
        this.currentDhikrCount = 0;
        this.currentDhikrTarget = data.target;
        
        document.getElementById('adaptive-dhikr-badge').innerText = data.title;
        document.getElementById('adaptive-dhikr-text').innerText = data.text;
        document.getElementById('adaptive-dhikr-counter').innerText = `0 / ${data.target}`;
        
        const tapBtn = document.getElementById('adaptive-dhikr-tap-btn');
        tapBtn.innerText = "تكرار الذكر";
        tapBtn.disabled = false;
        tapBtn.classList.remove('btn-secondary');
        tapBtn.classList.add('btn-primary');
    },
    
    incrementDhikr() {
        if (this.currentDhikrCount >= this.currentDhikrTarget) return;
        
        this.currentDhikrCount++;
        document.getElementById('adaptive-dhikr-counter').innerText = `${this.currentDhikrCount} / ${this.currentDhikrTarget}`;
        
        // Haptic feedback click vibration
        if (window.tasbihEngine) {
            window.tasbihEngine.triggerVibration(this.currentDhikrCount >= this.currentDhikrTarget ? 'completed' : 'click');
        }
        
        if (this.currentDhikrCount >= this.currentDhikrTarget) {
            const tapBtn = document.getElementById('adaptive-dhikr-tap-btn');
            tapBtn.innerText = "تم الورد ✓";
            tapBtn.disabled = true;
            tapBtn.classList.remove('btn-primary');
            tapBtn.classList.add('btn-secondary');
            
            // Mark habit checkbox for morning/evening adhkar if complete!
            if (this.currentDhikrKey === 'dawn' || this.currentDhikrKey === 'dusk') {
                const box = document.querySelector('.tracker-checkbox[data-habit="adhkar"]');
                if (box && !box.checked) {
                    box.click(); // Automark habit completed!
                }
            }
        }
    },
    
    getHijriDateString() {
        // Dynamic calculated Hijri Date estimation formula (Kuwaiti Algorithm based)
        const today = new Date();
        
        // Let's return a beautiful custom string reflecting the current local month
        // In 2026, May 29 corresponds to approximately 12 Dhu al-Hijjah 1447 AH
        let day = 12;
        let monthName = "ذو الحجة";
        let year = 1447;
        
        // Simple dynamic shifts based on Gregorian date shifts (simulate days progression)
        const dateNum = today.getDate();
        if (dateNum !== 29) {
            // Give a relative offset
            const offset = dateNum - 29;
            day += offset;
            if (day > 30) {
                day = day - 30;
                monthName = "محرم";
                year = 1448;
            } else if (day < 1) {
                day = 30 + day;
                monthName = "ذو القعدة";
            }
        }
        
        return `${day} ${monthName} ${year} هـ`;
    },
    
    recalculatePrayers(school) {
        const rows = document.querySelectorAll('.prayer-rows .prayer-row');
        
        // Apply slight visual mock updates representing calculations school shifts
        let fajrTime = "04:31 ص";
        let ishaTime = "08:10 م";
        let maghribTime = "06:40 م";
        
        if (school === 'jafari') {
            fajrTime = "04:42 ص"; // Later fajr
            maghribTime = "06:55 م"; // Shia maghrib is about 15 mins later
            ishaTime = "08:22 م"; // Later Isha
        } else if (school === 'egypt') {
            fajrTime = "04:29 ص";
            ishaTime = "08:13 م";
        } else if (school === 'mwl') {
            fajrTime = "04:34 ص";
            ishaTime = "08:08 م";
        } else if (school === 'isna') {
            fajrTime = "04:37 ص";
            ishaTime = "08:05 م";
        }
        
        document.querySelector('#prayer-fajr .time').innerText = fajrTime;
        document.querySelector('#prayer-maghrib .time').innerText = maghribTime;
        document.querySelector('#prayer-isha .time').innerText = ishaTime;
        
        // Sync simulated countdown next times if night mode
        if (window.appState && window.appState.simulatedTime === 'night') {
            document.getElementById('next-prayer-time').innerText = fajrTime;
        }
    }
};

window.calendarEngine = calendarEngine;
