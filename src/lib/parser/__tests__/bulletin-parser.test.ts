import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it, beforeAll } from "vitest";
import {
  extractBulletinMonth,
  parseBulletin,
  parseEmploymentTable,
} from "../bulletin-parser";

let sampleHtml: string;

beforeAll(() => {
  sampleHtml = readFileSync(
    join(__dirname, "../__fixtures__/sample-bulletin.html"),
    "utf-8"
  );
});

describe("extractBulletinMonth", () => {
  it("extracts the bulletin month from the page title", () => {
    expect(extractBulletinMonth(sampleHtml)).toBe("2026-03");
  });

  it("throws when month cannot be found", () => {
    expect(() => extractBulletinMonth("<html><body>No date here</body></html>")).toThrow(
      "Could not extract bulletin month"
    );
  });
});

describe("parseEmploymentTable", () => {
  it("parses 20 rows from the final action table (4 categories x 5 countries)", () => {
    const rows = parseEmploymentTable(sampleHtml, "final_action");
    expect(rows).toHaveLength(20);
  });

  it("parses 20 rows from the dates for filing table", () => {
    const rows = parseEmploymentTable(sampleHtml, "dates_for_filing");
    expect(rows).toHaveLength(20);
  });

  it("correctly maps category names in final action", () => {
    const rows = parseEmploymentTable(sampleHtml, "final_action");
    const categories = [...new Set(rows.map((r) => r.category))];
    expect(categories.sort()).toEqual(["EB1", "EB2", "EB3", "Other_Workers"]);
  });

  it("correctly maps country columns", () => {
    const rows = parseEmploymentTable(sampleHtml, "final_action");
    const countries = [...new Set(rows.map((r) => r.country_bucket))];
    expect(countries.sort()).toEqual([
      "all_other",
      "china_mainland",
      "india",
      "mexico",
      "philippines",
    ]);
  });

  it("handles C values as current", () => {
    const rows = parseEmploymentTable(sampleHtml, "final_action");
    const eb1AllOther = rows.find(
      (r) => r.category === "EB1" && r.country_bucket === "all_other"
    );
    expect(eb1AllOther).toBeDefined();
    expect(eb1AllOther!.cutoff_kind).toBe("current");
    expect(eb1AllOther!.cutoff_date).toBeNull();
    expect(eb1AllOther!.original_value).toBe("C");
  });

  it("handles U values as unavailable", () => {
    const rows = parseEmploymentTable(sampleHtml, "final_action");
    const otherWorkersMexico = rows.find(
      (r) => r.category === "Other_Workers" && r.country_bucket === "mexico"
    );
    expect(otherWorkersMexico).toBeDefined();
    expect(otherWorkersMexico!.cutoff_kind).toBe("unavailable");
    expect(otherWorkersMexico!.cutoff_date).toBeNull();
    expect(otherWorkersMexico!.original_value).toBe("U");
  });

  it("parses date values correctly", () => {
    const rows = parseEmploymentTable(sampleHtml, "final_action");
    const eb2India = rows.find(
      (r) => r.category === "EB2" && r.country_bucket === "india"
    );
    expect(eb2India).toBeDefined();
    expect(eb2India!.cutoff_kind).toBe("date");
    expect(eb2India!.cutoff_date).toBe("2013-09-15");
    expect(eb2India!.original_value).toBe("15SEP13");
  });

  it("sets bulletin_month on all rows", () => {
    const rows = parseEmploymentTable(sampleHtml, "final_action");
    for (const row of rows) {
      expect(row.bulletin_month).toBe("2026-03");
    }
  });

  it("sets chart_type on all rows", () => {
    const finalRows = parseEmploymentTable(sampleHtml, "final_action");
    for (const row of finalRows) {
      expect(row.chart_type).toBe("final_action");
    }

    const filingRows = parseEmploymentTable(sampleHtml, "dates_for_filing");
    for (const row of filingRows) {
      expect(row.chart_type).toBe("dates_for_filing");
    }
  });
});

describe("parseBulletin", () => {
  it("parses 40 total rows from both tables", () => {
    const result = parseBulletin(sampleHtml);
    expect(result.bulletin_month).toBe("2026-03");
    expect(result.rows).toHaveLength(40);
  });

  it("includes rows from both chart types", () => {
    const result = parseBulletin(sampleHtml);
    const chartTypes = [...new Set(result.rows.map((r) => r.chart_type))];
    expect(chartTypes.sort()).toEqual(["dates_for_filing", "final_action"]);
  });
});
