
# 🎯 Actuarial Symbols - Web Components Library

A zero-dependency, drop-in web component library for displaying international actuarial notation using native MathML.

This library allows you to write actuarial symbols directly in your HTML using easy-to-read custom elements. The browser handles the rendering via MathML, ensuring high-quality, scalable symbols.

## 🚀 Installation & Usage

### Local Development

For testing or local development, simply download `actuarial-symbols.refactored.js` and include it in your project.

```html
<script src="actuarial-symbols.refactored.js"></script>
```

### ☁️ Production via CDN

For live websites, it is highly recommended to load the script from a CDN. This improves performance and reduces load on your server. Once you push your project to a GitHub repository, you can use [jsDelivr](https://www.jsdelivr.com/) to serve the file directly.

Assuming your GitHub username is **ErChulo** and your repository is named **actuarial-symbols**, you can use the following link:

```html
<!-- Note: Replace 'actuarial-symbols' with your actual repository name -->
<script src="https://cdn.jsdelivr.net/gh/ErChulo/actuarial-symbols@latest/actuarial-symbols.refactored.js"></script>
```

**Note on Versioning:** Using `@latest` is convenient for development as it always pulls the most recent file from your `main` branch. For production environments, it is best practice to lock to a specific release version (e.g., `@1.0.0`) to prevent unexpected changes from breaking your site.


## 💡 Core Concept

The library works by defining a set of custom HTML elements (Web Components) that represent common actuarial symbols. You use these elements like any other HTML tag, and you configure them using attributes.

For example, to show an annuity-due for a life aged 45, you would write:

```html
<act-annuity age="45" type="due"></act-annuity>
```

This is much easier to write and read than the equivalent MathML or LaTeX.

## 📚 Component Reference

Here is a guide to the primary components and their most common attributes.

---

### `<act-annuity>`

Used for all types of annuities.

| Attribute | Description | Example | Renders As |
| :--- | :--- | :--- | :--- |
| `age` | The age of the annuitant(s). | `<act-annuity age="x"></act-annuity>` | <act-annuity age="x"></act-annuity> |
| `type` | The type of annuity. Can be `immediate` (default), `due`, or `continuous`. | `<act-annuity age="x" type="due"></act-annuity>` | <act-annuity age="x" type="due"></act-annuity> |
| `term` | The term of the annuity, added to the age subscript. | `<act-annuity age="x" term="n"></act-annuity>` | <act-annuity age="x:n"></act-annuity> |
| `defer` | The deferral period. | `<act-annuity age="x" defer="m"></act-annuity>` | <act-annuity age="x" defer="m"></act-annuity> |
| `frequency`| Payments per year (e.g., monthly). | `<act-annuity age="x" type="due" frequency="(12)"></act-annuity>` | <act-annuity age="x" type="due" frequency="(12)"></act-annuity> |
| `age` | Can also handle joint-life status. | `<act-annuity age="xy" type="due"></act-annuity>` | <act-annuity age="xy" type="due"></act-annuity> |

---

### `<act-insurance>`

Used for life insurance benefits.

| Attribute | Description | Example | Renders As |
| :--- | :--- | :--- | :--- |
| `age` | The age of the insured(s). | `<act-insurance age="x"></act-insurance>` | <act-insurance age="x"></act-insurance> |
| `payment` | Timing of payment. Can be `eoy` (end-of-year, default) or `continuous`. | `<act-insurance age="x" payment="continuous"></act-insurance>` | <act-insurance age="x" payment="continuous"></act-insurance> |
| `type` | Type of insurance. Can be `whole` (default), `term`, `endowment`, or `pure-endowment`. | `<act-insurance age="x:n" type="term"></act-insurance>` | <act-insurance age="x:n" type="term"></act-insurance> |

---

### `<act-premium>` and `<act-reserve>`

Used for premiums and reserves.

| Component | Attribute | Description | Example |
| :--- | :--- | :--- | :--- |
| `<act-premium>` | `benefit` | The benefit symbol (e.g., A). | `<act-premium benefit="A" age="x"></act-premium>` |
| `<act-premium>` | `payment` | `annual` (default) or `continuous`. | `<act-premium benefit="A" age="x" payment="continuous"></act-premium>` |
| `<act-reserve>` | `duration` | The duration at which the reserve is calculated. | `<act-reserve benefit="A" age="x" duration="k"></act-reserve>` |

---

### 🐲 The Generic `<act-symbol>`

For ultimate flexibility, `<act-symbol>` allows you to construct almost any symbol by controlling its individual parts.

```
      ul     ur
        \   /
     ll--P(S)--lr
```

| Attribute | Position | Example |
| :--- | :--- | :--- |
| `symbol` | The main symbol (S). | `symbol="A"` |
| `lr` | **L**ower **R**ight subscript. | `lr="x:n"` |
| `ur` | **U**pper **R**ight superscript. | `ur="(12)"` |
| `ll` | **L**ower **L**eft prescript. | `ll="t"` |
| `ul` | **U**pper **L**eft prescript. | `ul="k"` |
| `p` | The premium symbol (P). | `p="P"` |
| `decoration`| Adds a decoration over the symbol. Can be `bar`, `ddot`, or `ring`. | `decoration="bar"` |
| `last-survivor`| Renders the subscript with a bar over it for last survivor status. | `last-survivor` |

**Example:**
`<act-symbol ll="t" ul="k" p="P" symbol="A" lr="xy" ur="(m)" decoration="bar" last-survivor></act-symbol>`

---

##  Putting It All Together: An Example

You can combine these components with standard MathML to create complex formulas. Here is the equivalence principle equation:

```html
<div style="display: flex; align-items: center; justify-content: center; font-size: 1.2em; gap: 0.5em;">
    <act-premium benefit="A" age="x"></act-premium>
    <math><mo>&times;</mo></math>
    <act-annuity age="x" type="due"></act-annuity>
    <math><mo>=</mo></math>
    <act-insurance age="x"></act-insurance>
</div>
```

## 🌐 Browser Support

This library relies on modern browsers\' native support for MathML Core.

- ✅ **Chrome 109+**
- ✅ **Edge 109+**
- ✅ **Firefox (all recent versions)**
- ✅ **Safari (all recent versions)**

**Note on the "Actuarial Angle":** The `|n` term symbol (annuity-certain) uses a polyfill to ensure it renders consistently across all browsers, as Chrome\'s native support for this specific MathML feature is lacking. The appearance may vary slightly between browsers but will be visually correct.
