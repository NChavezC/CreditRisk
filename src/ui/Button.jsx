function Button({ children, className = "bg-stone-900", ...props }) {
  return (
    <button
      className={`text-yellow-50 font-semibold px-6 py-3 rounded-md shadow hover:bg-neutral-700 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
