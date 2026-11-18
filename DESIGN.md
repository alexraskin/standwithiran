---
name: Stand With Iran
description: A quiet bilingual editorial resource supporting the people of Iran.
colors:
  primary: "#851a2b"
  primary-hover: "#681322"
  paper: "#f6efe4"
  ink: "#271e20"
  muted: "#655550"
  rule: "#d9cbbb"
  code-paper: "#ebdfcf"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2.7rem, 6vw, 4.1rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(2.2rem, 5vw, 3.2rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.4rem"
    fontWeight: 500
    lineHeight: 1.35
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.8
  body-fa:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.8
  headline-fa:
    fontFamily: "Vazirmatn, Tahoma, sans-serif"
    fontSize: "clamp(1.9rem, 5vw, 2.7rem)"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: ".8rem"
    lineHeight: 1.7
spacing:
  content-padding: "28px"
  content-padding-mobile: "20px"
  editorial-gap: "1.4rem"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    padding: ".45em .8em"
  button-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
  link:
    textColor: "{colors.primary}"
  navigation:
    textColor: "{colors.muted}"
    padding: "1.1rem 0"
  record:
    padding: "1.5rem 0 1.8rem"
  timeline-entry:
    padding: "1.4rem 0"
---

# Design System: Stand With Iran

## Overview

**Creative North Star: "Quiet editorial"**

A quiet editorial style: warm paper, burgundy links, serif headings, and a narrow reading column, with full Farsi support. The design extends Archie through typography, spacing, and restrained rules so historical context, memorial records, and independent sources remain easy to read.

English uses Newsreader headings and the intentionally retained Inter body face. Farsi uses Vazirmatn with right-to-left layout and explicit direction for mixed-language content. The implementation and rendered pages are the visual authority; no generated composition defines this system.

**Key Characteristics:**

- Warm paper and burgundy accents.
- A centered reading column with ruled editorial lists.
- Local fonts and language-aware typography.

## Colors

Burgundy is the sole accent; warm neutrals carry the page. Sidecar tonal ramps are synthesized preview aids, not additional site colors.

### Primary

- **Burgundy** (`primary`): links, focus outlines, the top page rule, and bilingual slogan accents.
- **Deep burgundy** (`primary-hover`): link hover state.

### Neutral

- **Warm paper** (`paper`): page background and reversed button text.
- **Dark ink** (`ink`): body text and wordmark.
- **Muted brown** (`muted`): descriptions, dates, metadata, and navigation.
- **Pale rule** (`rule`): thin separators and table borders.
- **Inset paper** (`code-paper`): inherited code backgrounds and table shading.

## Typography

All three typefaces are served locally with font-display swap. Heading weights are medium; paragraph line height is generous. Section headings use Newsreader at 1.85rem. The wordmark stays in Newsreader in both languages. Navigation is .88rem; metadata uses the label role.

Farsi switches both body and heading families to Vazirmatn. Its first four heading levels use line height 1.6 and zero letter spacing. The homepage display size overrides the ordinary page-title size in both languages. English passages and names retain their Latin font and explicit left-to-right direction inside Farsi pages.

## Layout

The centered container has a maximum outer width of 850px, including its horizontal padding. Introductory descriptions stop at 65ch. Header navigation wraps onto a full-width row below the wordmark and language switch. A thin burgundy rule spans the top of the viewport.

At 600px and below, base text becomes 16px and container padding uses the mobile token. Index entries and timeline entries become one column; figures change from two columns to one, while counters change from four columns to two. Above that breakpoint, index labels occupy 13rem and timeline years 6.5rem, followed by the editorial gap and flexible text. Use logical inline/block properties so these arrangements follow reading direction.

## Elevation & Depth

The main editorial surfaces are flat, separated by space and fine rules. There are no card shadows in the custom layouts. Archie's table styling retains a subtle shadow, recorded in the sidecar; it is not a general surface treatment. Inherited body and link color transitions last .2s with ease. Reduced-motion preferences disable transitions and smooth scrolling.

## Shapes

The dominant shapes are straight rules and open text rows. The copy-link button has a thin outline and no custom radius. Inherited images and preformatted blocks retain Archie's 5px rounding, and inline code uses 3px rounding; these are not a card system.

## Components

- **Links:** underlined burgundy text; hover darkens the text and thickens the underline. Visible keyboard focus uses a 2px outline offset by 5px.
- **Copy-link button:** transparent with burgundy outline; hover reverses to burgundy fill and paper text. A separate live status region reports the result.
- **Navigation:** muted text with wrapping links; the current page is burgundy with a thicker underline. Keep the language switch independently available.
- **Memorial records:** open articles with a bottom rule, heading, alternate Farsi name, metadata, narrative, and source link. Mixed-language names and sources retain their direction attributes.
- **Timeline entries:** date column alongside a heading and paragraph; a bottom rule separates entries, except the last.
- **Figures and counters:** tabular numerals, generous type, and muted labels. Preserve their responsive grids.

## Do's and Don'ts

### Do

- Do use logical spacing and explicit language/direction for bilingual passages.
- Do retain visible link underlines, keyboard focus, and the skip link.
- Do reuse the existing reading column and ruled list patterns.

### Don't

- Don't replace the editorial lists with decorative cards.
- Don't force Latin typography or negative letter spacing onto Farsi headings.
- Don't replace Inter solely to satisfy a generic font detector.

Source: `assets/css/standwithiran.css`, layered after `assets/css/archie.css`, and root `layouts/`. Review captures live in `.impeccable/review/` for English and Farsi at 1280px and 390px.
