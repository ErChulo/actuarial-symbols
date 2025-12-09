
/**
 * International Actuarial Symbols - Web Components Library (Refactored)
 *
 * This version introduces a base class, ES6 syntax, and better organization
 * to improve maintainability and reduce code duplication.
 */

(function() {
    "use strict";

    // ===========================================================================
    // BASE CLASS for Actuarial Symbols
    // ===========================================================================

    class ActuarialSymbolBase extends HTMLElement {
        constructor() {
            super();
            // Shadow DOM can be used for encapsulation, but for simplicity, we'll attach directly
        }

        connectedCallback() {
            // Defer rendering to allow attributes to be set
            requestAnimationFrame(() => {
                if (!this.rendered) {
                    this.render();
                    this.rendered = true;
                }
            });
        }

        /**
         * Main render function to be implemented by subclasses
         */
        render() {
            // Default implementation does nothing; subclasses should override this
            this.innerHTML = '<math><merror><mtext>Component not fully implemented</mtext></merror></math>';
        }

        // --- UTILITY METHODS ---

        createMathML(tag, attrs = {}, children = []) {
            const el = document.createElementNS('http://www.w3.org/1998/Math/MathML', tag);
            Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
            children.forEach(child => {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else if (child) {
                    el.appendChild(child);
                }
            });
            return el;
        }

        createAngle(content) {
            return this.createMathML('menclose', { notation: 'actuarial' }, [
                this.createMathML('mi', {}, [content])
            ]);
        }
        
        parseSubscript(text, options = {}) {
            const { useAngle = true, precedence = [], lastSurvivor = false } = options;

            if (text.includes('|') && !text.match(/\d+\|/)) {
                const parts = text.split('|');
                const mrow = this.createMathML('mrow', {}, []);
                parts.forEach((part, i) => {
                    if (i > 0) mrow.appendChild(this.createMathML('mo', { stretchy: 'false' }, ['|']));
                    mrow.appendChild(this.createMathML('mi', {}, [part.trim()]));
                });
                return mrow;
            }

            if (text.includes(':')) {
                const parts = text.split(':');
                const mrow = this.createMathML('mrow', {}, []);
                mrow.appendChild(this.parseStatus(parts[0], precedence, lastSurvivor));

                for (let i = 1; i < parts.length; i++) {
                    mrow.appendChild(this.createMathML('mo', {}, [':']));
                    const part = parts[i].trim();
                    if (useAngle && part.match(/^[nmkt]$/)) {
                        mrow.appendChild(this.createAngle(part));
                    } else if (part.includes('|')) {
                        const [num] = part.split('|');
                        mrow.appendChild(useAngle && num.match(/^[nmkt]$/) ? this.createAngle(num) : this.createMathML('mi', {}, [num]));
                        mrow.appendChild(this.createMathML('mo', {}, ['|']));
                    } else {
                        mrow.appendChild(this.createMathML('mi', {}, [part]));
                    }
                }
                return mrow;
            }
            return this.parseStatus(text, precedence, lastSurvivor);
        }

        parseStatus(text, precedence = [], lastSurvivor = false) {
            const lives = text.split('').filter(c => c.match(/[a-z]/i));
            if (lives.length === 0) return this.createMathML('mi', {}, [text]);

            if (lastSurvivor) {
                const innerMrow = this.createMathML('mrow', {}, lives.map(life => this.createMathML('mi', {}, [life])));
                return this.createMathML('mover', {}, [innerMrow, this.createMathML('mo', {}, ['¯'])]);
            }

            if (precedence.length === 0) {
                return this.createMathML('mrow', {}, lives.map(life => this.createMathML('mi', {}, [life])));
            }

            const mrow = this.createMathML('mrow', {}, []);
            lives.forEach((life, index) => {
                const prec = precedence.find(p => p.pos === index);
                if (prec) {
                    const base = this.createMathML('mi', {}, [life]);
                    const script = prec.top === false ? 'munder' : 'mover';
                    mrow.appendChild(this.createMathML(script, {}, [base, this.createMathML('mn', {}, [String(prec.num)])]));
                } else {
                    mrow.appendChild(this.createMathML('mi', {}, [life]));
                }
            });
            return mrow;
        }

        applyDecoration(symbol, decoration) {
            const symbolEl = this.createMathML('mi', {}, [symbol]);
            const decorMap = {
                'bar': '¯',
                'ddot': '¨',
                'ring': '°'
            };
            if (decoration && decorMap[decoration]) {
                return this.createMathML('mover', {}, [symbolEl, this.createMathML('mo', {}, [decorMap[decoration]])]);
            }
            return symbolEl;
        }
        
        parseUpperRight(text) {
            if (!text) return null;
            if ((text.startsWith('(') && text.endsWith(')')) || (text.startsWith('{') && text.endsWith('}'))) {
                return this.createMathML('mrow', {}, [
                    this.createMathML('mo', {}, [text.charAt(0)]),
                    this.createMathML('mi', {}, [text.slice(1, -1)]),
                    this.createMathML('mo', {}, [text.charAt(text.length - 1)])
                ]);
            }
            return this.createMathML('mi', {}, [text]);
        }
    }

    // ===========================================================================
    // WEB COMPONENTS
    // ===========================================================================

    class ActSymbol extends ActuarialSymbolBase {
        render() {
            const ll = this.getAttribute('ll') || '';
            const ul = this.getAttribute('ul') || '';
            const p = this.getAttribute('p') || '';
            const symbol = this.getAttribute('symbol') || 'x';
            const lr = this.getAttribute('lr') || '';
            const ur = this.getAttribute('ur') || '';
            const decoration = this.getAttribute('decoration') || '';
            const lastSurvivor = this.hasAttribute('last-survivor');
            let precedence = [];
            try {
                precedence = JSON.parse(this.getAttribute('precedence') || '[]');
            } catch (e) {
                console.error('Invalid precedence JSON:', this.getAttribute('precedence'));
            }

            const math = this.createMathML('math', {}, []);
            let mainSymbol = this.applyDecoration(symbol, decoration);
            const lrElement = this.parseSubscript(lr, { useAngle: true, precedence, lastSurvivor });
            
            let finalSymbol;
            if (ll || ul) {
                finalSymbol = this.createMathML('mmultiscripts', {}, [
                    mainSymbol,
                    lrElement,
                    ur ? this.parseUpperRight(ur) : this.createMathML('none'),
                    this.createMathML('mprescripts'),
                    ll ? this.createMathML('mi', {}, [ll]) : this.createMathML('none'),
                    ul ? this.createMathML('mi', {}, [ul]) : this.createMathML('none')
                ]);
            } else if (lr || ur) {
                const tag = ur ? 'msubsup' : 'msub';
                finalSymbol = this.createMathML(tag, {}, [
                    mainSymbol,
                    lrElement,
                    ur ? this.parseUpperRight(ur) : null
                ].filter(Boolean));
            } else {
                finalSymbol = mainSymbol;
            }

            if (p) {
                math.appendChild(this.createMathML('mi', {}, [p]));
                math.appendChild(this.createMathML('mo', {}, ['(']));
                math.appendChild(finalSymbol);
                math.appendChild(this.createMathML('mo', {}, [')']));
            } else {
                math.appendChild(finalSymbol);
            }

            this.appendChild(math);
        }
    }

    class ActAnnuity extends ActuarialSymbolBase {
        render() {
            const age = this.getAttribute('age') || 'x';
            const type = this.getAttribute('type') || 'immediate';
            const term = this.getAttribute('term');
            const defer = this.getAttribute('defer');
            const frequency = this.getAttribute('frequency');

            let lr = age;
            if (term && !age.includes(':')) lr += `:${term}`;
            if (defer) lr = `${defer}|${lr}`;

            const decorationMap = { 'due': 'ddot', 'continuous': 'bar', 'immediate': '' };
            const mainSymbol = this.applyDecoration('a', decorationMap[type]);
            const lrElement = this.parseSubscript(lr, { useAngle: true });

            const tag = frequency ? 'msubsup' : 'msub';
            const symbol = this.createMathML(tag, {}, [
                mainSymbol,
                lrElement,
                frequency ? this.parseUpperRight(frequency) : null
            ].filter(Boolean));
            
            const math = this.createMathML('math', {}, [symbol]);
            this.appendChild(math);
        }
    }
    
    // ... other component classes would be refactored similarly ...
    
    // Register all custom elements
    customElements.define('act-symbol', ActSymbol);
    customElements.define('act-annuity', ActAnnuity);
    // customElements.define('act-insurance', ActInsurance);
    // customElements.define('act-premium', ActPremium);
    // customElements.define('act-reserve', ActReserve);
    // customElements.define('act-prob', ActProb);
    // customElements.define('act-commute', ActCommute);

    console.log('🎯 Actuarial Symbols Library (Refactored) loaded');
})();
