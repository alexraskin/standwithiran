"""Check Hugo output and content validation using Python 3.11+ only."""
import html
from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import tomllib
import unittest
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.tags = []
        self.text = path.read_text()
        self.feed(self.text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class SiteChecks(unittest.TestCase):
    def test_routes_and_assets(self):
        for language in ("en", "fa"):
            prefix = "/fa" if language == "fa" else ""
            for section in ("", "timeline", "victims", "evidence", "take-action", "terms", "privacy"):
                route = f"{prefix}/{section + '/' if section else ''}"
                with self.subTest(route=route):
                    page = Page(DIST / route.lstrip("/") / "index.html")
                    root = next(attrs for tag, attrs in page.tags if tag == "html")
                    self.assertEqual(root["lang"], language)
                    self.assertEqual(root["dir"], "rtl" if language == "fa" else "ltr")
                    self.assertEqual(sum(tag == "h1" for tag, _ in page.tags), 1)
                    self.assertIn("Content-Security-Policy", page.text)
                    self.assertNotIn("ZgotmplZ", page.text)
                    links = [attrs for tag, attrs in page.tags if tag == "link"]
                    self.assertTrue(any(a.get("rel") == "canonical" and a.get("href") == f"https://standwithiran.org{route}" for a in links))
                    self.assertTrue(any(a.get("hreflang") for a in links))
                    for _, attrs in page.tags:
                        for key in ("href", "src"):
                            url = attrs.get(key, "")
                            if not url.startswith("/") or url.startswith("//"):
                                continue
                            pathname = urlsplit(url).path
                            target = DIST / pathname.lstrip("/")
                            if pathname.endswith("/"):
                                target /= "index.html"
                            self.assertTrue(target.exists(), f"Broken URL {url} on {route}")
        self.assertIn("noindex", (DIST / "404.html").read_text())
        self.assertTrue((DIST / "sitemap.xml").exists())

    def test_records_and_sources(self):
        for section in ("timeline", "victims", "evidence", "resources", "figures"):
            for file in (ROOT / "content" / section).glob("*.md"):
                if file.name.startswith("_index"):
                    continue
                metadata = tomllib.loads(file.read_text().split("+++", 2)[1])
                if metadata.get("draft"):
                    continue
                language = file.stem.rsplit(".", 1)[1]
                prefix = "fa" if language == "fa" else ""
                output = {"resources": "take-action", "figures": "victims"}.get(section, section)
                page = Page(DIST / prefix / output / "index.html")
                with self.subTest(file=file.name):
                    if section != "figures" or language == "en":
                        self.assertIn(metadata["title"], html.unescape(page.text))
                    if "source_url" in metadata:
                        self.assertIn(metadata["source_url"], [a.get("href") for _, a in page.tags])
                    if section in ("timeline", "victims", "evidence"):
                        slug = file.stem.rsplit(".", 1)[0]
                        self.assertTrue((DIST / prefix / section / slug / "index.html").exists())
        for prefix in ("", "fa"):
            for section in ("resources", "figures"):
                self.assertFalse((DIST / prefix / section / "index.html").exists())

    def test_invalid_content_is_rejected(self):
        cases = (
            ("resources/3.en.md", "source_url", '"javascript:alert(1)"'),
            ("evidence/un-ffmi-2026-09.en.md", "category", '"unknown"'),
            ("evidence/un-ffmi-2026-09.en.md", "date", '"2026-02-30"'),
            ("timeline/1979.en.md", "year", '"yesterday"'),
        )
        with tempfile.TemporaryDirectory(prefix="standwithiran-check-") as temp:
            content = Path(temp) / "content"
            shutil.copytree(ROOT / "content", content)
            for file, field, value in cases:
                with self.subTest(field=field):
                    target = content / file
                    original = target.read_text()
                    target.write_text(re.sub(rf"^{field} = .+$", f"{field} = {value}", original, flags=re.M))
                    try:
                        result = subprocess.run(
                            ["hugo", "--contentDir", str(content), "--destination", str(Path(temp) / "dist"),
                             "--cacheDir", str(Path(temp) / "cache"), "--noBuildLock"],
                            cwd=ROOT, capture_output=True, text=True, check=False,
                        )
                        self.assertNotEqual(result.returncode, 0, f"Accepted invalid {field}")
                        self.assertIn(field, (result.stdout + result.stderr).lower())
                    finally:
                        target.write_text(original)


if __name__ == "__main__":
    unittest.main()
