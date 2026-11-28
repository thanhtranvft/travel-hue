import { HUE_POEMS, pickHuePoemIndex } from "../../data/world/hue-poems.js";
import { bindMultiTouchAction } from "../input/TouchControls.js";

const REVEAL_CHARS_PER_SEC = 10.5;

export class CafeLounge {
  constructor(game) {
    this.game = game;
    this.activeSeat = null;
    this.previousPose = null;
    this.declinedSeatId = null;
    this.declinedUntil = -Infinity;
    this.poemIndex = 0;
    this.revealedChars = 0;
    this.lastRenderedCount = -1;
    this.lastRenderedPoemId = null;
    this.ui = null;
    if (typeof document !== "undefined") {
      this.mountUi();
    }
  }

  mountUi() {
    const host = document.querySelector(".hud") || document.body;
    if (!host) return;

    const seatPrompt = document.createElement("aside");
    seatPrompt.id = "cafe-seat-prompt";
    seatPrompt.hidden = true;
    seatPrompt.innerHTML = `
      <div class="cafe-prompt-head">
        <span class="cafe-prompt-icon" aria-hidden="true">☕</span>
        <div>
          <strong data-cafe-prompt-title>Quán Cà phê Huế</strong>
          <p data-cafe-prompt-desc>Ngồi xuống nhâm nhi cà phê, nghe nhạc quán và thưởng thức thơ Huế.</p>
        </div>
      </div>
      <div class="cafe-prompt-actions">
        <button type="button" class="cafe-btn cafe-btn-primary" data-cafe-action="sit">Ngồi uống cà phê [G]</button>
        <button type="button" class="cafe-btn cafe-btn-ghost" data-cafe-action="dismiss">Để sau</button>
      </div>
    `;

    const poetryPanel = document.createElement("section");
    poetryPanel.id = "cafe-poetry-panel";
    poetryPanel.hidden = true;
    poetryPanel.setAttribute("aria-live", "polite");
    poetryPanel.innerHTML = `
      <div class="cafe-poetry-head">
        <div>
          <span class="cafe-poetry-kicker" data-cafe-venue>Quán Cà phê Huế</span>
          <strong data-poem-title>Chiều Bên Sông Hương</strong>
        </div>
      </div>
      <p class="cafe-poetry-sub" data-poem-subtitle>Nhâm nhi tách cà phê nhìn dòng nước lững lờ</p>
      <div class="cafe-poetry-body" data-poem-body></div>
      <div class="cafe-poetry-actions">
        <button type="button" class="cafe-btn cafe-btn-primary" data-cafe-action="next-poem">Đổi bài thơ</button>
        <button type="button" class="cafe-btn cafe-btn-ghost" data-cafe-action="stand">Đứng dậy [Esc]</button>
      </div>
    `;

    host.append(seatPrompt, poetryPanel);

    const sitBtn = seatPrompt.querySelector('[data-cafe-action="sit"]');
    const dismissBtn = seatPrompt.querySelector('[data-cafe-action="dismiss"]');
    const nextPoemBtn = poetryPanel.querySelector('[data-cafe-action="next-poem"]');
    const standBtn = poetryPanel.querySelector('[data-cafe-action="stand"]');

    bindMultiTouchAction(sitBtn, () => this.enterSeat());
    bindMultiTouchAction(dismissBtn, () => this.dismissPrompt());
    bindMultiTouchAction(nextPoemBtn, () => this.cyclePoem());
    bindMultiTouchAction(standBtn, () => this.exitSeat());

    this.ui = {
      seatPrompt,
      poetryPanel,
      promptTitle: seatPrompt.querySelector("[data-cafe-prompt-title]"),
      promptDesc: seatPrompt.querySelector("[data-cafe-prompt-desc]"),
      venueEl: poetryPanel.querySelector("[data-cafe-venue]"),
      poemTitle: poetryPanel.querySelector("[data-poem-title]"),
      poemSubtitle: poetryPanel.querySelector("[data-poem-subtitle]"),
      poemBody: poetryPanel.querySelector("[data-poem-body]"),
    };
  }

  isActive() {
    return Boolean(this.activeSeat);
  }

  reset() {
    if (this.activeSeat) {
      this.exitSeat({ silent: true });
    }
    this.declinedSeatId = null;
    this.declinedUntil = -Infinity;
    this.previousPose = null;
    this.revealedChars = 0;
    this.lastRenderedCount = -1;
    this.lastRenderedPoemId = null;
    if (typeof document !== "undefined") {
      delete document.body.dataset.cafeLounge;
    }
    this.refreshUi();
  }

