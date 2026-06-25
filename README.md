# EO-FM Living Atlas

EO-FM Living Atlas is a curated living catalogue of Earth observation foundation models, benchmarks, datasets, and related resources.

Each entry records modalities, architecture, modelling paradigm, downstream tasks, access, and direct links to papers, code, weights, and project pages where available.

## Pages

- `index.html`: searchable catalogue
- `landscape.html`: interactive landscape map
- `submit.html`: paper submission route
- `method.html`: scope, fields, and plotting rules

## Data

- `data/catalogue.json`: primary website data source
- `data/catalogue.csv`: editable/exportable table
- `schema/catalogue.schema.json`: structured field schema

## Landscape fields

The default Landscape view uses explicit plotting fields:

- `modality_complexity_score` and `modality_complexity_tier`
- `reported_downstream_task_count`
- `modelling_paradigm`
- `access`

These fields are separate from task labels used for search and filtering. This keeps the living plot aligned with curated landscape figures while preserving flexible user-selected X/Y comparisons.

## GitHub Pages

Enable Pages from the repository root on the `main` branch. The site should be available at:

`https://joshigunjan.github.io/EO-FM-Living-Atlas/`

## Submission workflow

The `Submit a paper` page links to a GitHub Issue Form. Suggested entries should include primary paper, code, project, and weight links wherever possible, together with modalities, architecture, modelling paradigm, and named downstream tasks. Submitted entries remain candidates until checked against primary sources.

## Design asset

The site uses `assets/hero-eo-layers.png`, a multimodal EO background representing optical, SAR, DEM, and ERA5-style layers.
