import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideMenu from "./SideMenu";

function Layout() {
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFooter(false);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="md:h-16">
        <Header />
      </div>
      <div className="grid grid-cols-12 bg-gray-100 items-baseline min-h-screen relative">
        <div className="col-span-2 h-screen sticky top-0 hidden lg:flex">
          <SideMenu />
        </div>
        <Outlet />
        {/* Copyright Footer */}
        {showFooter && (
          <div className="col-span-12 bg-gray-800 text-white py-3 text-center text-sm fixed bottom-0 w-full">
            <p>© {new Date().getFullYear()} - Created by 
              <a href="https://github.com/syedbilalalam1" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1">Syed Bilal Alam</a>
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Layout;
