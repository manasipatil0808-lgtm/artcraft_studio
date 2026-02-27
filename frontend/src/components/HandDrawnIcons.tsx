// Hand-drawn style SVG icons for a whimsical, artisanal feel

export const HandDrawnCart = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M3.5 4.5C3.3 4.5 3.1 4.6 3 4.8C2.9 5 2.9 5.2 3 5.4L3.2 5.8L5.8 11.2L6 11.6C6.1 11.8 6.3 11.9 6.5 11.9H18.5C18.7 11.9 18.9 11.8 19 11.6L21.8 6C21.9 5.8 21.9 5.6 21.8 5.4C21.7 5.2 21.5 5.1 21.3 5.1H7.2L6.5 3.6C6.4 3.4 6.2 3.3 6 3.3H3.5C3.2 3.3 3 3.5 3 3.8C3 4.1 3.2 4.3 3.5 4.3V4.5Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: '1, 2',
        strokeDashoffset: '0.5'
      }}
    />
    <circle 
      cx="8" 
      cy="19" 
      r="1.8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      fill="none"
    />
    <circle 
      cx="17" 
      cy="19" 
      r="1.8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      fill="none"
    />
    <path 
      d="M6 12L7 16C7.1 16.4 7.4 16.7 7.8 16.7H17.2C17.6 16.7 17.9 16.4 18 16L19 12" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const HandDrawnUser = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle 
      cx="12" 
      cy="8" 
      r="4.2" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      fill="none"
      style={{
        strokeDasharray: '1.5, 1',
      }}
    />
    <path 
      d="M4.5 20C4.8 16.5 8 14 12 14C16 14 19.2 16.5 19.5 20" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      fill="none"
      style={{
        strokeDasharray: '2, 1',
      }}
    />
  </svg>
);

export const HandDrawnHeart = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 21.5C11.8 21.4 4 15.8 4 9.5C4 6.5 6.5 4 9.5 4C10.9 4 12.2 4.6 13 5.5C13.8 4.6 15.1 4 16.5 4C19.5 4 22 6.5 22 9.5C22 15.8 14.2 21.4 12 21.5Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: '1.5, 1.5',
      }}
    />
  </svg>
);

export const HandDrawnGift = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect 
      x="3.5" 
      y="10.5" 
      width="17" 
      height="10" 
      rx="1" 
      stroke="currentColor" 
      strokeWidth="1.5"
      fill="none"
    />
    <path 
      d="M3.5 10.5H20.5V13.5H3.5V10.5Z" 
      stroke="currentColor" 
      strokeWidth="1.5"
      fill="none"
    />
    <path 
      d="M12 10.5V20.5" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path 
      d="M9.5 10.5C9.5 9.5 9 8 9 7C9 5.5 10 4.5 11 4.5C12 4.5 12.5 5.5 12.5 6.5" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <path 
      d="M14.5 10.5C14.5 9.5 15 8 15 7C15 5.5 14 4.5 13 4.5C12 4.5 11.5 5.5 11.5 6.5" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const HandDrawnMenu = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M4 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M4 17.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const HandDrawnX = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const HandDrawnLogout = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M9 21H5C4.5 21 4 20.5 4 20V4C4 3.5 4.5 3 5 3H9" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      fill="none"
    />
    <path 
      d="M16 17L21 12L16 7" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
    />
    <path 
      d="M21 12H9" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);

export const HandDrawnPackage = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 3L4 7V17L12 21L20 17V7L12 3Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
      fill="none"
    />
    <path 
      d="M12 12L4 7" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M12 12L20 7" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M12 12V21" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);
