import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  MAX_VOTER_IMPORT_FILE_SIZE,
  parseVoterWorksheet,
  VoterImportError,
  VOTER_TEMPLATE_SHEET,
} from "@/lib/voter-import";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Halaman ini hanya untuk admin." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Data impor tidak valid." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "File Excel wajib diunggah." }, { status: 400 });
  }
  if (!file.name.toLocaleLowerCase("en-US").endsWith(".xlsx")) {
    return NextResponse.json({ error: "File harus berformat .xlsx." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_VOTER_IMPORT_FILE_SIZE) {
    return NextResponse.json(
      { error: "Ukuran file Excel maksimal 5 MB dan file tidak boleh kosong." },
      { status: 413 },
    );
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const bytes = Buffer.from(await file.arrayBuffer());
    await workbook.xlsx.load(
      bytes as unknown as Parameters<typeof workbook.xlsx.load>[0],
    );
    const worksheet =
      workbook.getWorksheet(VOTER_TEMPLATE_SHEET) ??
      workbook.worksheets.find(
        (sheet) => sheet.name.trim().toLocaleLowerCase("en-US") === VOTER_TEMPLATE_SHEET.toLocaleLowerCase("en-US"),
      );
    if (!worksheet) {
      throw new VoterImportError(
        `Gunakan template dari menu "Unduh template Excel" dan isi lembar "${VOTER_TEMPLATE_SHEET}".`,
      );
    }

    const { students, skippedExampleRows } = parseVoterWorksheet(worksheet);
    const database = getDatabase();
    const findIdentifier = database.prepare("SELECT nis FROM voter_ids WHERE identifier = ?");
    const findVoter = database.prepare("SELECT nis FROM voters WHERE nis = ?");
    const upsertVoter = database.prepare(
      `INSERT INTO voters (nis, name, active) VALUES (?, ?, 1)
       ON CONFLICT(nis) DO UPDATE SET name = excluded.name, active = 1`,
    );
    const insertIdentifier = database.prepare(
      "INSERT OR IGNORE INTO voter_ids (identifier, nis) VALUES (?, ?)",
    );

    let imported = 0;
    let updated = 0;

    database.exec("BEGIN IMMEDIATE");
    try {
      for (const student of students) {
        const identifierOwner = findIdentifier.get(student.nis) as { nis: string } | undefined;
        if (identifierOwner && identifierOwner.nis !== student.nis) {
          throw new VoterImportError(
            `Baris ${student.row}: NIS ${student.nis} sudah terhubung ke data siswa lain di database.`,
            409,
          );
        }

        const existingVoter = findVoter.get(student.nis);
        upsertVoter.run(student.nis, student.name);
        insertIdentifier.run(student.nis, student.nis);
        if (existingVoter) updated += 1;
        else imported += 1;
      }
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }

    const exampleNote = skippedExampleRows
      ? ` ${skippedExampleRows} baris contoh diabaikan.`
      : "";
    return NextResponse.json({
      message: `${imported} pemilih baru ditambahkan, ${updated} pemilih diperbarui.${exampleNote}`,
      notice: "Password tidak disimpan; siswa tetap login dengan password = NIS + 1.",
      imported,
      updated,
      total: students.length,
      skippedExampleRows,
    });
  } catch (error) {
    if (error instanceof VoterImportError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Gagal mengimpor pemilih dari Excel:", error);
    return NextResponse.json(
      { error: "File Excel tidak valid atau data belum dapat disimpan. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
