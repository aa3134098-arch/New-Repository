/* 
========================================================================
   « أثَــر | Athar » - Core Application Logic & Router Manager
========================================================================
*/

// Application State
const appState = {
    currentTab: 'dashboard',
    simulatedTime: 'dawn', // dawn, noon, dusk, night
    isTimeMachineVisible: true,
    userSettings: {
        theme: 'auto', // auto, light, dark
        calcMethod: 'umm-al-qura',
        athanSound: 'al-haram'
    }
};

// DOM Elements
const statusClock = document.getElementById('status-clock');
const timeSimulator = document.getElementById('time-simulator');
const timeMachineBar = document.getElementById('time-machine-bar');
const timeMachineTrigger = document.getElementById('time-machine-trigger');
const closeTmBtn = document.getElementById('close-tm-btn');
const tmVisibleCheckbox = document.getElementById('tm-visible-checkbox');
const themeSelect = document.getElementById('theme-select');
const nextPrayerName = document.getElementById('next-prayer-name');
const nextPrayerTime = document.getElementById('next-prayer-time');
const prayerCountdown = document.getElementById('prayer-countdown');
const currentHijriDate = document.getElementById('current-hijri-date');

// Tab Configuration
const tabs = ['dashboard', 'quran', 'tasbih', 'tracker', 'settings'];

// 1. INITIALIZATION & LUCIDE ICONS
document.addEventListener('DOMContentLoaded', () => {
    // Initialize icons
    lucide.createIcons();
    
    // Set current hijri date
    if (window.calendarEngine) {
        currentHijriDate.innerText = window.calendarEngine.getHijriDateString();
    }
    
    // Start Real-Time Clock
    updateStatusClock();
    setInterval(updateStatusClock, 1000);
    
    // Start Prayer Countdown
    updatePrayerCountdown();
    setInterval(updatePrayerCountdown, 1000);
    
    // Bind General Events
    bindAppEvents();
    
    // Load Local Data if any
    loadUserData();
    
    // Initial dynamic time check
    syncTimeBasedTheme();
    toggleShiaSection(appState.userSettings.calcMethod);
    
    // Continuous automatic time checking and theme adjustments every 30 seconds
    setInterval(() => {
        syncTimeBasedTheme();
        updateStatusClock();
    }, 30000);
    
    // Initialize modular subsystems
    if (window.quranEngine) window.quranEngine.init();
    if (window.tasbihEngine) window.tasbihEngine.init();
    if (window.trackerEngine) window.trackerEngine.init();
    if (window.calendarEngine) window.calendarEngine.init();
    
    // Register PWA Service Worker for complete offline capabilities
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered successfully:', reg.scope))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
});

// 2. ROUTING / TAB MANAGER
function switchTab(tabId) {
    if (!tabs.includes(tabId)) return;
    
    appState.currentTab = tabId;
    
    // Update Nav item styling
    tabs.forEach(tab => {
        const navBtn = document.getElementById(`nav-${tab}`);
        const panel = document.getElementById(`panel-${tab}`);
        
        if (tab === tabId) {
            navBtn.classList.add('active');
            panel.classList.add('active');
        } else {
            navBtn.classList.remove('active');
            panel.classList.remove('active');
        }
    });
    
    // Scroll to top of main content
    document.getElementById('main-scrollable').scrollTop = 0;
    
    // Re-render Lucide icons for dynamically loaded content
    lucide.createIcons();
    
    // Specific tab init logic
    if (tabId === 'tracker' && window.trackerEngine) {
        window.trackerEngine.renderWeeklyChart();
    }
    
    // If leaving Quran reading, reset headers if needed
    if (tabId !== 'quran' && window.quranEngine) {
        window.quranEngine.resetToSurahIndex();
    }
}

// 3. TIME MACHINE & DYNAMIC THEMES
function updateStatusClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; // 12 instead of 0
    statusClock.innerText = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

