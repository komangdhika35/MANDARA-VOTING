import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getCandidateSelections, getMpkSelections } from "@/lib/candidates";
import { getDatabase } from "@/lib/db";
import { organizationIds } from "@/lib/election";

export const runtime = "nodejs";

const DISPLAY_NAME = "Pemilih";

type ResumeBody = { nis?: unknown };

export async function POST(request: Request) {
  try {
    let body: ResumeBody = {};
    try {
      const parsed = await request.json();
      if (parsed && typeof parsed === "object") body = parsed as ResumeBody;
    } catch {
      // Permintaan tanpa body tetap valid untuk pemilih tamu baru.
    }

    const requestedNis =
      typeof body.nis === "string" && body.nis.startsWith("GUEST-") && body.nis.length <= 64
        ? body.nis
        : null;

    // Setiap kali tombol "Mulai Memilih" ditekan, dibuat identitas tamu yang unik
    // supaya tidak ada tabrakan primary key di participation / voter_choices /
    // mpk_choices saat banyak pemilih bergantian memakai perangkat yang sama.
    // Identitas lama dipakai kembali hanya jika pemilih itu belum menyelesaikan
    // seluruh pilihan, sehingga nomor "Pemilih N"-nya tidak berubah.
    let guestNis = requestedNis ?? `GUEST-${randomUUID()}`;
    const database = getDatabase();
    let shouldResume = false;
    let voterName = "";

    database.exec("BEGIN IMMEDIATE");
    try {
      if (requestedNis) {
        const existing = database
          .prepare("SELECT nis, name FROM voters WHERE nis = ? AND active = 1")
          .get(requestedNis) as { nis: string; name: string } | undefined;
        const completedOrganizations = existing
          ? (
              database
                .prepare("SELECT COUNT(*) AS total FROM participation WHERE nis = ?")
                .get(requestedNis) as { total: number }
            ).total
          : organizationIds.length + 1;
        shouldResume = Boolean(existing) && completedOrganizations < organizationIds.length;

        if (shouldResume) {
          voterName = existing!.name;
          database.prepare("DELETE FROM sessions WHERE nis = ?").run(requestedNis);
        }
      }

      if (!shouldResume) {
        // Nomor yang sudah selesai tidak boleh dipakai ulang oleh pemilih berikutnya.
        const anyExisting = database
          .prepare("SELECT 1 FROM voters WHERE nis = ?")
          .get(guestNis);
        if (anyExisting) {
          guestNis = `GUEST-${randomUUID()}`;
        }

        const count = database
          .prepare("SELECT COUNT(*) AS total FROM voters WHERE nis LIKE 'GUEST-%'")
          .get() as { total: number };
        voterName = `Pemilih ${count.total + 1}`;
        database
          .prepare("INSERT INTO voters (nis, name, active) VALUES (?, ?, 1)")
          .run(guestNis, voterName);
      }

      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }

    await createSession(guestNis);

    return NextResponse.json({
      role: "student",
      nis: guestNis,
      // Nomor pemilih sengaja tidak dikirim ke browser; hanya admin yang mengetahui.
      voter: { name: DISPLAY_NAME },
      votedOrganizations: shouldResume
        ? (database
            .prepare("SELECT organization_id FROM participation WHERE nis = ?")
            .all(guestNis) as { organization_id: string }[])
            .map((row) => row.organization_id)
            .filter((id) => organizationIds.includes(id as (typeof organizationIds)[number]))
        : [],
      mpkSelections: shouldResume ? getMpkSelections(guestNis) : { chair: null, vice: null },
      candidateSelections: shouldResume ? getCandidateSelections(guestNis) : {},
    });
  } catch (error) {
    console.error("Gagal membuat sesi pemilih tamu:", error);
    return NextResponse.json(
      { error: "Sesi pemilih tamu belum dapat dibuat. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
