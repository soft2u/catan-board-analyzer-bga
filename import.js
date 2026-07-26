const CATAN_IMPORT_URL = "https://catan.soft2u.ro/import-from-bga";

function showError(message) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.classList.add("is-error");
}

async function submitBoard() {
  const encodedPayload = location.hash.slice(1);
  history.replaceState(null, "", location.pathname);

  if (!encodedPayload) {
    throw new Error("The board payload is missing. Return to BGA and try again.");
  }

  let payload;
  try {
    payload = JSON.parse(decodeURIComponent(encodedPayload));
  } catch {
    throw new Error("The board payload is invalid. Return to BGA and try again.");
  }

  const response = await fetch(CATAN_IMPORT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    credentials: "omit",
    cache: "no-store",
    redirect: "follow",
    referrerPolicy: "no-referrer"
  });

  if (!response.ok) {
    let message = `The analytics service returned HTTP ${response.status}.`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.error === "string" && errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // Keep the HTTP status message when the response is not JSON.
    }
    throw new Error(message);
  }

  const analyticsUrl = new URL(response.url);
  if (
    analyticsUrl.protocol !== "https:"
    || analyticsUrl.hostname !== "catan.soft2u.ro"
    || !analyticsUrl.pathname.startsWith("/map-analytics/")
  ) {
    throw new Error("The analytics service returned an unexpected destination.");
  }

  location.replace(analyticsUrl.toString());
}

globalThis.__CATAN_IMPORT_PROMISE__ = submitBoard().catch((error) => {
  showError(error instanceof Error ? error.message : String(error));
  return null;
});
