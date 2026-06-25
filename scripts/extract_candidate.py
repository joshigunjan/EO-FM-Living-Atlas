#!/usr/bin/env python3
"""
Draft a candidate EO-FM Atlas entry from a GitHub issue body or URL.

This is a safe starter extractor:
- It detects URLs, arXiv IDs, DOIs, and GitHub repos.
- It fetches basic metadata from arXiv or Crossref when possible.
- It writes a candidate JSON file.
- Scientific fields are intentionally marked for human review unless a later LLM step is added.

Usage:
  python scripts/extract_candidate.py --issue-body-file issue_body.md
  python scripts/extract_candidate.py --url https://arxiv.org/abs/2504.11171
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


URL_RE = re.compile(r"https?://[^\s)>\]]+")
ARXIV_RE = re.compile(r"arxiv\.org/(?:abs|pdf)/([0-9]{4}\.[0-9]{4,5})(?:v\d+)?", re.I)
DOI_RE = re.compile(r"\b10\.\d{4,9}/[-._;()/:A-Z0-9]+\b", re.I)
GITHUB_RE = re.compile(r"https?://github\.com/[^/\s]+/[^/\s#?]+", re.I)


def read_text(path: str | None, url: str | None) -> str:
    parts = []
    if path:
        parts.append(Path(path).read_text(encoding="utf-8"))
    if url:
        parts.append(url)
    return "\n".join(parts)


def first_match(pattern: re.Pattern, text: str) -> str:
    m = pattern.search(text)
    return m.group(1) if m and m.groups() else (m.group(0) if m else "")


def get_urls(text: str) -> list[str]:
    return [u.rstrip(".,") for u in URL_RE.findall(text)]


def fetch_json(url: str, headers: dict | None = None) -> dict:
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "EO-FM-Atlas/0.1"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def fetch_text(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "EO-FM-Atlas/0.1"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", errors="replace")


def arxiv_metadata(arxiv_id: str) -> dict:
    api = f"https://export.arxiv.org/api/query?id_list={urllib.parse.quote(arxiv_id)}"
    xml = fetch_text(api)
    root = ET.fromstring(xml)
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    entry = root.find("atom:entry", ns)
    if entry is None:
        return {}
    authors = [a.findtext("atom:name", default="", namespaces=ns) for a in entry.findall("atom:author", ns)]
    return {
        "title": (entry.findtext("atom:title", default="", namespaces=ns) or "").replace("\n", " ").strip(),
        "authors": authors,
        "abstract": (entry.findtext("atom:summary", default="", namespaces=ns) or "").replace("\n", " ").strip(),
        "published": entry.findtext("atom:published", default="", namespaces=ns),
        "paper_url": f"https://arxiv.org/abs/{arxiv_id}",
        "arxiv_id": arxiv_id,
    }


def crossref_metadata(doi: str) -> dict:
    url = f"https://api.crossref.org/works/{urllib.parse.quote(doi)}"
    data = fetch_json(url)
    msg = data.get("message", {})
    title = " ".join(msg.get("title", [])[:1])
    authors = []
    for a in msg.get("author", []):
        name = " ".join(x for x in [a.get("given", ""), a.get("family", "")] if x)
        if name:
            authors.append(name)
    return {
        "title": title,
        "authors": authors,
        "abstract": msg.get("abstract", ""),
        "published": "-".join(str(x) for x in (msg.get("published-print") or msg.get("published-online") or {}).get("date-parts", [[""]])[0]),
        "paper_url": msg.get("URL", ""),
        "doi": doi,
    }


def candidate_from_text(text: str) -> dict:
    urls = get_urls(text)
    arxiv_id = first_match(ARXIV_RE, text)
    doi = first_match(DOI_RE, text)
    github_url = first_match(GITHUB_RE, text)

    meta = {}
    source_kind = "submitted_url"

    try:
        if arxiv_id:
            meta = arxiv_metadata(arxiv_id)
            source_kind = "arxiv"
        elif doi:
            meta = crossref_metadata(doi)
            source_kind = "doi"
    except Exception as exc:
        meta = {"metadata_fetch_error": str(exc)}

    title = meta.get("title") or "Untitled candidate"
    stable_id_source = arxiv_id or doi or (urls[0] if urls else title)
    stable_id = hashlib.sha1(stable_id_source.encode("utf-8")).hexdigest()[:10]

    candidate = {
        "id": f"candidate-{stable_id}",
        "name": "",
        "title": title,
        "authors": meta.get("authors", []),
        "published": meta.get("published", ""),
        "scope": "candidate",
        "candidate_type": "",
        "source_kind": source_kind,
        "paper_url": meta.get("paper_url", urls[0] if urls else ""),
        "arxiv_id": meta.get("arxiv_id", arxiv_id),
        "doi": meta.get("doi", doi),
        "github_url": github_url,
        "all_submitted_urls": urls,
        "abstract": meta.get("abstract", ""),
        "input_modality": "",
        "architecture": "",
        "pretraining_objective": "",
        "downstream_tasks": "",
        "training_scale": "",
        "openness_text": "",
        "openness": "unknown",
        "notes": "Auto-drafted candidate. Scientific fields require human review.",
        "review_status": "candidate_auto_extracted",
        "created_on": dt.date.today().isoformat(),
    }
    return candidate


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--issue-body-file")
    parser.add_argument("--url")
    parser.add_argument("--out-dir", default="candidates")
    args = parser.parse_args()

    text = read_text(args.issue_body_file, args.url)
    candidate = candidate_from_text(text)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    safe_title = re.sub(r"[^a-zA-Z0-9]+", "-", (candidate["title"] or candidate["id"]).lower()).strip("-")[:70]
    out_path = out_dir / f"{dt.date.today().isoformat()}-{safe_title or candidate['id']}.json"
    out_path.write_text(json.dumps(candidate, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {out_path}")
    print(json.dumps(candidate, indent=2, ensure_ascii=False)[:4000])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