function bindAppEvents() {
    // Time Machine Trigger Top Bar
    timeMachineTrigger.addEventListener('click', () => {
        timeMachineBar.classList.toggle('visible');
    });
    
    closeTmBtn.addEventListener('click', () => {
        timeMachineBar.classList.remove('visible');
    });
    
    // Simulate time options
    timeSimulator.addEventListener('change', (e) => {
        const mode = e.target.value;
        setSimulationMode(mode);
    });
    
    // Settings Switch Show/Hide Time Machine
    tmVisibleCheckbox.addEventListener('change', (e) => {
        appState.isTimeMachineVisible = e.target.checked;
        if (e.target.checked) {
            timeMachineTrigger.style.display = 'flex';
        } else {
            timeMachineTrigger.style.display = 'none';
            timeMachineBar.classList.remove('visible');
        }
        saveUserData();
    });
    
    // Theme selection changes
    themeSelect.addEventListener('change', (e) => {
        appState.userSettings.theme = e.target.value;
        syncTimeBasedTheme();
        saveUserData();
    });
    
    // Calculation method adjustments
    document.getElementById('calc-method-select').addEventListener('change', (e) => {
        appState.userSettings.calcMethod = e.target.value;
        if (window.calendarEngine) {
            window.calendarEngine.recalculatePrayers(e.target.value);
        }
        toggleShiaSection(e.target.value);
        saveUserData();
    });
    
    // Athan sound selection change with dynamic audio preview
    document.getElementById('athan-sound-select').addEventListener('change', (e) => {
        const sound = e.target.value;
        appState.userSettings.athanSound = sound;
        saveUserData();
        
        const audio = document.getElementById('global-audio-element');
        if (sound === 'silent') {
            audio.pause();
            document.getElementById('audio-player-bar').classList.add('hidden');
            return;
        }
        
        let url = 'https://download.quranicaudio.com/adhan/adhan_makkah_52.mp3'; // Default Makkah
        let title = 'أذان الحرم المكي';
        let muazzin = 'بأعذب أصوات مؤذني الحرم';
        
        if (sound === 'shia') {
            url = 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Shia_Adhan_-_Aba_Zar_Al-Halwaji.ogg';
            title = 'الأذان الجعفري الحزين';
            muazzin = 'بصوت الرادود أبا ذر الحلواجي';
        } else if (sound === 'al-aqsa') {
            url = 'https://download.quranicaudio.com/adhan/adhan_aqsa_52.mp3';
            title = 'أذان المسجد الأقصى';
            muazzin = 'بصوت مؤذني الأقصى الشريف';
        } else if (sound === 'madina') {
            url = 'https://download.quranicaudio.com/adhan/adhan_madinah_52.mp3';
            title = 'أذان الحرم النبوي';
            muazzin = 'بصوت مؤذني الحرم النبوي';
        }
        
        audio.src = url;
        audio.load();
        
        // Show player bar
        const playerBar = document.getElementById('audio-player-bar');
        playerBar.classList.remove('hidden');
        
        document.getElementById('ap-surah-title').innerText = title;
        document.getElementById('ap-reader-title').innerText = muazzin;
        
        audio.play().catch(err => console.log('Audio preview failed', err));
        
        const playBtn = document.getElementById('ap-play-pause-btn');
        playBtn.innerHTML = '<i data-lucide="pause"></i>';
        lucide.createIcons();
    });

    // Profile click
    document.getElementById('profile-trigger').addEventListener('click', () => {
        switchTab('tracker');
    });
    
    // Sync Button
    document.getElementById('btn-sync-now').addEventListener('click', () => {
        const btn = document.getElementById('btn-sync-now');
        btn.innerText = 'جاري المزامنة...';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerText = 'اكتملت بنجاح ✓';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
            setTimeout(() => {
                btn.innerText = 'مزامنة البيانات';
                btn.disabled = false;
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-secondary');
            }, 2000);
        }, 1500);
    });
}

function setSimulationMode(mode) {
    appState.simulatedTime = mode;
    
    // Remove all time classes
    document.body.classList.remove('time-dawn', 'time-noon', 'time-dusk', 'time-night');
    
    // Add new simulation class
    document.body.classList.add(`time-${mode}`);
    
    // Trigger dynamic content changes
    if (window.calendarEngine) {
        window.calendarEngine.updateAdaptiveDhikr(mode);
    }
    
    // Update dashboard labels based on simulated times
    updatePrayerTimesForSimulation(mode);
}

