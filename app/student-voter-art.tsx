type StudentVoterArtProps = {
  variant?: "hero" | "portal";
  className?: string;
};

const SKIN = "#e9bd9b";
const SKIN_SHADE = "#d9a882";
const HAIR = "#2b2326";
const SHIRT = "#fffdf8";
const SHIRT_SHADE = "#e4ded3";
const GRAY = "#6b7280";
const GRAY_DARK = "#525b66";
const MAROON = "#8f1d2c";
const GOLD = "#e3b958";
const SHOE = "#332b2c";

/**
 * Ilustrasi siswa/siswi SMK dengan seragam putih-abu abu lengkap dengan dasi
 * dan badge, bersama kotak suara dan surat suara tercoblos. Dipakai sebagai
 * dekorasi halaman login; seluruh bentuk adalah SVG ringan tanpa aset eksternal.
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
        <circle cx="60" cy="60" r="54" fill="rgba(227,185,88,.14)" />
        <circle
          cx="60"
          cy="60"
          r="44"
          fill="none"
          stroke="rgba(143,29,44,.28)"
          strokeWidth="1.5"
          strokeDasharray="5 6"
        />
        <path
          d="M18 140Q22 98 60 92Q98 98 102 140Z"
          fill={SHIRT}
          stroke={SHIRT_SHADE}
          strokeWidth="2"
        />
        <path d="M48 96L60 112L72 96" fill="none" stroke={SHIRT_SHADE} strokeWidth="2" />
        <path d="M55 106H65L67 116L60 136L53 116Z" fill={MAROON} />
        <circle cx="82" cy="120" r="6" fill={GOLD} stroke={MAROON} strokeWidth="1.5" />
        <rect x="54" y="76" width="12" height="20" rx="4" fill={SKIN_SHADE} />
        <circle cx="60" cy="60" r="25" fill={SKIN} />
        <path
          d="M35 60Q36 30 60 31Q84 30 85 60Q74 46 60 45Q46 46 35 60Z"
          fill={HAIR}
        />
        <circle cx="51" cy="61" r="2" fill={HAIR} />
        <circle cx="69" cy="61" r="2" fill={HAIR} />
        <path
          d="M53 73q7 5 14 0"
          fill="none"
          stroke={SKIN_SHADE}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <g transform="translate(78 82)">
          <rect x="0" y="0" width="26" height="22" rx="4" fill="#fffaf0" stroke={GOLD} strokeWidth="1.5" />
          <path
            d="M6 12l5 5 10-11"
            fill="none"
            stroke={MAROON}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
      <g fill={GOLD} opacity="0.5">
        <path d="M38 66l11 13-11 13-11-13z" />
        <path d="M72 40l7 8-7 8-7-8z" />
        <path d="M404 44l9 11-9 11-9-11z" />
        <path d="M430 92l6 7-6 7-6-7z" />
      </g>
      <circle cx="236" cy="154" r="126" fill="rgba(255,214,140,.09)" />
      <circle
        cx="236"
        cy="154"
        r="102"
        fill="none"
        stroke="rgba(227,185,88,.34)"
        strokeWidth="1.5"
        strokeDasharray="7 9"
      />

      <g transform="rotate(-9 360 120)">
        <rect x="330" y="92" width="62" height="56" rx="5" fill="#fffaf0" stroke={GOLD} strokeWidth="2" />
        <path d="M340 106h42M340 116h42M340 126h27" stroke="#d9cbb0" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M341 136l7 7 14-16"
          fill="none"
          stroke={MAROON}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <rect x="300" y="150" width="132" height="126" rx="11" fill="#5f111c" stroke={GOLD} strokeWidth="3" />
      <rect x="322" y="142" width="88" height="12" rx="5" fill="#2b090e" stroke={GOLD} strokeWidth="2" />
      <path d="M312 178h108" stroke="rgba(227,185,88,.4)" strokeWidth="2" />
      <circle cx="366" cy="226" r="24" fill="rgba(227,185,88,.14)" stroke={GOLD} strokeWidth="2" />
      <path
        d="M355 226l8 8 16-18"
        fill="none"
        stroke="#f7e3ad"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g>
        <rect x="98" y="232" width="24" height="60" rx="5" fill={GRAY} />
        <rect x="126" y="232" width="24" height="60" rx="5" fill={GRAY_DARK} />
        <rect x="95" y="289" width="29" height="10" rx="4" fill={SHOE} />
        <rect x="124" y="289" width="29" height="10" rx="4" fill={SHOE} />
        <path d="M92 174L79 222" stroke={SHIRT} strokeWidth="16" strokeLinecap="round" />
        <path d="M148 174L161 222" stroke={SHIRT} strokeWidth="16" strokeLinecap="round" />
        <circle cx="78" cy="226" r="7" fill={SKIN} />
        <circle cx="162" cy="226" r="7" fill={SKIN} />
        <path d="M88 164Q118 148 148 164L154 238H82Z" fill={SHIRT} stroke={SHIRT_SHADE} strokeWidth="1.5" />
        <path d="M110 158L118 176L126 158" fill="none" stroke={SHIRT_SHADE} strokeWidth="2" />
        <path d="M114 170L122 170L124 180L118 208L112 180Z" fill={MAROON} />
        <circle cx="138" cy="188" r="6" fill={GOLD} stroke={MAROON} strokeWidth="1.5" />
        <rect x="112" y="146" width="12" height="18" rx="4" fill={SKIN_SHADE} />
        <circle cx="118" cy="130" r="21" fill={SKIN} />
        <path d="M97 129Q99 104 118 105Q137 104 139 129Q129 118 118 117Q107 118 97 129Z" fill={HAIR} />
        <circle cx="111" cy="131" r="1.8" fill={HAIR} />
        <circle cx="125" cy="131" r="1.8" fill={HAIR} />
        <path d="M113 141q5 4 10 0" fill="none" stroke={SKIN_SHADE} strokeWidth="1.6" strokeLinecap="round" />
      </g>

      <g>
        <rect x="195" y="262" width="10" height="32" rx="4" fill={SKIN} />
        <rect x="215" y="262" width="10" height="32" rx="4" fill={SKIN_SHADE} />
        <rect x="192" y="291" width="15" height="8" rx="3" fill={SHOE} />
        <rect x="213" y="291" width="15" height="8" rx="3" fill={SHOE} />
        <path d="M186 222H232L243 268H175Z" fill={GRAY} stroke={GRAY_DARK} strokeWidth="1.5" />
        <path d="M199 224l-3 42M211 224v42M223 224l3 42" stroke="rgba(255,255,255,.22)" strokeWidth="2" />
        <path d="M182 160Q209 145 236 160L240 226H178Z" fill={SHIRT} stroke={SHIRT_SHADE} strokeWidth="1.5" />
        <path d="M184 170L172 214" stroke={SHIRT} strokeWidth="15" strokeLinecap="round" />
        <path d="M234 170L246 214" stroke={SHIRT} strokeWidth="15" strokeLinecap="round" />
        <circle cx="171" cy="218" r="7" fill={SKIN} />
        <circle cx="247" cy="218" r="7" fill={SKIN} />
        <path d="M201 166L209 166L212 192L205 200L198 192Z" fill={MAROON} />
        <path d="M205 166l-8-5v10zM205 166l8-5v10z" fill={MAROON} />
        <circle cx="226" cy="182" r="6" fill={GOLD} stroke={MAROON} strokeWidth="1.5" />
        <rect x="203" y="148" width="12" height="16" rx="4" fill={SKIN_SHADE} />
        <circle cx="238" cy="120" r="10" fill={HAIR} />
        <circle cx="209" cy="130" r="20" fill={SKIN} />
        <path d="M189 132Q187 108 209 108Q231 108 229 132Q220 119 209 118Q198 119 189 132Z" fill={HAIR} />
        <path d="M189 131q-2 18 6 25l-7-4q-5-12-2-23z" fill={HAIR} />
        <circle cx="202" cy="131" r="1.8" fill={HAIR} />
        <circle cx="216" cy="131" r="1.8" fill={HAIR} />
        <path d="M204 141q5 4 10 0" fill="none" stroke={SKIN_SHADE} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}
