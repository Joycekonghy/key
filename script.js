class ClawMachine {
    constructor() {
        this.claw = document.getElementById('claw');
        this.prizeArea = document.getElementById('prizeArea');
        this.caughtDisplay = document.getElementById('caughtDisplay');
        this.clawPosition = 50;
        this.isGrabbing = false;
        this.caughtCats = [];
        this.cats = [];
        
        this.setupControls();
        this.updateClawPosition();
        this.addTechEffects();
        this.initializeCats();
        this.startPhysics();
    }
    
    initializeCats() {
        const catData = [
            { emoji: '🐱', label: 'btc predict game', link: 'https://btcpredictgame.com' },
        ];
        
        const areaRect = this.prizeArea.getBoundingClientRect();
        const areaWidth = areaRect.width - 40; // padding
        const areaHeight = areaRect.height - 40;
        
        catData.forEach((data, index) => {
            const cat = {
                element: document.querySelector(`[data-link="${data.link}"]`),
                x: Math.random() * (areaWidth - 80),
                y: Math.random() * (areaHeight - 140) + 100, // start higher up
                vx: 0,
                vy: 0,
                width: 80,
                height: 70,
                caught: false,
                data: data
            };
            
            cat.element.style.left = cat.x + 'px';
            cat.element.style.top = cat.y + 'px';
            
            this.cats.push(cat);
        });
    }
    
    startPhysics() {
        const gravity = 0.2;
        
        const updatePhysics = () => {
            const areaRect = this.prizeArea.getBoundingClientRect();
            const areaWidth = areaRect.width - 40;
            const areaHeight = areaRect.height - 40;
            
            this.cats.forEach(cat => {
                if (cat.caught) return;
                
                // Apply gravity
                cat.vy += gravity;
                
                // Update position
                cat.x += cat.vx;
                cat.y += cat.vy;
                
                // Floor collision - just stop
                if (cat.y + cat.height > areaHeight) {
                    cat.y = areaHeight - cat.height;
                    cat.vy = 0;
                    cat.vx *= 0.9; // slow down
                }
                
                // Wall collisions - just stop
                if (cat.x < 0) {
                    cat.x = 0;
                    cat.vx = 0;
                } else if (cat.x + cat.width > areaWidth) {
                    cat.x = areaWidth - cat.width;
                    cat.vx = 0;
                }
                
                // Simple collision - just push apart
                this.cats.forEach(otherCat => {
                    if (otherCat === cat || otherCat.caught) return;
                    
                    const dx = (cat.x + cat.width/2) - (otherCat.x + otherCat.width/2);
                    const dy = (cat.y + cat.height/2) - (otherCat.y + otherCat.height/2);
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    const minDistance = 60;
                    
                    if (distance < minDistance && distance > 0) {
                        const pushX = (dx / distance) * 2;
                        const pushY = (dy / distance) * 2;
                        
                        cat.x += pushX;
                        cat.y += pushY;
                        otherCat.x -= pushX;
                        otherCat.y -= pushY;
                    }
                });
                
                // Update DOM position
                cat.element.style.left = cat.x + 'px';
                cat.element.style.top = cat.y + 'px';
            });
            
            requestAnimationFrame(updatePhysics);
        };
        
        updatePhysics();
    }
    
    setupControls() {
        document.getElementById('leftBtn').addEventListener('click', () => this.moveLeft());
        document.getElementById('rightBtn').addEventListener('click', () => this.moveRight());
        document.getElementById('grabBtn').addEventListener('click', () => this.grab());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.moveLeft();
            if (e.key === 'ArrowRight') this.moveRight();
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.grab();
            }
        });
    }
    
    moveLeft() {
        if (this.isGrabbing) return;
        this.clawPosition = Math.max(10, this.clawPosition - 8);
        this.updateClawPosition();
        this.createMoveEffect();
    }
    
    moveRight() {
        if (this.isGrabbing) return;
        this.clawPosition = Math.min(90, this.clawPosition + 8);
        this.updateClawPosition();
        this.createMoveEffect();
    }
    
    updateClawPosition() {
        this.claw.style.left = this.clawPosition + '%';
    }
    
    createMoveEffect() {
        this.claw.style.filter = 'drop-shadow(0 0 20px #00ff41) brightness(1.5)';
        setTimeout(() => {
            this.claw.style.filter = 'drop-shadow(0 0 10px #00ff41)';
        }, 200);
    }
    
    async grab() {
        if (this.isGrabbing) return;
        
        this.isGrabbing = true;
        const grabBtn = document.getElementById('grabBtn');
        grabBtn.textContent = '⚡ GRABBING...';
        grabBtn.disabled = true;
        
        // Enhanced claw animation
        this.claw.classList.add('grabbing');
        this.createGrabEffect();
        
        setTimeout(() => {
            const caughtCat = this.checkForCatch();
            
            if (caughtCat) {
                this.catchCat(caughtCat);
            } else {
                this.createMissEffect();
            }
            
            setTimeout(() => {
                this.claw.classList.remove('grabbing');
                this.isGrabbing = false;
                grabBtn.textContent = '🎯 GRAB';
                grabBtn.disabled = false;
            }, 2000);
        }, 1000);
    }
    
    createGrabEffect() {
        // Electric effect around claw
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.top = '50%';
        effect.style.left = this.clawPosition + '%';
        effect.style.transform = 'translate(-50%, -50%)';
        effect.style.width = '100px';
        effect.style.height = '100px';
        effect.style.border = '2px solid #0080ff';
        effect.style.borderRadius = '50%';
        effect.style.boxShadow = '0 0 30px #0080ff, inset 0 0 30px #0080ff';
        effect.style.animation = 'grabPulse 1.4s ease-out';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '5';
        
        this.prizeArea.appendChild(effect);
        
        setTimeout(() => effect.remove(), 1400);
        
        // Add grab pulse animation if not exists
        if (!document.querySelector('#grab-style')) {
            const style = document.createElement('style');
            style.id = 'grab-style';
            style.textContent = `
                @keyframes grabPulse {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
                    30% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                    70% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createMissEffect() {
        // Miss effect
        const miss = document.createElement('div');
        miss.textContent = '💨 MISS';
        miss.style.position = 'fixed';
        miss.style.top = '40%';
        miss.style.left = '50%';
        miss.style.transform = 'translate(-50%, -50%)';
        miss.style.fontSize = '20px';
        miss.style.color = '#ff0080';
        miss.style.fontWeight = 'bold';
        miss.style.zIndex = '1000';
        miss.style.pointerEvents = 'none';
        miss.style.textShadow = '0 0 10px #ff0080';
        
        document.body.appendChild(miss);
        
        miss.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => miss.remove();
    }
    
    checkForCatch() {
        const clawRect = this.getClawGrabZone();
        
        for (let cat of this.cats) {
            if (cat.caught) continue;
            
            const catCenterX = cat.x + cat.width / 2;
            const catCenterY = cat.y + cat.height / 2;
            
            // Check if cat is in grab zone
            if (catCenterX >= clawRect.left && catCenterX <= clawRect.right && 
                catCenterY >= clawRect.top && catCenterY <= clawRect.bottom) {
                if (Math.random() < 0.75) {
                    return cat;
                }
            }
        }
        return null;
    }
    
    getClawGrabZone() {
        const areaRect = this.prizeArea.getBoundingClientRect();
        const clawCenterX = (this.clawPosition / 100) * (areaRect.width - 40);
        const grabWidth = 60;
        const grabHeight = 80;
        
        return {
            left: clawCenterX - grabWidth / 2,
            right: clawCenterX + grabWidth / 2,
            top: 150, // claw drop zone
            bottom: 230
        };
    }
    
    catchCat(cat) {
        cat.caught = true;
        this.caughtCats.push(cat.data);
        
        cat.element.classList.add('grabbed');
        
        // Add upward velocity for dramatic effect
        cat.vy = -15;
        cat.vx = (Math.random() - 0.5) * 5;
        
        this.createSuccessEffect();
        
        setTimeout(() => {
            this.updateCaughtDisplay();
            cat.element.style.visibility = 'hidden';
        }, 1500);
    }
    
    createSuccessEffect() {
        // Success explosion
        const success = document.createElement('div');
        success.textContent = '⚡ CAUGHT! ⚡';
        success.style.position = 'fixed';
        success.style.top = '50%';
        success.style.left = '50%';
        success.style.transform = 'translate(-50%, -50%)';
        success.style.fontSize = '28px';
        success.style.color = '#00ff41';
        success.style.fontWeight = 'bold';
        success.style.zIndex = '1000';
        success.style.pointerEvents = 'none';
        success.style.textShadow = '0 0 20px #00ff41';
        
        document.body.appendChild(success);
        
        success.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.3)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1.3)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.7)' }
        ], {
            duration: 2500,
            easing: 'ease-out'
        }).onfinish = () => success.remove();
        
        // Particle burst
        this.createParticleBurst();
    }
    
    createParticleBurst() {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = ['⚡', '✨', '💫', '🔥'][Math.floor(Math.random() * 4)];
                particle.style.position = 'fixed';
                particle.style.top = '50%';
                particle.style.left = '50%';
                particle.style.fontSize = '20px';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '999';
                
                document.body.appendChild(particle);
                
                const angle = (i / 15) * Math.PI * 2;
                const velocity = 150 + Math.random() * 100;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                particle.animate([
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${vx}px), calc(-50% + ${vy}px)) scale(0.5)`, opacity: 0 }
                ], {
                    duration: 1000 + Math.random() * 500,
                    easing: 'ease-out'
                }).onfinish = () => particle.remove();
            }, i * 50);
        }
    }
    
    updateCaughtDisplay() {
        if (this.caughtCats.length === 0) {
            this.caughtDisplay.innerHTML = '<p style="color: rgba(0, 255, 65, 0.6);">No cats caught yet... Try the claw machine!</p>';
            return;
        }
        
        this.caughtDisplay.innerHTML = this.caughtCats.map(cat => 
            `<div class="caught-cat" onclick="window.open('${cat.link}', '_blank')">
                <span style="font-size: 20px; filter: drop-shadow(0 0 5px currentColor);">${cat.emoji}</span>
                <div style="font-size: 12px; margin-top: 5px; color: #00ff41; text-shadow: 0 0 5px #00ff41;">${cat.label}</div>
            </div>`
        ).join('');
    }
    
    addTechEffects() {
        // Add floating tech particles
        setInterval(() => this.createTechParticle(), 1500);
        
        // Add scanning lines to machine
        this.addScanningEffect();
    }
    
    createTechParticle() {
        const particles = ['⚡', '💻', '🔧', '⚙️', '🔋', '📡'];
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight + 'px';
        particle.style.fontSize = '16px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '0';
        particle.style.opacity = '0.4';
        particle.style.color = '#00ff41';
        particle.style.filter = 'drop-shadow(0 0 5px #00ff41)';
        
        document.body.appendChild(particle);
        
        particle.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 0.4 },
            { transform: `translateY(-${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 4000 + 3000,
            easing: 'ease-out'
        }).onfinish = () => particle.remove();
    }
    
    addScanningEffect() {
        // Already added in CSS with ::before pseudo-element
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ClawMachine();
});
