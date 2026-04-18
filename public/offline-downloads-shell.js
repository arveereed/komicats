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

  async function listOfflineComics() {
    const db = await openOfflineDB();
    const tx = db.transaction(["comics"], "readonly");
    const comicsStore = tx.objectStore("comics");

    const comics = await getAll(comicsStore);
    comics.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    const result = comics.map((comic) => ({
      comicId: comic.comicId,
      title: comic.title,
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
        title: row.episodeTitle || "Untitled Episode",
        episodeIndex: row.episodeIndex || 0,
        pageCount: 1,
        previewUrl:
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
      episodeNumber: currentIndex + 1,
      previousEpisodeId,
      nextEpisodeId,
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

  async function renderDownloadsIndex() {
    const comics = await listOfflineComics();

    APP.innerHTML = `
      <section class="downloads-page">
        <div class="container">
          <div class="downloads-header">
            <svg class="downloads-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <path d="M7 10l5 5 5-5"/>
              <path d="M12 15V3"/>
            </svg>
            <h1 class="downloads-header-title">Downloads</h1>
          </div>

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
                                : ``
                            }

                            ${
                              comic.previewVideo
                                ? `<video src="${comic.previewVideo}" muted loop playsinline preload="metadata"></video>`
                                : ``
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
        </div>
      </section>
    `;

    setupCardPreviewPlayback();
  }

  async function renderComicDetails(comicId) {
    const comic = await getOfflineComicById(comicId);

    if (!comic) {
      APP.innerHTML = `
        <section class="downloads-page">
          <div class="container">
            <div class="downloads-empty">
              Offline comic not found on this device.
            </div>
          </div>
        </section>
      `;
      return;
    }

    const firstEpisode = comic.episodes[0];
    const readHref = firstEpisode
      ? `/profile/avatar/downloads/${comicId}/${firstEpisode.episodeId}`
      : "#";

    APP.innerHTML = `
      <section class="details-page">
        <div class="details-hero-wrap">
          <div class="details-hero">
            <div class="details-bg-radial"></div>
            <div class="details-bg-dark"></div>

            <div class="details-back">
              <a class="back-button" href="/profile/avatar/downloads" aria-label="Back">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </a>
            </div>

            <div class="details-hero-media">
              <div class="hero-preview" data-hero-preview>
                ${
                  comic.coverImage
                    ? `<img src="${comic.coverImage}" alt="${escapeHtml(
                        comic.title,
                      )}" />`
                    : ""
                }

                ${
                  comic.previewVideo
                    ? `<video src="${comic.previewVideo}" muted loop playsinline preload="metadata"></video>`
                    : ""
                }

                <div class="hero-preview-overlay-1"></div>
                <div class="hero-preview-overlay-2"></div>
              </div>
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
                    <a class="button-primary" href="${readHref}">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M8 5v14l11-7z"></path>
                      </svg>
                      Read Offline
                    </a>

                    <button class="button-danger" id="remove-download-btn">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"/>
                        <path d="M8 6V4h8v2"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                      </svg>
                      Remove Download
                    </button>
                  </div>

                  <div class="details-description">
                    Saved for offline reading.
                  </div>

                  <div class="details-footer-label">
                    Cached ${comic.cachedPages}/${comic.totalPages} pages
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="details-content">
            <div class="details-content-inner">
              <div class="details-tabbar">
                <div class="details-tab-active">Episodes</div>
              </div>

              <div class="details-episodes">
                ${comic.episodes
                  .map(
                    (episode) => `
                      <a
                        class="episode-row-link"
                        href="/profile/avatar/downloads/${comicId}/${episode.episodeId}"
                      >
                        <div class="episode-row">
                          <div class="episode-thumb">
                            ${
                              episode.previewUrl
                                ? `<img src="${episode.previewUrl}" alt="${escapeHtml(
                                    episode.title,
                                  )}" />`
                                : ""
                            }
                          </div>

                          <div class="episode-main">
                            <h3 class="episode-title">${episode.episodeIndex + 1}. ${escapeHtml(
                              episode.title,
                            )}</h3>
                            <div class="episode-desc">Available offline.</div>
                            <div class="episode-pages">${episode.pageCount} page${episode.pageCount > 1 ? "s" : ""}</div>
                          </div>

                          <div class="episode-open">Open</div>
                        </div>
                      </a>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    setupHeroPreviewPlayback();

    const removeButton = document.getElementById("remove-download-btn");

    if (removeButton) {
      removeButton.addEventListener("click", async () => {
        removeButton.disabled = true;
        removeButton.textContent = "Removing...";

        try {
          await removeOfflineComic(comicId);
          window.location.href = "/profile/avatar/downloads";
        } catch (error) {
          console.error("Failed to remove offline comic:", error);
          removeButton.disabled = false;
          removeButton.textContent = "Remove Download";
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
                <a class="button-secondary" href="/profile/avatar/downloads">Back to Downloads</a>
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
            <a class="reader-top-back" href="/profile/avatar/downloads/${comicId}" aria-label="Back">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </a>

            <div class="reader-top-center">
              <div class="reader-top-comic">${escapeHtml(data.comicTitle)}</div>
              <div class="reader-top-episode">Episode ${data.episodeNumber} · ${escapeHtml(
                data.episodeTitle,
              )}</div>
            </div>

            <div class="reader-top-pill">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 16V4"/>
                <path d="M7 11l5 5 5-5"/>
                <path d="M5 20h14"/>
              </svg>
            </div>
          </div>
        </header>

        <main class="reader-main">
          ${
            data.pages.length === 0
              ? `
                <div class="empty-card">
                  <h2 class="empty-title">No pages found</h2>
                  <p class="empty-desc">This offline episode does not have any saved pages yet.</p>
                  <div class="empty-actions">
                    <a class="button-secondary" href="/profile/avatar/downloads/${comicId}">
                      Back to Comic
                    </a>
                  </div>
                </div>
              `
              : `
                <div class="reader-pages-wrap">
                  ${data.pages
                    .map(
                      (page) => `
                        <div class="reader-page-item">
                          <img src="${page.imageUrl}" alt="${escapeHtml(
                            data.episodeTitle,
                          )}" />
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
          }
        </main>

        <div class="reader-bottom">
          <div class="reader-bottom-inner">
            <a class="reader-pill" href="/profile/avatar/downloads/${comicId}">
              Episode List
            </a>

            <div class="reader-nav">
              ${
                data.previousEpisodeId
                  ? `
                    <a class="reader-nav-btn" href="/profile/avatar/downloads/${comicId}/${data.previousEpisodeId}">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </a>
                  `
                  : `
                    <span class="reader-nav-disabled">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </span>
                  `
              }

              ${
                data.nextEpisodeId
                  ? `
                    <a class="reader-nav-btn" href="/profile/avatar/downloads/${comicId}/${data.nextEpisodeId}">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </a>
                  `
                  : `
                    <span class="reader-nav-disabled">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </span>
                  `
              }
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function getPathParts() {
    return window.location.pathname.split("/").filter(Boolean);
  }

  async function render() {
    clearBlobUrls();

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

  window.addEventListener("beforeunload", clearBlobUrls);

  render().catch((error) => {
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
  });
})();
