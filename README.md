Ah! Got it — you want **everything in a single, self-contained Markdown file**, no sections split across multiple files. Here’s the full README as **one Markdown file** you can copy-paste:

````markdown
# International Actuarial Symbols - Web Components Library

A web components library for displaying **actuarial symbols** with MathML, including life annuities, insurances, premiums, reserves, probabilities, and commutation functions.  

Based on `actuarialsymbol.dtx v1.1`.

---

## CDN Installation

Include the library in your HTML:

```html
<script src="https://cdn.jsdelivr.net/gh/yourusername/actuarial-symbols@main/actuarial-symbols.js"></script>
````

---

## Components & Usage

### `<act-symbol>`

Generic actuarial symbol with 4-corner notation.

**Attributes:**

| Attribute       | Description                                      |
| --------------- | ------------------------------------------------ |
| `ll`            | Lower-left subscript                             |
| `ul`            | Upper-left superscript                           |
| `p`             | Premium/Reserve wrapper (P, V, W)                |
| `symbol`        | Main symbol (required)                           |
| `lr`            | Lower-right subscript (required)                 |
| `ur`            | Upper-right superscript                          |
| `decoration`    | `'bar'`, `'ddot'`, `'ring'`                      |
| `precedence`    | JSON array: `[{pos: 0, num: 1, top: true}, ...]` |
| `last-survivor` | Boolean attribute                                |

**Example:**

```html
<act-symbol symbol="A" lr="x"></act-symbol>
<act-symbol symbol="a" ll="i" ul="j" lr="x:n" ur="(m)" decoration="ddot"></act-symbol>
<act-symbol symbol="P" lr="x" p="P"></act-symbol>
```

---

### `<act-annuity>`

Life annuity symbols.

**Attributes:**

| Attribute   | Description                                        |
| ----------- | -------------------------------------------------- |
| `age`       | Status, e.g., `x`, `x:n`, `xy`                     |
| `type`      | `'due'` (ä), `'immediate'` (a), `'continuous'` (ā) |
| `term`      | Optional term duration (overrides if in age)       |
| `defer`     | Optional deferral period                           |
| `frequency` | Optional, e.g., `(m)` for monthly                  |

**Example:**

```html
<act-annuity age="x" type="due"></act-annuity>
<act-annuity age="x:10" type="continuous" defer="5" frequency="(m)"></act-annuity>
```

---

### `<act-insurance>`

Life insurance symbols.

**Attributes:**

| Attribute   | Description                                            |
| ----------- | ------------------------------------------------------ |
| `age`       | Status, e.g., `x`, `x:n`                               |
| `type`      | `'whole'`, `'term'`, `'endowment'`, `'pure-endowment'` |
| `payment`   | `'eoy'` (end of year) or `'continuous'`                |
| `term`      | Optional term                                          |
| `frequency` | Optional, e.g., `(m)`                                  |

**Example:**

```html
<act-insurance age="x" type="whole"></act-insurance>
<act-insurance age="x:10" type="term" payment="continuous"></act-insurance>
```

---

### `<act-premium>`

Premium symbols `P(benefit)`.

**Attributes:**

| Attribute  | Description                        |
| ---------- | ---------------------------------- |
| `benefit`  | The benefit symbol, e.g., `A`, `a` |
| `age`      | Status                             |
| `payment`  | `'annual'` or `'continuous'`       |
| `duration` | Optional, for kth premium          |

**Example:**

```html
<act-premium benefit="A" age="x:n" payment="annual"></act-premium>
<act-premium benefit="a" age="x:10" payment="continuous" duration="5"></act-premium>
```

---

### `<act-reserve>`

Reserve symbols `V(benefit)`.

**Attributes:**

| Attribute  | Description                  |
| ---------- | ---------------------------- |
| `benefit`  | The benefit symbol           |
| `age`      | Status                       |
| `duration` | Time k                       |
| `payment`  | `'annual'` or `'continuous'` |

**Example:**

```html
<act-reserve benefit="A" age="x" duration="k"></act-reserve>
<act-reserve benefit="a" age="x:10" payment="continuous"></act-reserve>
```

---

### `<act-prob>`

Probability symbols `p` (survival) or `q` (mortality).

**Attributes:**

| Attribute | Description                           |
| --------- | ------------------------------------- |
| `age`     | Status, e.g., `x`                     |
| `time`    | Time period, e.g., `t`                |
| `type`    | `'survival'` (p) or `'mortality'` (q) |
| `defer`   | Optional deferral                     |

**Example:**

```html
<act-prob age="x" time="1" type="survival"></act-prob>
<act-prob age="x" time="5" type="mortality" defer="2"></act-prob>
```

---

### `<act-commute>`

Commutation functions: `D, N, C, M, S, R`.

**Attributes:**

| Attribute | Description                |
| --------- | -------------------------- |
| `func`    | Function letter, e.g., `D` |
| `age`     | Status, e.g., `x`          |

**Example:**

```html
<act-commute func="D" age="x"></act-commute>
<act-commute func="C" age="x:10"></act-commute>
```

---

## Notes

* All components use **MathML** internally for proper actuarial notation rendering.
* Supports **4-corner notation**, **deferred lives**, **last survivor** notation, **decorations** (bar, double dot, ring), and frequency/term specifications.
* Can be combined to build actuarial tables or formulas in HTML.

---

🎯 **Library loaded successfully!**

```

This is **a single Markdown file** — no splits, no multiple files — everything in one `README.md`.  

If you want, I can also **append a full “demo table” showing every component visually in HTML** directly inside the Markdown. It would make it immediately testable in a browser. Do you want me to do that?
```
