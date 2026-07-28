/**
 * Al Mayar Star - Design Tokens & Theme File
 * Following a "Minimal Luxury" aesthetic (Deep Navy, Champagne Gold, Soft Neutrals)
 */
export const theme = {
  // Backgrounds
  bg: {
    base: "bg-brand-bg",                    // #FAF8F6
    secondary: "bg-brand-bg-secondary",      // #F2EEEA
    card: "bg-brand-card",                  // #FFFFFF
  },
  
  // Text Colors
  text: {
    primary: "text-brand-text",              // #1F1F1F
    secondary: "text-brand-text-secondary",  // #6B6B6B
    accent: "text-brand-accent",            // #C9A96A (Champagne Gold)
    primaryNavy: "text-brand-primary",      // #2E3A59
    white: "text-white",
  },

  // Interactive Brand Colors
  primary: {
    base: "bg-brand-primary",               // #2E3A59
    hover: "hover:bg-brand-primary-hover",   // #44557A
    text: "text-brand-primary",
    border: "border-brand-primary",
    ring: "focus:ring-brand-primary",
  },

  // Luxury Accents
  accent: {
    base: "bg-brand-accent",                // #C9A96A
    hover: "hover:bg-brand-accent-hover",    // #B59659
    text: "text-brand-accent",
    border: "border-brand-accent",
    ring: "focus:ring-brand-accent",
  },

  // Status Colors
  success: {
    bg: "bg-brand-success/10",
    text: "text-brand-success",              // #4F8A6A
    base: "bg-brand-success",
    border: "border-brand-success",
  },
  error: {
    bg: "bg-brand-error/10",
    text: "text-brand-error",                // #C65B5B
    base: "bg-brand-error",
    border: "border-brand-error",
  },

  // Borders
  border: {
    base: "border-brand-border",            // #E8E3DD
    accent: "border-brand-accent",          // #C9A96A
    primary: "border-brand-primary",        // #2E3A59
  },

  // Shadow tokens
  shadow: {
    soft: "shadow-[0_4px_20px_rgba(46,58,89,0.05)]", // Soft shadow with primary color undertone
    medium: "shadow-[0_8px_30px_rgba(46,58,89,0.08)]",
    card: "shadow-[0_2px_15px_rgba(0,0,0,0.02)]",
  }
};
