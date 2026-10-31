# Meelad Desk v2.0.1 — Teams & Points Edition

**Offline-first Meelad competition manager** built with plain HTML, CSS, JavaScript and browser LocalStorage. No framework, login, account, backend, external fonts or third-party CDN.

## Start in VS Code (recommended)

1. Extract the ZIP and open the **`meelad-studio-v2`** folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey (if you don't already have it).
3. Open `index.html`, right-click and choose **Open with Live Server**.
4. Use the local address opened by Live Server, normally `http://127.0.0.1:5500/`.
5. Complete the one-time setup: **madrasa name, Meelad event name, logos and your own competing team names** (one per line).
6. Start entering students, judges and programs. No start script, Python installation or terminal commands are needed.

You can also run any other static HTTP server. For PWA installation, use localhost or HTTPS; avoid opening the file directly. If you move between `127.0.0.1:5500` and `localhost:5500`, the browsers consider those different LocalStorage locations. Stick to one URL, or use JSON export/import.

## Fix in v2.0.1

The left sidebar now has an **independently scrollable navigation area**. Settings & backup remains reachable on short laptop screens, at higher browser zoom, and in the mobile drawer. Team standings, storage format, chest codes and all other features are unchanged.

**After replacing the previous version:** keep the same Live Server address to retain LocalStorage data. Because this is an offline PWA, reload once or twice to let the updated service worker take over; if the older UI persists, press `Ctrl+Shift+R`. **Export a JSON backup first** as a precaution.

## New in v2

### Editable teams and automatic scoring

Teams are created in the first-time setup. Each student is assigned to **one configured team** through a dropdown, and you can add or rename teams later under Settings & backup or Teams & points. Team colours can be customised. You cannot delete a team while students are assigned to it.

Points come **only from published results**:

| Prize | Team points |
|---|---:|
| First | 5 |
| Second | 3 |
| Third | 1 |

The dashboard and **Teams & points** screen display standings, first/second/third counts, and a transparent table showing the contributing **program name, category, program code, winning student/chest code, team, prize and points**. Totals are never keyed in manually; editing/unpublishing/deleting a result changes the standings automatically. Ties on points favour teams with more first places; remaining ties are alphabetical.

### Chest-code and mark entry

Every program receives a unique automatic code `P001`, `P002`, etc. Program codes are not recycled.

When results arrive from the judges:

1. Open **Results → Enter result** for the program.
2. Enter marks (out of the program's maximum) beside the participant **chest numbers**.
3. Choose **Fill winners from marks** to assign first, second and third automatically, or type the winning chest numbers yourself.
4. Check for tied marks manually before publishing. Auto-ranking uses lower chest number to break an exact mark tie.
5. Select **Publish result**. The scoreboard updates instantly, and the poster becomes the official result.

Unpublished/draft results never award team points. You can attach an image or PDF of the judges' submitted result, and export a print-ready official result poster as PDF or PNG or print it.

### Judge sheets — **half A4**

- Each judge form occupies **the upper A5-sized half of an A4 sheet**, and bulk exports pack **two half-page forms on each A4 page**.
- A **single** judge form also uses an A4 page but fills only the top half, leaving the lower half blank.
- Forms display: madrasa/Meelad logo, event names, **program title + program code**, judge name, category, **participant chest codes and a single blank mark column**, plus signature.
- No student names, scoring rubrics, content/delivery columns or remarks are printed on judge sheets.
- A separate form is produced per assigned judge, with overflow automatically paginated in groups of 12 contestants.

### Chest cards — **portrait A6**

- Normal **upright A6** card (105 × 148.5 mm): two festival logos, chest number prominently, student name, class, category and team.
- **Individual download:** one A6 portrait PDF at print size.
- **Bulk download:** four portrait A6 cards per A4 sheet, with subtle cut guides; class filtering supported.
- No student photo is required.

### Poster export and other features

- Result posters are now designed at the A4 portrait aspect ratio and exported as a full-page PDF or PNG. A preview is available in the Results section.
- Student, category, judge, participant/roster and program CRUD retained, including automatic sequential chest codes per standard.
- Portable JSON backups include teams, team colours, marks, results, attachments, program codes, logos and the original class counters.
- **Existing v1 LocalStorage and v1 JSON exports are supported:** old free-text student team/house names are turned into registered teams, assigned to the students, and missing program codes are generated.
- Installable offline PWA (app shell cached after loading once via an HTTP server).

## Chest number examples

| Class | First student | Second student |
|---|---:|---:|
| 1 | 101 | 102 |
| 2 | 201 | 202 |
| 3 | 301 | 302 |
| 10 | 1001 | 1002 |
| 11 | 1101 | 1102 |
| 12 | 1201 | 1202 |

Chest numbers are sequential within each class and are not reused after deletion. Classes exceeding 99 registrations switch to an extended number range to prevent overlap.

## Import, export & backups

Open **Settings & backup → Export** to download your complete workspace JSON. On another computer, open the app and complete temporary setup if necessary, then use **Settings & backup → Import** to restore the file. **Import replaces current data** on that browser; you'll be asked to confirm. Back up regularly, especially before managing a large event or clearing browser history.

**Important:** LocalStorage does *not* automatically sync between computers or browsers. File uploads are embedded in your local data, but large files may hit browser storage limits; result attachments are limited to 1.5 MB each. SVG logos are converted to PNG on upload when possible; ordinary PNG/JPG logos are recommended for the most reliable PDF/PNG exports. Malayalam text in PDFs depends on fonts installed in the browser/OS.

## Files

```
meelad-studio-v2/
├── index.html             Application shell, sidebar and PWA meta tags
├── app.js                 UI, dialogs, forms, data storage and import/export
├── scores.mjs             Legacy data migration, team standings, score calculation
├── pdf.js                 Offline A4/A6 PDF, chest card, judge sheet, result poster engine
├── styles.css             Responsive modern UI
├── sw.js                  Offline cache/service worker
├── manifest.webmanifest  Installable PWA metadata
├── assets/
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

### Printing guidance

Set print scaling to **100% / Actual size**, use **A4** for bulk sheets or judge forms, and **A6** (105 × 148.5 mm) for individual chest cards. Turn off browser headers and footers when printing.

This application is a local tool intended for one administration workstation at a time. To let multiple volunteers change the *same* event at once, you would need to add a shared database and synchronisation backend.
