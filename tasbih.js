/* 
========================================================================
   « أثَــر | Athar » — Sacred Haptic Tasbih Digital Counter
========================================================================
*/

const tasbihEngine = {
    currentCount: 0,
    targetCount: 33,
    currentDhikr: "سبحان الله",
    
    init() {
        this.loadStats();
        this.bindEvents();
        this.updateUI();
    },
    
    bindEvents() {
        const clickArea = document.getElementById('tasbih-click-area');
        const ring = document.getElementById('tasbih-ring');
        
        // Tap/Click counting in any place on the click area
        clickArea.addEventListener('pointerdown', (e) => {
            // Avoid double tap zoom on mobile
            e.preventDefault();
            this.incrementCount(ring);
        });
        
        // Dhikr selection changes
        const dhikrSelect = document.getElementById('tasbih-dhikr-select');
        dhikrSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                const customVal = prompt('أدخل الذكر المخصص لك:');
                if (customVal && customVal.trim() !== '') {
                    this.currentDhikr = customVal.trim();
                    // Add temporary option
                    const opt = document.createElement('option');
                    opt.value = customVal;
                    opt.innerText = customVal;
                    dhikrSelect.add(opt, dhikrSelect.options[dhikrSelect.options.length - 1]);
                    dhikrSelect.value = customVal;
                } else {
                    dhikrSelect.value = this.currentDhikr;
                }
            } else {
                this.currentDhikr = e.target.value;
            }
            this.updateUI();
            this.saveStats();
        });
        
        // Reset counter
        document.getElementById('tasbih-reset-btn').addEventListener('click', () => {
            if (confirm('هل تريد تصفير العداد للذكر الحالي؟')) {
                this.currentCount = 0;
                this.updateUI();
                this.saveStats();
                this.triggerVibration('reset');
            }
        });
        
        // Target changer
        document.getElementById('tasbih-edit-target').addEventListener('click', () => {
            const newTarget = prompt('أدخل العدد المستهدف الجديد:', this.targetCount);
            if (newTarget && !isNaN(newTarget) && parseInt(newTarget) > 0) {
                this.targetCount = parseInt(newTarget);
                this.updateUI();
                this.saveStats();
            }
        });
    },
    
    incrementCount(ringElement) {
        this.currentCount++;
        
        // Visual feedback - Ring Pulsing scale effect
        ringElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            ringElement.style.transform = 'scale(1)';
        }, 100);
        
        // Haptic / Vibration feedback
        if (this.currentCount >= this.targetCount) {
            this.triggerVibration('completed');
            this.showCelebrationEffect();
            this.currentCount = 0; // Reset after target completion
        } else {
            this.triggerVibration('click');
        }
        
        // Update stats on Dashboard as well
        const dashTasbihCount = document.getElementById('dash-tasbih-count');
        if (dashTasbihCount) {
            let totalDhikrs = parseInt(dashTasbihCount.innerText) + 1;
            dashTasbihCount.innerText = totalDhikrs;
        }
        
        this.updateUI();
        this.saveStats();
    },
    
    triggerVibration(type) {
        if (!navigator.vibrate) return; // Browser does not support vibration API
        
        if (type === 'click') {
            // Ultra soft physical click (15ms)
            navigator.vibrate(15);
        } else if (type === 'completed') {
            // Success vibration alert: 2 pulses (100ms play, 50ms pause, 150ms play)
            navigator.vibrate([80, 50, 150]);
        } else if (type === 'reset') {
            // Negative long vibration warning (200ms)
            navigator.vibrate(200);
        }
    },
    
    showCelebrationEffect() {
        const ring = document.getElementById('tasbih-ring');
        ring.style.borderColor = 'var(--secondary)';
        
        // Sparkle / Glowing ring transition
        ring.classList.add('aligned');
        
        setTimeout(() => {
            ring.style.borderColor = 'var(--card-border)';
            ring.classList.remove('aligned');
        }, 1500);
    },
    
    updateUI() {
        document.getElementById('tasbih-current-count').innerText = this.currentCount;
        document.getElementById('tasbih-dhikr-label').innerText = this.currentDhikr;
        document.getElementById('tasbih-target-val').innerText = this.targetCount;
        
        // Update circular ring outline progress
        const percent = Math.min((this.currentCount / this.targetCount) * 360, 360);
        const ring = document.getElementById('tasbih-ring');
        
        // Set dynamic ring circular border gradient degree
        ring.style.backgroundImage = `radial-gradient(circle, var(--card) 60%, rgba(212, 175, 55, 0.04) 100%)`;
    },
    
    saveStats() {
        localStorage.setItem('athar_tasbih_count', this.currentCount);
        localStorage.setItem('athar_tasbih_target', this.targetCount);
        localStorage.setItem('athar_tasbih_dhikr', this.currentDhikr);
    },
    
    loadStats() {
        const savedCount = localStorage.getItem('athar_tasbih_count');
        if (savedCount) this.currentCount = parseInt(savedCount);
        
        const savedTarget = localStorage.getItem('athar_tasbih_target');
        if (savedTarget) this.targetCount = parseInt(savedTarget);
        
        const savedDhikr = localStorage.getItem('athar_tasbih_dhikr');
        if (savedDhikr) {
            this.currentDhikr = savedDhikr;
            
            // Sync selector value if option exists
            const select = document.getElementById('tasbih-dhikr-select');
            let exists = false;
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === savedDhikr) {
                    exists = true;
                    break;
                }
            }
            
            if (!exists) {
                const opt = document.createElement('option');
                opt.value = savedDhikr;
                opt.innerText = savedDhikr;
                select.add(opt, select.options[select.options.length - 1]);
            }
            
            select.value = savedDhikr;
        }
    }
};

window.tasbihEngine = tasbihEngine;
