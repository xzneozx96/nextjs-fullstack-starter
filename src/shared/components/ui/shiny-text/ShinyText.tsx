import { cn } from '@/shared/utils/utils';

const ShinyText = ({ text = '', speed = 5, className = '' }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={cn(
        'animate-shine inline-block bg-clip-text text-transparent',
        'bg-linear-to-r from-35% via-50% to-65%',
        'from-neutral-400 via-gray-500 to-neutral-400',
        'dark:from-neutral-500 dark:via-neutral-50 dark:to-neutral-500',
        className,
      )}
      style={{
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration,
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText;

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       keyframes: {
//         shine: {
//           '0%': { 'background-position': '100%' },
//           '100%': { 'background-position': '-100%' },
//         },
//       },
//       animation: {
//         shine: 'shine 5s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// };
