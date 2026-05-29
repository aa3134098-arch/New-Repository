/* 
========================================================================
   « أثَــر | Athar » — Spiritual Habits Accountability & Canvas Chart
========================================================================
*/

const trackerEngine = {
    dailyHabits: {
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
        sunnah: false,
        quran: false,
        adhkar: false
    },
    
    // 7 Days commitment statistics (Saturday to Friday)
    weeklyStats: [85, 90, 70, 80, 95, 60, 0], // In percent. Index 6 is today, updated dynamically!
    
    init() {
        this.loadHabits();
        this.bindEvents();
        this.updateProgress();
    },
    
    bindEvents() {
        const checkboxes = document.querySelectorAll('.tracker-checkbox');
        
        checkboxes.forEach(box => {
            box.addEventListener('change', (e) => {
                const habit = e.target.getAttribute('data-habit');
                this.dailyHabits[habit] = e.target.checked;
                
                this.updateProgress();
                this.saveHabits();
                
                // Triggers subtle click vibration if supported
                if (navigator.vibrate) navigator.vibrate(8);
            });
        });
    },
    
    updateProgress() {
        // Calculate daily percentage
        const totalHabits = Object.keys(this.dailyHabits).length;
        const completedHabits = Object.values(this.dailyHabits).filter(val => val === true).length;
        const percent = Math.round((completedHabits / totalHabits) * 100);
        
        // Update Donut circle chart on Tracker screen
        document.getElementById('tracker-today-percent').innerText = `${percent}%`;
        
        // Dashboard Stats
        const dashPercent = document.getElementById('dash-tracker-percent');
        if (dashPercent) dashPercent.innerText = `${percent}%`;
        
        // Donut stroke animation calculation (perimeter = 2 * PI * R where R = 40 => 251.2)
        const donutFill = document.getElementById('tracker-donut-fill');
        const offset = 251.2 - (251.2 * percent / 100);
        donutFill.style.strokeDashoffset = offset;
        
        // Update today's slot in weekly stats
        this.weeklyStats[6] = percent;
        
        // Redraw canvas chart
        this.renderWeeklyChart();
    },
    
    renderWeeklyChart() {
        const canvas = document.getElementById('tracker-weekly-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Responsive canvas sizing
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const height = rect.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Get theme HSL variables to match visual aesthetics
        const isNight = document.body.classList.contains('time-night');
        const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim();
        const secondaryColor = getComputedStyle(document.body).getPropertyValue('--secondary').trim();
        const textSecondary = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim();
        const gridColor = isNight ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
        
        // Labels for days
        const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
        
        // Chart layout configs
        const chartPaddingBottom = 25;
        const chartPaddingTop = 20;
        const chartPaddingLeft = 10;
        const chartPaddingRight = 10;
        const chartHeight = height - chartPaddingTop - chartPaddingBottom;
        const barWidth = 14;
        const colWidth = (width - chartPaddingLeft - chartPaddingRight) / 7;
        
        // Draw soft horizontal gridlines (3 lines: 100%, 50%, 0%)
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 2; i++) {
            const gridY = chartPaddingTop + (chartHeight * i / 2);
            ctx.beginPath();
            ctx.moveTo(chartPaddingLeft, gridY);
            ctx.lineTo(width - chartPaddingRight, gridY);
            ctx.stroke();
        }
        
        // Draw bars and text
        this.weeklyStats.forEach((percentVal, index) => {
            const colX = chartPaddingLeft + (colWidth * index);
            const barX = colX + (colWidth / 2) - (barWidth / 2);
            
            // Bar height calculations
            const targetBarHeight = (percentVal / 100) * chartHeight;
            const barY = chartPaddingTop + chartHeight - targetBarHeight;
            
            // Draw gradient fill for each bar (Teal to Matte Gold)
            const gradient = ctx.createLinearGradient(barX, barY, barX, chartPaddingTop + chartHeight);
            gradient.addColorStop(0, secondaryColor);
            gradient.addColorStop(1, primaryColor);
            
            // Draw bar with rounded top corners
            ctx.fillStyle = gradient;
            ctx.beginPath();
            const radius = 6; // Corner radius
            
            if (percentVal > 0) {
                // If bar height is smaller than radius, adjust
                const r = Math.min(radius, targetBarHeight);
                ctx.moveTo(barX, barY + r);
                ctx.lineTo(barX, barY + targetBarHeight);
                ctx.lineTo(barX + barWidth, barY + targetBarHeight);
                ctx.lineTo(barX + barWidth, barY + r);
                ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth - r, barY);
                ctx.lineTo(barX + r, barY);
                ctx.quadraticCurveTo(barX, barY, barX, barY + r);
                ctx.closePath();
                ctx.fill();
            } else {
                // Draw a very thin placeholder dot if 0%
                ctx.arc(barX + (barWidth / 2), chartPaddingTop + chartHeight - 2, 2, 0, Math.PI * 2);
                ctx.fillStyle = gridColor;
                ctx.fill();
            }
            
            // Draw Day Text Labels at bottom
            ctx.fillStyle = textSecondary;
            ctx.font = '10px Cairo, Tajawal, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(days[index], colX + (colWidth / 2), height - 8);
            
            // Draw percentage tooltip indicator on top of today (Friday / index 6)
            if (percentVal > 0) {
                ctx.fillStyle = primaryColor;
                ctx.font = 'bold 9px Cairo, sans-serif';
                ctx.fillText(`${percentVal}%`, colX + (colWidth / 2), barY - 6);
            }
        });
    },
    
    saveHabits() {
        localStorage.setItem('athar_daily_habits', JSON.stringify(this.dailyHabits));
        localStorage.setItem('athar_weekly_stats', JSON.stringify(this.weeklyStats));
    },
    
    loadHabits() {
        const savedHabits = localStorage.getItem('athar_daily_habits');
        if (savedHabits) {
            this.dailyHabits = JSON.parse(savedHabits);
            
            // Sync checkpoints checkboxes visual status
            Object.keys(this.dailyHabits).forEach(habit => {
                const box = document.querySelector(`.tracker-checkbox[data-habit="${habit}"]`);
                if (box) box.checked = this.dailyHabits[habit];
            });
        }
        
        const savedStats = localStorage.getItem('athar_weekly_stats');
        if (savedStats) {
            this.weeklyStats = JSON.parse(savedStats);
        }
    }
};

window.trackerEngine = trackerEngine;
window.addEventListener('resize', () => {
    if (window.trackerEngine) window.trackerEngine.renderWeeklyChart();
});
