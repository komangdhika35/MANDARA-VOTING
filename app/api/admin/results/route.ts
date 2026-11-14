import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getCandidateConfigurations, getElectionCandidates } from "@/lib/candidates";
import { getDatabase } from "@/lib/db";
import {
  organizationIds,
  type OrganizationId,
} from "@/lib/election";

export const runtime = "nodejs";

const organizationNames: Record<OrganizationId, string> = {
  mpk: "Majelis Perwakilan Kelas",
  osis: "Organisasi Siswa Intra Sekolah",
  ky: "Komisi Yudisial",
};

export async function GET() {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: "Halaman ini hanya untuk admin." }, { status: 403 });
    }

    const rows = getDatabase()
      .prepare(
        `SELECT organization_id, candidate_id, COUNT(*) AS votes
         FROM ballots
         GROUP BY organization_id, candidate_id`,
      )
      .all() as { organization_id: string; candidate_id: string; votes: number }[];
    const database = getDatabase();
    const votesByCandidate = new Map(
      rows.map((row) => [`${row.organization_id}:${row.candidate_id}`, row.votes]),
    );
    const candidateConfigurations = getCandidateConfigurations();
    const electionCandidates = getElectionCandidates();

    const mpkRows = database
      .prepare(
        `SELECT position, member_id, COUNT(*) AS votes
         FROM mpk_ballots
         GROUP BY position, member_id`,
      )
      .all() as { position: string; member_id: string; votes: number }[];
    const mpkVotes = new Map(
      mpkRows.map((row) => [`${row.position}:${row.member_id}`, row.votes]),
    );
    const mpkParticipation = database
      .prepare(
        "SELECT COUNT(*) AS total FROM participation WHERE organization_id = 'mpk'",
      )
      .get() as { total: number };
    const mpkBallotTotal = database
      .prepare("SELECT COUNT(*) AS total FROM mpk_ballots")
      .get() as { total: number };
    const voterRows = database
      .prepare(
        `SELECT voters.nis, voters.name, participation.organization_id
         FROM voters
         LEFT JOIN participation ON participation.nis = voters.nis
         WHERE voters.active = 1
         ORDER BY voters.name COLLATE NOCASE, participation.organization_id`,
      )
      .all() as { organization_id: string | null; nis: string; name: string }[];
    const votersByNis = new Map<
      string,
      {
        nis: string;
        name: string;
        participatedOrganizations: OrganizationId[];
        searchIdentifiers: string[];
      }
    >();
    const votersByOrganization = new Map<OrganizationId, { nis: string; name: string }[]>(
      organizationIds.map((organizationId) => [organizationId, []]),
    );
    for (const row of voterRows) {
      const voter = votersByNis.get(row.nis) ?? {
        nis: row.nis,
        name: row.name,
        participatedOrganizations: [],
        searchIdentifiers: [row.nis],
      };
      if (
        row.organization_id &&
        organizationIds.includes(row.organization_id as OrganizationId)
      ) {
        const organizationId = row.organization_id as OrganizationId;
        voter.participatedOrganizations.push(organizationId);
        votersByOrganization.get(organizationId)?.push({ nis: row.nis, name: row.name });
      }
      votersByNis.set(row.nis, voter);
    }
    const voterIdentifierRows = database
      .prepare(
        `SELECT voter_ids.nis, voter_ids.identifier
         FROM voter_ids
         JOIN voters ON voters.nis = voter_ids.nis
         WHERE voters.active = 1`,
      )
      .all() as { nis: string; identifier: string }[];
    for (const row of voterIdentifierRows) {
      const voter = votersByNis.get(row.nis);
      if (voter && !voter.searchIdentifiers.includes(row.identifier)) {
        voter.searchIdentifiers.push(row.identifier);
      }
    }

    const organizations = organizationIds.map((id) => {
      if (id === "mpk") {
        const positions = (["chair", "vice"] as const).map((position) => {
          const candidates = electionCandidates.mpkMembers[position].map((member) => ({
            id: member.id,
            name: member.name,
            votes: mpkVotes.get(`${position}:${member.id}`) ?? 0,
          }));
          const title = position === "chair" ? "Calon Ketua" : "Calon Wakil Ketua";
          return {
            id: position,
            title,
            totalVotes: candidates.reduce((total, candidate) => total + candidate.votes, 0),
            candidates,
          };
        });
        return {
          id,
          name: id.toUpperCase(),
          fullName: organizationNames[id],
          totalVotes: mpkParticipation.total,
          hasAnyVotes: mpkBallotTotal.total > 0,
          candidates: [],
          positions,
          voters: votersByOrganization.get(id) ?? [],
          abstainers: [],
        };
      }

      const candidates = candidateConfigurations[id].map((candidate) => ({
        ...candidate,
        votes: votesByCandidate.get(`${id}:${candidate.id}`) ?? 0,
      }));
      return {
        id,
        name: id.toUpperCase(),
        fullName: organizationNames[id],
        totalVotes: candidates.reduce((total, candidate) => total + candidate.votes, 0),
        hasAnyVotes: candidates.reduce((total, candidate) => total + candidate.votes, 0) > 0,
        candidates,
        positions: [],
        voters: votersByOrganization.get(id) ?? [],
        abstainers: [],
      };
    });

    return NextResponse.json({
      organizations,
      voters: [...votersByNis.values()],
      totalVotes: organizations.reduce((total, organization) => total + organization.totalVotes, 0),
    });
  } catch (error) {
    console.error("Gagal memuat rekap suara:", error);
    return NextResponse.json(
      { error: "Rekap suara belum dapat dimuat. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
