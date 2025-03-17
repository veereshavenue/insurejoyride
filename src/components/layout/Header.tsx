
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-insurance-blue font-medium text-xl hover:opacity-90 transition-opacity"
        >
          <ShieldCheck className="h-6 w-6" />
          <span className="font-semibold">InsureBuddy</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm hover:text-insurance-blue transition-colors">
            Home
          </Link>
          <Link to="/" className="text-sm hover:text-insurance-blue transition-colors">
            How It Works
          </Link>
          <Link to="/" className="text-sm hover:text-insurance-blue transition-colors">
            About Us
          </Link>
          <Link to="/" className="text-sm hover:text-insurance-blue transition-colors">
            FAQs
          </Link>
        </nav>
        
        <Link
          to="/"
          className="bg-insurance-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-insurance-blue/90 transition-colors"
        >
          Get a Quote
        </Link>
      </div>
    </header>
  );
};

export default Header;
