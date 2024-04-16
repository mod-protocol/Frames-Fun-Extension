export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

const renderLoadingIndicator = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

export const Button = (props: ButtonProps) => {
  const { isLoading, children, ...rest } = props

  const className = `inline-flex justify-center h-10 items-center px-4 py-2 font-semibold leading-6 text-base shadow rounded-full min-w-28 text-white transition ease-in-out duration-150 ${props.disabled ? "bg-violet-600/50 hover:bg-violet-500/50 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-500 active:bg-violet-400"}`

  return (
    <button className={className} {...rest}>
      {isLoading && (
        <div className={children ? "-ml-1 mr-3" : ""}>
          {renderLoadingIndicator()}
        </div>
      )}
      {children}
    </button>
  )
}
