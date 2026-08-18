export default function CalendarIllustration({ size = 128 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="14" width="100" height="86" rx="20" fill="#dbeafe" />
      <rect x="10" y="14" width="100" height="26" rx="20" fill="#bfdbfe" />
      <rect x="10" y="28" width="100" height="12" fill="#bfdbfe" />
      <circle cx="38" cy="20" r="5" fill="#2563eb" />
      <circle cx="82" cy="20" r="5" fill="#2563eb" />
      <path
        d="M34 62 L54 80 L88 42"
        stroke="#2563eb"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="93" cy="86" r="19" fill="#0f766e" />
      <path
        d="M85 86 L91 92 L102 79"
        stroke="#ffffff"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
