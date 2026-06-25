# Deployment checklist for EO-FM Living Atlas

Target repository:

```text
joshigunjan/EO-FM-Living-Atlas
```

Public GitHub Pages URL after deployment:

```text
https://joshigunjan.github.io/EO-FM-Living-Atlas/
```

## Steps

1. Create a new public GitHub repository named `EO-FM-Living-Atlas` under the `joshigunjan` account.
2. Upload all files from this folder to the repository root.
3. Go to repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the default branch, usually `main`, and folder `/root`.
6. Save. GitHub Pages should publish the site at the URL above.
7. Open the **Submit a paper** page and confirm that the button opens a new GitHub issue using the `add-paper.yml` template.
8. Test with one known paper link. The GitHub Action should create a candidate extraction artifact/comment depending on workflow permissions.

## Recommended next edits

- Add a short project description in the GitHub repo About field.
- Add topics such as `earth-observation`, `foundation-models`, `remote-sensing`, `geospatial-ai`, `benchmarks`.
- Add a license once you decide how public you want the catalogue data to be.
- Review `data/catalogue.json` before announcing publicly.
