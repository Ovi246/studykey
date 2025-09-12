
const StudyKeyLogo = ({ size = 512 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    {/* Background Circle */}
    <circle cx="256" cy="256" r="240" fill="#FF4500" stroke="#FFF" strokeWidth="16"/>
    
    {/* Key Shape */}
    <g fill="#FFF">
      {/* Key Head */}
      <circle cx="256" cy="180" r="60"/>
      <circle cx="256" cy="180" r="30" fill="#FF4500"/>
      
      {/* Key Shaft */}
      <rect x="236" y="240" width="40" height="160" rx="20"/>
      
      {/* Key Teeth */}
      <rect x="276" y="340" width="30" height="20" rx="10"/>
      <rect x="276" y="370" width="40" height="20" rx="10"/>
    </g>
    
    {/* Book Pages */}
    <g fill="#FFF" opacity="0.9">
      <rect x="320" y="200" width="80" height="100" rx="8"/>
      <rect x="330" y="210" width="60" height="4" fill="#FF4500"/>
      <rect x="330" y="220" width="50" height="4" fill="#FF4500"/>
      <rect x="330" y="230" width="60" height="4" fill="#FF4500"/>
      <rect x="330" y="250" width="40" height="4" fill="#FF4500"/>
      <rect x="330" y="260" width="55" height="4" fill="#FF4500"/>
      <rect x="330" y="270" width="45" height="4" fill="#FF4500"/>
    </g>
    
    {/* StudyKey Text */}
    <text x="256" y="450" textAnchor="middle" fill="#FFF" fontSize="48" fontWeight="bold" fontFamily="Arial, sans-serif">
      StudyKey
    </text>
  </svg>
);

export default StudyKeyLogo;