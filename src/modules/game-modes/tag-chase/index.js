import {
  cleanEmoteId,
  cleanPartyItemId,
  PARTY_ITEMS,
  TAG_CHASE_CONFIG,
} from "./constants.js";
import { createTagChaseRoomState } from "./serverRoomState.js";
import { TagChaseHUD } from "./TagChaseHUD.js";
import { TagChaseWorldFX } from "./TagChaseWorldFX.js";

export const tagChaseMode = {
  id: "tag-chase",
  kind: "special",
  title: "Rượt bắt tốc độ",
  shortTitle: "Rượt bắt",
  description:
    "Khám phá địa danh Huế, tranh tài rượt bắt ngắn rồi cùng hoàn thành nhiệm vụ. Ghi nhận lượt ghé thăm và đóng góp đồng hành.",
  regions: ["quoc-hoc", "quang-trung"],
  enabled: true,
  upcoming: false,
  charmsEnabled: true,
  maxPlayers: 10,
  createClientSession(game) {
    let latestTagState = null;
    let latestPlayers = [];
    let selfId = null;
    let localRole = "runner";
    let localScore = 0;
    let shieldUntil = 0;
    let slowedUntil = 0;
    let coffeeBoostUntil = 0;
    let lastCastAt = 0;
    let lastEmoteAt = 0;
    let inventory = {
      "non-la-shield": 0,
      "perfume-wind": 0,
      "salt-coffee": 0,
    };
    const claimedPickups = new Map();

    const fx = new TagChaseWorldFX(game);
    const hud = new TagChaseHUD(game, {
      onUsePartyItem: (itemId) => usePartyItem(itemId),
      onSendEmote: (emoteId) => sendEmote(emoteId),
    });

    function clearCollisionToast() {
      if (typeof document === "undefined") return;
      const toast = document.querySelector("#collision-toast");
      if (toast) toast.hidden = true;
    }

    function usePartyItem(rawId) {
      if (
        latestTagState?.phase !== "playing" ||
        latestTagState?.stage !== "chase"
      )
        return false;
      const itemId = cleanPartyItemId(rawId);
      if (!itemId || (inventory[itemId] || 0) <= 0) return false;
      if (itemId !== "salt-coffee" && (game?.stun || 0) > 0) {
        hud.showToast(
          "☕ Đang choáng — dùng Cà Phê Muối [F] để giải choáng!",
          1900,
          "alert",
        );
        return false;
      }
      const now = Date.now();
      lastCastAt = now;
      inventory = {
        ...inventory,
        [itemId]: Math.max(0, (inventory[itemId] || 0) - 1),
      };

      if (itemId === "non-la-shield") {
        shieldUntil = now + TAG_CHASE_CONFIG.shieldDurationMs;
        game?.audio?.playShieldActivate?.();
        hud.showToast("👒 Khiên Nón Lá kích hoạt (6s)!", 2200, "success");
      } else if (itemId === "perfume-wind") {
        game?.audio?.playWindGust?.();
        if (game?.bike?.position) {
          fx.spawnWindWave(
            game.bike.position.x,
            game.bike.position.y,
            game.bike.position.z,
          );
        }
        hud.showToast(
          "💨 Gió Sông Hương làm chậm đối thủ quanh bạn!",
          2100,
          "info",
        );
      } else if (itemId === "salt-coffee") {
        if (game) {
          game.stun = 0;
          game.noticeTime = 0;
          game.collisionCooldown = Math.max(game.collisionCooldown || 0, 0.8);
        }
        clearCollisionToast();
        slowedUntil = 0;
        coffeeBoostUntil = now + TAG_CHASE_CONFIG.coffeeBoostDurationMs;
        game?.audio?.playCoffeeBoost?.();
        hud.showToast(
          "☕ Cà Phê Muối! Giải choáng & vọt +25% tốc độ!",
          2200,
          "success",
        );
      }

      game?.online?.sendModeAction?.("use_party_item", { itemId });
      hud.updateInventory(inventory, { stunned: (game?.stun || 0) > 0 });
      return true;
    }

    function sendEmote(rawEmoteId) {
      const emoteId = cleanEmoteId(rawEmoteId);
      if (!emoteId) return false;
      const now = Date.now();
      if (now - lastEmoteAt < TAG_CHASE_CONFIG.emoteCooldownMs) return false;
      lastEmoteAt = now;
      game?.online?.sendModeAction?.("emote", { emoteId });
      return true;
    }

    const onKeyDown = (e) => {
      if (
        game?.sessionActive === false ||
        e.repeat ||
        e.target?.closest?.('input,select,textarea,[contenteditable="true"]')
      ) {
        return;
      }
      const key = e.key?.toLowerCase?.();
      if (key === "q") usePartyItem("non-la-shield");
      else if (key === "e") usePartyItem("perfume-wind");
      else if (key === "f") usePartyItem("salt-coffee");
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKeyDown);
    }

    return {
      get speedMultiplier() {
        const now = Date.now();
        let mult =
          latestTagState?.phase === "playing" &&
          latestTagState?.stage === "chase" &&
          localRole === "hunter"
            ? TAG_CHASE_CONFIG.hunterSpeedMultiplier
            : 1;
        if (now < slowedUntil) mult *= TAG_CHASE_CONFIG.windSlowMultiplier;
        if (now < coffeeBoostUntil)
          mult *= TAG_CHASE_CONFIG.coffeeBoostMultiplier;
        return mult;
      },

      onSnapshot(snapshot, id) {
        selfId = id;
        latestPlayers = snapshot?.players || [];
        const me = latestPlayers.find((p) => p.id === id);
        if (me?.modeData) {
          localRole = me.modeData.role || "runner";
          localScore = me.modeData.score || 0;
          const now = Date.now();
          if (now - lastCastAt > 750) {
            if (!me.modeData.shielded) shieldUntil = 0;
            if (!me.modeData.coffeeBoost) coffeeBoostUntil = 0;
          }
          if (!me.modeData.slowed && now - lastCastAt > 400) {
            slowedUntil = Math.min(slowedUntil, now);
          }
        }
      },

      onServerEvent(msg) {
        if (!msg || typeof msg !== "object") return;
        const now = Date.now();

        if (msg.event === "landmark_visit") {
          hud.showToast(`🗺️ Đã ghé ${msg.title} · +${msg.points}đ`);
          return;
        }

        if (msg.event === "tag_state") {
          const prevPhase = latestTagState?.phase;
          latestTagState = msg;
          fx.stage = msg.phase === "playing" ? msg.stage : null;
          if (msg.stage !== "chase") {
            slowedUntil = 0;
            coffeeBoostUntil = 0;
          }
          if (
            msg.phase !== prevPhase &&
            (msg.phase === "countdown" || msg.phase === "waiting")
          ) {
            shieldUntil = 0;
            slowedUntil = 0;
            coffeeBoostUntil = 0;
          }
          const activeIds = new Set([
            ...(msg.partyBoxes || []).map((b) => b.id),
            ...(msg.coop?.active ? msg.coop.items || [] : []).map((i) => i.id),
          ]);
          for (const key of claimedPickups.keys()) {
            if (!activeIds.has(key) || now - claimedPickups.get(key) > 2500) {
              claimedPickups.delete(key);
            }
          }
          fx.syncState(msg);
          return;
        }

        if (msg.event === "party_inventory") {
          if (msg.inventory) inventory = { ...msg.inventory };
          if (msg.pickedItem && PARTY_ITEMS[msg.pickedItem]) {
            const item = PARTY_ITEMS[msg.pickedItem];
            game?.audio?.playCharmPickup?.("20");
            hud.showToast(
              `🎁 Nhặt được ${item.name} [${item.key}]!`,
              2400,
              "success",
            );
          }
          hud.updateInventory(inventory, { stunned: (game?.stun || 0) > 0 });
          return;
        }

        if (msg.event === "party_used" && msg.itemId === "non-la-shield") {
          shieldUntil =
            now + (msg.durationMs || TAG_CHASE_CONFIG.shieldDurationMs);
          return;
        }

        if (msg.event === "wind_gust") {
          fx.spawnWindWave(
            msg.x ?? game?.bike?.position?.x ?? 0,
            msg.y ?? game?.bike?.position?.y ?? 0.3,
            msg.z ?? game?.bike?.position?.z ?? 0,
          );
          if (msg.casterId !== selfId) game?.audio?.playWindGust?.();
          return;
        }

        if (msg.event === "wind_slowed") {
          slowedUntil =
            now + (msg.durationMs || TAG_CHASE_CONFIG.windSlowDurationMs);
          hud.showToast(
            `💨 Dính Gió Sông Hương từ ${msg.byName || "đối thủ"}!`,
            2100,
            "alert",
          );
          return;
        }

        if (msg.event === "coffee_boost") {
          if (game) {
            game.stun = 0;
            game.noticeTime = 0;
          }
          clearCollisionToast();
          slowedUntil = 0;
          coffeeBoostUntil =
            now + (msg.durationMs || TAG_CHASE_CONFIG.coffeeBoostDurationMs);
          return;
        }

        if (msg.event === "tag_swap") {
          if (msg.youTagged) {
            localRole = "runner";
            game?.audio?.playTagHit?.(false);
            hud.showToast(
              `🔥 Bắt trúng ${msg.victimName}! +${msg.points}đ · Đổi vai Người Chạy!`,
              3000,
              "success",
            );
          } else if (msg.youWereTagged) {
            localRole = "hunter";
            if (game)
              game.stun = Math.max(game.stun || 0, (msg.stunMs || 450) / 1000);
            game?.audio?.playTagHit?.(true);
            hud.showToast(
              `⚡ ${msg.hunterName} bắt trúng bạn! Bạn là Người Săn mới!`,
              3000,
              "alert",
            );
          }
          return;
        }

        if (msg.event === "shield_block") {
          game?.audio?.playShieldBlock?.();
          if (msg.role === "defender") {
            shieldUntil = 0;
            hud.showToast(
              `👒 Khiên Nón Lá hất văng ${msg.attackerName}! +${msg.points}đ!`,
              2800,
              "success",
            );
          } else if (msg.role === "attacker") {
            if (game)
              game.stun = Math.max(game.stun || 0, (msg.stunMs || 800) / 1000);
            hud.showToast(
              `👒 ${msg.defenderName} đang đeo Khiên Nón Lá! Bạn bị choáng!`,
              2600,
              "alert",
            );
          }
          return;
        }

        if (msg.event === "tag_bump") {
          if (game) game.stun = Math.max(game.stun || 0, 0.35);
          game?.audio?.collision?.();
          return;
        }

        if (msg.event === "close_call") {
          game?.audio?.playCloseCall?.();
          const comboText = msg.combo > 1 ? ` x${msg.combo}` : "";
          hud.showToast(
            `💨 Thoát Hiểm Gang Tấc!${comboText} +${msg.points}đ!`,
            2500,
            "success",
          );
          return;
        }

        if (msg.event === "coop_start") {
          hud.showToast(`🏮 Nhiệm vụ toàn phòng: ${msg.title}!`, 3400, "info");
          return;
        }

        if (msg.event === "coop_end") {
          if (msg.success) {
            game?.audio?.playFireworkBurst?.();
            const pos = game?.bike?.position || { x: 0, z: 0 };
            fx.spawnFireworkVolley(pos.x, pos.z);
            hud.showToast(
              `🎆 Hoàn thành: ${msg.title}! Người có đóng góp +${msg.reward}đ!`,
              4200,
              "success",
            );
          } else {
            hud.showToast(`⏳ Hết giờ nhiệm vụ: ${msg.title}`, 2500, "alert");
          }
          return;
        }

        if (msg.event === "tag_banner" && msg.text) {
          hud.showToast(msg.text, 2800, "info");
          return;
        }

        if (msg.event === "emote") {
          const target =
            msg.playerId === selfId
              ? game?.bike
              : game?.online?.avatars?.entries?.get?.(msg.playerId)?.bike;
          if (target) fx.spawnEmoteBubble(target, msg.text);
          game?.audio?.playEmotePop?.();
        }
      },

      handleTrafficContact(actor) {
        if (Date.now() >= shieldUntil) return false;
        shieldUntil = 0;
        if (actor) actor.pause = 1.6;
        if (game) game.collisionCooldown = 2.0;
        game?.online?.sendModeAction?.("traffic_shield_block", {});
        game?.audio?.playShieldBlock?.();
        hud.showToast(
          "👒 Khiên Nón Lá đỡ cho bạn khỏi va chạm! (+30đ)",
          2600,
          "success",
        );
        return true;
      },

      update(dt, elapsed) {
        const now = Date.now();
        const bikePos = game?.bike?.position;
        if (
          bikePos &&
          game?.online?.canMove !== false &&
          !(game?.stun > 0) &&
          latestTagState
        ) {
          for (const box of latestTagState.partyBoxes || []) {
            if (!box?.id || claimedPickups.has(box.id)) continue;
            if (Math.hypot(bikePos.x - box.x, bikePos.z - box.z) <= 2.6) {
              claimedPickups.set(box.id, now);
              fx.hidePickup(box.id);
              game.online?.sendModeAction?.("party_pickup", { boxId: box.id });
            }
          }
          if (latestTagState.coop?.active) {
            for (const item of latestTagState.coop.items || []) {
              if (!item?.id || claimedPickups.has(item.id)) continue;
              if (Math.hypot(bikePos.x - item.x, bikePos.z - item.z) <= 2.7) {
                claimedPickups.set(item.id, now);
                fx.hidePickup(item.id);
                game?.audio?.playCharmPickup?.("10");
                game.online?.sendModeAction?.("coop_pickup", {
                  itemId: item.id,
                });
              }
            }
          }
        }

        const shieldMs = Math.max(0, shieldUntil - now);
        const slowMs = Math.max(0, slowedUntil - now);
        const coffeeMs = Math.max(0, coffeeBoostUntil - now);

        fx.update(
          dt,
          elapsed,
          {
            role: localRole,
            shielded: shieldMs > 0,
            slowed: slowMs > 0,
            coffeeBoost: coffeeMs > 0,
          },
          game?.online?.avatars?.entries,
        );

        hud.updateInventory(inventory, { stunned: (game?.stun || 0) > 0 });
        hud.updateState(
          latestTagState,
          { role: localRole, score: localScore },
          selfId,
          { shieldMs, slowMs, coffeeMs },
        );
        hud.updateRadar(latestPlayers, selfId);
      },

      dispose() {
        if (typeof window !== "undefined") {
          window.removeEventListener("keydown", onKeyDown);
        }
        fx.dispose();
        hud.dispose();
      },
    };
  },

  createServerRoomState(room, roomKey) {
    return createTagChaseRoomState(room, roomKey);
  },
};

export default tagChaseMode;
