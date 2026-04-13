# Excel to Word Mapper

A browser-based React application that parses generic Excel (`.xlsx` / `.xls`) files into a strictly mapped, multi-row Word (`.docx`) table template. Built securely entirely on the client side with no database or backend required.

## Features Let 🚀

- **Fast & Private**: Runs entirely in your browser using pure JavaScript manipulation algorithms without uploading your sensitive data to external API servers.
- **Dynamic Table Mapping:** Visually select template placeholders and cross-reference them by clicking rows locally in an Excel preview map.
- **Smart Increments:** Generates output efficiently matching a fixed interval step based on your mappings. The current configuration enforces a 4-participant deep merge topology per output team.
- **Robust Schema Matching**: Identifies incomplete rows and formats robust empty spacing securely inside generated `.docx` configurations, avoiding offset breakage and format clipping.

## Technologies Used

- **React 18** (UI and state orchestration)
- **Vite 6** (Build system)
- **Tailwind CSS v4** (Utility class styling)
- **SheetJS (xlsx)** (Client-side Excel parsing mapping engine)
- **docx** (Programmable Word generation via OOXML standard protocols)
- **Lucide-React** (Lightweight scalable icons)

## 📦 Installation & Setup

1. **Clone or Download the Repository:**
   ```bash
   # Extract or pull files to your directory
   cd "e:\Excel to word data"
   ```

2. **Install Dependencies:**
   Ensure you have [Node.js](https://nodejs.org) installed on your machine.
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Open Application** 
   Access the server locally, typically at `http://localhost:5173`.

## 🛠️ How to Use

1. **Upload Dataset:** Click the data upload block dragging a suitable `.xlsx` file mapping base datasets (flat schema configurations).
2. **Template Map Integration:** 
   - Observe the `Template Builder` on the right side indicating placeholders mapping layout.
   - Click a placeholder box (e.g. `TEAM TITLE`). It will turn blue.
   - Click the correspondent layout column inside your structural Data Source (the loaded Excel UI window table).
3. **Generate & Download:** Click the `Generate Docx` node. The mapper iterates row intervals downwards directly from your first click baseline index until exhaustion, then compiles `.docx` objects immediately pushing to your browser's local downloader pipeline.

## 📝 Configuration (Schema Changes)

To modify from a 4-participant structure or redesign the table:
- Edit the `mappings` properties schema variables inside `src/components/TemplateMapper.jsx`.
- Adapt the internal OOXML table builder instructions via the `handleExport` structure loop inside `src/components/DocxExport.jsx`.
