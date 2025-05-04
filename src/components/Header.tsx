import React from 'react';
import { ClipboardCheck, Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="mr-4 p-1 rounded-full hover:bg-gray-100 transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center">
          <ClipboardCheck size={32} className="text-blue-600 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">InspecPro</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;