import { describe, it, expect } from "vitest";
import { contrastRatio, meetsAANormal, meetsAALarge } from "./contrast.js";
import { walmartDarkTokens as t } from "./designTokens.js";

describe("theme contrast (WCAG AA targets)", () => {
  it("body text on default background >= 4.5:1", () => {
    expect(meetsAANormal(t.textPrimary, t.midnight)).toBe(true);
    expect(contrastRatio(t.textPrimary, t.midnight)).toBeGreaterThanOrEqual(4.5);
  });

  it("secondary text on default background >= 4.5:1 (normal UI copy)", () => {
    expect(meetsAANormal(t.textSecondary, t.midnight)).toBe(true);
  });

  it("secondary text on elevated surface >= 4.5:1", () => {
    expect(meetsAANormal(t.textSecondary, t.surfaceElevated)).toBe(true);
  });

  it("primary link color on midnight >= 4.5:1", () => {
    expect(meetsAANormal(t.trueBlueOnDark, t.midnight)).toBe(true);
  });

  it("text on Spark Yellow (chip CTA) >= 4.5:1", () => {
    expect(meetsAANormal(t.textOnSpark, t.sparkYellow)).toBe(true);
  });

  it("alert border color vs card surface: large text / UI component 3:1 minimum", () => {
    expect(meetsAALarge(t.alertAccent, t.surfaceElevated)).toBe(true);
  });

  it("white on True Blue for large bold headlines (decorative large type)", () => {
    expect(meetsAALarge(t.white, t.trueBlue)).toBe(true);
  });
});
