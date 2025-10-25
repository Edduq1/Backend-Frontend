import React from "react";
import { Loader2 } from "lucide-react"; 

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}) => {
  const base =
    "relative w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const variants = {
    primary:
      "text-sky-300 bg-white/5 border border-sky-500/40 backdrop-blur-md " +
      "hover:bg-sky-500/20 hover:border-sky-400/60 " +
      "hover:shadow-[0_0_25px_-4px_rgba(56,189,248,0.5)] " +
      "focus:ring-sky-400/70",
    secondary:
      "text-gray-300 bg-gray-800/40 border border-gray-600/50 backdrop-blur-md " +
      "hover:bg-gray-700/40 hover:text-white " +
      "hover:shadow-[0_0_20px_-6px_rgba(156,163,175,0.3)] " +
      "focus:ring-gray-500/50",
    danger:
      "text-red-300 bg-red-900/20 border border-red-600/40 backdrop-blur-md " +
      "hover:bg-red-600/30 hover:border-red-400/60 " +
      "hover:shadow-[0_0_20px_-4px_rgba(248,113,113,0.4)] " +
      "focus:ring-red-500/50",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin w-5 h-5 text-sky-300" />
      )}
      <span className="inline-flex items-center gap-2">{loading ? "Cargando..." : children}</span>
    </button>
  );
};

export default Button;
