import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { venuesApi } from "../api/venues";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ImageUploader } from "../components/ImageUploader";
import { geocodeAddress } from "../api/geocoding";

const SPORT_TYPES = [
  { value: "football", label: "Футбол" },
  { value: "tennis", label: "Теннис" },
  { value: "basketball", label: "Баскетбол" },
  { value: "volleyball", label: "Волейбол" },
  { value: "swimming", label: "Плавание" },
  { value: "gym", label: "Тренажёр" },
  { value: "other", label: "Другое" },
];

const AMENITIES_LIST = [
  "Душ",
  "Раздевалка",
  "Парковка",
  "Кафе",
  "Сауна",
  "Освещение",
  "Трибуны",
  "Прокат инвентаря",
  "Тренер",
  "Кондиционер",
];

export const OwnersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    sportType: "football",
    address: "",
    city: "Бишкек",
    pricePerHour: "",
    amenities: [] as string[],
  });
  const [images, setImages] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const coordinates = await geocodeAddress(form.address, form.city);
      return venuesApi.createJson({
        name: form.name,
        description: form.description,
        sportType: form.sportType,
        address: form.address,
        city: form.city,
        pricePerHour: Number(form.pricePerHour),
        amenities: form.amenities,
        images,
        ...(coordinates ? { coordinates } : {}),
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setShowForm(false);
      setForm({
        name: "",
        description: "",
        sportType: "football",
        address: "",
        city: "Бишкек",
        pricePerHour: "",
        amenities: [],
      });
      setImages([]);
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      setTimeout(() => setSuccess(false), 5000);
    },
  });

  const toggleAmenity = (a: string) => {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter((x) => x !== a)
        : [...p.amenities, a],
    }));
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-bg-card border border-border-subtle rounded px-3 py-1.5 mb-7">
            <span className="w-5 h-px bg-orange" />
            <span className="text-xs text-text-muted uppercase tracking-widest">
              Для владельцев
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-5">
            Зарабатывай на своём
            <br />
            <span className="text-orange">спортивном объекте</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed max-w-xl mb-8">
            Разместите свой объект на платформе и получайте стабильный поток
            клиентов. Управляйте расписанием и доходами в одном месте.
          </p>

          {!showForm && (
            <Button
              onClick={() =>
                isAuthenticated ? setShowForm(true) : navigate("/register")
              }
            >
              {isAuthenticated ? "Разместить объект" : "Начать бесплатно"}
            </Button>
          )}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {[
            {
              title: "Больше клиентов",
              desc: "Тысячи пользователей ищут объекты на нашей платформе каждый день.",
            },
            {
              title: "Онлайн расписание",
              desc: "Управляйте слотами и бронированиями в реальном времени без лишних звонков.",
            },
            {
              title: "Рейтинг и отзывы",
              desc: "Система отзывов помогает привлекать новых клиентов и строить репутацию.",
            },
          ].map((b) => (
            <div
              key={b.title}
              className="bg-bg-secondary border border-border-subtle rounded-card p-6"
            >
              <div className="w-8 h-8 bg-orange/10 border border-orange/20 rounded-lg flex items-center justify-center mb-4">
                <span className="w-2 h-2 bg-orange rounded-full" />
              </div>
              <h3 className="text-sm font-bold mb-2">{b.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-card px-5 py-4 mb-6">
            Объект успешно создан и появится на платформе после проверки.
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-bg-secondary border border-border-subtle rounded-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold tracking-tight">Новый объект</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-text-muted hover:text-text-primary transition-colors text-sm"
              >
                Отмена
              </button>
            </div>

            <div className="space-y-5">
              <Input
                label="Название объекта"
                placeholder="Стадион Динамо"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-muted uppercase tracking-wider">
                  Описание
                </label>
                <textarea
                  className="bg-bg-primary border border-border-subtle rounded-btn px-4 py-2.5 text-sm text-text-primary placeholder-text-ghost outline-none focus:border-orange transition-colors resize-none"
                  rows={3}
                  placeholder="Опишите ваш объект..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-muted uppercase tracking-wider">
                  Вид спорта
                </label>
                <select
                  className="bg-bg-primary border border-border-subtle rounded-btn px-4 py-2.5 text-sm text-text-primary outline-none focus:border-orange transition-colors"
                  value={form.sportType}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sportType: e.target.value }))
                  }
                >
                  {SPORT_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Адрес"
                  placeholder="ул. Московская 123"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                />
                <Input
                  label="Город"
                  placeholder="Бишкек"
                  value={form.city}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, city: e.target.value }))
                  }
                />
              </div>

              <Input
                label="Цена за час (сом)"
                type="number"
                placeholder="1000"
                value={form.pricePerHour}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pricePerHour: e.target.value }))
                }
              />

              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted uppercase tracking-wider">
                  Удобства
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        form.amenities.includes(a)
                          ? "bg-orange/10 border-orange text-orange"
                          : "bg-bg-primary border-border-subtle text-text-muted hover:border-orange hover:text-orange"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <ImageUploader images={images} onChange={setImages} max={5} />

              <Button
                size="lg"
                loading={mutation.isPending}
                onClick={() => mutation.mutate()}
                disabled={
                  !form.name ||
                  !form.description ||
                  !form.address ||
                  !form.pricePerHour
                }
              >
                Разместить объект
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