function syncTimeBasedTheme() {
    const themeMode = appState.userSettings.theme;
    
    if (themeMode === 'light') {
        document.body.classList.remove('time-dawn', 'time-dusk', 'time-night');
        document.body.classList.add('time-noon');
        timeSimulator.value = 'noon';
    } else if (themeMode === 'dark') {
        document.body.classList.remove('time-dawn', 'time-noon', 'time-dusk');
        document.body.classList.add('time-night');
        timeSimulator.value = 'night';
    } else {
        // Auto / Dynamic Time based
        const hour = new Date().getHours();
        let mode = 'noon';
        if (hour >= 4 && hour < 8) mode = 'dawn';
        else if (hour >= 8 && hour < 17) mode = 'noon';
        else if (hour >= 17 && hour < 19) mode = 'dusk';
        else mode = 'night';
        
        setSimulationMode(mode);
        timeSimulator.value = mode;
    }
}

function updatePrayerTimesForSimulation(mode) {
    let nextName = 'الفجر';
    let nextTime = '04:31 ص';
    
    if (mode === 'dawn') {
        nextName = 'الظهر';
        nextTime = '12:22 م';
    } else if (mode === 'noon') {
        nextName = 'العصر';
        nextTime = '03:52 م';
    } else if (mode === 'dusk') {
        nextName = 'المغرب';
        nextTime = '08:10 م';
    } else if (mode === 'night') {
        nextName = 'الفجر';
        nextTime = '04:31 ص';
    }
    
    nextPrayerName.innerText = nextName;
    nextPrayerTime.innerText = nextTime;
    
    // Mark active in side checklist/rows
    document.querySelectorAll('.prayer-row').forEach(row => {
        row.classList.remove('active');
    });
    
    const activeRowId = `prayer-${mode === 'noon' ? 'dhuhr' : mode === 'dusk' ? 'maghrib' : mode === 'night' ? 'isha' : 'fajr'}`;
    const row = document.getElementById(activeRowId);
    if (row) row.classList.add('active');
}

// 4. PRAYER TIMES COUNTDOWN ENGINE
function updatePrayerCountdown() {
    const now = new Date();
    let target = new Date();
    
    const mode = appState.simulatedTime;
    let targetHour = 4, targetMin = 31; // Fajr default for simulation 'night'
    
    if (mode === 'dawn') {
        // Next is Dhuhr
        targetHour = 12; targetMin = 22;
    } else if (mode === 'noon') {
        // Next is Asr
        targetHour = 15; targetMin = 52;
    } else if (mode === 'dusk') {
        // Next is Isha
        targetHour = 20; targetMin = 10;
    }
    
    target.setHours(targetHour, targetMin, 0);
    
    if (target < now) {
        target.setDate(target.getDate() + 1); // Tomorrow
    }
    
    const diff = target - now;
    const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    
    prayerCountdown.innerText = `${hours}:${minutes}:${seconds}`;
}

// 5. LOCAL STORAGE SYNC
function saveUserData() {
    localStorage.setItem('athar_app_settings', JSON.stringify(appState.userSettings));
    localStorage.setItem('athar_tm_visible', appState.isTimeMachineVisible);
}

function loadUserData() {
    const savedSettings = localStorage.getItem('athar_app_settings');
    if (savedSettings) {
        appState.userSettings = JSON.parse(savedSettings);
        themeSelect.value = appState.userSettings.theme;
        document.getElementById('calc-method-select').value = appState.userSettings.calcMethod || 'umm-al-qura';
        document.getElementById('athan-sound-select').value = appState.userSettings.athanSound || 'al-haram';
    }
    
    const savedTm = localStorage.getItem('athar_tm_visible');
    if (savedTm) {
        const visible = savedTm === 'true';
        appState.isTimeMachineVisible = visible;
        tmVisibleCheckbox.checked = visible;
        if (!visible) {
            timeMachineTrigger.style.display = 'none';
            timeMachineBar.classList.remove('visible');
        } else {
            timeMachineTrigger.style.display = 'flex';
        }
    }
}

// 6. SHIA DEVOTIONALS HELPER FUNCTIONS
let ziyaratCounterState = {
    step: 'curse', // curse, greeting
    count: 0,
    target: 100
};

