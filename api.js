// api.js
// Exact backend contract:
//   GET  /views/ids
//   POST /views/query
const API_BASE = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE) ? String(process.env.NEXT_PUBLIC_API_BASE) : "";

function joinUrl(base, path) {
  if (!base) return path;
  return base.replace(/\/+$/,"") + "/" + String(path || "").replace(/^\/+/, "");
}
function baseOrigin() {
  return (typeof window !== "undefined" && window.location?.origin) ? window.location.origin : "";
}
function absUrl(path) {
  const origin = API_BASE || baseOrigin();
  return origin ? joinUrl(origin, path) : String(path || "");
}

// Returns: [{id, name}, ...]
export async function listForecastIds({ scope = "global", model = "", series = "" } = {}) {
  const url = new URL(absUrl("/views/ids"));
  url.searchParams.set("scope", scope || "global");
  if (model != null) url.searchParams.set("model", model);
  if (series != null) url.searchParams.set("series", series);
  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(`listForecastIds ${res.status}: ${url}`);
  return res.json();
}

// Returns: { rows, total }
export async function queryView({
  scope = "global",
  model = "",
  series = "",
  forecast_id,
  date_from = null,
  date_to = null,
  page = 1,
  page_size = 20000
} = {}) {
  const url = absUrl("/views/query");
  const body = {
    scope,
    model: model || null,
    series: series || null,
    forecast_id: String(forecast_id || ""),
    date_from,
    date_to,
    page,
    page_size
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`queryView ${res.status}: ${url}`);
  return res.json();
}
