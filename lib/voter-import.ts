import type ExcelJS from "exceljs";

export const VOTER_TEMPLATE_SHEET = "Pemilih";
export const VOTER_TEMPLATE_HEADERS = ["Nama", "NIS", "Password"] as const;
export const VOTER_TEMPLATE_EXAMPLE = {
  name: "Contoh: Nama Siswa",
  nis: "1343",
  password: "1344",
} as const;
export const VOTER_TEMPLATE_FILE_NAME = "template-pemilih-suara-mandara.xlsx";
export const MAX_VOTER_IMPORT_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_VOTER_IMPORT_ROWS = 5000;

type CellLike = {
  value: unknown;
  numFmt?: string | number;
};

export function normalizeHeader(value: string) {
  return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleUpperCase("en-US");
}

export function normalizeStudentName(value: string) {
  return value.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function cellText(cell: CellLike): string {
  const value = cell.value;
  if (value === null || value === undefined) return "";

  if (typeof value === "string" || typeof value === "number") {
    if (
      typeof value === "number" &&
      typeof cell.numFmt === "string" &&
      /^0+$/.test(cell.numFmt)
    ) {
      return String(value).padStart(cell.numFmt.length, "0");
    }
    return String(value);
  }

  if (typeof value === "object") {
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText
        .map((part) =>
          typeof part === "object" && part !== null && "text" in part
            ? String(part.text ?? "")
            : "",
        )
        .join("");
    }
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value && value.result !== null && value.result !== undefined) {
      return String(value.result);
    }
  }

  return "";
}

export function expectedStudentPassword(nis: string) {
  if (!/^\d{4}$/.test(nis)) throw new Error("NIS pemilih harus terdiri dari 4 angka.");
  return (BigInt(nis) + BigInt(1)).toString();
}

export class VoterImportError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type ImportedStudent = {
  row: number;
  name: string;
  nis: string;
};

type HeaderColumns = {
  headerRow: number;
  name: number;
  nis: number;
  password: number;
};

function findHeaderColumns(worksheet: ExcelJS.Worksheet): HeaderColumns | null {
  const expected = VOTER_TEMPLATE_HEADERS.map(normalizeHeader);

  for (let rowNumber = 1; rowNumber <= Math.min(worksheet.actualRowCount, 10); rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const columns = new Map<string, number>();
    for (let column = 1; column <= Math.min(row.cellCount, 12); column += 1) {
      const header = normalizeHeader(cellText(row.getCell(column)));
      if (expected.includes(header) && !columns.has(header)) {
        columns.set(header, column);
      }
    }

    const name = columns.get(expected[0]);
    const nis = columns.get(expected[1]);
    const password = columns.get(expected[2]);
    if (name && nis && password) {
      return { headerRow: rowNumber, name, nis, password };
    }
  }

  return null;
}

export function parseVoterWorksheet(worksheet: ExcelJS.Worksheet): {
  students: ImportedStudent[];
  skippedExampleRows: number;
} {
  const columns = findHeaderColumns(worksheet);
  if (!columns) {
    throw new VoterImportError(
      `Template tidak dikenali. Pastikan kolom ${VOTER_TEMPLATE_HEADERS.join(", ")} tersedia pada lembar "${VOTER_TEMPLATE_SHEET}".`,
    );
  }

  const students: ImportedStudent[] = [];
  const seenNis = new Map<string, number>();
  let skippedExampleRows = 0;

  for (
    let rowNumber = columns.headerRow + 1;
    rowNumber <= worksheet.actualRowCount;
    rowNumber += 1
  ) {
    const row = worksheet.getRow(rowNumber);
    const name = normalizeStudentName(cellText(row.getCell(columns.name)));
    const nis = cellText(row.getCell(columns.nis)).trim();
    const password = cellText(row.getCell(columns.password)).trim();

    if (!name && !nis && !password) continue;

    if (
      name === normalizeStudentName(VOTER_TEMPLATE_EXAMPLE.name) &&
      nis === VOTER_TEMPLATE_EXAMPLE.nis &&
      password === VOTER_TEMPLATE_EXAMPLE.password
    ) {
      skippedExampleRows += 1;
      continue;
    }

    if (!name) {
      throw new VoterImportError(`Baris ${rowNumber}: nama siswa wajib diisi.`);
    }
    if (name.length > 120) {
      throw new VoterImportError(`Baris ${rowNumber}: nama siswa melebihi 120 karakter.`);
    }
    if (!/^\d{4}$/.test(nis)) {
      throw new VoterImportError(`Baris ${rowNumber}: NIS harus terdiri dari tepat 4 angka.`);
    }

    const expectedPassword = expectedStudentPassword(nis);
    if (password !== expectedPassword) {
      throw new VoterImportError(
        `Baris ${rowNumber}: password untuk NIS ${nis} harus ${expectedPassword}.`,
      );
    }

    const previousRow = seenNis.get(nis);
    if (previousRow) {
      throw new VoterImportError(
        `Baris ${rowNumber}: NIS ${nis} sudah digunakan pada baris ${previousRow}.`,
      );
    }
    seenNis.set(nis, rowNumber);
    students.push({ row: rowNumber, name, nis });
  }

  if (students.length === 0) {
    throw new VoterImportError("Tidak ada data siswa yang dapat diimpor dari file tersebut.");
  }
  if (students.length > MAX_VOTER_IMPORT_ROWS) {
    throw new VoterImportError(
      `Jumlah siswa dalam file melebihi batas ${MAX_VOTER_IMPORT_ROWS} baris.`,
    );
  }

  return { students, skippedExampleRows };
}
