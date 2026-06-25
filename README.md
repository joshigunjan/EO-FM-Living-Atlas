# EO-FM Atlas

A starter static website and machine-readable database for a living catalogue of Earth observation foundation models, benchmarks, datasets, and related vision-language models.

This starter kit was generated from the curated workbook:

`eo_foundation_models_table(1).xlsx`


## Target GitHub repository

Recommended repository path:

```text
joshigunjan/EO-FM-Living-Atlas
```

Recommended public website URL after GitHub Pages is enabled:

```text
https://joshigunjan.github.io/EO-FM-Living-Atlas/
```

Note: GitHub repository names should use URL-safe characters. Use hyphens instead of spaces.

## What is included

- `index.html`, `style.css`, `app.js`: static searchable catalogue
- `watchlist.html`: extended registry/watchlist page
- `submit.html`: submission workflow page
- `method.html`: curation and status definitions
- `data/catalogue.json`: 74 seed catalogue entries
- `data/watchlist.json`: 105 watchlist entries
- `data/catalogue.csv`: table-friendly export
- `schema/catalogue.schema.json`: first schema
- `.github/ISSUE_TEMPLATE/add-paper.yml`: GitHub Issue Form for community submissions
- `.github/workflows/extract-candidate.yml`: starter automation for candidate extraction
- `scripts/extract_candidate.py`: basic arXiv/DOI/GitHub metadata extractor

## Recommended publishing workflow

1. Create a new GitHub repository named `EO-FM-Living-Atlas` under `joshigunjan`.
2. Upload all files from this starter kit.
3. The submission link in `submit.html` is already configured for `joshigunjan/EO-FM-Living-Atlas`.
4. Enable GitHub Pages from the repository settings.
5. Keep `data/catalogue.json` as the public verified catalogue.
6. Keep `data/watchlist.json` as the broader unverified registry.
7. Let new submissions enter through GitHub issues.
8. Let automation create candidate JSON files.
9. Review candidate entries manually before promoting them to the public catalogue.

## Suggested review statuses

- `seed_verified`: curated detailed entry from the seed workbook.
- `seed_specialized`: curated VLM/MLLM entry from the seed workbook.
- `watchlist_unverified`: registry item that needs source-paper verification.
- `candidate_auto_extracted`: machine-drafted submission.
- `verified`: human-reviewed and approved.

## Local preview

Because the website loads JSON with `fetch`, use a small local server instead of opening `index.html` directly:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Next improvements

- Add fields for parameter count, release date, benchmark name, and license.
- Add citation export as BibTeX.
- Add confidence scores for extracted fields.
- Add an admin review page.
- Add scheduled discovery from arXiv, OpenAlex, Semantic Scholar, and GitHub.
