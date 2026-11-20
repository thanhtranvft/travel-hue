import { cleanPlayerName } from "../core/network/protocol.js";
import config from "../data/online-config.json" with { type: "json" };

export const PLAYER_NAME_STORAGE_KEY = "hue-player-name";

export function getSavedPlayerName(storage = globalThis.localStorage) {
  try {
    return cleanPlayerName(storage?.getItem(PLAYER_NAME_STORAGE_KEY) || "");
  } catch {
    return "";
  }
}

export function savePlayerName(name, storage = globalThis.localStorage) {
  const cleaned = cleanPlayerName(name);
  if (!cleaned) return "";
  try {
    storage?.setItem(PLAYER_NAME_STORAGE_KEY, cleaned);
  } catch {}
  return cleaned;
}

export function clearSavedPlayerName(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(PLAYER_NAME_STORAGE_KEY);
  } catch {}
}

export function chooseSession(previousName = "", onStart = () => {}) {
  const savedName = cleanPlayerName(previousName) || getSavedPlayerName();
  const hasSavedUser = Boolean(savedName);
  return new Promise((resolve) => {
    const overlay = document.createElement("section");
    overlay.className = "session-overlay";
    overlay.id = "session-entry";
    overlay.innerHTML = hasSavedUser
      ? `<form class="session-form"><small>HUẾ · CÚN CON ĐI DẠO</small><h2>Chọn chế độ chơi</h2><p class="session-user">Đang đăng nhập: <strong id="saved-player-name"></strong></p><p id="entry-error" role="alert"></p><div class="session-modes"><button type="submit" name="mode" value="explore"><b>Khám phá</b><span>Dạo phố một mình như hiện tại</span></button><button type="submit" name="mode" value="online"><b>Online</b><span>Gặp gỡ · Tối đa 10 người</span></button></div><p class="session-note">Dùng nút Đăng xuất ở góc trên bên trái để đổi tên</p></form>`
      : `<form class="session-form"><small>HUẾ · CÚN CON ĐI DẠO</small><h2>Bắt đầu chuyến đi</h2><label for="player-name">Tên trên áo của bạn</label><input id="player-name" name="playerName" maxlength="36" autocomplete="nickname" placeholder="Nhập tên của bạn" required><p id="entry-error" role="alert"></p><div class="session-modes"><button type="submit" name="mode" value="explore"><b>Khám phá</b><span>Dạo phố một mình như hiện tại</span></button><button type="submit" name="mode" value="online"><b>Online</b><span>Gặp gỡ · Tối đa 10 người</span></button></div><p class="session-note">Tên hiển thị tối đa 18 ký tự · Không cần tài khoản</p></form>`;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Chọn chế độ chơi");
    document.querySelector("#app").append(overlay);
    const input = overlay.querySelector("#player-name");
    if (hasSavedUser) {
      overlay.querySelector("#saved-player-name").textContent = savedName;
    }
    overlay.querySelector('[value="online"]').disabled = !config.enabled;
    overlay.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = hasSavedUser
        ? savedName
        : cleanPlayerName(input?.value || "");
      if (!name) {
        overlay.querySelector("#entry-error").textContent =
          "Hãy nhập tên của bạn.";
        input?.focus();
        return;
      }
      const mode = event.submitter?.value || "explore";
      if (mode === "online" && !config.enabled) return;
      savePlayerName(name);
      onStart();
      overlay.remove();
      resolve({ name, mode });
    });
    (input || overlay.querySelector('.session-modes button'))?.focus();
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
