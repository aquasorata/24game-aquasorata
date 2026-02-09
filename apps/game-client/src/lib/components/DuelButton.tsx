'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginConfirmModalProps = {
  onClose: () => void;
  onLogin: () => void;
};

function LoginConfirmModal({onClose, onLogin} : LoginConfirmModalProps)  {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Login Required
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          You need to log in before playing Duel mode.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
              px-4 py-2 text-sm rounded-md border border-gray-300
              text-gray-600 hover:bg-gray-100
            "
          >
            Cancel
          </button>
          <button
            onClick={onLogin}
            className="
              px-4 py-2 text-sm rounded-md bg-cyan-500
              text-white hover:bg-cyan-600
            "
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export function DuelButton({ isLoggedIn }: { isLoggedIn: Boolean}) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    router.push("/play?mode=duel");
  };
  
  return (
    <>
      <button
        onClick={handleClick}
        className="
          block w-full text-center py-3 border border-[#64afdd]
          text-[#64afdd] font-semibold uppercase
          duration-300 transition-colors
          hover:bg-[#64afdd] hover:text-white
        "
      >
        Duel
      </button>

      {showLoginModal && (
        <LoginConfirmModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => router.push("/login")}
        />
      )}
    </>
  );
}