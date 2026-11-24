type StudentVoterArtProps = {
  variant?: "hero" | "portal";
  className?: string;
};

const SKIN = "#e8b892";
const SKIN_SHADE = "#d29b76";
const BLUSH = "#d98d83";
const HAIR = "#2a2225";
const HAIR_LIGHT = "#4a3b3f";
const SHIRT = "#fffdf7";
const SHIRT_SHADE = "#ddd8cc";
const COLLAR = "#f3eee4";
const GRAY = "#707982";
const GRAY_DARK = "#515b65";
const GRAY_LIGHT = "#98a0a8";
const MAROON = "#981f32";
const MAROON_DARK = "#68111f";
const GOLD = "#e2b75c";
const GOLD_LIGHT = "#f7dfa0";
const SHOE = "#352c2e";
const INK = "#3b2d30";

/**
 * Ilustrasi siswa/siswi SMK dengan seragam putih-abu abu lengkap dasi, kerah,
 * dan badge sekolah. Dipakai sebagai dekorasi login Portal Pemilih; seluruh
 * bentuk adalah SVG ringan tanpa aset eksternal.
 */
export default function StudentVoterArt({
  variant = "hero",
  className,
}: StudentVoterArtProps) {
  if (variant === "portal") {
    return (
      <svg
        viewBox="0 0 120 140"
        className={className}
        aria-hidden="true"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="60" cy="62" r="55" fill="rgba(226,183,92,.16)" />
        <circle
          cx="60"
          cy="62"
          r="45"
          fill="none"
          stroke="rgba(152,31,50,.3)"
          strokeWidth="1.4"
          strokeDasharray="5 6"
        />
        <path
          d="M60 7l6 8-6 8-6-8zM104 58l6 8-6 8-6-8zM15 58l6 8-6 8-6-8z"
          fill={GOLD}
          opacity="0.55"
        />

        <ellipse cx="60" cy="136" rx="42" ry="6" fill="rgba(104,17,31,.12)" />
        <path
          d="M15 140Q20 103 60 95Q100 103 105 140Z"
          fill={SHIRT}
          stroke={SHIRT_SHADE}
          strokeWidth="2"
        />
        <path d="M43 98L60 115L77 98" fill="none" stroke={SHIRT_SHADE} strokeWidth="2" />
        <path d="M49 98L60 111L53 116L46 104Z" fill={COLLAR} />
        <path d="M71 98L60 111L67 116L74 104Z" fill={COLLAR} />
        <path d="M55 110h10l2 8-7 6-7-6z" fill={MAROON} />
        <path d="M56 124l6 5-3 11-5-11z" fill={MAROON_DARK} />
        <rect x="79" y="119" width="13" height="10" rx="2" fill={GOLD_LIGHT} stroke={MAROON} strokeWidth="1.3" />
        <path d="M82 124l3 3 5-6" fill="none" stroke={MAROON} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        <rect x="54" y="77" width="12" height="19" rx="5" fill={SKIN_SHADE} />
        <circle cx="41" cy="62" r="3.5" fill={SKIN_SHADE} />
        <circle cx="79" cy="62" r="3.5" fill={SKIN_SHADE} />
        <circle cx="60" cy="60" r="23" fill={SKIN} />
        <path
          d="M37 61Q38 34 60 35Q83 34 83 61Q76 48 60 47Q45 48 37 61Z"
          fill={HAIR}
        />
        <path d="M38 60q-2 13 4 19l-5-3q-4-10-2-19z" fill={HAIR_LIGHT} />
        <path d="M48 54q5-3 9 0M64 54q5-3 9 0" fill="none" stroke={HAIR} strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="52" cy="61" r="2.4" fill={INK} />
        <circle cx="68" cy="61" r="2.4" fill={INK} />
        <circle cx="52.8" cy="60.2" r="0.8" fill="#fff" />
        <circle cx="68.8" cy="60.2" r="0.8" fill="#fff" />
        <ellipse cx="47" cy="68" rx="3.4" ry="2" fill={BLUSH} opacity="0.55" />
        <ellipse cx="73" cy="68" rx="3.4" ry="2" fill={BLUSH} opacity="0.55" />
        <path d="M54 71q6 5 12 0" fill="none" stroke={SKIN_SHADE} strokeWidth="2" strokeLinecap="round" />

        <g transform="rotate(10 92 99)">
          <rect x="80" y="84" width="25" height="31" rx="4" fill="#fffaf0" stroke={GOLD} strokeWidth="1.5" />
          <path d="M85 92h15M85 98h15M85 104h9" stroke={SHIRT_SHADE} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M85 110l4 4 7-8" fill="none" stroke={MAROON} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 460 320"
      className={className}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={GOLD} opacity="0.55">
        <path d="M38 66l11 13-11 13-11-13z" />
        <path d="M72 40l7 8-7 8-7-8z" />
        <path d="M404 44l9 11-9 11-9-11z" />
        <path d="M430 92l6 7-6 7-6-7z" />
      </g>
      <circle cx="236" cy="154" r="126" fill="rgba(255,214,140,.1)" />
      <circle
        cx="236"
        cy="154"
        r="102"
        fill="none"
        stroke="rgba(226,183,92,.36)"
        strokeWidth="1.5"
        strokeDasharray="7 9"
      />
      <ellipse cx="130" cy="298" rx="55" ry="7" fill="rgba(104,17,31,.12)" />
      <ellipse cx="212" cy="298" rx="48" ry="7" fill="rgba(104,17,31,.1)" />
      <ellipse cx="366" cy="280" rx="72" ry="8" fill="rgba(104,17,31,.16)" />

      <g transform="rotate(-9 360 120)">
        <rect x="330" y="92" width="62" height="56" rx="5" fill="#fffaf0" stroke={GOLD} strokeWidth="2" />
        <path d="M340 106h42M340 116h42M340 126h27" stroke={SHIRT_SHADE} strokeWidth="2" strokeLinecap="round" />
        <path
          d="M341 136l7 7 14-16"
          fill="none"
          stroke={MAROON}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <rect x="300" y="150" width="132" height="126" rx="11" fill={MAROON_DARK} stroke={GOLD} strokeWidth="3" />
      <rect x="322" y="142" width="88" height="12" rx="5" fill="#2b090e" stroke={GOLD} strokeWidth="2" />
      <rect x="324" y="134" width="84" height="9" rx="4" fill="#3d0b15" stroke={GOLD} strokeWidth="1.5" />
      <path d="M312 178h108" stroke="rgba(226,183,92,.42)" strokeWidth="2" />
      <path d="M312 258h108" stroke="rgba(226,183,92,.18)" strokeWidth="2" />
      <circle cx="366" cy="226" r="25" fill="rgba(226,183,92,.15)" stroke={GOLD} strokeWidth="2" />
      <circle cx="366" cy="226" r="18" fill="none" stroke="rgba(247,223,160,.55)" strokeWidth="1.3" />
      <path
        d="M355 226l8 8 16-18"
        fill="none"
        stroke={GOLD_LIGHT}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M340 160h12M340 168h8" stroke="rgba(247,223,160,.4)" strokeWidth="2" strokeLinecap="round" />

      <g>
        <path d="M102 234h23l-3 57h-18z" fill={GRAY} stroke={GRAY_DARK} strokeWidth="1.5" />
        <path d="M129 234h23l4 57h-20z" fill={GRAY_DARK} stroke={GRAY_LIGHT} strokeWidth="1.2" />
        <path d="M105 238l-1 49M136 238l1 49" stroke="rgba(255,255,255,.2)" strokeWidth="2" />
        <path d="M98 288h29v9H96a3 3 0 002-9z" fill={SHOE} />
        <path d="M127 288h30v9h-30z" fill={SHOE} />

        <path d="M92 168Q118 153 146 168L151 238H88Z" fill={SHIRT} stroke={SHIRT_SHADE} strokeWidth="1.8" />
        <path d="M104 165l13 15-13 8-9-16z" fill={COLLAR} stroke={SHIRT_SHADE} strokeWidth="1" />
        <path d="M134 165l-13 15 13 8 9-16z" fill={COLLAR} stroke={SHIRT_SHADE} strokeWidth="1" />
        <path d="M115 177h9l3 9-7 6-7-6z" fill={MAROON} />
        <path d="M115 192l7 6-4 27-7-27z" fill={MAROON_DARK} />
        <path d="M93 206q25 8 55 0" fill="none" stroke={SHIRT_SHADE} strokeWidth="1.3" opacity="0.7" />
        <rect x="136" y="190" width="12" height="9" rx="2" fill={GOLD_LIGHT} stroke={MAROON} strokeWidth="1.4" />
        <path d="M139 194l2.5 2.5 4-5" fill="none" stroke={MAROON} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M94 176L79 220" stroke={SHIRT} strokeWidth="15" strokeLinecap="round" />
        <path d="M94 176L79 220" stroke={SHIRT_SHADE} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <path d="M145 176L162 209" stroke={SHIRT} strokeWidth="15" strokeLinecap="round" />
        <circle cx="78" cy="223" r="6.5" fill={SKIN} />
        <circle cx="163" cy="211" r="6.5" fill={SKIN_SHADE} />

        <g transform="rotate(12 164 197)">
          <rect x="150" y="181" width="28" height="33" rx="4" fill="#fffaf0" stroke={GOLD} strokeWidth="1.6" />
          <path d="M156 189h16M156 195h16M156 201h9" stroke={SHIRT_SHADE} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M156 208l4 4 7-8" fill="none" stroke={MAROON} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <rect x="113" y="147" width="12" height="19" rx="5" fill={SKIN_SHADE} />
        <circle cx="100" cy="132" r="3.5" fill={SKIN_SHADE} />
        <circle cx="139" cy="132" r="3.5" fill={SKIN_SHADE} />
        <circle cx="119" cy="130" r="19" fill={SKIN} />
        <path
          d="M100 130Q101 108 120 109Q139 108 139 130Q132 119 120 118Q108 119 100 130Z"
          fill={HAIR}
        />
        <path d="M100 130q-2 10 3 16l-5-3q-4-9-2-16z" fill={HAIR_LIGHT} />
        <path d="M107 125q4-3 8 0M123 125q4-3 8 0" fill="none" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="112" cy="131" r="2.3" fill={INK} />
        <circle cx="127" cy="131" r="2.3" fill={INK} />
        <circle cx="112.8" cy="130.2" r="0.8" fill="#fff" />
        <circle cx="127.8" cy="130.2" r="0.8" fill="#fff" />
        <ellipse cx="107" cy="137" rx="3.2" ry="1.8" fill={BLUSH} opacity="0.5" />
        <ellipse cx="132" cy="137" rx="3.2" ry="1.8" fill={BLUSH} opacity="0.5" />
        <path d="M114 141q5 4 10 0" fill="none" stroke={SKIN_SHADE} strokeWidth="1.7" strokeLinecap="round" />
      </g>

      <g>
        <rect x="194" y="267" width="10" height="26" rx="4" fill={SKIN} />
        <rect x="216" y="267" width="10" height="26" rx="4" fill={SKIN_SHADE} />
        <path d="M191 290h16v8h-17a3 3 0 001-8z" fill={SHOE} />
        <path d="M213 290h17v8h-17z" fill={SHOE} />

        <path d="M181 225H239L249 271H172Z" fill={GRAY} stroke={GRAY_DARK} strokeWidth="1.6" />
        <path d="M197 227l-4 42M210 227v42M223 227l4 42" stroke="rgba(255,255,255,.24)" strokeWidth="2" />
        <path d="M178 225h64" stroke={GRAY_DARK} strokeWidth="3" strokeLinecap="round" />

        <path d="M179 161Q209 147 239 161L243 226H176Z" fill={SHIRT} stroke={SHIRT_SHADE} strokeWidth="1.8" />
        <path d="M194 158l14 15-14 8-9-16z" fill={COLLAR} stroke={SHIRT_SHADE} strokeWidth="1" />
        <path d="M223 158l-14 15 14 8 9-16z" fill={COLLAR} stroke={SHIRT_SHADE} strokeWidth="1" />
        <path d="M203 172h11l2 9-7 6-8-6z" fill={MAROON} />
        <path d="M204 187l7 6-4 25-7-25z" fill={MAROON_DARK} />
        <path d="M179 202q30 8 62 0" fill="none" stroke={SHIRT_SHADE} strokeWidth="1.3" opacity="0.7" />
        <rect x="225" y="181" width="12" height="9" rx="2" fill={GOLD_LIGHT} stroke={MAROON} strokeWidth="1.4" />
        <path d="M228 185l2.5 2.5 4-5" fill="none" stroke={MAROON} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M181 172L168 213" stroke={SHIRT} strokeWidth="14" strokeLinecap="round" />
        <path d="M239 172L253 207" stroke={SHIRT} strokeWidth="14" strokeLinecap="round" />
        <circle cx="167" cy="216" r="6.3" fill={SKIN} />
        <circle cx="254" cy="210" r="6.3" fill={SKIN_SHADE} />

        <rect x="203" y="146" width="12" height="18" rx="5" fill={SKIN_SHADE} />
        <circle cx="190" cy="128" r="3.5" fill={SKIN_SHADE} />
        <circle cx="228" cy="128" r="3.5" fill={SKIN_SHADE} />
        <circle cx="209" cy="126" r="18" fill={SKIN} />
        <circle cx="229" cy="108" r="10" fill={HAIR} />
        <circle cx="229" cy="108" r="5" fill={HAIR_LIGHT} />
        <path
          d="M190 127Q188 105 209 105Q230 105 228 127Q221 116 209 115Q197 116 190 127Z"
          fill={HAIR}
        />
        <path d="M190 126q-2 14 4 20l-5-3q-4-10-2-20z" fill={HAIR_LIGHT} />
        <path d="M198 122q4-3 8 0M213 122q4-3 8 0" fill="none" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="202" cy="128" r="2.2" fill={INK} />
        <circle cx="216" cy="128" r="2.2" fill={INK} />
        <circle cx="202.8" cy="127.2" r="0.8" fill="#fff" />
        <circle cx="216.8" cy="127.2" r="0.8" fill="#fff" />
        <ellipse cx="197" cy="134" rx="3" ry="1.7" fill={BLUSH} opacity="0.5" />
        <ellipse cx="221" cy="134" rx="3" ry="1.7" fill={BLUSH} opacity="0.5" />
        <path d="M204 137q5 4 10 0" fill="none" stroke={SKIN_SHADE} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}
