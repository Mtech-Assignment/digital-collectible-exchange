import React from "react";
import SmallLoader from "../loading/SmallLoader";
import BtnHelper from "./BtnHelper";

export default function BtnMain({ icon, text, onClick, className, disabled }) {
  return (
      <button
          disabled={disabled}
          onClick={onClick}
          className={`relative mr-3 cursor-pointer hover:text-gray-100 rounded-md flex items-center justify-center gap-x-1 text-center border border-blue-500 py-2 px-8 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white ${className}`}
      >
        { disabled === true ? <SmallLoader /> : <BtnHelper icon={icon} text={text} />}
      </button>
  );
}
