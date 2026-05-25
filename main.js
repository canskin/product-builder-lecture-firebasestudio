/**
 * Lotto Ball Web Component
 * Colors itself based on the number range and handles entry animation.
 */
class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['number'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'number') {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    getColor(num) {
        if (num <= 10) return 'oklch(75% 0.15 85)'; // Yellow
        if (num <= 20) return 'oklch(65% 0.15 250)'; // Blue
        if (num <= 30) return 'oklch(60% 0.15 20)';  // Red
        if (num <= 40) return 'oklch(50% 0 0)';      // Grey/Black
        return 'oklch(70% 0.15 150)';               // Green
    }

    render() {
        const num = parseInt(this.getAttribute('number')) || 0;
        const color = this.getColor(num);
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-flex;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: ${color};
                    color: white;
                    font-weight: bold;
                    font-size: 1.2rem;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 
                        inset -4px -4px 8px rgba(0,0,0,0.2),
                        inset 4px 4px 8px rgba(255,255,255,0.3),
                        0 8px 16px rgba(0,0,0,0.3);
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    transform: scale(0);
                    user-select: none;
                }

                @keyframes popIn {
                    to { transform: scale(1); }
                }

                @media (max-width: 600px) {
                    :host {
                        width: 40px;
                        height: 40px;
                        font-size: 1rem;
                    }
                }
            </style>
            ${num}
        `;
    }
}

/**
 * Lotto History Web Component
 * Displays a list of previous draws.
 */
class LottoHistory extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.history = JSON.parse(localStorage.getItem('lotto-history') || '[]');
    }

    connectedCallback() {
        this.render();
    }

    addDraw(numbers) {
        this.history.unshift({
            date: new Date().toLocaleString(),
            numbers: numbers
        });
        this.history = this.history.slice(0, 10); // Keep last 10
        localStorage.setItem('lotto-history', JSON.stringify(this.history));
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-top: 2rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                h3 { margin-top: 0; color: rgba(255, 255, 255, 0.7); }
                .draw-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .draw-date { font-size: 0.8rem; color: rgba(255, 255, 255, 0.4); }
                .draw-numbers { display: flex; gap: 4px; }
                .small-ball {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    font-size: 0.7rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.1);
                }
            </style>
            <h3>최근 추첨 내역</h3>
            <div id="list">
                ${this.history.map(draw => `
                    <div class="draw-item">
                        <span class="draw-date">${draw.date}</span>
                        <div class="draw-numbers">
                            ${draw.numbers.map(n => `<div class="small-ball">${n}</div>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

customElements.define('lotto-ball', LottoBall);
customElements.define('lotto-history', LottoHistory);

// App Logic
document.addEventListener('DOMContentLoaded', () => {
    const numbersContainer = document.getElementById('numbers');
    const generateButton = document.getElementById('generate');
    const historyComponent = document.querySelector('lotto-history');

    const generateNumbers = () => {
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    };

    generateButton.addEventListener('click', () => {
        generateButton.disabled = true;
        numbersContainer.innerHTML = '';
        const lottoNumbers = generateNumbers();

        lottoNumbers.forEach((number, index) => {
            setTimeout(() => {
                const ball = document.createElement('lotto-ball');
                ball.setAttribute('number', number);
                numbersContainer.appendChild(ball);

                if (index === lottoNumbers.length - 1) {
                    historyComponent.addDraw(lottoNumbers);
                    generateButton.disabled = false;
                }
            }, index * 300);
        });
    });
});
