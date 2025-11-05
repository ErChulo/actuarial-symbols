/**

- International Actuarial Symbols - Web Components Library
- Based on actuarialsymbol.dtx v1.1
- 
- Usage:
- <script src="https://cdn.jsdelivr.net/gh/yourusername/actuarial-symbols@main/actuarial-symbols.js"></script>
- 
- Then use in HTML:
- <act-symbol symbol="A" lr="x"></act-symbol>
- <act-annuity age="x" term="n" type="due"></act-annuity>
- <act-insurance age="x" term="n"></act-insurance>
- <act-premium benefit="A" age="x:n"></act-premium>
  */

(function() {
"use strict";


// Utility: Create MathML elements
function createMathML(tag, attrs = {}, children = []) {
    const el = document.createElementNS('http://www.w3.org/1998/Math/MathML', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    children.forEach(child => {
        if (typeof child === 'string') {
            el.textContent = child;
        } else if (child) {
            el.appendChild(child);
        }
    });
    return el;
}

// Create actuarial angle: ⌉n⌉
function createAngle(content) {
    return createMathML('menclose', {notation: 'actuarial'}, [
        createMathML('mi', {}, [content])
    ]);
}

// Parse subscript with special handling for durations, joint lives, etc.
function parseSubscript(text, options = {}) {
    const { useAngle = true, precedence = [], lastSurvivor = false } = options;

    // Reversionary annuity: x|y
    if (text.includes('|') && !text.match(/\d+\|/)) {
        const parts = text.split('|');
        const mrow = createMathML('mrow', {}, []);
        parts.forEach((part, i) => {
            if (i > 0) mrow.appendChild(createMathML('mo', {stretchy: 'false'}, ['|']));
            mrow.appendChild(createMathML('mi', {}, [part.trim()]));
        });
        return mrow;
    }

    // Duration notation: x:n or x:y:n
    if (text.includes(':')) {
        const parts = text.split(':');
        const mrow = createMathML('mrow', {}, []);
        
        // First part: status (might have precedence/last survivor)
        mrow.appendChild(parseStatus(parts[0], precedence, lastSurvivor));
        
        // Remaining parts: durations
        for (let i = 1; i < parts.length; i++) {
            mrow.appendChild(createMathML('mo', {}, [':']));
            const part = parts[i].trim();
            
            // Apply angle to duration letters
            if (useAngle && part.match(/^[nmkt]$/)) {
                mrow.appendChild(createAngle(part));
            } else if (part.includes('|')) {
                // Deferred: n|
                const [num] = part.split('|');
                if (useAngle && num.match(/^[nmkt]$/)) {
                    mrow.appendChild(createAngle(num));
                } else {
                    mrow.appendChild(createMathML('mi', {}, [num]));
                }
                mrow.appendChild(createMathML('mo', {}, ['|']));
            } else {
                mrow.appendChild(createMathML('mi', {}, [part]));
            }
        }
        return mrow;
    }

    // Simple status
    return parseStatus(text, precedence, lastSurvivor);
}

// Parse status with precedence numbers and last survivor notation
function parseStatus(text, precedence = [], lastSurvivor = false) {
    const lives = text.split('').filter(c => c.match(/[a-z]/i));
    
    if (lives.length === 0) {
        return createMathML('mi', {}, [text]);
    }

    // Last survivor: overline over all lives
    if (lastSurvivor) {
        const innerMrow = createMathML('mrow', {}, []);
        lives.forEach(life => {
            innerMrow.appendChild(createMathML('mi', {}, [life]));
        });
        return createMathML('mover', {}, [
            innerMrow,
            createMathML('mo', {}, ['¯'])
        ]);
    }

    // No precedence: simple list
    if (precedence.length === 0) {
        if (lives.length === 1) {
            return createMathML('mi', {}, [lives[0]]);
        }
        const mrow = createMathML('mrow', {}, []);
        lives.forEach(life => {
            mrow.appendChild(createMathML('mi', {}, [life]));
        });
        return mrow;
    }

    // With precedence numbers
    const mrow = createMathML('mrow', {}, []);
    lives.forEach((life, index) => {
        const prec = precedence.find(p => p.pos === index);
        if (prec) {
            const base = createMathML('mi', {}, [life]);
            if (prec.top === false) {
                // Bottom precedence
                mrow.appendChild(createMathML('munderover', {}, [
                    base,
                    createMathML('mn', {}, [String(prec.num)]),
                    createMathML('none', {}, [])
                ]));
            } else {
                // Top precedence (default)
                mrow.appendChild(createMathML('munderover', {}, [
                    base,
                    createMathML('none', {}, []),
                    createMathML('mn', {}, [String(prec.num)])
                ]));
            }
        } else {
            mrow.appendChild(createMathML('mi', {}, [life]));
        }
    });
    return mrow;
}

// Apply decoration to symbol (bar, ddot, ring)
function applyDecoration(symbol, decoration) {
    const symbolEl = createMathML('mi', {}, [symbol]);
    
    if (decoration === 'bar') {
        return createMathML('mover', {}, [symbolEl, createMathML('mo', {}, ['¯'])]);
    } else if (decoration === 'ddot') {
        return createMathML('mover', {}, [symbolEl, createMathML('mo', {}, ['¨'])]);
    } else if (decoration === 'ring') {
        return createMathML('mover', {}, [symbolEl, createMathML('mo', {}, ['°'])]);
    }
    return symbolEl;
}

// Parse upper-right superscript (handles parentheses)
function parseUpperRight(text) {
    if (!text) return null;
    
    // Check if it's wrapped in parens or braces
    if ((text.startsWith('(') && text.endsWith(')')) || 
        (text.startsWith('{') && text.endsWith('}'))) {
        return createMathML('mrow', {}, [
            createMathML('mo', {}, [text.charAt(0)]),
            createMathML('mi', {}, [text.slice(1, -1)]),
            createMathML('mo', {}, [text.charAt(text.length - 1)])
        ]);
    }
    return createMathML('mi', {}, [text]);
}

// ============================================================================
// WEB COMPONENTS
// ============================================================================

/**
 * <act-symbol> - Generic actuarial symbol with 4-corner notation
 * 
 * Implements: \actsymb[ll][ul][P]{symbol}{lr}[ur]
 * 
 * Attributes:
 *   ll          - Lower-left subscript
 *   ul          - Upper-left superscript  
 *   p           - Premium/Reserve symbol (P, V, W)
 *   symbol      - Main symbol (required)
 *   lr          - Lower-right subscript (required)
 *   ur          - Upper-right superscript
 *   decoration  - 'bar', 'ddot', or 'ring'
 *   precedence  - JSON array: [{pos: 0, num: 1, top: true}, ...]
 *   last-survivor - Boolean attribute
 */
class ActSymbol extends HTMLElement {
    connectedCallback() {
        const ll = this.getAttribute('ll') || '';
        const ul = this.getAttribute('ul') || '';
        const p = this.getAttribute('p') || '';
        const symbol = this.getAttribute('symbol') || '';
        const lr = this.getAttribute('lr') || '';
        const ur = this.getAttribute('ur') || '';
        const decoration = this.getAttribute('decoration') || '';
        const lastSurvivor = this.hasAttribute('last-survivor');
        
        let precedence = [];
        try {
            const precAttr = this.getAttribute('precedence');
            if (precAttr) precedence = JSON.parse(precAttr);
        } catch (e) {}

        const math = createMathML('math', {}, []);
        let mainSymbol = applyDecoration(symbol, decoration);

        const lrElement = parseSubscript(lr, {
            useAngle: true,
            precedence,
            lastSurvivor
        });

        // Handle left scripts
        if (ll || ul) {
            const scripts = createMathML('mmultiscripts', {}, [mainSymbol]);
            scripts.appendChild(lrElement);
            scripts.appendChild(ur ? parseUpperRight(ur) : createMathML('none', {}, []));
            scripts.appendChild(createMathML('mprescripts', {}, []));
            scripts.appendChild(ll ? createMathML('mi', {}, [ll]) : createMathML('none', {}, []));
            scripts.appendChild(ul ? createMathML('mi', {}, [ul]) : createMathML('none', {}, []));
            mainSymbol = scripts;
        } else if (lr || ur) {
            // Only right scripts
            if (ur) {
                mainSymbol = createMathML('msubsup', {}, [
                    mainSymbol,
                    lrElement,
                    parseUpperRight(ur)
                ]);
            } else {
                mainSymbol = createMathML('msub', {}, [mainSymbol, lrElement]);
            }
        }

        // Premium/Reserve wrapper
        if (p) {
            math.appendChild(createMathML('mi', {}, [p]));
            math.appendChild(createMathML('mo', {}, ['(']));
            math.appendChild(mainSymbol);
            math.appendChild(createMathML('mo', {}, [')']));
        } else {
            math.appendChild(mainSymbol);
        }

        this.appendChild(math);
    }
}

/**
 * <act-annuity> - Life annuity symbols
 * 
 * Implements shortcuts like: \ax**, \ax*, \ax
 * 
 * Attributes:
 *   age       - Status (e.g., "x", "x:n", "xy")
 *   type      - 'due' (ä), 'immediate' (a), 'continuous' (ā)
 *   term      - Optional term duration (overrides if in age)
 *   defer     - Optional deferral period
 *   frequency - Optional: '(m)' for mthly
 */
class ActAnnuity extends HTMLElement {
    connectedCallback() {
        let age = this.getAttribute('age') || 'x';
        const type = this.getAttribute('type') || 'immediate';
        const term = this.getAttribute('term');
        const defer = this.getAttribute('defer');
        const frequency = this.getAttribute('frequency');

        // Build subscript
        let lr = age;
        if (term && !age.includes(':')) lr += ':' + term;
        if (defer) lr = defer + '|' + lr;

        const decorationMap = {
            'due': 'ddot',
            'continuous': 'bar',
            'immediate': ''
        };

        const symbol = createMathML('math', {}, []);
        const mainSymbol = applyDecoration('a', decorationMap[type]);
        const lrElement = parseSubscript(lr, {useAngle: true});

        if (frequency) {
            const sub = createMathML('msubsup', {}, [
                mainSymbol,
                lrElement,
                parseUpperRight(frequency)
            ]);
            symbol.appendChild(sub);
        } else {
            symbol.appendChild(createMathML('msub', {}, [mainSymbol, lrElement]));
        }

        this.appendChild(symbol);
    }
}

/**
 * <act-insurance> - Life insurance symbols
 * 
 * Implements: \Ax, \Ax*, etc.
 * 
 * Attributes:
 *   age       - Status (e.g., "x", "x:n")
 *   type      - 'whole', 'term', 'endowment', 'pure-endowment'
 *   payment   - 'eoy' (end of year), 'continuous'
 *   term      - Optional term
 *   frequency - Optional: '(m)'
 */
class ActInsurance extends HTMLElement {
    connectedCallback() {
        let age = this.getAttribute('age') || 'x';
        const type = this.getAttribute('type') || 'whole';
        const payment = this.getAttribute('payment') || 'eoy';
        const term = this.getAttribute('term');
        const frequency = this.getAttribute('frequency');

        let lr = age;
        if (term && !age.includes(':')) lr += ':' + term;

        const decoration = payment === 'continuous' ? 'bar' : '';
        const math = createMathML('math', {}, []);
        let mainSymbol = applyDecoration('A', decoration);
        const lrElement = parseSubscript(lr, {useAngle: true});

        // Handle different insurance types
        if (type === 'term') {
            const sub = createMathML('msubsup', {}, [
                mainSymbol,
                lrElement,
                createMathML('mn', {}, ['1'])
            ]);
            if (frequency) {
                math.appendChild(createMathML('msubsup', {}, [
                    sub,
                    createMathML('none', {}, []),
                    parseUpperRight(frequency)
                ]));
            } else {
                math.appendChild(sub);
            }
        } else if (type === 'pure-endowment') {
            const scripts = createMathML('mmultiscripts', {}, [mainSymbol]);
            scripts.appendChild(lrElement);
            scripts.appendChild(createMathML('none', {}, []));
            scripts.appendChild(createMathML('mprescripts', {}, []));
            scripts.appendChild(term ? createMathML('mi', {}, [term]) : createMathML('none', {}, []));
            scripts.appendChild(createMathML('none', {}, []));
            math.appendChild(scripts);
        } else {
            // Whole or endowment
            if (frequency) {
                math.appendChild(createMathML('msubsup', {}, [
                    mainSymbol,
                    lrElement,
                    parseUpperRight(frequency)
                ]));
            } else {
                math.appendChild(createMathML('msub', {}, [mainSymbol, lrElement]));
            }
        }

        this.appendChild(math);
    }
}

/**
 * <act-premium> - Premium symbols P(benefit)
 * 
 * Attributes:
 *   benefit   - The benefit symbol content (e.g., "A", "a")
 *   age       - Status
 *   payment   - 'annual', 'continuous'
 *   duration  - Optional: duration k for kth premium
 */
class ActPremium extends HTMLElement {
    connectedCallback() {
        const benefit = this.getAttribute('benefit') || 'A';
        const age = this.getAttribute('age') || 'x';
        const payment = this.getAttribute('payment') || 'annual';
        const duration = this.getAttribute('duration');

        const math = createMathML('math', {}, []);
        
        // P or P̄
        let pSymbol = applyDecoration('P', payment === 'continuous' ? 'bar' : '');
        
        // Add duration as left subscript if provided
        if (duration) {
            const scripts = createMathML('mmultiscripts', {}, [pSymbol]);
            scripts.appendChild(createMathML('none', {}, []));
            scripts.appendChild(createMathML('none', {}, []));
            scripts.appendChild(createMathML('mprescripts', {}, []));
            scripts.appendChild(createMathML('mi', {}, [duration]));
            scripts.appendChild(createMathML('none', {}, []));
            pSymbol = scripts;
        }

        math.appendChild(pSymbol);
        math.appendChild(createMathML('mo', {}, ['(']));
        
        // Benefit symbol
        const benefitSymbol = applyDecoration(benefit, payment === 'continuous' ? 'bar' : '');
        const lrElement = parseSubscript(age, {useAngle: true});
        math.appendChild(createMathML('msub', {}, [benefitSymbol, lrElement]));
        
        math.appendChild(createMathML('mo', {}, [')']));

        this.appendChild(math);
    }
}

/**
 * <act-reserve> - Reserve symbols V(benefit)
 * 
 * Attributes:
 *   benefit   - The benefit symbol
 *   age       - Status
 *   duration  - Time k
 *   payment   - 'annual', 'continuous'
 */
class ActReserve extends HTMLElement {
    connectedCallback() {
        const benefit = this.getAttribute('benefit') || 'A';
        const age = this.getAttribute('age') || 'x';
        const duration = this.getAttribute('duration') || 'k';
        const payment = this.getAttribute('payment') || 'annual';

        const math = createMathML('math', {}, []);
        
        let vSymbol = applyDecoration('V', payment === 'continuous' ? 'bar' : '');
        
        // Add duration as left subscript
        const scripts = createMathML('mmultiscripts', {}, [vSymbol]);
        scripts.appendChild(createMathML('none', {}, []));
        scripts.appendChild(createMathML('none', {}, []));
        scripts.appendChild(createMathML('mprescripts', {}, []));
        scripts.appendChild(createMathML('mi', {}, [duration]));
        scripts.appendChild(createMathML('none', {}, []));

        math.appendChild(scripts);
        math.appendChild(createMathML('mo', {}, ['(']));
        
        const benefitSymbol = applyDecoration(benefit, payment === 'continuous' ? 'bar' : '');
        const lrElement = parseSubscript(age, {useAngle: true});
        math.appendChild(createMathML('msub', {}, [benefitSymbol, lrElement]));
        
        math.appendChild(createMathML('mo', {}, [')']));

        this.appendChild(math);
    }
}

/**
 * <act-prob> - Probability symbols (p, q)
 * 
 * Attributes:
 *   age       - Status (e.g., "x")
 *   time      - Time period t
 *   type      - 'survival' (p) or 'mortality' (q)
 *   defer     - Optional deferral
 */
class ActProb extends HTMLElement {
    connectedCallback() {
        const age = this.getAttribute('age') || 'x';
        const time = this.getAttribute('time') || 't';
        const type = this.getAttribute('type') || 'survival';
        const defer = this.getAttribute('defer');

        const math = createMathML('math', {}, []);
        const symbol = type === 'mortality' ? 'q' : 'p';
        
        let ll = time;
        if (defer) ll = defer + '|' + ll;

        const scripts = createMathML('mmultiscripts', {}, [createMathML('mi', {}, [symbol])]);
        scripts.appendChild(createMathML('mi', {}, [age]));
        scripts.appendChild(createMathML('none', {}, []));
        scripts.appendChild(createMathML('mprescripts', {}, []));
        scripts.appendChild(createMathML('mi', {}, [ll]));
        scripts.appendChild(createMathML('none', {}, []));

        math.appendChild(scripts);
        this.appendChild(math);
    }
}

/**
 * <act-commute> - Commutation functions (D, N, C, M, S, R)
 * 
 * Attributes:
 *   func      - Function letter (D, N, C, M, S, R)
 *   age       - Status
 */
class ActCommute extends HTMLElement {
    connectedCallback() {
        const func = this.getAttribute('func') || 'D';
        const age = this.getAttribute('age') || 'x';

        const math = createMathML('math', {}, []);
        math.appendChild(createMathML('msub', {}, [
            createMathML('mi', {}, [func]),
            createMathML('mi', {}, [age])
        ]));

        this.appendChild(math);
    }
}

// Register all custom elements
customElements.define('act-symbol', ActSymbol);
customElements.define('act-annuity', ActAnnuity);
customElements.define('act-insurance', ActInsurance);
customElements.define('act-premium', ActPremium);
customElements.define('act-reserve', ActReserve);
customElements.define('act-prob', ActProb);
customElements.define('act-commute', ActCommute);

console.log('🎯 Actuarial Symbols Library loaded');
})();
