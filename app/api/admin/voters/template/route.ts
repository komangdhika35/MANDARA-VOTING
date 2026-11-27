import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  VOTER_TEMPLATE_EXAMPLE,
  VOTER_TEMPLATE_FILE_NAME,
  VOTER_TEMPLATE_HEADERS,
  VOTER_TEMPLATE_SHEET,
} from "@/lib/voter-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Halaman ini hanya untuk admin." }, { status: 403 });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Suara Mandara";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(VOTER_TEMPLATE_SHEET, {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    worksheet.columns = [
      { header: VOTER_TEMPLATE_HEADERS[0], key: "name", width: 34 },
      { header: VOTER_TEMPLATE_HEADERS[1], key: "nis", width: 14 },
      { header: VOTER_TEMPLATE_HEADERS[2], key: "password", width: 16 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2F5946" },
    };
    headerRow.alignment = { vertical: "middle" };
    headerRow.height = 22;

    const exampleRow = worksheet.addRow({
      name: VOTER_TEMPLATE_EXAMPLE.name,
      nis: VOTER_TEMPLATE_EXAMPLE.nis,
      password: VOTER_TEMPLATE_EXAMPLE.password,
    });
    exampleRow.font = { italic: true, color: { argb: "FF8A8F88" } };
    exampleRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF4F5F1" },
    };
    for (let column = 1; column <= VOTER_TEMPLATE_HEADERS.length; column += 1) {
      exampleRow.getCell(column).alignment = { vertical: "middle" };
    }
    exampleRow.getCell(2).numFmt = "@";
    exampleRow.getCell(3).numFmt = "@";

    const guide = workbook.addWorksheet("Petunjuk");
    guide.columns = [{ width: 100 }];
    guide.addRow(["PETUNJUK PENGISIAN TEMPLATE PEMILIH"]).font = { bold: true };
    guide.addRow([]);
    guide.addRow([`1. Isi data siswa pada lembar "${VOTER_TEMPLATE_SHEET}".`]);
    guide.addRow(["2. Nama siswa wajib diisi, maksimal 120 karakter."]);
    guide.addRow(["3. NIS wajib terdiri dari tepat 4 angka, misalnya 1343."]);
    guide.addRow([
      "4. Password adalah NIS + 1, misalnya NIS 1343 memiliki password 1344.",
    ]);
    guide.addRow([
      "5. Jika NIS diawali 0, password dihitung sebagai bilangan tanpa awalan 0 (0001 menjadi 2).",
    ]);
    guide.addRow(["6. Baris contoh bertanda 'Contoh:' akan diabaikan saat impor."]);
    guide.addRow(["7. NIS yang sudah terdaftar akan diperbarui namanya; suara yang ada tidak dihapus."]);
    guide.addRow([
      "8. Jangan kirimkan file berisi data siswa yang sebenarnya melalui media publik.",
    ]);

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${VOTER_TEMPLATE_FILE_NAME}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Gagal membuat template pemilih:", error);
    return NextResponse.json(
      { error: "Template belum dapat dibuat. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
