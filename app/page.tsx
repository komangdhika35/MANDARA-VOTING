"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type OrganizationId = "mpk" | "osis" | "ky";

type VoteRecord = {
  mpk: number;
  osis: number;
  ky: number;
};

export default function Page() {
  const router = useRouter();
  const [classLevel, setClassLevel] = useState<"kelas-10-11" | "kelas-12" | null>(null);
  const [voterName, setVoterName] = useState("");
  const [role, setRole] = useState<"student" | "admin" | null>(null);
  const [activeOrganization, setActiveOrganization] = useState<OrganizationId>("mpk");
  const [votes, setVotes] = useState<VoteRecord>({ mpk: 0, osis: 0, ky: 0 });
  const [mpkChair, setMpkChair] = useState<string | null>(null);
  const [mpkVice, setMpkVice] = useState<string | null>(null);
  const [candidateSel, setCandidateSel] = useState({} as Record<OrganizationId, string>);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [isAbsensi, setIsAbsensi] = useState(false);

  // Detect class level from URL
  useEffect(() => {
    const checkLevel = () => {
      if (router.pathname === "/kelas-12") {
        setClassLevel("kelas-12");
      } else {
        setClassLevel(null);
      }
    };
    // Use queueMicrotask to avoid setState in effect warning
    queueMicrotask(checkLevel);
  }, []);

  // Load session
  useEffect(() => {
    async function loadSession() {
      try {
        const [sessionResp, candidatesResp] = await Promise.all([
          fetch("/api/auth/session", { cache: "no-store" }),
          fetch("/api/election/candidates", { cache: "no-store" }),
        ]);

        if (sessionResp.status === 401) {
          setReady(true);
          return;
        }

        if (!sessionResp.ok) throw new Error("Gagal memuat session");

        const sessionData = (await sessionResp.json()) as {
    role?: "student" | "admin";
    voter?: { name: string };
    votedOrganizations?: OrganizationId[];
  };

        setReady(true);

        if (sessionData.role === "admin") {
          setRole("admin");
          return;
        }

        setRole(sessionData.role ?? "student");
        setVoterName(sessionData.voter?.name ?? "");

        if (classLevel === "kelas-12") {
          // kelas-12: normal voting
          setVotes({ mpk: 0, osis: 0, ky: 0 } as VoteRecord);
          setMpkChair(null);
          setMpkVice(null);
          setCandidateSel({} as Record<OrganizationId, string>);
          setSelectedCandidate("");
          setIsAbsensi(false);
        } else {
          // kelas-10-11: absensi mode
          setIsAbsensi(true);
          setVotes({ mpk: 0, osis: 0, ky: 0 } as VoteRecord);
          setMpkChair(null);
          setMpkVice(null);
          setCandidateSel({} as Record<OrganizationId, string>);
          setSelectedCandidate("");
        }
      } catch (error) {
        console.error("Gagal memuat session:", error);
        setReady(true);
      }
    }

    if (!ready) loadSession();
  }, [classLevel, ready]);

  // Handle login
  async function handleLogin(nis: string, password: string) {
    setIsSubmitting(true);
    setLoginError("");

    try {
      let body: { nis?: string; password?: string };
      if (classLevel === "kelas-12") {
        body = { nis, password };
      } else {
        body = { nis: "", password: "" };
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as {
        role?: "student" | "admin";
        voter?: { name: string };
        votedOrganizations?: OrganizationId[];
        mpkSelections?: { chair: string | null; vice: string | null };
        error?: string;
      };

      if (!response.ok) throw new Error(data.error ?? "Login tidak berhasil");

      setRole(data.role ?? "student");
      setVoterName(data.voter?.name ?? "");

      if (classLevel === "kelas-12") {
        const votedOrgs: string[] = data.votedOrganizations ?? [];
        setVotes({
          mpk: votedOrgs.includes("mpk") ? 1 : 0,
          osis: votedOrgs.includes("osis") ? 1 : 0,
          ky: votedOrgs.includes("ky") ? 1 : 0,
        } as VoteRecord);
        setMpkChair(data.mpkSelections?.chair ?? null);
        setMpkVice(data.mpkSelections?.vice ?? null);
        setCandidateSel({} as Record<OrganizationId, string>);
        setSelectedCandidate("");
        setIsAbsensi(false);
      } else {
        // kelas-10-11: absensi mode
        setIsAbsensi(true);
        setVotes({ mpk: 0, osis: 0, ky: 0 } as VoteRecord);
        setMpkChair(null);
        setMpkVice(null);
        setCandidateSel({} as Record<OrganizationId, string>);
        setSelectedCandidate("");
      }

      router.push("/");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Gagal login");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch { /* ignore */ }
    setRole(null);
    setVoterName("");
    setClassLevel(null);
    setActiveOrganization("mpk");
    setVotes({ mpk: 0, osis: 0, ky: 0 } as VoteRecord);
    setMpkChair(null);
    setMpkVice(null);
    setCandidateSel({} as Record<OrganizationId, string>);
    setSelectedCandidate("");
    setIsAbsensi(false);
    router.push("/");
  }

  // If not ready, show loading
  if (!ready) {
    return (
      <main className="min-h-screen bg-[var(--bg)] [display:flex] [items-center] [justify-center] [h-[calc(100vh-70px)]]">
        <div className="text-center">
          <Image
            src="/logo-suara-mandara.png"
            alt="Suara Mandara"
            width={64}
            height={64}
            className="mx-auto mb-8"
          />
          <p className="text-[#5a4548]">Memuat aplikasi pemilihan...</p>
        </div>
      </main>
    );
  }

  // If not logged in yet and no class level selected, show class selector
  if (!role && classLevel === null) {
    return (
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-2xl mx-auto [px-6] [py-20] [text-center]">
          <Image
            src="/logo-suara-mandara.png"
            alt="Suara Mandara"
            width={64}
            height={64}
            className="mx-auto mb-8"
          />
          <h1 className="text-3xl font-bold text-[#27392f] mb-4">Selamat Datang</h1>
          <p className="text-[#5a4548] mb-12">Silakan pilih kelas Anda untuk melanjutkan pemilihan.</p>

          <div className="space-y-4 max-w-md mx-auto">
            <button
              className="w-full [padding:16px] [border:1px_solid_#e9ebe4] [border-radius:8px] [font-size:18px] [font-weight:700] [text-left] [transition-all] [hover:border-[#17483b]] [hover:text-[#17483b]] [focus-visible:outline-none] [focus-visible:ring-2] [focus-visible:ring-[#17483b]]"
              onClick={() => setClassLevel("kelas-10-11")}
            >
              <span className="[flex] [items-center] [gap-2]">
                <span className="text-[#34483e]">Kelas 10/11</span>
                <span className="text-[#17483b]">→</span>
              </span>
            </button>

            <button
              className="w-full [padding:16px] [border:1px_solid_#e9ebe4] [border-radius:8px] [font-size:18px] [font-weight:700] [text-left] [transition-all] [hover:border-[#17483b]] [hover:text-[#17483b]] [focus-visible:outline-none] [focus-visible:ring-2] [focus-visible:ring-[#17483b]]"
              onClick={() => setClassLevel("kelas-12")}
            >
              <span className="[flex] [items-center] [gap-2]">
                <span className="text-[#34483e]">Kelas 12</span>
                <span className="text-[#17483b]">→</span>
              </span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // If admin, redirect to admin page
  if (role === "admin") {
    router.push("/admin");
    return <main className="min-h-screen" />;
  }

  // Voter page
  const isKelas1011 = classLevel === "kelas-10-11";
  const isKelas12 = classLevel === "kelas-12";

  // Header
  const showLogoutBtn = isKelas12 || isKelas1011;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <header className="bg-[rgba(255,255,255,.82)] border-b border-[#e9ebe4] [px-6] [h-[70px]] [flex] [items-center] [justify-between]">
        <a className="brand [display:inline-flex] [align-items:center] [gap:10px]" href="#" aria-label="Suara Mandara">
          <Image
            className="[width:34px] [height:34px] [border-radius:8px] [object-fit:cover]"
            src="/logo-suara-mandara.png"
            alt=""
            width={34}
            height={34}
          />
          <span className="brand-copy [font:800_20px_'Manrope',_sans-serif] [letter-spacing:-1.2px] [&_>_span]:[color:#c93246]">Suara<span>Mandara</span></span>
        </a>

        <span className="header-election [display:flex] [align-items:center] [gap:9px] [color:#7d877f] [font-size:9px] [font-weight:700] [letter-spacing:.9px]">
          <span className="live-dot [width:7px] [height:7px] [display:inline-block] [flex:0_0_auto] [border-radius:50%] [background:#cbe67c] [box-shadow:0_0_0_3px_rgba(203,_230,_124,_.13)]" /> PEMILIHAN SISWA 2026/2027
        </span>

        {showLogoutBtn && (
          <button
            className="profile-button [display:flex] [align-items:center] [gap:9px] [padding:0] [border:0] [background:transparent] [text-align:left] [cursor:pointer]"
            onClick={() => handleLogout()}
            title="Keluar"
          >
            <span className="profile-avatar [width:32px] [height:32px] [border-radius:50%] [display:grid] [place-items:center] [color:#315940] [background:#e6edda] [font-size:10px] [font-weight:700]">AD</span>
            <span className="profile-name [color:#34473d] [font-size:10px] [font-weight:700]">
              {isKelas12 ? "Siswa XII" : "Siswa X/XI"}
            </span>
          </button>
        )}
      </header>

      <div className="min-h-[calc(100vh-70px)] p-6">
        {isKelas1011 ? (
          // kelas 10/11: absensi mode
          <div>
            <h2 className="text-xl font-bold text-[#27392f] mb-6">Kelas 10/11 - Pemilihan Organisasi</h2>
            <p className="text-[#5a4548] mb-8">
              NIS Anda <strong>{voterName}</strong> telah terdaftar dalam absensi pemilihan.
              Silakan pilih organizasi untuk memulai.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="group [p-4] [border:1px_solid_#e9ebe4] [border-radius:8px] [background:#fbfcf8] [transition-all] [hover:border-[#17483b]] [hover:bg:#f5f7ef] [focus-visible:outline-none] [focus-visible:ring-2] [focus-visible:ring-[#17483b]]"
                onClick={() => setActiveOrganization("mpk" as OrganizationId)}
              >
                <span className="[flex] [items-center] [gap-2]">
                  <span className="[width:32px] [height:32px] [border-radius:6px] [background:#e9e1f4] [display:grid] [place-items:center] [font:700_12px_'Manrope',_sans-serif] [color:#63518c]">MPK</span>
                  <strong className="text-[#27392f]">MPK</strong>
                  <span className="text-[#78837a]">Majelis Perwakilan Kelas</span>
                </span>
              </button>

              <button
                className="group [p-4] [border:1px_solid_#e9ebe4] [border-radius:8px] [background:#f0f7ef] [transition-all] [hover:#306953] [hover:text:#306953] [focus-visible:outline-none] [focus-visible:ring-2] [focus-visible:ring-[#306953]]"
                onClick={() => setActiveOrganization("osis" as OrganizationId)}
              >
                <span className="[flex] [items-center] [gap-2]">
                  <span className="[width:32px] [height:32px] [border-radius:6px] [background:#dceee0] [display:grid] [place-items:center] [font:700_12px_'Manrope',_sans-serif] [color:#306953]">OSIS</span>
                  <strong className="text-[#27392f]">OSIS</strong>
                  <span className="text-[#78837a]">Organisasi Siswa Intra Sekolah</span>
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button
                className="group [p-4] [border:1px_solid_#e9ebe4] [border-radius:8px] [background:#fffaf0] [transition-all] [hover:#f8e3d6] [hover:text:#a05e44] [focus-visible:outline-none] [focus-visible:ring-2] [focus-visible:ring-[#a05e44]]"
                onClick={() => setActiveOrganization("ky" as OrganizationId)}
              >
                <span className="[flex] [items-center] [gap-2]">
                  <span className="[width:32px] [height:32px] [border-radius:6px] [background:#f8e3d6] [display:grid] [place-items:center] [font:700_12px_'Manrope',_sans-serif] [color:#a05e44]">KY</span>
                  <strong className="text-[#27392f]">KY</strong>
                  <span className="text-[#78837a]">Komisi Yudisial</span>
                </span>
              </button>
            </div>
          </div>
        ) : isKelas12 ? (
          // kelas 12: normal voting
          <div>
            <h2 className="text-xl font-bold text-[#27392f] mb-6">Kelas 12 - Pemilihan Organisasi</h2>
            <p className="text-[#5a4548] mb-8">
              Selamat datang <strong>{voterName}</strong>. Silakan pilih organizasi untuk memulai pemilihan.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="group [p-4] [border:1px_solid_#e9ebe4] [border-radius:8px] [background:#e9e1f4] [transition-all] [hover;border-[#17483b]] [hover:text-[#17483b]] [focus-visible:outline-none] [focus-visible:ring-2] [focus-visible:ring-[#17483b]]"
                onClick={() => setActiveOrganization("mpk" as OrganizationId)}
              >
                <span className="[flex] [items-center] [gap-2]">
                  <span className="[width:32px] [height:32px] [border-radius:6px] [background:#e9e1f4] [display:grid] [place-items:center] [font:700_12px_'Manrope',_sans-serif] [color:#63518c]">MPK</span>
                  <strong className="text-[#27392f]">MPK</strong>
                  <span className="text-[#78837a]">Majelis Perwakilan Kelas</span>
                </span>
              </button>

              <button
                className="group [p-4] [border:1px_solid_#e9ebe4] [border-radius:8px] [background:#dceee0] [transition-all] [hover:#306953] [hover:text:#306953] [focus-visible:outline-none] [focus-visible:ring-2] [focus-visible:ring-[#306953]]"
                onClick={() => setActiveOrganization("osis" as OrganizationId)}
              >
                <span className="[flex] [items-center] [gap-2]">
                  <span className="[width:32px] [height:32px] [border-radius:6px] [background:#dceee0] [display:grid] [place-items:center] [font:700_12px_'Manrope',_sans-serif] [color:#306953]">OSIS</span>
                  <strong className="text-[#27392f]">OSIS</strong>
                  <span className="text-[#78837a]">Organisasi Siswa Intra Sekolah</span>
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button
                className="group [p-4] [border:1px_solid_#e9ebe4] [border-radius:8px] [background:#f8e3d6] [transition-all] [hover:#a05e44] [hover:text:#a05e44] [focus-visible:outline-none] [focus-visible:ring-2] [focus-visible:ring-[#a05e44]]"
                onClick={() => setActiveOrganization("ky" as OrganizationId)}
              >
                <span className="[flex] [items-center] [gap-2]">
                  <span className="[width:32px] [height:32px] [border-radius:6px] [background:#f8e3d6] [display:grid] [place-items:center] [font:700_12px_'Manrope',_sans-serif] [color:#a05e44]">KY</span>
                  <strong className="text-[#27392f]">KY</strong>
                  <span className="text-[#78837a]">Komisi Yudisial</span>
                </span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[#78837a]">Silakan pilih kelas terlebih dahulu.</p>
        )}
      </div>
    </main>
  );
}