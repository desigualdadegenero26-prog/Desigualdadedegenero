import { ReactNode } from "react";
import borderImg from "@/assets/decorative-border.png";

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Standardized decorative blue/gold certificate-style frame.
 * Wraps any section/content with the same ornamental border.
 */
export function DecorativeFrame({ children, className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          backgroundImage: `url(${borderImg})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
