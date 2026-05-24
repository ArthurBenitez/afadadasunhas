import { cn } from "@/lib/utils";

type Variant = "full" | "mono";

interface BrandMarkProps extends React.SVGProps<SVGSVGElement> {
  variant?: Variant;
  title?: string;
}

/**
 * Marca da A fada das Unhas.
 * Composição: círculo marsala + silhueta de unha em bege com
 * meia-lua (cuticula) destacada. Geométrico, alto contraste,
 * legível em tamanhos pequenos.
 */
export function BrandMark({
  variant = "full",
  className,
  title = "A fada das Unhas",
  ...props
}: BrandMarkProps) {
  if (variant === "mono") {
    return (
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("block", className)}
        aria-label={title}
        role="img"
        {...props}
      >
        <title>{title}</title>
        {/* Silhueta da unha */}
        <path
          d="M22 14c0-3.3 4.5-6 10-6s10 2.7 10 6v28c0 5.5-4.5 10-10 10s-10-4.5-10-10V14z"
          fill="currentColor"
        />
        {/* Meia-lua */}
        <path
          d="M24 18c0-2.2 3.6-4 8-4s8 1.8 8 4-3.6 4-8 4-8-1.8-8-4z"
          fill="currentColor"
          opacity="0.35"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      aria-label={title}
      role="img"
      {...props}
    >
      <title>{title}</title>
      <circle cx="32" cy="32" r="32" fill="#640017" />
      {/* Silhueta da unha em bege */}
      <path
        d="M22 18c0-3 4.5-5.5 10-5.5S42 15 42 18v24c0 5.5-4.5 10-10 10s-10-4.5-10-10V18z"
        fill="#EFEFC9"
      />
      {/* Meia-lua (cuticula) */}
      <path
        d="M24 20.5c0-1.9 3.6-3.5 8-3.5s8 1.6 8 3.5S36.4 24 32 24s-8-1.6-8-3.5z"
        fill="#640017"
        opacity="0.18"
      />
      {/* Brilho diagonal sutil */}
      <path
        d="M28 22v18"
        stroke="#640017"
        strokeOpacity="0.08"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
