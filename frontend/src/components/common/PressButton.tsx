function PressButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`scale-100 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.88] active:duration-80 active:ease-out ${className} flex cursor-pointer items-center justify-center`}
    >
      {children}
    </button>
  )
}

export default PressButton