  findNearbySeat(maxDist = 3.8) {
    if (this.activeSeat || this.game.riverActivities?.isActive?.()) return null;
    const spots = this.game.world?.cafeSpots;
    if (!Array.isArray(spots) || !spots.length) return null;
    const p = this.game.bike?.position;
    if (!p) return null;
    let best = null;
    let bestDist = maxDist;
    for (const spot of spots) {
      const d = Math.hypot(spot.x - p.x, spot.z - p.z);
      const dy = Math.abs((spot.y ?? 0) - (p.y ?? 0));
      if (d <= bestDist && dy <= 1.65) {
        bestDist = d;
        best = spot;
      }
    }
    return best;
  }

  dismissPrompt() {
    const spot = this.findNearbySeat();
    if (spot) {
      this.declinedSeatId = spot.id;
      this.declinedUntil = (this.game.elapsed || 0) + 5;
    }
    this.refreshUi();
  }

  handleKeyG() {
    if (this.game.riverActivities?.isActive?.()) return false;
    if (this.activeSeat) {
      return this.exitSeat();
    }
    const spot = this.findNearbySeat();
    if (spot) {
      return this.enterSeat(spot);
    }
    return false;
  }

  handleEscape() {
    if (!this.activeSeat) return false;
    return this.exitSeat();
  }

  enterSeat(spot = null) {
    if (this.game.riverActivities?.isActive?.()) return false;
    const target = spot || this.findNearbySeat();
    if (!target) return false;

    const bike = this.game.bike;
    this.previousPose = {
      x: bike.position.x,
      y: bike.position.y,
      z: bike.position.z,
      heading: bike.motion.heading,
    };
    this.activeSeat = target;
    this.declinedSeatId = null;
    this.declinedUntil = -Infinity;
    this.game.auto = false;

    bike.position.set(target.x, target.y, target.z);
    bike.motion.heading = target.heading;
    bike.motion.speed = 0;
    bike.motion.lean = 0;
    bike.rotation.set(0, target.heading, 0);
    bike.setActivityStance("cafe");

    this.game.cameraYaw = target.heading;
    if (this.game.input) {
      this.game.input.reset?.();
      this.game.input.recenterRequested = true;
    }

    void this.game.audio?.tryUnlock?.();
    this.game.audio?.setCafeMode?.(true, target);

    this.poemIndex = pickHuePoemIndex(
      target.venueId || target.title || target.id,
      this.poemIndex,
    );
    this.revealedChars = 0;
    this.lastRenderedCount = -1;
    this.lastRenderedPoemId = null;

    if (typeof document !== "undefined") {
      document.body.dataset.cafeLounge = "active";
    }
    this.game.syncMode?.();
    this.game.updateHud?.();
    this.refreshUi();
    return true;
  }

  exitSeat({ silent = false } = {}) {
    if (!this.activeSeat) return false;
    const seat = this.activeSeat;
    this.activeSeat = null;

    this.game.audio?.setCafeMode?.(false);

    const bike = this.game.bike;
    const world = this.game.world;
    const rp = seat.returnPose || this.previousPose || {
      x: seat.x + Math.sin(seat.heading) * 1.1,
      y: seat.y,
      z: seat.z + Math.cos(seat.heading) * 1.1,
      heading: seat.heading,
    };
    const safeY =
      world?.groundAt?.(rp.x, rp.z, rp.y ?? seat.y) ?? rp.y ?? seat.y ?? 0.3;
    const heading = Number.isFinite(rp.heading) ? rp.heading : seat.heading;

    bike.setActivityStance(null);
    bike.position.set(rp.x, safeY, rp.z);
    bike.motion.heading = heading;
    bike.motion.speed = 0;
    bike.motion.lean = 0;
    bike.rotation.set(0, heading, 0);

    this.game.cameraYaw = heading;
    if (this.game.input) {
      this.game.input.reset?.();
      this.game.input.recenterRequested = true;
    }

    if (!silent) {
      this.declinedSeatId = seat.id;
      this.declinedUntil = (this.game.elapsed || 0) + 4;
    }
    if (typeof document !== "undefined") {
      delete document.body.dataset.cafeLounge;
    }
    if (!silent) {
      this.game.syncMode?.();
      this.game.updateHud?.();
    }
    this.refreshUi();
    return true;
  }

