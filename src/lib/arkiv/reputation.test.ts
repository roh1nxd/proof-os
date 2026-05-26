import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeReputation } from "./reputation";

describe("computeReputation", () => {
  it("caps score at 100", () => {
    const contributions = Array.from({ length: 20 }, (_, i) => ({
      entityKey: `c-${i}`,
      attributes: {},
      payload: { project: "p", role: "r" },
    }));
    const result = computeReputation({
      contributions,
      endorsementsReceived: [],
      badges: [],
      hasProfile: true,
    });
    assert.equal(result.score, 100);
  });

  it("returns zero for empty builder", () => {
    const result = computeReputation({
      contributions: [],
      endorsementsReceived: [],
      badges: [],
      hasProfile: false,
    });
    assert.equal(result.score, 0);
  });
});