function toggleShiaSection(method) {
    const shiaSec = document.getElementById('shia-devotionals-section');
    const shiaGuide = document.getElementById('shia-dashboard-guide');
    
    if (method === 'jafari') {
        if (shiaSec) shiaSec.classList.remove('hidden');
        if (shiaGuide) shiaGuide.classList.remove('hidden');
    } else {
        if (shiaSec) shiaSec.classList.add('hidden');
        if (shiaGuide) shiaGuide.classList.add('hidden');
    }
}

function switchShiaSubCategory(category) {
    const btnDuas = document.getElementById('btn-shia-duas');
    const btnZiyarat = document.getElementById('btn-shia-ziyarat');
    const listDuas = document.getElementById('shia-duas-list');
    const listZiyarat = document.getElementById('shia-ziyarat-list');
    
    if (category === 'duas') {
        btnDuas.classList.add('active');
        btnZiyarat.classList.remove('active');
        listDuas.classList.remove('hidden');
        listZiyarat.classList.add('hidden');
    } else {
        btnDuas.classList.remove('active');
        btnZiyarat.classList.add('active');
        listDuas.classList.add('hidden');
        listZiyarat.classList.remove('hidden');
    }
}

function openShiaDuasModal(key) {
    const modal = document.getElementById('shia-duas-modal');
    const titleEl = document.getElementById('shia-modal-title');
    const textEl = document.getElementById('shia-modal-text');
    const counterWrapper = document.getElementById('ziyarat-counter-wrapper');
    
    // shiaDuasDatabase is loaded from devotionals.js
    const data = window.shiaDuasDatabase ? window.shiaDuasDatabase[key] : (typeof shiaDuasDatabase !== 'undefined' ? shiaDuasDatabase[key] : null);
    if (!data) return;
    
    titleEl.innerText = data.title;
    textEl.innerText = data.text;
    modal.classList.remove('hidden');
    
    if (data.isZiyarat) {
        counterWrapper.classList.remove('hidden');
        resetZiyaratCounter();
    } else {
        counterWrapper.classList.add('hidden');
    }
    
    lucide.createIcons();
}

function closeShiaDuasModal() {
    document.getElementById('shia-duas-modal').classList.add('hidden');
}

function resetZiyaratCounter() {
    ziyaratCounterState.step = 'curse';
    ziyaratCounterState.count = 0;
    
    document.getElementById('z-counter-title').innerText = "فقرة اللعن (100 مرة)";
    document.getElementById('z-counter-value').innerText = "0 / 100";
    document.getElementById('shia-modal-text').scrollTop = 0;
}

function incrementZiyaratCounter() {
    if (ziyaratCounterState.count < ziyaratCounterState.target) {
        ziyaratCounterState.count++;
        document.getElementById('z-counter-value').innerText = `${ziyaratCounterState.count} / ${ziyaratCounterState.target}`;
        
        // Haptic feedback click vibration
        if (window.tasbihEngine) {
            window.tasbihEngine.triggerVibration('click');
        }
        
        if (ziyaratCounterState.count >= ziyaratCounterState.target) {
            if (window.tasbihEngine) {
                window.tasbihEngine.triggerVibration('completed');
            }
            
            if (ziyaratCounterState.step === 'curse') {
                // Switch to greetings part
                setTimeout(() => {
                    ziyaratCounterState.step = 'greeting';
                    ziyaratCounterState.count = 0;
                    document.getElementById('z-counter-title').innerText = "فقرة السلام (100 مرة)";
                    document.getElementById('z-counter-value').innerText = "0 / 100";
                    alert("اكتملت فقرة اللعن بنجاح! انتقل الآن لفقرة السلام (100 مرة).");
                }, 500);
            } else {
                alert("اكتملت الزيارة المباركة! تقبل الله منكم صالح الأعمال.");
                resetZiyaratCounter();
                closeShiaDuasModal();
            }
        }
    }
}

// Bind to window to make available globally for inline onclick handlers
window.toggleShiaSection = toggleShiaSection;
window.switchShiaSubCategory = switchShiaSubCategory;
window.openShiaDuasModal = openShiaDuasModal;
window.closeShiaDuasModal = closeShiaDuasModal;
window.incrementZiyaratCounter = incrementZiyaratCounter;
window.resetZiyaratCounter = resetZiyaratCounter;
window.appState = appState;
