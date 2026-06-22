"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn-ghost py-2"
      onClick={() => {
        window.location.replace("/api/auth/logout");
      }}
    >
      ออก
    </button>
  );
}
