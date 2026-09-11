(function () {
  const dataUrl = "data/timeline.json";
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  function isValidEntry(entry) {
    return entry && typeof entry.title === "string" && entry.title.trim()
      && typeof entry.description === "string" && entry.description.trim()
      && typeof entry.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry.date)
      && !Number.isNaN(Date.parse(`${entry.date}T00:00:00`));
  }

  function cleanEntries(entries) {
    return (Array.isArray(entries) ? entries : [])
      .filter(isValidEntry)
      .map((entry) => ({
        title: entry.title.trim(),
        description: entry.description.trim(),
        date: entry.date
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function formatDate(date) {
    return dateFormatter.format(new Date(`${date}T00:00:00`));
  }

  async function loadEntries() {
    const response = await fetch(dataUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load timeline data (${response.status}).`);
    return cleanEntries(await response.json());
  }

  function renderPublic(entries) {
    const container = document.querySelector("#timeline");
    if (!container) return;
    container.replaceChildren();

    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = "<h3>No timeline updates yet</h3><p>New updates will appear here as they are added.</p>";
      container.append(empty);
      return;
    }

    const timeline = document.createElement("div");
    timeline.className = "timeline";
    entries.forEach((entry) => {
      const item = document.createElement("article");
      item.className = "timeline-entry";
      item.innerHTML = `<div class="timeline-date">${formatDate(entry.date)}</div><h3></h3><p></p>`;
      item.querySelector("h3").textContent = entry.title;
      item.querySelector("p").textContent = entry.description;
      timeline.append(item);
    });
    container.append(timeline);
  }

  function renderManager(entries, onEdit, onDelete) {
    const container = document.querySelector("#manager-list");
    if (!container) return;
    container.replaceChildren();
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No entries yet. Add your first timeline update above.";
      container.append(empty);
      return;
    }

    entries.forEach((entry, index) => {
      const item = document.createElement("article");
      item.className = "manager-entry";
      item.innerHTML = `<div><div class="timeline-date">${formatDate(entry.date)}</div><h3></h3><p></p></div><div class="actions"><button class="btn btn-secondary" type="button" data-action="edit">Edit</button><button class="btn btn-danger" type="button" data-action="delete">Delete</button></div>`;
      item.querySelector("h3").textContent = entry.title;
      item.querySelector("p").textContent = entry.description;
      item.querySelector('[data-action="edit"]').addEventListener("click", () => onEdit(index));
      item.querySelector('[data-action="delete"]').addEventListener("click", () => onDelete(index));
      container.append(item);
    });
  }

  function showError(message) {
    const container = document.querySelector("#timeline");
    if (container) container.innerHTML = `<div class="empty-state"><h3>Timeline unavailable</h3><p>${message}</p></div>`;
  }

  window.timelineApp = { cleanEntries, formatDate, loadEntries, renderPublic, renderManager, showError };
}());
