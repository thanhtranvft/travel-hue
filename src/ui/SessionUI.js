import {
  AVATAR_CATALOG,
  cleanAvatarId,
  cleanPlayerName,
  DEFAULT_AVATAR_ID,
} from "../core/network/protocol.js";
import config from "../data/online-config.json" with { type: "json" };

export const PLAYER_NAME_STORAGE_KEY = "hue-player-name";
export const PLAYER_AVATAR_STORAGE_KEY = "hue-player-avatar";

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

export function getSavedAvatar(storage = globalThis.localStorage) {
  try {
    return cleanAvatarId(
      storage?.getItem(PLAYER_AVATAR_STORAGE_KEY) || DEFAULT_AVATAR_ID,
    );
  } catch {
    return DEFAULT_AVATAR_ID;
  }
}

export function saveAvatar(avatarId, storage = globalThis.localStorage) {
  const cleaned = cleanAvatarId(avatarId);
  try {
    storage?.setItem(PLAYER_AVATAR_STORAGE_KEY, cleaned);
  } catch {}
  return cleaned;
}

function chibiBadgeSvg(id) {
  const icons = {
    boy: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="30" r="18" fill="#ffd9be"/><path d="M13 28c0-13 9-20 19-20s19 7 19 20c-3-7-9-11-19-11s-16 4-19 11z" fill="#3a2820"/><path d="M22 14l4-6 6 5 6-5 4 6z" fill="#3a2820"/><circle cx="25" cy="31" r="3.4" fill="#2a1a12"/><circle cx="39" cy="31" r="3.4" fill="#2a1a12"/><circle cx="24" cy="29.8" r="1.2" fill="#fff"/><circle cx="38" cy="29.8" r="1.2" fill="#fff"/><path d="M26 39q6 5 12 0" stroke="#c94c4c" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M18 48h28v10H18z" fill="#f8fafc"/><path d="M24 48l8 10 8-10z" fill="#dc2f2f"/></svg>`,
    girl: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="14" cy="26" r="7" fill="#3b2318"/><circle cx="50" cy="26" r="7" fill="#3b2318"/><circle cx="15" cy="20" r="4" fill="#eb678e"/><circle cx="49" cy="20" r="4" fill="#eb678e"/><circle cx="32" cy="30" r="18" fill="#ffe0c8"/><path d="M14 28c1-13 9-20 18-20s17 7 18 20c-4-7-10-10-18-10s-14 3-18 10z" fill="#3b2318"/><circle cx="25" cy="31" r="3.4" fill="#2a1a12"/><circle cx="39" cy="31" r="3.4" fill="#2a1a12"/><circle cx="24" cy="29.8" r="1.2" fill="#fff"/><circle cx="38" cy="29.8" r="1.2" fill="#fff"/><path d="M27 39q5 4 10 0" stroke="#c94c4c" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M19 48h26v10H19z" fill="#f8fafc"/><path d="M24 48l8 9 8-9z" fill="#dc2f2f"/></svg>`,
    dog: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="14" cy="32" rx="6" ry="12" fill="#b97334" transform="rotate(14 14 32)"/><ellipse cx="50" cy="32" rx="6" ry="12" fill="#b97334" transform="rotate(-14 50 32)"/><circle cx="32" cy="32" r="18" fill="#f1b96b"/><ellipse cx="32" cy="39" rx="11" ry="8" fill="#fce5bd"/><circle cx="25" cy="28" r="3.2" fill="#241812"/><circle cx="39" cy="28" r="3.2" fill="#241812"/><circle cx="24" cy="27" r="1.1" fill="#fff"/><circle cx="38" cy="27" r="1.1" fill="#fff"/><ellipse cx="32" cy="35" rx="4" ry="2.8" fill="#282220"/><path d="M20 49h24v6H20z" fill="#d93636"/><circle cx="32" cy="54" r="3.5" fill="#ffd34e"/></svg>`,
    cat: `<svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="14,24 18,7 29,18" fill="#f5942c"/><polygon points="50,24 46,7 35,18" fill="#f5942c"/><polygon points="17,22 19,11 26,18" fill="#f6a6b2"/><polygon points="47,22 45,11 38,18" fill="#f6a6b2"/><circle cx="32" cy="33" r="18" fill="#f7a53e"/><rect x="30.5" y="16" width="3" height="6" rx="1.5" fill="#c96f1e"/><circle cx="25" cy="31" r="3.3" fill="#2a4518"/><circle cx="39" cy="31" r="3.3" fill="#2a4518"/><circle cx="24" cy="29.8" r="1.1" fill="#fff"/><circle cx="38" cy="29.8" r="1.1" fill="#fff"/><ellipse cx="32" cy="37" rx="3.4" ry="2.5" fill="#f07c86"/><path d="M13 36l9 2M13 40l9-1M51 36l-9 2M51 40l-9-1" stroke="#8a511c" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    cow: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 17c-2-6 1-10 5-7l3 5zM46 17c2-6-1-10-5-7l-3 5z" fill="#f4e6c8"/><ellipse cx="12" cy="27" rx="6" ry="3.5" fill="#9c5e2c" transform="rotate(-18 12 27)"/><ellipse cx="52" cy="27" rx="6" ry="3.5" fill="#9c5e2c" transform="rotate(18 52 27)"/><circle cx="32" cy="31" r="17" fill="#e6af5d"/><circle cx="24" cy="24" r="5" fill="#8a5228"/><ellipse cx="32" cy="39" rx="12" ry="7.5" fill="#fde9ca"/><circle cx="25" cy="28" r="3" fill="#241812"/><circle cx="39" cy="28" r="3" fill="#241812"/><circle cx="28" cy="38" r="1.8" fill="#eb9a9a"/><circle cx="36" cy="38" r="1.8" fill="#eb9a9a"/><circle cx="32" cy="54" r="4" fill="#ffd34e"/></svg>`,
    buffalo: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 22C9 19 6 10 14 7c-2 5 2 9 7 10zM46 22c9-3 12-12 4-15 2 5-2 9-7 10z" fill="#262a31"/><ellipse cx="12" cy="28" rx="6" ry="3.2" fill="#3a404a" transform="rotate(-15 12 28)"/><ellipse cx="52" cy="28" rx="6" ry="3.2" fill="#3a404a" transform="rotate(15 52 28)"/><circle cx="32" cy="32" r="17" fill="#48505b"/><ellipse cx="32" cy="40" rx="11" ry="7" fill="#333942"/><circle cx="25" cy="29" r="3" fill="#17191d"/><circle cx="39" cy="29" r="3" fill="#17191d"/><circle cx="24" cy="28" r="1.1" fill="#fff"/><circle cx="38" cy="28" r="1.1" fill="#fff"/><circle cx="28" cy="39" r="1.8" fill="#1b1e24"/><circle cx="36" cy="39" r="1.8" fill="#1b1e24"/></svg>`,
  };
  return icons[id] || icons.boy;
}

