// src/components/Toast.js
import React from "react";

const Toast = ({ type, message, onClose }) => {
  if (!message) return null;

  const backgroundColor =
    type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div
      className={`${backgroundColor} fixed top-5 right-5 text-white px-4 py-2 rounded shadow-lg transition-transform transform ${
        message ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center">
        <span>{type === "success" ? "✅" : "❌"}</span>
        <span className="ml-2">{message}</span>
      </div>
      <button
        className="ml-4 text-sm underline"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

export default Toast;
