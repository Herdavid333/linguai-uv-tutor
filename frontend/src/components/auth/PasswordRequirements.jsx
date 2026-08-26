import {
  CheckCircle2,
  Circle,
} from "lucide-react";

export default function PasswordRequirements({
  password = "",
}) {
  const requirements = [
    {
      id: "length",
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "At least one number",
      valid: /\d/.test(password),
    },
  ];

  return (
    <div className="space-y-3">
      {requirements.map(
        (requirement) => {
          const Icon =
            requirement.valid
              ? CheckCircle2
              : Circle;

          return (
            <div
              key={requirement.id}
              className={`
                flex
                items-center
                gap-3
                rounded-md
                border
                px-3
                py-2.5
                transition-all
                duration-200

                ${
                  requirement.valid
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 bg-white"
                }
              `}
            >
              <Icon
                size={21}
                strokeWidth={2.5}
                className={
                  requirement.valid
                    ? "shrink-0 text-green-600"
                    : "shrink-0 text-gray-400"
                }
              />

              <span
                className={`
                  font-semibold

                  text-[13px]
                  sm:text-[14px]
                  lg:text-[16px]

                  ${
                    requirement.valid
                      ? "text-green-700"
                      : "text-gray-600"
                  }
                `}
              >
                {requirement.label}
              </span>
            </div>
          );
        }
      )}
    </div>
  );
}