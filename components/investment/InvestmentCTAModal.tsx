'use client';

/**
 * InvestmentCTAModal Component
 * 
 * Modal dialog that prompts non-investors to invest to unlock premium features.
 * This component is reusable across the application wherever investment prompts are needed.
 * 
 * Features:
 * - Displays benefits of becoming an investor
 * - "Invest Now" button that navigates to investment portal
 * - "Maybe Later" button to dismiss the modal
 * - Accessible modal with proper ARIA attributes
 * - Responsive design with mobile support
 * - Dark mode support
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * @example
 * ```tsx
 * const [showModal, setShowModal] = useState(false);
 * 
 * <InvestmentCTAModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onInvest={() => router.push('/investment-portal')}
 * />
 * ```
 */

/**
 * InvestmentCTAModal Props
 */
export interface InvestmentCTAModalProps {
  /**
   * Whether the modal is currently open
   */
  isOpen: boolean;
  
  /**
   * Callback function when the modal is closed/dismissed
   */
  onClose: () => void;
  
  /**
   * Optional callback function when "Invest Now" is clicked
   * If not provided, defaults to navigating to '/investment-portal'
   */
  onInvest?: () => void;
}

/**
 * InvestmentCTAModal Component
 * 
 * Displays a modal prompting users to invest to unlock premium features.
 * Shows a list of benefits and provides "Invest Now" and "Maybe Later" actions.
 * 
 * @param props - Component props
 * @returns Modal component or null if not open
 */
export function InvestmentCTAModal({ 
  isOpen, 
  onClose,
  onInvest 
}: InvestmentCTAModalProps): JSX.Element | null {
  if (!isOpen) return null;

  const handleInvest = () => {
    if (onInvest) {
      onInvest();
    } else {
      // Default behavior: navigate to investment portal
      window.location.href = '/investment-portal';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal panel */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Modal content */}
          <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <h3
                  className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100"
                  id="modal-title"
                >
                  Unlock Premium Features
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Become an investor to unlock exclusive features and insights:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Portfolio Tracking:</strong> Monitor all your investments in one place
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Financial Analytics:</strong> Detailed profit/loss analysis and projections
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Team Insights:</strong> View project teams and their performance
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Development Tracking:</strong> Real-time project stage updates
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Modal actions */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
            <button
              type="button"
              onClick={handleInvest}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto transition-colors"
            >
              Invest Now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
