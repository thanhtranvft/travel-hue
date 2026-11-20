import test from "node:test";
import assert from "node:assert/strict";
import {
  PLAYER_NAME_STORAGE_KEY,
  getSavedPlayerName,
  savePlayerName,
  clearSavedPlayerName,
} from "../src/ui/SessionUI.js";

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

test("saved player name persists across reloads and clears only on logout", () => {
  const storage = createMemoryStorage();
  assert.equal(getSavedPlayerName(storage), "");

  const saved = savePlayerName("  <Thanh>  ", storage);
  assert.equal(saved, "Thanh");
  assert.equal(storage.getItem(PLAYER_NAME_STORAGE_KEY), "Thanh");
  assert.equal(getSavedPlayerName(storage), "Thanh");

  clearSavedPlayerName(storage);
  assert.equal(getSavedPlayerName(storage), "");
  assert.equal(storage.getItem(PLAYER_NAME_STORAGE_KEY), null);
});
