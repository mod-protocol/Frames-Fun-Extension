import { LoadingIndicator } from "./loading-indicator"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

export const Button = (props: ButtonProps) => {
  const { isLoading, children, ...rest } = props

  const className = `inline-flex justify-center h-10 items-center px-4 py-2 font-semibold leading-6 text-base shadow rounded-full min-w-28 text-white transition ease-in-out duration-150 ${props.disabled ? "bg-violet-600/50 hover:bg-violet-500/50 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-500 active:bg-violet-400"}`

  return (
    <button className={className} {...rest}>
      {isLoading && (
        <div className={children ? "-ml-1 mr-3" : ""}>
          <LoadingIndicator />
        </div>
      )}
      {children}
    </button>
  )
}
