#!/usr/bin/env python3
"""Draft extractor for EO-FM Living Atlas candidate issues.

This starter script is intentionally conservative. It extracts obvious URLs and
creates a candidate YAML skeleton. A later version can call arXiv, Crossref,
OpenAlex, Semantic Scholar, or an LLM API for richer metadata extraction.
"""
import re
import sys
import textwrap
from datetime import date

URL_RE = re.compile(r"https?://[^\s)]+")

def classify_url(url):
    if "arxiv.org" in url:
        return "paper_url"
    if "doi.org" in url or "ieeexplore" in url or "openaccess.thecvf" in url or "nature.com" in url:
        return "paper_url"
    if "github.com" in url:
        return "code_url"
    if "huggingface.co" in url:
        return "weights_url"
    return "project_url"

def main():
    text = sys.stdin.read()
    urls = URL_RE.findall(text)
    fields = {"paper_url": "", "code_url": "", "weights_url": "", "project_url": ""}
    for url in urls:
        key = classify_url(url)
        if not fields[key]:
            fields[key] = url
    print(textwrap.dedent(f"""
    name: TODO
    category: candidate
    scope: Earth observation foundation model
    modality_tags: []
    architecture_tags: []
    modelling_paradigm_key: TODO
    modelling_paradigm: TODO
    task_tags: []
    downstream_tasks: TODO
    openness: unknown
    review_status: candidate
    paper_url: {fields['paper_url']}
    code_url: {fields['code_url']}
    weights_url: {fields['weights_url']}
    project_url: {fields['project_url']}
    source_provenance: User-submitted candidate; needs human review.
    last_updated: {date.today().isoformat()}
    """).strip())

if __name__ == "__main__":
    main()
