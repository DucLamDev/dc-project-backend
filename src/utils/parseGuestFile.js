import { parse } from "csv-parse/sync";
import { readSheet } from "read-excel-file/node";

export async function parseGuestFile(file) {
  const name = file.originalname.toLowerCase();

  if (name.endsWith(".csv")) {
    return parse(file.buffer.toString("utf8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  }

  if (!name.endsWith(".xlsx")) {
    const error = new Error("Only CSV and XLSX files are supported.");
    error.status = 400;
    throw error;
  }

  const rows = await readSheet(file.buffer);
  const headers = rows[0]?.map((header) => String(header || "").trim()) || [];

  return rows.slice(1).map((row) =>
    headers.reduce((record, header, index) => {
      if (!header) return record;
      record[header] = row[index] ?? "";
      return record;
    }, {})
  );
}
