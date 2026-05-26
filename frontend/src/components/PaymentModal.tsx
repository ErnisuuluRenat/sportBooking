import { useState } from "react";
import { Button } from "./ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  venueName: string;
  date: string;
  time: string;
  loading?: boolean;
}

const formatCard = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
const formatExpiry = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 4)
    .replace(/(.{2})/, "$1/");
const formatCvv = (v: string) => v.replace(/\D/g, "").slice(0, 3);

export const PaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  venueName,
  date,
  time,
  loading,
}: Props) => {
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [form, setForm] = useState({ card: "", expiry: "", cvv: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.card.replace(/\s/g, "").length < 16)
      e.card = "Введите корректный номер карты";
    if (form.expiry.length < 5) e.expiry = "Введите дату";
    if (form.cvv.length < 3) e.cvv = "Введите CVV";
    if (!form.name.trim()) e.name = "Введите имя";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onSuccess();
        setStep("form");
        setForm({ card: "", expiry: "", cvv: "", name: "" });
      }, 1500);
    }, 2000);
  };

  const cardType = form.card.startsWith("4")
    ? "VISA"
    : form.card.startsWith("5")
      ? "MC"
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-bg-secondary border border-border-subtle rounded-card overflow-hidden shadow-2xl mt-16 md:mt-0">
        {/* Processing overlay */}
        {step === "processing" && (
          <div className="absolute inset-0 bg-bg-secondary flex flex-col items-center justify-center z-10 gap-4">
            <div className="w-10 h-10 border-2 border-border-subtle border-t-orange rounded-full animate-spin" />
            <p className="text-sm text-text-muted">Обработка платежа...</p>
          </div>
        )}

        {/* Success overlay */}
        {step === "success" && (
          <div className="absolute inset-0 bg-bg-secondary flex flex-col items-center justify-center z-10 gap-3">
            <div className="w-14 h-14 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
              <svg
                className="w-7 h-7 text-green-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-base font-bold">Оплата прошла успешно</p>
            <p className="text-sm text-text-muted">Бронь подтверждена</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-orange"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-bold">Оплата</span>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Order summary */}
        <div className="mx-6 mt-5 bg-bg-primary border border-border-subtle rounded-xl p-4 mb-5">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-3">
            Детали брони
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Объект</span>
              <span className="font-medium text-text-primary truncate ml-4 text-right">
                {venueName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Дата</span>
              <span className="font-medium text-text-primary">{date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Время</span>
              <span className="font-medium text-text-primary">{time}</span>
            </div>
            <div className="h-px bg-border-subtle my-2" />
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Итого</span>
              <span className="text-base font-extrabold text-orange">
                {amount.toLocaleString()} сом
              </span>
            </div>
          </div>
        </div>

        {/* Card form */}
        <div className="px-6 pb-6 space-y-4">
          {/* Card number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-muted uppercase tracking-wider">
              Номер карты
            </label>
            <div className="relative">
              <input
                className={`w-full bg-bg-primary border rounded-btn px-4 py-2.5 text-sm text-text-primary placeholder-text-ghost outline-none transition-colors pr-16 ${errors.card ? "border-red-400/50" : "border-border-subtle focus:border-orange"}`}
                placeholder="0000 0000 0000 0000"
                value={form.card}
                onChange={(e) =>
                  setForm((p) => ({ ...p, card: formatCard(e.target.value) }))
                }
              />
              {cardType && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted border border-border-subtle px-1.5 py-0.5 rounded">
                  {cardType}
                </span>
              )}
            </div>
            {errors.card && (
              <span className="text-xs text-red-400">{errors.card}</span>
            )}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-muted uppercase tracking-wider">
                Срок
              </label>
              <input
                className={`w-full bg-bg-primary border rounded-btn px-4 py-2.5 text-sm text-text-primary placeholder-text-ghost outline-none transition-colors ${errors.expiry ? "border-red-400/50" : "border-border-subtle focus:border-orange"}`}
                placeholder="MM/YY"
                value={form.expiry}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    expiry: formatExpiry(e.target.value),
                  }))
                }
              />
              {errors.expiry && (
                <span className="text-xs text-red-400">{errors.expiry}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-muted uppercase tracking-wider">
                CVV
              </label>
              <input
                className={`w-full bg-bg-primary border rounded-btn px-4 py-2.5 text-sm text-text-primary placeholder-text-ghost outline-none transition-colors ${errors.cvv ? "border-red-400/50" : "border-border-subtle focus:border-orange"}`}
                placeholder="•••"
                type="password"
                value={form.cvv}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cvv: formatCvv(e.target.value) }))
                }
              />
              {errors.cvv && (
                <span className="text-xs text-red-400">{errors.cvv}</span>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-muted uppercase tracking-wider">
              Имя на карте
            </label>
            <input
              className={`w-full bg-bg-primary border rounded-btn px-4 py-2.5 text-sm text-text-primary placeholder-text-ghost outline-none transition-colors uppercase ${errors.name ? "border-red-400/50" : "border-border-subtle focus:border-orange"}`}
              placeholder="AZAMAT KENJEBAEV"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value.toUpperCase() }))
              }
            />
            {errors.name && (
              <span className="text-xs text-red-400">{errors.name}</span>
            )}
          </div>

          <Button size="lg" loading={loading} onClick={handlePay}>
            Оплатить {amount.toLocaleString()} сом
          </Button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 text-xs text-text-ghost">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
            </svg>
            Защищено SSL шифрованием
          </div>
        </div>
      </div>
    </div>
  );
};
