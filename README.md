# EO-FM Living Atlas

EO-FM Living Atlas is an interactive catalogue of Earth observation and remote-sensing foundation models, benchmarks, and related resources.

The catalogue tracks more than paper titles. Each entry is structured by:

- Scientific scope
- Model category
- Input modalities and sensors
- Architecture family
- Specific downstream tasks
- Openness of code and weights
- Direct paper, code, weight, and project links
- Notes and caveats

## Website pages

- `index.html`: searchable catalogue
- `submit.html`: paper submission route
- `method.html`: catalogue scope and field definitions

## Data files

- `data/catalogue.json`: website data source
- `data/catalogue.csv`: editable/exportable catalogue table
- `schema/catalogue.schema.json`: expected structured fields

## GitHub Pages

Enable Pages from the repository root on the `main` branch. The site should be available at:

`https://joshigunjan.github.io/EO-FM-Living-Atlas/`

## Submission workflow

The `Submit a paper` page links to a GitHub Issue Form. Suggested entries should include primary paper, code, project, and weight links wherever possible, together with modalities, architecture, and named downstream tasks.


## Design assets

The homepage uses `assets/hero-eo-layers.png` as a multimodal Earth observation background representing optical, SAR, DEM, and ERA5-style layers.
