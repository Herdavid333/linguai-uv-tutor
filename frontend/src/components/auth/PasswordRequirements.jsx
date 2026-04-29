"use client";

export default function PasswordRequirements({ password, isOpen }) {
  const requirements = [
    {
      label: "Minimum 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "At least one uppercase letter (A-Z)",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter (a-z)",
      valid: /[a-z]/.test(password),
    },
    {
      label: "At least one number (0-9)",
      valid: /[0-9]/.test(password),
    },
    {
      label: "At least one special character (!@#$%^&*)",
      valid: /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+=]/.test(password),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="mt-1 rounded-md bg-[#b3b3b3] p-4 text-white">
      <h4 className="mb-1 text-[18px] font-bold text-black text-center">
        Password Requirements
      </h4>

      <ul className="space-y-0 text-[18px]">
        {requirements.map((requirement, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 ${
              requirement.valid ? "text-black" : "text-white"
            }`}
          >
            <span className="inline-block w-[16px] text-center font-bold">
              {requirement.valid ? "✓" : "•"}
            </span>
            <span>{requirement.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}