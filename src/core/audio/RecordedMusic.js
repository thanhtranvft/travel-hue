const recordings = {
  "huethuong.mp3": new URL(
    "../../assets/audio/music/huethuong.mp3",
    import.meta.url,
  ).href,
  "Thuong Ve Mien Trung.mp3": new URL(
    "../../assets/audio/music/Thuong Ve Mien Trung.mp3",
    import.meta.url,
  ).href,
};
export class RecordedMusic {
  constructor(audio, onStatus) {
    this.audio = audio;
    this.onStatus = onStatus;
    this.element = document.createElement("audio");
    this.element.id = "recorded-music";
    this.element.controls = true;
    this.element.loop = true;
    this.element.preload = "metadata";
    this.element.hidden = true;
    document.querySelector("#sound-settings").append(this.element);
    this.version = 0;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.element.pause();
      else if (
        this.audio.enabled &&
        this.audio.musicEnabled &&
        this.audio.track?.kind === "file"
      )
        void this.sync(this.audio.track, true);
    });
  }
  async sync(track, enabled) {
    const version = ++this.version,
      active =
        enabled &&
        this.audio.enabled &&
        this.audio.musicEnabled &&
        track?.kind === "file";
    this.element.hidden = !active;
    if (!active) {
      this.element.pause();
      return;
    }
    const source = recordings[track.file];
    if (!source) {
      this.onStatus("Không tìm thấy file nhạc đã chọn.");
      return;
    }
    try {
      this.audio.initialize();
      if (!this.sourceNode) {
        this.sourceNode = this.audio.ctx.createMediaElementSource(this.element);
        this.sourceNode.connect(this.audio.master);
      }
      if (this.currentFile !== track.file) {
        this.element.pause();
        this.element.src = source;
        this.element.load();
        this.currentFile = track.file;
      }
      await this.audio.ctx.resume();
      if (
        version !== this.version ||
        !this.audio.enabled ||
        !this.audio.musicEnabled ||
        document.hidden
      )
        return;
      await this.element.play();
      if (version === this.version) this.onStatus("");
    } catch (error) {
      if (version === this.version && error.name !== "AbortError")
        this.onStatus("Chạm ▶ trên thanh nhạc để phát file đã chọn.");
    }
  }
  setVolume() {
    /* Music and sound effects share the master volume. */
  }
  dispose() {
    this.element.pause();
    this.element.removeAttribute("src");
    this.element.load();
    this.sourceNode?.disconnect();
  }
}
