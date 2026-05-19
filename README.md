# Nelson's Digital Workshop & Portfolio 🚀

Welcome to my personal website, hosted on GitHub Pages at [ncray.github.io](https://ncray.github.io). 

This repository serves as a personal travel blog and a showcase of interactive client-side games, utilities, and developer projects. It is built using **Jekyll** with a premium, custom slate-glassmorphism theme overriding the default styling.

---

## 🛠️ Crafted Projects

The site hosts multiple standalone interactive applications in the `projects/` directory:

1. **🇯🇵 Japan Trip Planner 2026 (`/projects/japan-trip/`)**
   - *Description*: A comprehensive, toddler-friendly itinerary planner designed for a 16-day family adventure across Tokyo, Hakone, Atami, and Odaiba.
   - *Features*: Interactive OpenStreetMap integration (via Leaflet.js), custom phase marker pins, and detailed, expandable transit logistics tables (with auto USD/JPY conversion).
   - *Scripts*: Includes automated Python image-sourcing scripts that search for representative tourist photos and compress them for ideal performance (<200KB).

2. **🧠 Number Sense Game (`/projects/number_sense/`)**
   - *Description*: An engaging, interactive mental arithmetic game to hone calculation speed, focus, and numerical agility.

3. **👔 Personal Board of Directors (`/projects/personal_bod`)**
   - *Description*: A decision-making simulator powered by Westeros characters, giving you customized, humorous advice based on your queries.

4. **🗣️ AAC Editor (`/projects/aac/`)**
   - *Description*: An Augmentative and Alternative Communication helper board builder, designed to assist toddler and adult accessibility speech.

5. **🖼️ Local Image Compressor (`/projects/image_compressor/`)**
   - *Description*: A secure, client-side browser utility for lightning-fast image compression and optimization before upload.

---

## 🇯🇵 Japan Trip Image-Sourcing Script Setup

The automated image sourcing system is located inside `projects/japan-trip/scripts/`.

### Prerequisites
- Python 3.11+
- Installed package manager `uv` (recommended)

### Environment Variables Setup
To run the image sourcer (`image_sourcer.py`), you need search API access:
1. Navigate to `projects/japan-trip/scripts/`.
2. Duplicate the `.env.template` file and rename it to `.env`:
   ```bash
   cp .env.template .env
   ```
3. Open `.env` and fill in your keys:
   * `TAVILY_API_KEY`: Key from Tavily Search API.
   * `GOOGLE_API_KEY`: Key for your Gemini model access.

### Running Sourcing
Execute the script using `uv`:
```bash
uv run --project scripts scripts/image_sourcer.py "Search Query Name"
```
The script will search, download the best match, compress it to `<200KB`, and save it under `projects/japan-trip/images/`.

---

## 🚀 Local Development

To run this Jekyll site locally:

1. **Install Ruby and Bundler** (if not already installed).
2. **Install dependencies**:
   ```bash
   bundle install
   ```
3. **Serve locally**:
   ```bash
   bundle exec jekyll serve
   ```
4. Open `http://localhost:4000` in your web browser.