import { useState } from "react";
import toast from "react-hot-toast";
import { logoutUser } from "../api/logoutUser";
import { FaCircleUser } from "react-icons/fa6";
import ModulePortal from "./ModalPortal";
import { useAuth } from "@/app/providers/auth-provider";
import Link from "next/link";

export function MenuButton() {
  const { me } = useAuth();
  const username = me?.username;
  const [openMenu, setOpenMenu] = useState(false);
  
  async function handleLogout() {
    const result = await logoutUser();

    if (!result.ok) {
      toast.error(result.message || 'Connection failed.');
      return;
    }

    toast.success('Logout successful!');

    window.location.replace('/');
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <FaCircleUser size={24} color="#64afdd"/>
      <button
        onClick={() => setOpenMenu(true)}
        className={`text-base font-semibold text-[#64afdd] ${me ? 'cursor-pointer' : ''}`}
      >
        {username ? `${username.slice(0, 8)}` : 'Guest'}
      </button>
      {
        me ?
          <ModulePortal open={openMenu} onClose={() => setOpenMenu(false)}>
            <div
            className="
              popover-panel
              fixed left-1/2 top-1/2
              -translate-x-1/2 -translate-y-1/2
              w-65 mobile-s:w-75 mobile-l:w-100
              tablet:w-105 laptop:w-120
              p-4 mobile-l:p-6
              bg-white text-[#64afdd]
              border border-[#64afdd]
            ">
              <button
                onClick={() => handleLogout()}
                className="
                  block w-full text-center py-3 border border-[#64afdd] 
                  text-[#64afdd] font-semibold uppercase
                  duration-300 transition-colors
                  hover:bg-[#64afdd] hover:text-white
                "
              >
                Logout
              </button>
            </div>
          </ModulePortal>
        : 
          <ModulePortal open={openMenu} onClose={() => setOpenMenu(false)}>
            <div
            className="
              popover-panel
              fixed left-1/2 top-1/2
              -translate-x-1/2 -translate-y-1/2
              w-65 mobile-s:w-75 mobile-l:w-100
              tablet:w-105 laptop:w-120
              p-4 mobile-l:p-6
              bg-white text-[#64afdd]
              border border-[#64afdd]
            ">
              <Link
                className="
                  block w-full text-center py-3 border border-[#64afdd] 
                  text-[#64afdd] font-semibold uppercase
                  duration-300 transition-colors
                  hover:bg-[#64afdd] hover:text-white
                "
                href={'/login'}
              >
                Login
              </Link>
            </div>
          </ModulePortal>
      }
    </div>
  );
}