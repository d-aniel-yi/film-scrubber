import { describe, it, expect } from "vitest";
import { extractVideoId } from "./youtube";

const ID = "dQw4w9WgXcQ";

describe("extractVideoId", () => {
  it("extracts ID from youtube.com/watch?v=ID", () => {
    expect(extractVideoId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(extractVideoId(`https://youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it("extracts ID from youtu.be/ID", () => {
    expect(extractVideoId(`https://youtu.be/${ID}`)).toBe(ID);
  });

  it("extracts ID from youtube.com/shorts/ID", () => {
    expect(extractVideoId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
  });

  it("extracts ID from youtube.com/embed/ID", () => {
    expect(extractVideoId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
  });

  it("returns null for null, undefined, empty string", () => {
    expect(extractVideoId(null)).toBeNull();
    expect(extractVideoId(undefined)).toBeNull();
    expect(extractVideoId("")).toBeNull();
    expect(extractVideoId("   ")).toBeNull();
  });

  it("returns null for invalid or unsupported URLs", () => {
    expect(extractVideoId("https://example.com")).toBeNull();
    expect(extractVideoId("https://youtube.com")).toBeNull();
    expect(extractVideoId("not a url")).toBeNull();
    expect(extractVideoId("https://www.youtube.com/watch")).toBeNull();
    expect(extractVideoId("https://www.youtube.com/watch?v=")).toBeNull();
    expect(extractVideoId("https://www.youtube.com/watch?v=short")).toBeNull(); // ID must be 11 chars
  });

  it("trims whitespace", () => {
    expect(extractVideoId(`  https://www.youtube.com/watch?v=${ID}  `)).toBe(ID);
  });
});