export function renderAvatarGrid(selectedId = DEFAULT_AVATAR_ID) {
  const active = cleanAvatarId(selectedId);
  return `<div class="avatar-grid" role="radiogroup" aria-label="Chọn nhân vật Chibi">${AVATAR_CATALOG.map(
    (a) =>
      `<button type="button" class="avatar-card" data-avatar="${a.id}" role="radio" aria-checked="${String(a.id === active)}" style="--avatar-accent:${a.accent}">
        <span class="avatar-icon">${chibiBadgeSvg(a.id)}</span>
        <span class="avatar-meta"><strong>${a.label}</strong><small>${a.subtitle}</small></span>
      </button>`,
  ).join("")}</div>`;
}

export function chooseSession(previousName = "", onStart = () => {}) {
  const savedName = cleanPlayerName(previousName) || getSavedPlayerName();
  const hasSavedUser = Boolean(savedName);
  let selectedAvatar = getSavedAvatar();
  return new Promise((resolve) => {
    const overlay = document.createElement("section");
    overlay.className = "session-overlay";
    overlay.id = "session-entry";
    overlay.innerHTML = hasSavedUser
      ? `<form class="session-form"><small>HUẾ · CHIBI THAM QUAN</small><h2>Chọn nhân vật & chế độ</h2><p class="session-user">Đang đăng nhập: <strong id="saved-player-name"></strong></p><div class="avatar-picker-label">Mẫu nhân vật 3D Chibi</div>${renderAvatarGrid(selectedAvatar)}<p id="entry-error" role="alert"></p><div class="session-modes"><button type="submit" name="mode" value="explore"><b>Khám phá</b><span>Đi bộ, chạy bộ & đạp xe một mình</span></button><button type="submit" name="mode" value="online"><b>Online</b><span>Gặp gỡ · Tối đa 10 người</span></button></div><p class="session-note">Dùng nút Đăng xuất ở góc trên bên trái để đổi tên</p></form>`
      : `<form class="session-form"><small>HUẾ · CHIBI THAM QUAN</small><h2>Bắt đầu chuyến đi</h2><label for="player-name">Tên hiển thị của bạn</label><input id="player-name" name="playerName" maxlength="36" autocomplete="nickname" placeholder="Nhập tên của bạn" required><div class="avatar-picker-label">Chọn mẫu nhân vật 3D Chibi</div>${renderAvatarGrid(selectedAvatar)}<p id="entry-error" role="alert"></p><div class="session-modes"><button type="submit" name="mode" value="explore"><b>Khám phá</b><span>Đi bộ, chạy bộ & đạp xe một mình</span></button><button type="submit" name="mode" value="online"><b>Online</b><span>Gặp gỡ · Tối đa 10 người</span></button></div><p class="session-note">Tên hiển thị tối đa 18 ký tự · Không cần tài khoản</p></form>`;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Chọn nhân vật và chế độ chơi");
    document.querySelector("#app").append(overlay);
    const input = overlay.querySelector("#player-name");
    if (hasSavedUser) {
      overlay.querySelector("#saved-player-name").textContent = savedName;
    }
    const avatarButtons = [...overlay.querySelectorAll("[data-avatar]")];
    avatarButtons.forEach((btn) =>
      btn.addEventListener("click", () => {
        selectedAvatar = cleanAvatarId(btn.dataset.avatar);
        avatarButtons.forEach((other) =>
          other.setAttribute("aria-checked", String(other === btn)),
        );
      }),
    );
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
      saveAvatar(selectedAvatar);
      onStart();
      overlay.remove();
      resolve({ name, mode, avatar: selectedAvatar });
    });
    (input || overlay.querySelector(".session-modes button"))?.focus();
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
