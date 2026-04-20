(function () {
  const APP = document.getElementById("app");
  const activeUrls = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function makeBlobUrl(blob) {
    const url = URL.createObjectURL(blob);
    activeUrls.push(url);
    return url;
  }

  function clearBlobUrls() {
    while (activeUrls.length) {
      const url = activeUrls.pop();
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    }
  }

  function openOfflineDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("comic-offline-db", 2);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  function getAll(store) {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  function get(store, key) {
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? null);
    });
  }

  function getAllByIndex(store, indexName, key) {
    return new Promise((resolve, reject) => {
      const request = store.index(indexName).getAll(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  function setBodyScrollLock(locked) {
    document.body.classList.toggle("modal-open", !!locked);
  }

  function iconArrowLeft() {
    return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>';
  }

  function iconChevronLeft() {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
  }

  function iconChevronRight() {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
  }

  function iconDownload() {
    return '<svg class="downloads-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>';
  }

  function iconPlay() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>';
  }

  function iconTrash() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>';
  }

  function iconBookOpen() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 19a2 2 0 0 1 2-2h16"/><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 0-2 2z"/></svg>';
  }

  function iconFileImage() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.6-1.6a2 2 0 0 0-2.8 0L10 21"/></svg>';
  }

  function downloadsHeaderHtml() {
    return `
      <header class="downloads-shell-header">
        <div class="container downloads-shell-header-inner">
          <a
            class="downloads-shell-back"
            href="/profile/avatar/profile"
            aria-label="Back"
            data-protected-link
          >
            ${iconChevronLeft()}
          </a>

          <div class="downloads-shell-title-wrap">
            ${iconDownload()}
            <h1 class="downloads-header-title">Downloads</h1>
          </div>

          <div class="downloads-shell-spacer" aria-hidden="true"></div>
        </div>
      </header>
    `;
  }

  function renderExpandableDescription(text, id) {
    return `
      <div class="details-description-wrap">
        <p class="details-description is-collapsed" data-expandable-text="${id}">${escapeHtml(
          text,
        )}</p>
        <button class="details-description-toggle" type="button" data-expand-toggle="${id}">
          Read more
        </button>
      </div>
    `;
  }

  function renderHeroPreview(thumbnail, previewVideo, title, heroClass) {
    return `
      <div class="${heroClass}" data-hero-preview>
        ${
          thumbnail
            ? `<img src="${thumbnail}" alt="${escapeHtml(title)}" class="hero-image" />`
            : `<div class="hero-placeholder"></div>`
        }

        ${
          previewVideo
            ? `<video src="${previewVideo}" muted loop playsinline preload="metadata" class="hero-video"></video>`
            : ""
        }

        <div class="hero-preview-overlay-1"></div>
        <div class="hero-preview-overlay-2"></div>
      </div>
    `;
  }

  async function listOfflineComics() {
    const db = await openOfflineDB();
    const tx = db.transaction(["comics"], "readonly");
    const comicsStore = tx.objectStore("comics");

    const comics = await getAll(comicsStore);

    const result = comics.map((comic) => ({
      comicId: comic.comicId,
      title: comic.title,
      description: comic.description ?? null,
      coverImage:
        comic.coverImageBlob != null
          ? makeBlobUrl(comic.coverImageBlob)
          : (comic.coverImage ?? null),
      previewVideo:
        comic.previewVideoBlob != null
          ? makeBlobUrl(comic.previewVideoBlob)
          : (comic.previewVideo ?? null),
      totalPages: comic.totalPages,
      cachedPages: comic.cachedPages,
      updatedAt: comic.updatedAt,
    }));

    db.close();
    return result;
  }

  async function getOfflineComicById(comicId) {
    const db = await openOfflineDB();
    const tx = db.transaction(["comics", "pages"], "readonly");
    const comicsStore = tx.objectStore("comics");
    const pagesStore = tx.objectStore("pages");

    const comic = await get(comicsStore, comicId);

    if (!comic) {
      db.close();
      return null;
    }

    const rows = await getAllByIndex(pagesStore, "by-comic", comicId);
    rows.sort((a, b) => {
      if ((a.episodeIndex || 0) !== (b.episodeIndex || 0)) {
        return (a.episodeIndex || 0) - (b.episodeIndex || 0);
      }

      return (a.pageIndex || 0) - (b.pageIndex || 0);
    });

    const episodesMap = new Map();

    for (const row of rows) {
      const existing = episodesMap.get(row.episodeId);

      if (existing) {
        existing.pageCount += 1;
        continue;
      }

      episodesMap.set(row.episodeId, {
        episodeId: row.episodeId,
        title: row.episodeTitle || `Episode ${(row.episodeIndex || 0) + 1}`,
        description: row.episodeDescription ?? null,
        episodeIndex: row.episodeIndex || 0,
        pageCount: 1,
        previewImage:
          row.episodePreviewImageBlob != null
            ? makeBlobUrl(row.episodePreviewImageBlob)
            : null,
      });
    }

    const episodes = Array.from(episodesMap.values()).sort(
      (a, b) => a.episodeIndex - b.episodeIndex,
    );

    db.close();

    return {
      comicId: comic.comicId,
      title: comic.title,
      description: comic.description ?? null,
      coverImage:
        comic.coverImageBlob != null
          ? makeBlobUrl(comic.coverImageBlob)
          : (comic.coverImage ?? null),
      previewVideo:
        comic.previewVideoBlob != null
          ? makeBlobUrl(comic.previewVideoBlob)
          : (comic.previewVideo ?? null),
      totalPages: comic.totalPages,
      cachedPages: comic.cachedPages,
      updatedAt: comic.updatedAt,
      episodes,
    };
  }

  async function getOfflineEpisodeData(comicId, episodeId) {
    const comic = await getOfflineComicById(comicId);
    if (!comic) return null;

    const db = await openOfflineDB();
    const tx = db.transaction(["pages"], "readonly");
    const pagesStore = tx.objectStore("pages");

    const rows = await getAllByIndex(
      pagesStore,
      "by-episode",
      `${comicId}:${episodeId}`,
    );

    rows.sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));

    const pages = rows.map((row, index) => ({
      id: `${episodeId}-${index}`,
      imageUrl: makeBlobUrl(row.blob),
    }));

    const currentIndex = comic.episodes.findIndex(
      (episode) => episode.episodeId === episodeId,
    );

    db.close();

    if (currentIndex === -1) return null;

    const currentEpisode = comic.episodes[currentIndex];
    const previousEpisodeId =
      currentIndex > 0 ? comic.episodes[currentIndex - 1].episodeId : null;
    const nextEpisodeId =
      currentIndex < comic.episodes.length - 1
        ? comic.episodes[currentIndex + 1].episodeId
        : null;

    return {
      comicTitle: comic.title,
      episodeTitle: currentEpisode.title || `Episode ${currentIndex + 1}`,
      episodeDescription: currentEpisode.description ?? null,
      episodeNumber: currentIndex + 1,
      previousEpisodeId,
      nextEpisodeId,
      episodes: comic.episodes.map((episode) => ({
        id: episode.episodeId,
        title: episode.title,
        description: episode.description ?? null,
        imageCount: episode.pageCount,
      })),
      pages,
    };
  }

  async function removeOfflineComic(comicId) {
    const db = await openOfflineDB();
    const tx = db.transaction(["comics", "pages"], "readwrite");

    await new Promise((resolve, reject) => {
      const req = tx.objectStore("comics").delete(comicId);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });

    await new Promise((resolve, reject) => {
      const store = tx.objectStore("pages");
      const cursorRequest = store.openCursor();

      cursorRequest.onerror = () => reject(cursorRequest.error);

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;

        if (!cursor) {
          resolve();
          return;
        }

        if (cursor.value.comicId === comicId) {
          const deleteReq = cursor.delete();
          deleteReq.onerror = () => reject(deleteReq.error);
          deleteReq.onsuccess = () => cursor.continue();
          return;
        }

        cursor.continue();
      };
    });

    db.close();
  }

  async function removeOfflineDownloadRecord(comicId) {
    if (!navigator.onLine) return;

    try {
      await fetch(`/api/offline-downloads/${encodeURIComponent(comicId)}`, {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      });
    } catch (error) {
      console.error("Failed to sync offline removal:", error);
    }
  }

  function showDownloadsToast(message) {
    let toast = document.querySelector(".downloads-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "downloads-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");

    window.clearTimeout(showDownloadsToast._timeoutId);
    showDownloadsToast._timeoutId = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  function setupProtectedOfflineLinks() {
    const links = document.querySelectorAll("[data-protected-link]");

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        if (navigator.onLine) return;
        event.preventDefault();
        showDownloadsToast("Need internet first");
      });
    });
  }

  function setupExpandableDescriptions() {
    const toggles = document.querySelectorAll("[data-expand-toggle]");

    toggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const id = toggle.getAttribute("data-expand-toggle");
        if (!id) return;

        const text = document.querySelector(`[data-expandable-text="${id}"]`);

        if (!text) return;

        const expanded = text.classList.toggle("is-expanded");
        text.classList.toggle("is-collapsed", !expanded);
        toggle.textContent = expanded ? "Show less" : "Read more";
      });
    });
  }

  function setupCardPreviewPlayback() {
    const cards = document.querySelectorAll("[data-preview-card]");

    cards.forEach((card) => {
      const video = card.querySelector("video");
      if (!video) return;

      let ready = false;
      let errored = false;

      const setPlaying = (playing) => {
        if (!ready || errored) return;
        card.classList.toggle("playing", playing);
      };

      video.addEventListener("canplay", () => {
        ready = true;
      });

      video.addEventListener("loadeddata", () => {
        ready = true;
      });

      video.addEventListener("error", () => {
        errored = true;
        card.classList.remove("playing");
      });

      card.addEventListener("mouseenter", () => {
        if (errored) return;

        const playPromise = video.play();
        if (playPromise) {
          playPromise.then(() => setPlaying(true)).catch(() => {});
        }
      });

      card.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
        setPlaying(false);
      });

      card.addEventListener("touchstart", () => {
        if (errored) return;

        const playPromise = video.play();
        if (playPromise) {
          playPromise.then(() => setPlaying(true)).catch(() => {});
        }
      });
    });
  }

  function setupHeroPreviewPlayback() {
    const hero = document.querySelector("[data-hero-preview]");
    if (!hero) return;

    const video = hero.querySelector("video");
    if (!video) return;

    let ready = false;
    let errored = false;

    const tryPlay = () => {
      if (!ready || errored) return;
      const playPromise = video.play();
      if (playPromise) {
        playPromise
          .then(() => {
            hero.classList.add("playing");
          })
          .catch(() => {});
      }
    };

    video.addEventListener("canplay", () => {
      ready = true;
      tryPlay();
    });

    video.addEventListener("loadeddata", () => {
      ready = true;
      tryPlay();
    });

    video.addEventListener("error", () => {
      errored = true;
      hero.classList.remove("playing");
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
          video.pause();
          hero.classList.remove("playing");
          return;
        }

        tryPlay();
      },
      {
        threshold: [0, 0.1, 0.2, 0.35, 0.6, 1],
      },
    );

    observer.observe(hero);
  }

  function setupReaderOverlays() {
    const sheetBackdrop = document.getElementById("episodes-sheet-backdrop");
    const sheet = document.getElementById("episodes-sheet");
    const dialogBackdrop = document.getElementById("episode-info-backdrop");
    const dialog = document.getElementById("episode-info-dialog");
    const openSheetButton = document.getElementById("open-episodes-sheet");
    const openDialogButton = document.getElementById("open-episode-info");
    const closeSheetButton = document.getElementById("close-episodes-sheet");
    const closeDialogButton = document.getElementById("close-episode-info");
    const closeDialogSecondary = document.getElementById(
      "close-episode-info-secondary",
    );

    const closeAll = () => {
      if (sheetBackdrop) sheetBackdrop.hidden = true;
      if (dialogBackdrop) dialogBackdrop.hidden = true;
      if (sheet) sheet.classList.remove("is-open");
      if (dialog) dialog.classList.remove("is-open");
      setBodyScrollLock(false);
    };

    const openSheet = () => {
      if (!sheet || !sheetBackdrop) return;
      closeAll();
      sheetBackdrop.hidden = false;
      sheet.classList.add("is-open");
      setBodyScrollLock(true);
    };

    const openDialog = () => {
      if (!dialog || !dialogBackdrop) return;
      closeAll();
      dialogBackdrop.hidden = false;
      dialog.classList.add("is-open");
      setBodyScrollLock(true);
    };

    if (openSheetButton) {
      openSheetButton.addEventListener("click", openSheet);
    }

    if (openDialogButton) {
      openDialogButton.addEventListener("click", openDialog);
    }

    if (closeSheetButton) {
      closeSheetButton.addEventListener("click", closeAll);
    }

    if (closeDialogButton) {
      closeDialogButton.addEventListener("click", closeAll);
    }

    if (closeDialogSecondary) {
      closeDialogSecondary.addEventListener("click", closeAll);
    }

    if (sheetBackdrop) {
      sheetBackdrop.addEventListener("click", closeAll);
    }

    if (dialogBackdrop) {
      dialogBackdrop.addEventListener("click", closeAll);
    }

    document.onkeydown = (event) => {
      if (event.key === "Escape") {
        closeAll();
      }
    };
  }

  function renderDownloadsState(message, stateClass) {
    const showOfflineNotice = !navigator.onLine;

    APP.innerHTML = `
      <section class="downloads-shell">
        ${downloadsHeaderHtml()}

        <section class="downloads-page">
          ${
            showOfflineNotice
              ? '<div class="downloads-notice">You are offline. Only downloaded comics on this device are available.</div>'
              : ""
          }

          <div class="${stateClass}">
            ${escapeHtml(message)}
          </div>
        </section>
      </section>
    `;

    setupProtectedOfflineLinks();
  }

  async function renderDownloadsIndex() {
    renderDownloadsState("Loading downloads...", "downloads-loading");

    const comics = await listOfflineComics();
    const showOfflineNotice = !navigator.onLine;

    APP.innerHTML = `
      <section class="downloads-shell">
        ${downloadsHeaderHtml()}

        <section class="downloads-page">
          ${
            showOfflineNotice
              ? '<div class="downloads-notice">You are offline. Only downloaded comics on this device are available.</div>'
              : ""
          }

          ${
            comics.length === 0
              ? `
                <div class="downloads-empty">
                  No offline comics on this device yet.
                </div>
              `
              : `
                <div class="downloads-grid">
                  ${comics
                    .map(
                      (comic) => `
                        <a
                          class="download-card"
                          data-preview-card
                          href="/profile/avatar/downloads/${encodeURIComponent(
                            comic.comicId,
                          )}"
                        >
                          <div class="download-card-cover">
                            ${
                              comic.coverImage
                                ? `<img src="${comic.coverImage}" alt="${escapeHtml(
                                    comic.title,
                                  )}" />`
                                : '<div class="download-card-cover-placeholder"></div>'
                            }

                            ${
                              comic.previewVideo
                                ? `<video src="${comic.previewVideo}" muted loop playsinline preload="metadata"></video>`
                                : ""
                            }

                            <div class="download-card-overlay"></div>

                            <div class="download-card-body">
                              <h2 class="download-card-title">${escapeHtml(
                                comic.title,
                              )}</h2>
                              <p class="download-card-meta">${comic.cachedPages}/${comic.totalPages} pages cached</p>
                              <p class="download-card-status">Available on this device</p>
                            </div>
                          </div>
                        </a>
                      `,
                    )
                    .join("")}
                </div>
              `
          }
        </section>
      </section>
    `;

    setupProtectedOfflineLinks();
    setupCardPreviewPlayback();
  }

  async function renderComicDetails(comicId) {
    const comic = await getOfflineComicById(comicId);

    if (!comic) {
      APP.innerHTML = `
        <section class="downloads-shell plain-state-shell">
          <div class="plain-state">Offline comic not found on this device.</div>
        </section>
      `;
      return;
    }

    const firstEpisode = comic.episodes[0];
    const readHref = firstEpisode
      ? `/profile/avatar/downloads/${comicId}/${firstEpisode.episodeId}`
      : null;
    const description =
      comic.description?.trim() || "No description available.";

    APP.innerHTML = `
      <section class="details-page">
        <div class="details-hero-wrap">
          <div class="details-hero">
            <div class="details-bg-radial"></div>
            <div class="details-bg-dark"></div>

            <div class="details-back">
              <a class="back-button" href="/profile/avatar/downloads" aria-label="Back">
                ${iconChevronLeft()}
              </a>
            </div>

            <div class="details-hero-media">
              ${renderHeroPreview(
                comic.coverImage,
                comic.previewVideo,
                comic.title,
                "hero-preview",
              )}
            </div>

            <div class="details-bottom-panel-wrap">
              <div class="details-bottom-panel">
                <div class="details-bottom-panel-inner">
                  <h1 class="details-title">${escapeHtml(comic.title)}</h1>

                  <div class="details-meta">
                    <span class="details-age">16+</span>
                    <span>${comic.episodes.length} Episodes</span>
                  </div>

                  <div class="details-button-stack">
                    ${
                      readHref
                        ? `<a class="button-primary" href="${readHref}">${iconPlay()} Read Offline</a>`
                        : `<button class="button-primary is-disabled" type="button" disabled>${iconPlay()} Read Offline</button>`
                    }

                    <button class="button-secondary" id="remove-download-btn" type="button">
                      ${iconTrash()}
                      <span>Remove Download</span>
                    </button>
                  </div>

                  ${renderExpandableDescription(description, "comic-description")}
                </div>
              </div>
            </div>
          </div>

          <div class="details-content">
            <div class="details-content-inner">
              <div class="details-tabbar">
                <button class="details-tab-active" type="button">Episodes</button>
              </div>

              <div class="details-episodes">
                ${
                  comic.episodes.length === 0
                    ? '<div class="details-empty-card">No episodes found.</div>'
                    : comic.episodes
                        .map(
                          (episode, index) => `
                            <a
                              class="episode-row-link"
                              href="/profile/avatar/downloads/${comicId}/${episode.episodeId}"
                            >
                              <div class="episode-row">
                                <div class="episode-thumb">
                                  ${
                                    episode.previewImage
                                      ? `<img src="${episode.previewImage}" alt="${escapeHtml(
                                          episode.title,
                                        )}" />`
                                      : '<div class="episode-thumb-empty">No image</div>'
                                  }
                                </div>

                                <div class="episode-main">
                                  <h3 class="episode-title">${index + 1}. ${escapeHtml(
                                    episode.title,
                                  )}</h3>
                                  <div class="episode-desc">${escapeHtml(
                                    episode.description ||
                                      "No description available.",
                                  )}</div>
                                  <div class="episode-pages">${episode.pageCount} page${
                                    episode.pageCount > 1 ? "s" : ""
                                  }</div>
                                </div>
                              </div>
                            </a>
                          `,
                        )
                        .join("")
                }
              </div>

              <div class="details-footer-label">
                Cached ${comic.cachedPages}/${comic.totalPages} pages
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    setupHeroPreviewPlayback();
    setupExpandableDescriptions();

    const removeButton = document.getElementById("remove-download-btn");

    if (removeButton) {
      removeButton.addEventListener("click", async () => {
        if (removeButton.disabled) return;

        removeButton.disabled = true;
        removeButton.innerHTML = `${iconTrash()} <span>Removing...</span>`;

        try {
          await removeOfflineComic(comicId);
          await removeOfflineDownloadRecord(comicId);
          showDownloadsToast("Download removed");
          navigateTo("/profile/avatar/downloads", { replace: true });
        } catch (error) {
          console.error("Failed to remove offline comic:", error);
          removeButton.disabled = false;
          removeButton.innerHTML = `${iconTrash()} <span>Remove Download</span>`;
          showDownloadsToast("Failed to remove download");
        }
      });
    }
  }

  async function renderEpisodeReader(comicId, episodeId) {
    const data = await getOfflineEpisodeData(comicId, episodeId);

    if (!data) {
      APP.innerHTML = `
        <section class="reader-page-shell">
          <main class="reader-main">
            <div class="empty-card">
              <h2 class="empty-title">Offline episode not found</h2>
              <p class="empty-desc">This episode is not available on this device.</p>
              <div class="empty-actions">
                <a class="button-secondary empty-button" href="/profile/avatar/downloads">Back to Downloads</a>
              </div>
            </div>
          </main>
        </section>
      `;
      return;
    }

    APP.innerHTML = `
      <section class="reader-page-shell">
        <header class="reader-topbar">
          <div class="reader-topbar-inner">
            <div class="reader-top-left">
              <a class="reader-top-back" href="/profile/avatar/downloads/${comicId}" aria-label="Back">
                ${iconArrowLeft()}
              </a>
            </div>

            <div class="reader-top-center">
              <h1 class="reader-top-comic">${escapeHtml(data.comicTitle)}</h1>
              <p class="reader-top-episode">Episode ${data.episodeNumber} · ${escapeHtml(
                data.episodeTitle,
              )}</p>
            </div>

            <div class="reader-top-actions">
              <button class="reader-icon-button" id="open-episodes-sheet" type="button" aria-label="Open episodes">
                <img src="/icons/Menu.png" alt="Menu" width="24" height="24" />
              </button>

              <button class="reader-icon-button" id="open-episode-info" type="button" aria-label="Open episode info">
                <img src="/icons/info.png" alt="Info" width="24" height="24" />
              </button>
            </div>
          </div>
        </header>

        <div class="sheet-backdrop" id="episodes-sheet-backdrop" hidden></div>
        <aside class="sheet-panel" id="episodes-sheet" aria-hidden="true">
          <div class="sheet-header">
            <div>
              <h2 class="sheet-title">Episodes</h2>
              <p class="sheet-description">Browse saved offline episodes</p>
            </div>
            <button class="sheet-close" id="close-episodes-sheet" type="button" aria-label="Close episodes">
              ×
            </button>
          </div>

          <div class="sheet-body">
            ${
              data.episodes.length === 0
                ? '<div class="sheet-empty">No episodes available.</div>'
                : data.episodes
                    .map(
                      (episode, index) => `
                        <a
                          class="sheet-episode-card ${
                            episode.id === episodeId ? "is-active" : ""
                          }"
                          href="/profile/avatar/downloads/${comicId}/${episode.id}"
                        >
                          <div class="sheet-episode-head">
                            <div class="sheet-episode-main">
                              <p class="sheet-episode-number">Episode ${
                                index + 1
                              }</p>
                              <h3 class="sheet-episode-title">${escapeHtml(
                                episode.title,
                              )}</h3>
                              ${
                                episode.description
                                  ? `<p class="sheet-episode-description">${escapeHtml(
                                      episode.description,
                                    )}</p>`
                                  : ""
                              }
                            </div>
                            ${
                              episode.id === episodeId
                                ? '<span class="sheet-episode-badge">Current</span>'
                                : ""
                            }
                          </div>

                          <div class="sheet-episode-meta">
                            ${iconFileImage()}
                            <span>${episode.imageCount ?? 0} pages</span>
                          </div>
                        </a>
                      `,
                    )
                    .join("")
            }
          </div>
        </aside>

        <div class="dialog-backdrop" id="episode-info-backdrop" hidden></div>
        <section class="dialog-panel" id="episode-info-dialog" aria-hidden="true">
          <div class="dialog-header">
            <div>
              <h2 class="dialog-title">Episode Info</h2>
              <p class="dialog-description">Details about the current episode</p>
            </div>
            <button class="sheet-close" id="close-episode-info" type="button" aria-label="Close episode info">
              ×
            </button>
          </div>

          <div class="dialog-body">
            <div class="dialog-card">
              <p class="dialog-label">Comic</p>
              <h3 class="dialog-value">${escapeHtml(data.comicTitle)}</h3>
            </div>

            <div class="dialog-card">
              <p class="dialog-label">Episode</p>
              <h3 class="dialog-value">Episode ${data.episodeNumber}: ${escapeHtml(
                data.episodeTitle,
              )}</h3>
              <p class="dialog-copy">${escapeHtml(
                data.episodeDescription || "Saved for offline reading.",
              )}</p>
            </div>

            <div class="dialog-stats">
              <div class="dialog-card">
                <div class="dialog-stat-head">
                  ${iconBookOpen()}
                  <span>Total Episodes</span>
                </div>
                <p class="dialog-stat-value">${data.episodes.length || 1}</p>
              </div>

              <div class="dialog-card">
                <div class="dialog-stat-head">
                  ${iconFileImage()}
                  <span>Pages</span>
                </div>
                <p class="dialog-stat-value">${data.pages.length}</p>
              </div>
            </div>

            <div class="dialog-actions">
              <a class="button-primary dialog-flex-button" href="/profile/avatar/downloads/${comicId}">
                Back to Comic
              </a>
              <button class="button-outline" id="close-episode-info-secondary" type="button">
                Close
              </button>
            </div>
          </div>
        </section>

        <main class="reader-main">
          ${
            data.pages.length === 0
              ? `
                <div class="empty-card empty-card-reader">
                  <h2 class="empty-title">No pages found</h2>
                  <p class="empty-desc">This offline episode does not have any saved pages yet.</p>
                  <div class="empty-actions">
                    <a class="button-secondary empty-button" href="/profile/avatar/downloads/${comicId}">
                      Back to Comic
                    </a>
                  </div>
                </div>
              `
              : `
                <div class="reader-pages-wrap">
                  ${data.pages
                    .map(
                      (page, index) => `
                        <div class="reader-page-item">
                          <img src="${page.imageUrl}" alt="${escapeHtml(
                            `${data.episodeTitle} - Page ${index + 1}`,
                          )}" />
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
          }
        </main>

        <div class="reader-bottom-fixed">
          <div class="reader-bottom-inner">
            <div class="reader-bottom-spacer"></div>

            <div class="reader-nav">
              ${
                data.previousEpisodeId
                  ? `<a class="reader-nav-btn" href="/profile/avatar/downloads/${comicId}/${data.previousEpisodeId}" aria-label="Previous episode">${iconChevronLeft()}</a>`
                  : `<button class="reader-nav-disabled" type="button" disabled aria-label="Previous episode">${iconChevronLeft()}</button>`
              }

              ${
                data.nextEpisodeId
                  ? `<a class="reader-nav-btn" href="/profile/avatar/downloads/${comicId}/${data.nextEpisodeId}" aria-label="Next episode">${iconChevronRight()}</a>`
                  : `<button class="reader-nav-disabled" type="button" disabled aria-label="Next episode">${iconChevronRight()}</button>`
              }
            </div>
          </div>
        </div>
      </section>
    `;

    setupReaderOverlays();
  }

  function getPathParts() {
    return window.location.pathname.split("/").filter(Boolean);
  }

  function navigateTo(url, options) {
    const replace = !!(options && options.replace);
    const path = typeof url === "string" ? url : url.pathname;

    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }

    render().catch(handleRenderError);
  }

  function handleDocumentNavigation(event) {
    const link = event.target.closest("a[href]");
    if (!link) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    let targetUrl;

    try {
      targetUrl = new URL(href, window.location.origin);
    } catch (_) {
      return;
    }

    if (targetUrl.origin !== window.location.origin) return;
    if (!targetUrl.pathname.startsWith("/profile/avatar/downloads")) return;

    event.preventDefault();
    navigateTo(targetUrl.pathname + targetUrl.search + targetUrl.hash);
  }

  async function render() {
    clearBlobUrls();
    setBodyScrollLock(false);
    document.onkeydown = null;

    const parts = getPathParts();

    if (
      parts.length >= 3 &&
      parts[0] === "profile" &&
      parts[1] === "avatar" &&
      parts[2] === "downloads"
    ) {
      const comicId = parts[3];
      const episodeId = parts[4];

      if (!comicId) {
        await renderDownloadsIndex();
        return;
      }

      if (!episodeId) {
        await renderComicDetails(decodeURIComponent(comicId));
        return;
      }

      await renderEpisodeReader(
        decodeURIComponent(comicId),
        decodeURIComponent(episodeId),
      );
      return;
    }

    await renderDownloadsIndex();
  }

  function handleRenderError(error) {
    console.error("offline shell failed:", error);
    APP.innerHTML = `
      <section class="downloads-page">
        <div class="container">
          <div class="downloads-empty">
            Failed to load offline downloads.
          </div>
        </div>
      </section>
    `;
  }

  window.addEventListener("beforeunload", clearBlobUrls);
  window.addEventListener("popstate", () => {
    render().catch(handleRenderError);
  });
  window.addEventListener("online", () => {
    render().catch(handleRenderError);
  });
  window.addEventListener("offline", () => {
    render().catch(handleRenderError);
  });
  document.addEventListener("click", handleDocumentNavigation);

  render().catch(handleRenderError);
})();
