# Copy Generated Image Helper

When GPT Image produces files under:

```text
C:\Users\siriu\.codex\generated_images\...
```

copy each generated PNG into the matching slug folder:

```powershell
$items = @(
  @{Slug='state-transition-testing'; Source='C:\path\to\generated-state-transition.png'},
  @{Slug='pairwise-testing'; Source='C:\path\to\generated-pairwise.png'},
  @{Slug='json-basics'; Source='C:\path\to\generated-json.png'},
  @{Slug='jira-basics'; Source='C:\path\to\generated-jira.png'}
)

foreach ($item in $items) {
  $target = "D:\dev\temp\QA Education\qa-learning-platform\backend\uploads\course-slides\$($item.Slug)"
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  Copy-Item -LiteralPath $item.Source -Destination (Join-Path $target 'Slide_01.png') -Force
}
```

Then run:

```powershell
docker compose exec backend python -m app.seed.import_slide_assets
docker compose exec backend python -m app.seed.report_missing_slide_images
```