  cyclePoem() {
    if (!HUE_POEMS.length) return;
    this.poemIndex = (this.poemIndex + 1) % HUE_POEMS.length;
    this.revealedChars = 0;
    this.lastRenderedCount = -1;
    this.lastRenderedPoemId = null;
    this.refreshUi();
  }

  getActivePoem() {
    return HUE_POEMS[this.poemIndex % HUE_POEMS.length] || HUE_POEMS[0];
  }

  stepPhysics(dt) {
    if (!this.activeSeat) return false;
    const bike = this.game.bike;
    const seat = this.activeSeat;
    bike.position.set(seat.x, seat.y, seat.z);
    bike.motion.heading = seat.heading;
    bike.motion.speed = 0;
    bike.motion.lean = 0;
    bike.rotation.set(0, seat.heading, 0);
    bike.update(dt, 0, 0, true, { poseOnly: true, stance: "cafe" });
    return true;
  }

  advancePoetry(dt) {
    if (!this.activeSeat) return;
    const poem = this.getActivePoem();
    if (!poem) return;
    const totalChars = poem.verses.reduce((sum, line) => sum + line.length, 0);
    if (this.revealedChars < totalChars) {
      this.revealedChars = Math.min(
        totalChars,
        this.revealedChars + Math.max(0, dt) * REVEAL_CHARS_PER_SEC,
      );
    }
  }

  update(dt = 0.016) {
    if (this.activeSeat) {
      this.advancePoetry(dt);
    }
    this.refreshUi();
  }

  refreshUi() {
    if (!this.ui) return;
    const {
      seatPrompt,
      poetryPanel,
      promptTitle,
      promptDesc,
      venueEl,
      poemTitle,
      poemSubtitle,
      poemBody,
    } = this.ui;

    if (this.activeSeat) {
      seatPrompt.hidden = true;
      poetryPanel.hidden = false;
      const poem = this.getActivePoem();
      const charCount = Math.floor(this.revealedChars);
      if (
        poem &&
        (poem.id !== this.lastRenderedPoemId || charCount !== this.lastRenderedCount)
      ) {
        this.lastRenderedPoemId = poem.id;
        this.lastRenderedCount = charCount;
        venueEl.textContent = `☕ ${this.activeSeat.title || "Quán Cà phê Huế"}`;
        poemTitle.textContent = poem.title;
        poemSubtitle.textContent = poem.subtitle || "";

        const totalChars = poem.verses.reduce((sum, line) => sum + line.length, 0);
        let remaining = charCount;
        let cursorPlaced = false;
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < poem.verses.length; i++) {
          const line = poem.verses[i];
          if (remaining <= 0 && i > 0) break;
          const p = document.createElement("p");
          p.className = "cafe-poetry-verse";
          const sliceLen = Math.max(0, Math.min(line.length, remaining));
          p.textContent = line.slice(0, sliceLen);
          remaining -= sliceLen;
          if (!cursorPlaced && charCount < totalChars && sliceLen < line.length) {
            const cursor = document.createElement("span");
            cursor.className = "cafe-poetry-cursor";
            cursor.setAttribute("aria-hidden", "true");
            p.append(cursor);
            cursorPlaced = true;
          }
          fragment.append(p);
          if (sliceLen < line.length) break;
        }
        if (!cursorPlaced && charCount < totalChars) {
          const p = document.createElement("p");
          p.className = "cafe-poetry-verse";
          const cursor = document.createElement("span");
          cursor.className = "cafe-poetry-cursor";
          cursor.setAttribute("aria-hidden", "true");
          p.append(cursor);
          fragment.append(p);
        }
        poemBody.replaceChildren(fragment);
      }
      return;
    }

    poetryPanel.hidden = true;
    const spot = this.findNearbySeat();
    const now = this.game.elapsed || 0;
    const suppressed =
      spot && this.declinedSeatId === spot.id && now < this.declinedUntil;
    if (spot && !suppressed) {
      promptTitle.textContent = spot.title || "Quán Cà phê Huế";
      promptDesc.textContent =
        "Ngồi tại ghế thưởng thức cà phê, nhạc quán êm dịu và thơ xứ Huế.";
      seatPrompt.hidden = false;
    } else {
      seatPrompt.hidden = true;
    }
  }
}
