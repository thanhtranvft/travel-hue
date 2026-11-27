export function isMobileViewport() {
  return matchMedia("(pointer:coarse), (max-width:760px), (max-height:500px)").matches;
}

const landscapeControllers = new WeakMap();

export function initializeLandscapeMode() {
  const button = document.querySelector("#landscape-toggle"),
    hint = document.querySelector("#orientation-hint"),
    message = document.querySelector("#orientation-message");
  if (!button) return { enter: async () => {}, exit: async () => {} };
  if (landscapeControllers.has(button)) return landscapeControllers.get(button);

  let requested = false,
    ownsFullscreen = false,
    busy = false;
  const update = () => {
    const active = Boolean(requested || ownsFullscreen);
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? "⛶" : "↔";
    const label = active ? "Thoát ngang" : "Chơi ngang";
    button.title = label;
    button.setAttribute("aria-label", label);
  };
  const enter = async ({ showHintOnFailure = true } = {}) => {
    if (busy) return;
    busy = true;
    button.disabled = true;
    try {
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
        if (showHintOnFailure && innerHeight > innerWidth) {
          message.textContent =
            "Hãy bật Tự động xoay và xoay điện thoại sang ngang. Trình duyệt này chưa cho phép khóa ngang tự động.";
          hint.hidden = false;
        } else {
          hint.hidden = true;
        }
      }
    } finally {
      busy = false;
      button.disabled = false;
      update();
    }
  };
  const exit = async () => {
    if (busy) return;
    busy = true;
    button.disabled = true;
    try {
      screen.orientation?.unlock?.();
      requested = false;
      if (ownsFullscreen && document.fullscreenElement)
        await document.exitFullscreen();
      ownsFullscreen = false;
      hint.hidden = true;
    } finally {
      busy = false;
      button.disabled = false;
      update();
    }
  };
  button.addEventListener("click", () =>
    requested || ownsFullscreen ? exit() : enter({ showHintOnFailure: true }),
  );
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
  const onOrientationChange = () => {
    if (innerWidth > innerHeight) hint.hidden = true;
    update();
  };
  screen.orientation?.addEventListener?.("change", onOrientationChange);
  addEventListener("resize", onOrientationChange);
  update();

  const controller = { enter, exit };
  landscapeControllers.set(button, controller);
  return controller;
}

export function initializeMobileUI() {
  const nav = document.querySelector("#district-list"),
    toggle = document.querySelector("#toggle-districts");
  if (!nav || !toggle) {
    initializeLandscapeMode();
    return;
  }
  const small = matchMedia("(max-width:760px), (max-height:500px)");
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
  document.querySelector("#app").addEventListener("pointerdown", (e) => {
    if (e.target?.id === "game" && small.matches) setOpen(false);
  });
  addEventListener("keydown", (event) => {
    if (event.key === "Escape" && small.matches) setOpen(false);
  });
  initializeLandscapeMode();
}

export function initializeAudioUI(audio) {
  const button = document.querySelector("#audio-toggle"),
    settings = document.querySelector("#sound-settings"),
    status = document.querySelector("#audio-status"),
    volume = document.querySelector("#audio-volume");
  let settingsOpen = false;
  const expand = document.createElement("button");
  expand.type = "button";
  expand.id = "audio-settings-toggle";
  expand.setAttribute("aria-controls", "sound-settings");
  button.after(expand);
  const collapse = document.createElement("button");
  collapse.type = "button";
  collapse.className = "audio-collapse";
  collapse.textContent = "Thu gọn ▴";
  collapse.setAttribute("aria-label", "Thu gọn bảng nhạc");
  settings.prepend(collapse);
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
    button.setAttribute("aria-pressed", String(audio.musicEnabled));
    button.textContent = audio.musicEnabled ? "♫" : "♪̸";
    const musicLabel = audio.musicEnabled ? "Tắt nhạc nền" : "Bật nhạc nền";
    button.title = musicLabel;
    button.setAttribute("aria-label", musicLabel);

    settings.hidden = !audio.musicEnabled || !settingsOpen;
    expand.hidden = !audio.musicEnabled || settingsOpen;
    expand.textContent = "⚙";
    expand.title = "Chọn nhạc & âm lượng";
    expand.setAttribute("aria-label", "Mở bảng nhạc");
    expand.setAttribute(
      "aria-expanded",
      String(audio.musicEnabled && settingsOpen),
    );
  };
  collapse.addEventListener("click", () => {
    settingsOpen = false;
    sync();
    expand.focus({ preventScroll: true });
  });
  expand.addEventListener("click", () => {
    settingsOpen = true;
    sync();
    collapse.focus({ preventScroll: true });
  });
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      if (audio.enabled && audio.ctx?.state !== "running") {
        await audio.setEnabled(true);
        if (!audio.musicEnabled) audio.setMusicEnabled(true);
      } else {
        audio.setMusicEnabled(!audio.musicEnabled);
      }
      status.textContent = "";
    } catch {
      status.textContent =
        "Chưa phát được nhạc nền. Hãy chạm nút Nhạc nền để thử lại.";
    } finally {
      button.disabled = false;
      sync();
    }
  });
  volume.addEventListener("input", () => {
    audio.setVolume(Number(volume.value) / 100);
    if (audio.enabled && audio.ctx?.state !== "running") {
      void audio.tryUnlock();
    }
  });
  const prevStateChange = audio.onStateChange;
  audio.onStateChange = () => {
    prevStateChange?.();
    sync();
  };
  audio.onStatus = (text) => (status.textContent = text);
  sync();
}
