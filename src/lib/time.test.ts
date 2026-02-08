import { describe, it, expect } from "vitest";
import { stepTime, clampTime, jumpTime } from "./time";

describe("clampTime", () => {
  it("clamps to [0, duration]", () => {
    expect(clampTime(-1, 100)).toBe(0);
    expect(clampTime(0, 100)).toBe(0);
    expect(clampTime(50, 100)).toBe(50);
    expect(clampTime(100, 100)).toBe(100);
    expect(clampTime(101, 100)).toBe(100);
  });

  it("handles zero duration", () => {
    expect(clampTime(5, 0)).toBe(0);
  });
});

describe("stepTime", () => {
  it("steps forward by stepSize", () => {
    expect(stepTime(0, 0.1, 1)).toBe(0.1);
    expect(stepTime(10, 0.033, 1)).toBe(10.033);
  });

  it("steps backward by stepSize", () => {
    expect(stepTime(1, 0.1, -1)).toBe(0.9);
    expect(stepTime(10, 0.05, -1)).toBe(9.95);
  });

  it("does not go below 0 without duration", () => {
    expect(stepTime(0, 0.1, -1)).toBe(0);
    expect(stepTime(0.05, 0.1, -1)).toBe(0);
  });

  it("clamps to [0, duration] when duration provided", () => {
    expect(stepTime(0, 0.1, -1, 100)).toBe(0);
    expect(stepTime(99.9, 0.1, 1, 100)).toBe(100);
    expect(stepTime(100, 0.1, 1, 100)).toBe(100);
  });
});

describe("jumpTime", () => {
  it("adds seconds", () => {
    expect(jumpTime(0, 5)).toBe(5);
    expect(jumpTime(10, -3)).toBe(7);
  });

  it("does not go below 0 without duration", () => {
    expect(jumpTime(0, -5)).toBe(0);
  });

  it("clamps to [0, duration] when duration provided", () => {
    expect(jumpTime(0, -5, 100)).toBe(0);
    expect(jumpTime(98, 5, 100)).toBe(100);
  });
});
