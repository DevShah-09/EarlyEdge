/**
 * COMPONENT: LoadingSpinner
 * Purpose: Full-page or inline loading indicator.
 * Props:
 *  - fullPage: boolean (default true) — center on screen
 *  - size: "sm"|"md"|"lg"
 *  - message: string — optional loading text
 */
const LoadingSpinner = ({ fullPage = true, size = 'md', message = 'Initializing Application...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4'
  };

  const containerClasses = fullPage 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6'
    : 'flex flex-col items-center justify-center gap-4 py-12';

  return (
    <div className={containerClasses}>
      <div className={`${sizeClasses[size]} border-blue-100 border-t-blue-600 rounded-full animate-spin shadow-inner`}></div>
      {message && <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">{message}</p>}
    </div>
  );
};
export default LoadingSpinner
