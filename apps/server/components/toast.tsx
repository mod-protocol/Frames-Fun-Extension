import { useEffect, useState } from "react";

type ToastType = "info" | "success" | "error";

interface ToastState {
  message: string;
  type: ToastType;
}

interface ToastProps extends Partial<ToastState> {
  show: boolean;
  onClose: () => void;
}

export function useToast() {
  const [toastState, setToastState] = useState<ToastState | null>(null);
  function setToast(message: string, type?: ToastType) {
    setToastState({ message, type: type ?? "info" });
  }
  const toast: ToastProps = {
    ...toastState,
    show: !!toastState,
    onClose: () => setToastState(null),
  };
  return [toast, setToast] as const;
}

export function Toast({ toast }: { toast: ToastProps }) {
  const { message, type, onClose } = toast;
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!toast.show) {
    return null;
  }

  let iconContainerClassName =
    "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-md dark:bg-blue-800 dark:text-blue-200";
  if (type === "success") {
    iconContainerClassName =
      "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-md dark:bg-green-800 dark:text-green-200";
  } else if (type === "error") {
    iconContainerClassName =
      "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-md dark:bg-red-800 dark:text-red-200";
  }

  return (
    <div
      className="flex items-center w-full max-w-sm p-4 mb-4 text-gray-500 bg-white rounded-md shadow dark:text-gray-200 dark:bg-black/90"
      role="alert"
    >
      <div className={iconContainerClassName}>
        <svg
          className="w-5 h-5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {type === "info" && (
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          )}
          {type === "success" && (
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          )}
          {type === "error" && (
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
          )}
        </svg>
        <span className="sr-only">Icon</span>
      </div>
      <div className="ms-3 text-sm font-normal text-ellipsis overflow-hidden">
        {message}
      </div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-md focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-300 dark:hover:text-white dark:bg-black/90 dark:hover:bg-black/70"
        aria-label="Close"
        onClick={onClose}
      >
        <span className="sr-only">Close</span>
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </div>
  );
}
