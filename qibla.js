/* 
========================================================================
   « أثَــر | Athar » — Interactive Qibla Compass Engine
========================================================================
*/

const qiblaEngine = {
    qiblaAngle: 135, // Qibla Heading from North for mock coordinates (e.g., Cairo/Mecca angle is ~135° SE)
    currentHeading: 0,
    isDragging: false,
    startX: 0,
    
    init() {
        this.bindEvents();
    },
    
    bindEvents() {
        const compass = document.getElementById('compass-rose');
        
        // 1. Mobile Device Orientation sensors
        window.addEventListener('deviceorientationabsolute', (e) => this.handleOrientation(e), true);
        window.addEventListener('deviceorientation', (e) => this.handleOrientation(e), true);
        
        // 2. Desktop Swipe/Drag simulator
        compass.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startX = e.clientX;
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.startX;
            this.startX = e.clientX;
            
            // Adjust heading based on drag delta speed
            this.currentHeading = (this.currentHeading + (deltaX * 0.5) + 360) % 360;
            this.updateCompassRotation();
        });
        
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // Mobile touch swipe simulator
        compass.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.startX = e.touches[0].clientX;
        });
        
        compass.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.touches[0].clientX - this.startX;
            this.startX = e.touches[0].clientX;
            
            this.currentHeading = (this.currentHeading + (deltaX * 0.5) + 360) % 360;
            this.updateCompassRotation();
        });
        
        compass.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    },
    
    handleOrientation(event) {
        // alpha: rotation around z-axis [0, 360]
        let heading = event.alpha;
        
        // Check for Webkit heading if available (iOS specific)
        if (event.webkitCompassHeading) {
            heading = event.webkitCompassHeading;
        }
        
        if (heading !== null && heading !== undefined) {
            // Smooth headings
            this.currentHeading = Math.round(heading);
            this.updateCompassRotation();
        }
    },
    
    updateCompassRotation() {
        const rose = document.getElementById('compass-rose');
        if (!rose) return;
        
        // Rotate the compass dial (rose) in counter direction of heading
        rose.style.transform = `rotate(${-this.currentHeading}deg)`;
        
        // Calculate difference with Qibla target angle
        const diff = Math.abs(this.currentHeading - this.qiblaAngle);
        
        // Align state checklist (within 4 degrees margin)
        if (diff <= 4 || diff >= 356) {
            rose.classList.add('aligned');
            document.getElementById('qibla-status').innerHTML = `الحالة: <strong>مكتمل الاتجاه (مواجه للكعبة) ✓</strong>`;
            
            // Tiny haptic pulse (10ms) when entering perfect alignment
            if (navigator.vibrate) navigator.vibrate(10);
        } else {
            rose.classList.remove('aligned');
            document.getElementById('qibla-status').innerHTML = `درجة الانحراف: <strong>${Math.round(this.currentHeading)}° من الشمال</strong>`;
        }
    },
    
    simulateQiblaMatch() {
        // Spin the compass rose in a beautiful sweep
        let count = 0;
        const interval = setInterval(() => {
            // Animate spinning towards the qibla alignment
            const step = (this.qiblaAngle - this.currentHeading) * 0.15;
            this.currentHeading += step;
            this.updateCompassRotation();
            
            count++;
            if (count > 25 || Math.abs(this.currentHeading - this.qiblaAngle) < 0.2) {
                this.currentHeading = this.qiblaAngle;
                this.updateCompassRotation();
                clearInterval(interval);
                
                // Final success click haptic
                if (window.tasbihEngine) window.tasbihEngine.triggerVibration('completed');
            }
        }, 30);
    }
};

// Global handlers to open/close Qibla compass modal dialog
function openQiblaModal() {
    document.getElementById('qibla-modal').classList.remove('hidden');
    if (window.qiblaEngine) window.qiblaEngine.init();
    
    // Auto simulate spin after 500ms to guide desktop users
    setTimeout(() => {
        if (window.qiblaEngine) window.qiblaEngine.simulateQiblaMatch();
    }, 600);
}

function closeQiblaModal() {
    document.getElementById('qibla-modal').classList.add('hidden');
}

function simulateQiblaMatch() {
    if (window.qiblaEngine) window.qiblaEngine.simulateQiblaMatch();
}

window.qiblaEngine = qiblaEngine;
