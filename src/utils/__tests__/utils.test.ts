import { formatFileSize, formatDate, formatCurrency } from "../utils";

describe("Utility Functions", () => {
  describe("formatFileSize", () => {
    test("formats bytes correctly", () => {
      expect(formatFileSize(500)).toBe("500 B");
    });

    test("formats kilobytes correctly", () => {
      expect(formatFileSize(1500)).toBe("1.5 KB");
    });

    test("formats megabytes correctly", () => {
      expect(formatFileSize(1500000)).toBe("1.4 MB");
    });

    test("formats gigabytes correctly", () => {
      expect(formatFileSize(1500000000)).toBe("1.4 GB");
    });
  });

  describe("formatDate", () => {
    test("formats date without time", () => {
      const date = new Date(2023, 0, 15); // January 15, 2023
      const dateString = date.toISOString();

      // This will depend on the locale, but we can check the format
      const formatted = formatDate(dateString, false);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    test("formats date with time", () => {
      const date = new Date(2023, 0, 15, 14, 30); // January 15, 2023, 14:30
      const dateString = date.toISOString();

      // This will depend on the locale, but we can check the format
      const formatted = formatDate(dateString, true);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });
  });

  describe("formatCurrency", () => {
    test("formats BRL currency correctly", () => {
      const formatted = formatCurrency(1234.56);
      // This will depend on the locale, but we can check for currency symbol
      expect(formatted).toContain("R$");
      expect(formatted).toContain("1.234,56");
    });

    test("formats USD currency correctly", () => {
      const formatted = formatCurrency(1234.56, "USD");
      // This will depend on the locale, but we can check for currency symbol
      expect(formatted).toContain("US$");
      expect(formatted).toContain("1.234,56");
    });
  });
});
