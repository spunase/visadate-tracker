import { describe, expect, it } from "vitest";
import { parseDOSDate } from "../date-parser";

describe("parseDOSDate", () => {
  describe("standard date parsing", () => {
    it('parses "15SEP13" → "2013-09-15"', () => {
      const result = parseDOSDate("15SEP13");
      expect(result).toEqual({ kind: "date", date: "2013-09-15" });
    });

    it('parses "01JAN05" → "2005-01-01" (year 2000s)', () => {
      const result = parseDOSDate("01JAN05");
      expect(result).toEqual({ kind: "date", date: "2005-01-01" });
    });

    it('parses "22MAR25" → "2025-03-22" (year 2020s)', () => {
      const result = parseDOSDate("22MAR25");
      expect(result).toEqual({ kind: "date", date: "2025-03-22" });
    });

    it('parses "01JAN00" → "2000-01-01" (boundary: year 00)', () => {
      const result = parseDOSDate("01JAN00");
      expect(result).toEqual({ kind: "date", date: "2000-01-01" });
    });

    it('parses "01JAN30" → "2030-01-01" (boundary: year 30)', () => {
      const result = parseDOSDate("01JAN30");
      expect(result).toEqual({ kind: "date", date: "2030-01-01" });
    });

    it('parses "01JAN31" → "1931-01-01" (boundary: year 31)', () => {
      const result = parseDOSDate("01JAN31");
      expect(result).toEqual({ kind: "date", date: "1931-01-01" });
    });

    it('parses "01DEC99" → "1999-12-01" (year 1900s)', () => {
      const result = parseDOSDate("01DEC99");
      expect(result).toEqual({ kind: "date", date: "1999-12-01" });
    });

    it("parses single-digit day without leading zero", () => {
      const result = parseDOSDate("1SEP13");
      expect(result).toEqual({ kind: "date", date: "2013-09-01" });
    });
  });

  describe("symbolic values", () => {
    it('parses "C" as current', () => {
      const result = parseDOSDate("C");
      expect(result).toEqual({ kind: "current" });
    });

    it('parses "U" as unavailable', () => {
      const result = parseDOSDate("U");
      expect(result).toEqual({ kind: "unavailable" });
    });
  });

  describe("case insensitivity", () => {
    it('parses lowercase "15sep13"', () => {
      const result = parseDOSDate("15sep13");
      expect(result).toEqual({ kind: "date", date: "2013-09-15" });
    });

    it('parses mixed case "15Sep13"', () => {
      const result = parseDOSDate("15Sep13");
      expect(result).toEqual({ kind: "date", date: "2013-09-15" });
    });

    it('parses lowercase "c" as current', () => {
      const result = parseDOSDate("c");
      expect(result).toEqual({ kind: "current" });
    });

    it('parses lowercase "u" as unavailable', () => {
      const result = parseDOSDate("u");
      expect(result).toEqual({ kind: "unavailable" });
    });
  });

  describe("whitespace handling", () => {
    it('trims leading/trailing whitespace: " 15SEP13 "', () => {
      const result = parseDOSDate(" 15SEP13 ");
      expect(result).toEqual({ kind: "date", date: "2013-09-15" });
    });

    it('trims whitespace around "C"', () => {
      const result = parseDOSDate("  C  ");
      expect(result).toEqual({ kind: "current" });
    });

    it('trims whitespace around "U"', () => {
      const result = parseDOSDate(" U ");
      expect(result).toEqual({ kind: "unavailable" });
    });
  });

  describe("error handling", () => {
    it("throws on empty string", () => {
      expect(() => parseDOSDate("")).toThrow();
    });

    it("throws on invalid format", () => {
      expect(() => parseDOSDate("INVALID")).toThrow();
    });

    it("throws on invalid month abbreviation", () => {
      expect(() => parseDOSDate("15XYZ13")).toThrow();
    });
  });

  describe("all months", () => {
    const months = [
      ["JAN", "01"],
      ["FEB", "02"],
      ["MAR", "03"],
      ["APR", "04"],
      ["MAY", "05"],
      ["JUN", "06"],
      ["JUL", "07"],
      ["AUG", "08"],
      ["SEP", "09"],
      ["OCT", "10"],
      ["NOV", "11"],
      ["DEC", "12"],
    ] as const;

    for (const [abbr, num] of months) {
      it(`parses month ${abbr} as ${num}`, () => {
        const result = parseDOSDate(`01${abbr}20`);
        expect(result).toEqual({ kind: "date", date: `2020-${num}-01` });
      });
    }
  });
});
