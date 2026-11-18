// CloudFront Function (viewer-request, cloudfront-js-2.0).
// www -> apex 301, and directory URLs to the index.html Hugo writes for them.
function handler(event) {
  var r = event.request;
  var host = r.headers.host ? r.headers.host.value.toLowerCase() : "";

  if (host.indexOf("www.") === 0) {
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
        location: { value: "https://" + host.slice(4) + r.uri + (qs ? "?" + qs : "") },
      },
    };
  }

  if (r.uri.endsWith("/")) r.uri += "index.html";
  else if (r.uri.split("/").pop().indexOf(".") === -1) r.uri += "/index.html";
  return r;
}
