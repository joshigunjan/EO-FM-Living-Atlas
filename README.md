# EO-FM Living Atlas

A structured, interactive catalogue of Earth observation and remote-sensing foundation models.

This version is designed to go beyond an awesome-list format. It keeps original paper/code/weight links but also tracks:

- Scientific scope
- Model category
- Input modalities and sensors
- Architecture family
- Specific downstream tasks
- Openness of code and weights
- Review status
- Notes and caveats

## Data files

- `data/catalogue.json`: website data source
- `data/catalogue.csv`: editable/exportable catalogue table
- `data/watchlist.json`: broader registry/watchlist
- `schema/catalogue.schema.json`: expected structured fields

## Status labels

- `Curated seed`: manually curated seed entry from the initial workbook.
- `Specialized seed`: manually curated seed entry from a specialized subgroup, usually VLM/MLLM.
- `Candidate`: submitted or automatically discovered entry awaiting human review.

## GitHub Pages

Enable Pages from the repository root on the `main` branch. The site should be available at:

`https://joshigunjan.github.io/EO-FM-Living-Atlas/`

## Submission workflow

The `Submit a paper` page links to a GitHub Issue Form. Submitted papers should become candidate entries first, then be manually reviewed before appearing as verified catalogue rows.
