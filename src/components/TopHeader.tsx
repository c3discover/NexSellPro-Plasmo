import headerImgBase64 from "data-base64:~../assets/headerLogo.png"

export const TopHeader = () => {
  return (
    <div
      id="header"
      className="flex items-center justify-between p-4 text-white shadow-xl rounded-b-lg"
      style={{ 
        background: 'linear-gradient(145deg, #3a3f47, #2f3238)',  // A dark gradient for texture
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',  // Adds depth like a countertop
      }}
    >
      {/* Left Icon with more drastic drop shadow */}
      <div 
        className="text-4xl p-0 m-0 hover:text-gray-400 transition duration-300 ease-in-out" 
        style={{ filter: 'drop-shadow(8px 8px 15px rgba(0, 0, 0, 1))' }}  // Larger offset, darker shadow
      >
        ⚙️
      </div>
      
      {/* Center Logo with more drastic drop shadow */}
      <img
        src={headerImgBase64}
        alt="Header Logo"
        className="w-48"
        style={{ filter: 'drop-shadow(8px 8px 20px rgba(0, 0, 0, 1))' }}  // Larger offset, darker shadow
      />
      
      {/* Right Icon with more drastic drop shadow */}
      <div 
        className="text-4xl p-0 m-0 hover:text-gray-400 transition duration-300 ease-in-out" 
        style={{ filter: 'drop-shadow(8px 8px 15px rgba(0, 0, 0, 1))' }}  // Larger offset, darker shadow
      >
        Ⓜ️
      </div>
    </div>
  )
}
