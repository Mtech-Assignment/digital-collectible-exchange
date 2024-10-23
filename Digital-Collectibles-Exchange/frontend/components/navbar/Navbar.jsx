import React, { useState } from "react";
import Link from "next/link";
import { navLinks } from "../../data";
import { useRouter } from "next/router";
import {
  AiOutlineMenuUnfold,
  AiOutlineMenuFold,
  AiOutlinePlus,
} from "react-icons/ai";
import BtnMain from "../../subcomponents/btns/BtnMain";

export default function Navbar() {
  const router = useRouter();
  const [isMobileNavOpen, setisMobileNavOpen] = useState(false);

  const handleClick = () => {
    router.push("/sell");
    if (isMobileNavOpen) {
      setisMobileNavOpen(false);
    }
  };
  return (
    <div>
      <div className="sys-app-notCollapsed m-0 p-0 fixed top-0 left-0 w-full shadow z-50">
        <div className="w-full ">
          <div className="pb-0 py-2 px-2 mx-auto ">
            <div className="w-full flex justify-between items-center p-2 text-gray-900 bg-white rounded-lg shadow-lg font-medium capitalize">
              <div>
                <span className="px-2 mr-2 md:border-r border-gray-800">
                  <img
                      src="https://img.freepik.com/premium-vector/print_1174912-11140.jpg?w=1380"
                      alt="Logo Placeholder"
                    className="w-8 h-8 -mt-1 inline mx-auto"
                  />
                </span>
              </div>
              <div className="px-2 md:flex gap-x-5 items-center flex-1 text-gray-900 bg-white font-medium capitalize hidden">
                {navLinks?.map(({ title, link, icon }, id) => (
                  <Link key={id} href={link}>
                    <a
                      id={id}
                      className={`px-2 py-1 flex items-center cursor-pointer hover:bg-gray-200 hover:text-gray-700 text-sm rounded ${
                        router.pathname === link
                          ? "text-gray-700 font-semibold"
                          : ""
                      }`}
                    >
                      <span className="p-2 bg-gray-200 rounded-full">{icon}</span>
                      <span className="mx-1">{title}</span>
                    </a>
                  </Link>
                ))}
              </div>
              <BtnMain
                text="List NFT"
                icon={<AiOutlinePlus className="text-2xl" />}
                className="md:flex hidden "
                onClick={handleClick}
              />
              <div className="md:hidden transition-all mr-3 my-3 cursor-pointer hover:text-gray-700">
                {isMobileNavOpen ? (
                  <AiOutlineMenuFold
                    onClick={() => setisMobileNavOpen(false)}
                    className="rounded text-2xl"
                  />
                ) : (
                  <AiOutlineMenuUnfold
                    onClick={() => setisMobileNavOpen(true)}
                    className="rounded text-2xl"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navbar */}
          <div
            id="navbar"
            className={`pt-0 absolute top-0 z-50 mx-auto ${
              isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
            } transition-all flex-wrap md:hidden`}
          >
            <div className="py-[.5px] w-64">
              <div
                  className="w-full py-4 space-y-6 px-2 text-gray-900 bg-white rounded-lg min-h-screen  text-left capitalize font-medium shadow-lg">
                <img
                    src="https://img.freepik.com/premium-vector/print_1174912-11140.jpg?w=1380"
                    alt="alt placeholder"
                    className="w-8 h-8 mx-auto mb-5 "
                />
                {navLinks?.map(({title, link, icon}, id) => (
                    <Link key={id} href={link}>
                      <a
                          id={id}
                          className={`px-2 flex items-center cursor-pointer hover:bg-gray-200 hover:text-gray-700 text-sm rounded ${
                              router.pathname === link
                                  ? "text-gray-700 font-semibold"
                                  : ""
                          }`}
                      >
                        <span className="p-2 bg-gray-200 rounded-full">{icon}</span>
                        <span className="mx-1">{title}</span>
                      </a>
                    </Link>
                ))}
                <BtnMain
                    text="List NFT"
                    icon={<AiOutlinePlus className="text-2xl"/>}
                    className="w-full !rounded-full"
                    onClick={handleClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
