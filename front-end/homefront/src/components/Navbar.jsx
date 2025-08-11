import { Link } from "react-router-dom";


export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
        {/* Left - Navigation Links */}
       <ul className="flex gap-8 text-white bg font-medium">
  <li>
    <Link to="/" className="hover:text-yellow cursor-pointer">
      Home
    </Link>
  </li>
  <li>
    <Link to="/About" className="hover:text-yellow cursor-pointer">
      About
    </Link>
  </li>
  <li>
    <Link to="/Service" className="hover:text-yellow cursor-pointer">
      Service
    </Link>
  </li>
    <li>
    <Link to="/blog" className="hover:text-yellow cursor-pointer">
      Blog
    </Link>
  </li>
    <li>
    <Link to="/contactus" className="hover:text-yellow cursor-pointer">
      Contact 
    </Link>
  </li>
</ul>

        {/* Center - Logo + Text */}
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          <img 
            src="/images/OltonLogo.png" 
            alt="Olton Logo" 
            className="h-8 w-auto"
          />
        </div>

        {/* Right - Book Now Button */}
  <button className="relative flex items-center justify-center bg-[#FCD34D] text-green font-medium px-8 py-3 rounded-full overflow-hidden group">
  {/* Arrow */}
  <span className="absolute left-5 transform transition-all duration-900 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover:left-auto group-hover:right-5">
    →
  </span>

  {/* Text */}
  <span className="pl-6 transition-all duration-900 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover:-translate-x-3">
    Get In Touch
  </span>
</button>




      </div>
    </nav>
  );
}
