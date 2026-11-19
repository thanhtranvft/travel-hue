import { cleanPlayerName } from "../core/network/protocol.js";
import config from "../data/online-config.json" with { type: "json" };
export function chooseSession(previousName = "", onStart = () => {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("section");
    overlay.className = "session-overlay";
    overlay.id = "session-entry";
    overlay.innerHTML = `<form class="session-form"><small>HUẾ · CÚN CON ĐI DẠO</small><h2>Bắt đầu chuyến đi</h2><label for="player-name">Tên trên áo của bạn</label><input id="player-name" name="playerName" maxlength="36" autocomplete="nickname" placeholder="Nhập tên của bạn" required><p id="entry-error" role="alert"></p><div class="session-modes"><button type="submit" name="mode" value="explore"><b>Khám phá</b><span>Dạo phố một mình như hiện tại</span></button><button type="submit" name="mode" value="online"><b>Online</b><span>Gặp gỡ · Tối đa 10 người</span></button></div><p class="session-note">Tên hiển thị tối đa 18 ký tự · Không cần tài khoản</p></form>`;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Chọn chế độ chơi");
    document.querySelector("#app").append(overlay);
    const input = overlay.querySelector("input");
    try {
      input.value =
        previousName || localStorage.getItem("hue-player-name") || "";
    } catch {
      input.value = previousName;
    }
    overlay.querySelector('[value="online"]').disabled = !config.enabled;
    overlay.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = cleanPlayerName(input.value);
      if (!name) {
        overlay.querySelector("#entry-error").textContent =
          "Hãy nhập tên của bạn.";
        input.focus();
        return;
      }
      const mode = event.submitter?.value || "explore";
      if (mode === "online" && !config.enabled) return;
      try {
        localStorage.setItem("hue-player-name", name);
      } catch {}
      onStart();
      overlay.remove();
      resolve({ name, mode });
    });
    input.focus();
  });
}
export function createSessionPanel(session, onSwitch) {
  document.querySelector("#session-panel")?.remove();
  const panel = document.createElement("section");
  panel.id = "session-panel";
  panel.innerHTML =
    '<details><summary></summary><ul></ul></details><span class="connection-status" role="status"></span><button type="button">Đổi chế độ</button>';
  const summary = panel.querySelector("summary"),
    list = panel.querySelector("ul"),
    status = panel.querySelector(".connection-status");
  summary.textContent =
    session.mode === "online"
      ? "Online · Đang kết nối…"
      : `${session.name} · Khám phá`;
  panel.querySelector("button").addEventListener("click", onSwitch);
  document.querySelector(".utility-toolbar").append(panel);
  return {
    status(text) {
      status.textContent = text;
    },
    snapshot(message, selfId, areas) {
      summary.textContent = `Online · ${message.players.filter((p) => p.connected).length}/10 người`;
      list.replaceChildren(
        ...message.players.map((p) => {
          const li = document.createElement("li");
          li.textContent = `${p.name}${p.id === selfId ? " (bạn)" : ""} · ${areas.find((a) => a.id === p.region)?.title || p.region}${p.connected ? "" : " · Mất kết nối"}`;
          return li;
        }),
      );
    },
    remove() {
      panel.remove();
    },
  };
}
