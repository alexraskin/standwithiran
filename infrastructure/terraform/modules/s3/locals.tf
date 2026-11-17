locals {
  files = fileset(var.site_dir, "**")

  mime = {
    html        = "text/html; charset=utf-8"
    css         = "text/css"
    js          = "text/javascript"
    xml         = "application/xml; charset=utf-8"
    txt         = "text/plain; charset=utf-8"
    webmanifest = "application/manifest+json"
    woff2       = "font/woff2"
    svg         = "image/svg+xml"
    webp        = "image/webp"
    jpg         = "image/jpeg"
    png         = "image/png"
    ico         = "image/x-icon"
  }

  # _astro/ is content-hashed by Astro. HTML and the sitemap revalidate so a
  # deploy shows up without an invalidation.
  cache_immutable = "public, max-age=31536000, immutable"
  cache_static    = "public, max-age=86400, stale-while-revalidate=604800"
  cache_html      = "public, max-age=0, must-revalidate"
}
