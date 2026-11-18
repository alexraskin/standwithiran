// CloudFront Function (viewer-request, cloudfront-js-2.0).
// 301s to one canonical URL per page (apex host, trailing slash, no
// index.html, no /en/ prefix), then maps directory URLs to Hugo's index.html.
function handler(event) {
  var r = event.request;
  var host = r.headers.host ? r.headers.host.value.toLowerCase() : "";
  var apex = host.indexOf("www.") === 0 ? host.slice(4) : host;
  var uri = r.uri;

  // /foo/index.html -> /foo/
  if (uri.endsWith("/index.html")) uri = uri.slice(0, -"index.html".length);

  var isFile = uri.split("/").pop().indexOf(".") !== -1;
  if (!isFile) {
    // /foo -> /foo/
    if (!uri.endsWith("/")) uri += "/";
    // English lives at the root; Hugo's /en/ is only an alias. Files such as
    // /en/sitemap.xml are real and stay put.
    if (uri.indexOf("/en/") === 0) uri = uri.slice(3);
  }

  if (apex !== host || uri !== r.uri) {
    var qs = Object.keys(r.querystring)
      .map(function (k) {
        var v = r.querystring[k];
        return v.value ? k + "=" + v.value : k;
      })
      .join("&");
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: { value: "https://" + apex + uri + (qs ? "?" + qs : "") },
      },
    };
  }

  if (uri.endsWith("/")) r.uri += "index.html";
  return r;
}
