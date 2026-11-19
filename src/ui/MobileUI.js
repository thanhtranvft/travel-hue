import { RecordedMusic } from "../core/audio/RecordedMusic.js";
export function initializeMobileUI() {
  const nav = document.querySelector("#district-list"),
    toggle = document.querySelector("#toggle-districts"),
    small = matchMedia("(max-width:760px), (max-height:500px)");
  const setOpen = (open) => {
    nav.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };
  setOpen(!small.matches);
  small.addEventListener("change", () => setOpen(!small.matches));
  toggle.addEventListener("click", () => setOpen(nav.hidden));
  document.querySelectorAll("[data-district]").forEach((button) =>
    button.addEventListener("click", () => {
      if (small.matches) {
        setOpen(false);
        toggle.focus({ preventScroll: true });
      }
    }),
  );
  document.querySelector("#game").addEventListener("pointerdown", () => {
    if (small.matches) setOpen(false);
  });
  addEventListener("keydown", (event) => {
    if (event.key === "Escape" && small.matches) setOpen(false);
  });
  const button = document.querySelector("#landscape-toggle"),
    hint = document.querySelector("#orientation-hint"),
    message = document.querySelector("#orientation-message");
  let requested = false,
    ownsFullscreen = false;
  const update = () => {
    button.setAttribute("aria-pressed", String(requested || ownsFullscreen));
    button.textContent =
      requested || ownsFullscreen ? "⛶ Thoát ngang" : "↔ Chơi ngang";
  };
  button.addEventListener("click", async () => {
    if (button.disabled) return;
    button.disabled = true;
    try {
      if (requested || ownsFullscreen) {
        screen.orientation?.unlock?.();
        requested = false;
        if (ownsFullscreen && document.fullscreenElement)
          await document.exitFullscreen();
        ownsFullscreen = false;
        hint.hidden = true;
      } else {
        if (
          document.documentElement.requestFullscreen &&
          !document.fullscreenElement
        ) {
          try {
            await document.documentElement.requestFullscreen();
            ownsFullscreen = true;
          } catch {
            /* Portrait guidance remains available. */
          }
        }
        try {
          if (!screen.orientation?.lock)
            throw new Error("Orientation unavailable");
          await screen.orientation.lock("landscape");
          requested = true;
          hint.hidden = true;
        } catch {
          message.textContent =
            "Hãy bật Tự động xoay và xoay điện thoại sang ngang. Trình duyệt này chưa cho phép khóa ngang tự động.";
          hint.hidden = false;
        }
      }
    } finally {
      button.disabled = false;
      update();
    }
  });
  document
    .querySelector("#dismiss-orientation")
    .addEventListener("click", () => (hint.hidden = true));
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && ownsFullscreen) {
      ownsFullscreen = false;
      requested = false;
      screen.orientation?.unlock?.();
      update();
    }
  });
  screen.orientation?.addEventListener?.("change", () => {
    if (innerWidth > innerHeight) hint.hidden = true;
  });
}

export function initializeAudioUI(audio) {
  const button = document.querySelector("#audio-toggle"),
    settings = document.querySelector("#sound-settings"),
    status = document.querySelector("#audio-status"),
    volume = document.querySelector("#audio-volume");
  audio.recordedMusic = new RecordedMusic(
    audio,
    (text) => (status.textContent = text),
  );
  const trackLabel = document.createElement("label");
  trackLabel.className = "track-selector";
  trackLabel.textContent = "Nhạc nền";
  const tracks = document.createElement("select");
  tracks.id = "music-track";
  tracks.setAttribute("aria-label", "Chọn nhạc nền Huế");
  for (const track of audio.tracks) {
    const option = document.createElement("option");
    option.value = track.id;
    option.textContent = track.title;
    tracks.append(option);
  }
  try {
    const saved = localStorage.getItem("hue-music-track");
    if (saved) audio.setTrack(saved);
  } catch {}
  tracks.value = audio.track?.id || "";
  tracks.disabled = audio.tracks.length === 0;
  trackLabel.append(tracks);
  settings.prepend(trackLabel);
  tracks.addEventListener("change", () => {
    audio.setTrack(tracks.value);
    try {
      localStorage.setItem("hue-music-track", tracks.value);
    } catch {}
  });
  const sync = () => {
    button.setAttribute("aria-pressed", String(audio.enabled));
    button.textContent = audio.enabled ? "♫ Tắt nhạc" : "♫ Bật nhạc";
    settings.hidden = !audio.enabled;
  };
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      await audio.setEnabled(!audio.enabled);
      status.textContent = "";
    } catch {
      status.textContent =
        "Chưa phát được âm thanh. Hãy chạm Bật nhạc để thử lại.";
    } finally {
      button.disabled = false;
      sync();
    }
  });
  volume.addEventListener("input", () =>
    audio.setVolume(Number(volume.value) / 100),
  );
  audio.onStatus = (text) => (status.textContent = text);
  sync();
}
