import {
  captureScreenshot,
  formatDuration,
  getCaptureCapabilities,
  shareCapturedMedia,
  startClipRecording,
} from "../core/capture/GameplayCapture.js";

export function initializeCaptureShareUI(game, audio) {
  const utilityButtons = document.querySelector(".utility-buttons");
  const topCenter = document.querySelector("#hud-top-center");
  if (!utilityButtons || !topCenter) return null;

  const menuButton = document.createElement("button");
  menuButton.type = "button";
  menuButton.id = "capture-menu-toggle";
  menuButton.textContent = "📷";
  menuButton.title = "Chụp ảnh / Quay clip / Chia sẻ";
  menuButton.setAttribute("aria-label", "Chụp ảnh, quay clip và chia sẻ");
  menuButton.setAttribute("aria-haspopup", "dialog");
  utilityButtons.prepend(menuButton);

  const recPill = document.createElement("aside");
  recPill.id = "recording-pill";
  recPill.setAttribute("role", "status");
  recPill.hidden = true;
  recPill.innerHTML = `
    <span class="rec-dot" aria-hidden="true"></span>
    <span id="rec-timer">REC 00:00 / 00:30</span>
    <span id="rec-audio-tag" class="rec-audio-tag">🔊 Game · 🎙️̸ Không mic</span>
    <button type="button" id="stop-recording-btn" class="rec-stop-btn">■ Dừng</button>
  `;
  topCenter.prepend(recPill);

  const cleanExitBtn = document.createElement("button");
  cleanExitBtn.type = "button";
  cleanExitBtn.id = "clean-mode-exit";
  cleanExitBtn.hidden = true;
  cleanExitBtn.textContent = "👁️ Hiện HUD [H]";
  cleanExitBtn.title = "Thoát chế độ Quay Sạch [H]";
  document.body.append(cleanExitBtn);

  const modal = document.createElement("section");
  modal.id = "capture-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "capture-modal-title");
  modal.hidden = true;
  modal.innerHTML = `
    <div class="capture-dialog">
      <div class="capture-header">
        <h2 id="capture-modal-title">Chia sẻ hành trình Huế</h2>
        <button type="button" class="capture-close" id="capture-close-btn" aria-label="Đóng">✕</button>
      </div>

      <div id="capture-config-view">
        <div class="capture-tabs" role="tablist" aria-label="Chọn cách quay và chia sẻ">
          <button type="button" class="capture-tab" role="tab" id="tab-builtin" aria-selected="true" aria-controls="panel-builtin">🎬 Trong game</button>
          <button type="button" class="capture-tab" role="tab" id="tab-external" aria-selected="false" aria-controls="panel-external">📱 Thiết bị ngoài</button>
        </div>

        <div id="panel-builtin" class="capture-section" role="tabpanel" aria-labelledby="tab-builtin">
          <div class="capture-group">
            <span class="capture-label">Khung hình chia sẻ</span>
            <div class="capture-pills">
              <button type="button" class="capture-pill" data-aspect="full" aria-pressed="true">Ngang / Đầy đủ (YouTube · Facebook)</button>
              <button type="button" class="capture-pill" data-aspect="9:16" aria-pressed="false">Dọc 9:16 (TikTok · Reels)</button>
            </div>
          </div>

          <div class="capture-group">
            <span class="capture-label">Chất lượng video</span>
            <div class="capture-pills">
              <button type="button" class="capture-pill" data-quality="standard" aria-pressed="false">Tiêu chuẩn (720p · 30fps)</button>
              <button type="button" class="capture-pill" data-quality="high" aria-pressed="true">Full HD (1080p · 60fps)</button>
              <button type="button" class="capture-pill" data-quality="ultra" aria-pressed="false">Siêu nét (Gốc · 60fps)</button>
            </div>
          </div>

          <div class="capture-group">
            <span class="capture-label">Thời lượng clip tối đa</span>
            <div class="capture-pills">
              <button type="button" class="capture-pill" data-duration="15" aria-pressed="false">15 giây</button>
              <button type="button" class="capture-pill" data-duration="30" aria-pressed="true">30 giây</button>
              <button type="button" class="capture-pill" data-duration="60" aria-pressed="false">60 giây</button>
            </div>
          </div>

          <label class="capture-check">
            <input type="checkbox" id="capture-watermark" checked />
            <span>Gắn nhãn “Cún con đi dạo Huế” & tên địa danh trên ảnh/clip</span>
          </label>

          <label class="capture-check">
            <input type="checkbox" id="capture-include-hud" />
            <span>Quay / chụp toàn bộ nội dung bên trong game (gồm bảng điểm, bản đồ, thanh tốc độ &amp; giao diện HUD)</span>
          </label>

          <div id="capture-audio-box" class="capture-audio-box">
            <span id="capture-audio-text">🔊 Thu trọn nhạc nền, Ca Huế & âm thanh game · 🎙️ Không xin quyền micro, không thu lời nói của bạn.</span>
            <button type="button" id="capture-enable-audio-btn" class="capture-inline-btn" hidden>Bật âm thanh</button>
          </div>

          <div class="capture-actions">
            <button type="button" id="capture-photo-btn" class="capture-btn secondary">📸 Chụp ảnh ngay</button>
            <button type="button" id="capture-video-btn" class="capture-btn primary">🎬 Quay clip ngắn</button>
          </div>
        </div>

        <div id="panel-external" class="capture-section" role="tabpanel" aria-labelledby="tab-external" hidden>
          <div class="capture-card">
            <h3>1. Chế độ Quay Sạch (Ẩn giao diện HUD)</h3>
            <p>Ẩn toàn bộ nút bấm và bản đồ để bạn quay màn hình bằng iPhone, Android, OBS hoặc TikTok LIVE Studio gọn đẹp hơn.</p>
            <button type="button" id="toggle-clean-mode-btn" class="capture-btn secondary">👁️ Bật Chế độ Quay Sạch [H]</button>
          </div>

          <div class="capture-card">
            <h3>2. Tùy chọn âm thanh khi quay bằng OBS / PC</h3>
            <label class="capture-check">
              <input type="checkbox" id="capture-keep-audio-bg" />
              <span>Giữ nhạc & âm thanh game phát liên tục kể cả khi chuyển sang cửa sổ OBS / tab khác</span>
            </label>
            <ul>
              <li><strong>Quay trên điện thoại:</strong> Kéo Trung tâm điều khiển → Ghi màn hình (tắt Micro để chỉ thu âm thanh game).</li>
              <li><strong>Quay trên PC (OBS):</strong> Chọn Window/Browser Capture và tắt nguồn Mic/Aux nếu không muốn thu giọng nói.</li>
            </ul>
          </div>

          <button type="button" id="share-game-link-btn" class="capture-btn primary">🔗 Chia sẻ / Copy link game</button>
        </div>
      </div>

      <div id="capture-preview-view" class="capture-section" hidden>
        <div class="capture-preview-frame" id="capture-preview-frame"></div>
        <div class="capture-meta-note" id="capture-preview-meta"></div>
        <div class="capture-actions">
          <button type="button" id="capture-share-btn" class="capture-btn primary">🚀 Chia sẻ (FB · TikTok · YT)</button>
          <a id="capture-download-btn" class="capture-btn secondary" download>⬇ Tải về máy</a>
        </div>
        <button type="button" id="capture-retake-btn" class="capture-btn">↺ Chụp / Quay lại</button>
      </div>

      <div class="capture-status" id="capture-status" role="status"></div>
    </div>
  `;
  document.body.append(modal);

  let selectedAspect = "full";
  let selectedQuality = "high";
  let selectedDuration = 30;
  let watermarkEnabled = true;
  let includeHudEnabled = false;
  let cleanMode = false;
  let activeRecorder = null;
  let currentResult = null;
  const capabilities = getCaptureCapabilities();

  const configView = modal.querySelector("#capture-config-view");
  const previewView = modal.querySelector("#capture-preview-view");
  const previewFrame = modal.querySelector("#capture-preview-frame");
  const previewMeta = modal.querySelector("#capture-preview-meta");
  const statusEl = modal.querySelector("#capture-status");
  const audioBox = modal.querySelector("#capture-audio-box");
  const audioText = modal.querySelector("#capture-audio-text");
  const enableAudioBtn = modal.querySelector("#capture-enable-audio-btn");
  const videoBtn = modal.querySelector("#capture-video-btn");
  const photoBtn = modal.querySelector("#capture-photo-btn");
  const downloadBtn = modal.querySelector("#capture-download-btn");
  const shareBtn = modal.querySelector("#capture-share-btn");
  const tabBuiltin = modal.querySelector("#tab-builtin");
  const tabExternal = modal.querySelector("#tab-external");
  const panelBuiltin = modal.querySelector("#panel-builtin");
  const panelExternal = modal.querySelector("#panel-external");
  const cleanModeBtn = modal.querySelector("#toggle-clean-mode-btn");
  const keepBgCheck = modal.querySelector("#capture-keep-audio-bg");
  const watermarkCheck = modal.querySelector("#capture-watermark");
  const includeHudCheck = modal.querySelector("#capture-include-hud");
  const recTimerEl = recPill.querySelector("#rec-timer");
  const recAudioTagEl = recPill.querySelector("#rec-audio-tag");
  const stopRecBtn = recPill.querySelector("#stop-recording-btn");

  const setStatus = (text = "") => {
    statusEl.textContent = text;
  };

  const revokeCurrentResult = () => {
    if (currentResult?.url) {
      try {
        URL.revokeObjectURL(currentResult.url);
      } catch {}
    }
    currentResult = null;
    previewFrame.innerHTML = "";
  };

  const getWatermarkMeta = () => {
    const landmark = document.querySelector("#landmark-card.visible h2")?.textContent?.trim() || "";
    return {
      areaTitle: game?.district?.title || game?.world?.region?.title || "Huế",
      landmarkTitle: landmark,
    };
  };

  const syncAudioBanner = () => {
    const soundReady = Boolean(audio?.enabled && audio?.ctx?.state === "running");
    const soundOn = Boolean(audio?.enabled);
    const musicOn = Boolean(audio?.musicEnabled);
    audioBox.classList.toggle("muted", !soundOn);
    enableAudioBtn.hidden = soundReady;
    if (!soundOn || !soundReady) {
      audioText.textContent =
        "🔊 Chạm vào game hoặc nút bên cạnh để kích hoạt âm thanh & Ca Huế khi quay clip (không thu mic).";
    } else if (!musicOn) {
      audioText.textContent =
        "🔊 Đang thu hiệu ứng & Ca Huế (Nhạc nền ♫ đang tắt) · 🎙️ Không xin quyền micro, không thu lời nói của bạn.";
    } else {
      audioText.textContent =
        "🔊 Thu trọn nhạc nền, Ca Huế & âm thanh game · 🎙️ Không xin quyền micro, không thu lời nói của bạn.";
    }

    if (!capabilities.canRecordVideo) {
      videoBtn.disabled = true;
      videoBtn.title = "Trình duyệt chưa hỗ trợ quay video trực tiếp";
    }
  };

  const setCleanMode = (next) => {
    cleanMode = Boolean(next);
    document.body.classList.toggle("clean-capture-mode", cleanMode);
    cleanExitBtn.hidden = !cleanMode;
    cleanModeBtn.textContent = cleanMode
      ? "👁️ Tắt Chế độ Quay Sạch [H]"
      : "👁️ Bật Chế độ Quay Sạch [H]";
  };

  const openModal = (tab = "builtin") => {
    setStatus("");
    syncAudioBanner();
    selectTab(tab);
    configView.hidden = Boolean(currentResult);
    previewView.hidden = !currentResult;
    modal.hidden = false;
    if (game?.input) game.input.reset();
  };

  const closeModal = () => {
    modal.hidden = true;
    setStatus("");
  };

  const selectTab = (tab) => {
    const isBuiltin = tab !== "external";
    tabBuiltin.setAttribute("aria-selected", String(isBuiltin));
    tabExternal.setAttribute("aria-selected", String(!isBuiltin));
    panelBuiltin.hidden = !isBuiltin;
    panelExternal.hidden = isBuiltin;
  };

  const showPreview = (result) => {
    revokeCurrentResult();
    currentResult = result;
    previewFrame.innerHTML = "";
    if (result.kind === "video") {
      const video = document.createElement("video");
      video.src = result.url;
      video.controls = true;
      video.playsInline = true;
      video.autoplay = false;
      previewFrame.append(video);
      const audioLabel = result.hasAudio
        ? "Có âm thanh & nhạc game · Không thu micro"
        : "Không thu được âm thanh game";
      const hudLabel = result.includeHud ? " · Gồm toàn bộ giao diện HUD" : "";
      const fpsLabel = result.fps ? ` · ${result.fps}fps` : "";
      const sizeMb =
        result.blob?.size > 0
          ? ` · ${(result.blob.size / (1024 * 1024)).toFixed(1)} MB`
          : "";
      previewMeta.textContent = `Clip ${result.durationSec}s · ${result.width}×${result.height}${fpsLabel}${sizeMb} · ${audioLabel}${hudLabel}`;
    } else {
      const img = document.createElement("img");
      img.src = result.url;
      img.alt = "Ảnh chụp hành trình Huế";
      previewFrame.append(img);
      const hudLabel = result.includeHud ? " · Gồm toàn bộ giao diện HUD" : "";
      previewMeta.textContent = `Ảnh PNG · ${result.width}×${result.height}${hudLabel}`;
    }
    downloadBtn.href = result.url;
    downloadBtn.download = result.filename;
    configView.hidden = true;
    previewView.hidden = false;
    modal.hidden = false;
    setStatus("");
  };

  menuButton.addEventListener("click", () => {
    if (activeRecorder) {
      activeRecorder.stop();
      return;
    }
    openModal();
  });

  modal.querySelector("#capture-close-btn").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  tabBuiltin.addEventListener("click", () => selectTab("builtin"));
  tabExternal.addEventListener("click", () => selectTab("external"));

  modal.querySelectorAll("[data-aspect]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedAspect = btn.dataset.aspect || "full";
      modal.querySelectorAll("[data-aspect]").forEach((other) => {
        other.setAttribute("aria-pressed", String(other === btn));
      });
    });
  });

  modal.querySelectorAll("[data-quality]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedQuality = btn.dataset.quality || "high";
      modal.querySelectorAll("[data-quality]").forEach((other) => {
        other.setAttribute("aria-pressed", String(other === btn));
      });
    });
  });

  modal.querySelectorAll("[data-duration]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedDuration = Number(btn.dataset.duration) || 30;
      modal.querySelectorAll("[data-duration]").forEach((other) => {
        other.setAttribute("aria-pressed", String(other === btn));
      });
    });
  });

  watermarkCheck.addEventListener("change", () => {
    watermarkEnabled = Boolean(watermarkCheck.checked);
  });

  includeHudCheck.addEventListener("change", () => {
    includeHudEnabled = Boolean(includeHudCheck.checked);
  });

  enableAudioBtn.addEventListener("click", async () => {
    try {
      await audio?.setEnabled?.(true);
      syncAudioBanner();
      setStatus("Đã kích hoạt âm thanh game.");
    } catch {
      setStatus("Chưa bật được âm thanh. Hãy chạm màn hình hoặc nút ♫ trên góc phải.");
    }
  });

  photoBtn.addEventListener("click", async () => {
    photoBtn.disabled = true;
    setStatus("Đang chụp khung hình…");
    try {
      const meta = getWatermarkMeta();
      const result = await captureScreenshot({
        canvas: game?.getCaptureCanvas?.() || document.querySelector("#game"),
        renderNow: () => game?.renderSnapshotFrame?.(),
        aspect: selectedAspect,
        regionId: game?.world?.region?.id || "hue",
        areaTitle: meta.areaTitle,
        landmarkTitle: meta.landmarkTitle,
        watermark: watermarkEnabled,
        includeHud: includeHudEnabled,
      });
      showPreview(result);
    } catch (err) {
      setStatus(err?.message || "Không thể chụp ảnh lúc này.");
    } finally {
      photoBtn.disabled = false;
    }
  });

  videoBtn.addEventListener("click", async () => {
    if (activeRecorder) return;
    setStatus("Đang khởi động quay clip…");
    try {
      closeModal();
      activeRecorder = await startClipRecording({
        getCanvas: () =>
          game?.getCaptureCanvas?.() || document.querySelector("#game"),
        audio,
        aspect: selectedAspect,
        quality: selectedQuality,
        maxDurationSec: selectedDuration,
        regionId: game?.world?.region?.id || "hue",
        getWatermarkMeta,
        watermark: watermarkEnabled,
        includeHud: includeHudEnabled,
        onTick: ({ elapsedSec, maxDurationSec }) => {
          recTimerEl.textContent = `REC ${formatDuration(elapsedSec)} / ${formatDuration(maxDurationSec)}`;
        },
        onFinish: (result) => {
          activeRecorder = null;
          recPill.hidden = true;
          menuButton.setAttribute("aria-pressed", "false");
          showPreview(result);
        },
        onError: (err) => {
          activeRecorder = null;
          recPill.hidden = true;
          menuButton.setAttribute("aria-pressed", "false");
          openModal();
          setStatus(err?.message || "Không thể hoàn tất quay clip.");
        },
      });
      recAudioTagEl.textContent = activeRecorder.hasAudio
        ? "🔊 Âm thanh game · 🎙️̸ Không mic"
        : "🔇 Tắt âm · 🎙️̸ Không mic";
      recPill.hidden = false;
      menuButton.setAttribute("aria-pressed", "true");
    } catch (err) {
      activeRecorder = null;
      recPill.hidden = true;
      openModal();
      setStatus(err?.message || "Trình duyệt chưa hỗ trợ quay clip.");
    }
  });

  stopRecBtn.addEventListener("click", () => {
    activeRecorder?.stop?.();
  });

  modal.querySelector("#capture-retake-btn").addEventListener("click", () => {
    revokeCurrentResult();
    previewView.hidden = true;
    configView.hidden = false;
    setStatus("");
    syncAudioBanner();
  });

  shareBtn.addEventListener("click", async () => {
    if (!currentResult) return;
    const areaTitle = game?.district?.title || "Huế";
    const res = await shareCapturedMedia({
      blob: currentResult.blob,
      filename: currentResult.filename,
      mimeType: currentResult.mimeType,
      title: `Cún con đi dạo Huế · ${areaTitle}`,
      text: `Khám phá ${areaTitle} bên sông Hương cùng Cún con đi dạo Huế!`,
    });
    if (res.status === "shared") {
      setStatus("Đã mở bảng chia sẻ mạng xã hội.");
    } else if (res.status === "shared-link-only") {
      setStatus(
        "Đã chia sẻ link game. Để đăng clip/ảnh lên Facebook, TikTok, YouTube trên máy tính, hãy bấm Tải về máy.",
      );
    } else if (res.status === "unsupported") {
      setStatus(
        "Trình duyệt này chưa hỗ trợ gửi file trực tiếp. Hãy bấm “Tải về máy” rồi đăng lên Facebook, TikTok hoặc YouTube.",
      );
    }
  });

  cleanModeBtn.addEventListener("click", () => {
    setCleanMode(!cleanMode);
    if (cleanMode) closeModal();
  });
  cleanExitBtn.addEventListener("click", () => setCleanMode(false));

  keepBgCheck.addEventListener("change", () => {
    audio?.setKeepAliveInBackground?.(keepBgCheck.checked);
  });

  modal.querySelector("#share-game-link-btn").addEventListener("click", async () => {
    const url = window.location.href;
    const res = await shareCapturedMedia({
      title: "Cún con đi dạo Huế",
      text: "Cùng dạo quanh Quốc Học, Tràng Tiền, Cầu Gỗ Lim và sông Hương trong không gian 3D!",
      url,
    });
    if (res.status === "shared" || res.status === "shared-link-only") {
      setStatus("Đã chia sẻ đường dẫn game.");
      return;
    }
    try {
      await navigator.clipboard?.writeText?.(url);
      setStatus("Đã sao chép link game vào bộ nhớ tạm.");
    } catch {
      setStatus(`Link game: ${url}`);
    }
  });

  addEventListener("keydown", (e) => {
    if (e.target?.closest?.('input,select,textarea,[contenteditable="true"]')) {
      return;
    }
    if (e.key === "Escape" && !modal.hidden) {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key.toLowerCase() === "h" && !e.repeat && modal.hidden) {
      setCleanMode(!cleanMode);
    }
  });

  return {
    openModal,
    closeModal,
    setCleanMode,
    stopRecording: () => activeRecorder?.stop?.(),
    dispose: () => {
      activeRecorder?.stop?.();
      revokeCurrentResult();
    },
  };
}
