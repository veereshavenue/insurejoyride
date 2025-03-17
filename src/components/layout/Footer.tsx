
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-insurance-blue">
              <ShieldCheck className="h-6 w-6" />
              <span className="font-semibold text-xl">InsureBuddy</span>
            </Link>
            <p className="text-sm text-gray-600 max-w-xs">
              Your trusted travel insurance companion. Compare, choose, and secure your journey with confidence.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-insurance-blue transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-insurance-blue transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-insurance-blue transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-insurance-blue transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Insurance Types</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-insurance-blue transition-colors">
                  Single Trip
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-insurance-blue transition-colors">
                  Annual Multi-Trip
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-insurance-blue transition-colors">
                  Family Coverage
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-insurance-blue transition-colors">
                  Group Travel
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-insurance-blue flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  123 Insurance Street, Travel City, TC 10101
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-insurance-blue flex-shrink-0" />
                <span className="text-sm text-gray-600">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-insurance-blue flex-shrink-0" />
                <span className="text-sm text-gray-600">support@insurebuddy.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} InsureBuddy. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/" className="hover:text-insurance-blue transition-colors">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-insurance-blue transition-colors">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-insurance-blue transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
