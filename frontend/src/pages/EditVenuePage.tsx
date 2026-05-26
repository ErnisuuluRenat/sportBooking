import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venuesApi } from "../api/venues";
import { useAuthStore } from "../store/authStore";
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

export const EditVenuePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    description: "",
    sportType: "football",
    address: "",
    city: "",
    pricePerHour: "",
    amenities: [] as string[],
  });
  const [images, setImages] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const { data: venue, isLoading } = useQuery({
    queryKey: ["venue", id],
    queryFn: () => venuesApi.getOne(id!),
    enabled: !!id,
  });

  // Заполняем форму данными объекта
  useEffect(() => {
    if (venue) {
      setForm({
        name: venue.name,
        description: venue.description,
        sportType: venue.sportType,
        address: venue.address,
        city: venue.city,
        pricePerHour: String(venue.pricePerHour),
        amenities: venue.amenities ?? [],
      });
      setImages(venue.images ?? []);
    }
  }, [venue]);

  // Проверка прав — только owner или admin
  const canEdit =
    isAuthenticated &&
    (user?.role === "admin" ||
      (venue &&
        typeof venue.owner === "object" &&
        (venue.owner as any)._id === user?.id));

  const mutation = useMutation({
    mutationFn: async () => {
      const updateData: any = {
        name: form.name,
        description: form.description,
        sportType: form.sportType,
        address: form.address,
        city: form.city,
        pricePerHour: Number(form.pricePerHour),
        amenities: form.amenities,
        images,
      };

      // Геокодинг если адрес изменился или нет координат
      if (!venue?.location?.coordinates?.length) {
        const coordinates = await geocodeAddress(form.address, form.city);
        if (coordinates) updateData.coordinates = coordinates;
      }

      return venuesApi.update(id!, updateData);
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["venue", id] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      setTimeout(() => navigate(`/venues/${id}`), 1500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => venuesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      navigate("/");
    },
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleAmenity = (a: string) => {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter((x) => x !== a)
        : [...p.amenities, a],
    }));
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border-subtle border-t-orange rounded-full animate-spin" />
      </div>
    );

  if (!canEdit)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-text-muted text-sm">
          У вас нет прав для редактирования этого объекта
        </p>
        <Button onClick={() => navigate(`/venues/${id}`)}>Вернуться</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(`/venues/${id}`)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              d="M19 12H5M12 5l-7 7 7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Назад к объекту
        </button>

        <h1 className="text-2xl font-extrabold tracking-tight mb-8">
          Редактировать объект
        </h1>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-card px-4 py-3 mb-6">
            Объект успешно обновлён. Перенаправляем...
          </div>
        )}

        <div className="space-y-5">
          <Input
            label="Название"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-muted uppercase tracking-wider">
              Описание
            </label>
            <textarea
              className="bg-bg-secondary border border-border-subtle rounded-btn px-4 py-2.5 text-sm text-text-primary placeholder-text-ghost outline-none focus:border-orange transition-colors resize-none"
              rows={4}
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
              className="bg-bg-secondary border border-border-subtle rounded-btn px-4 py-2.5 text-sm text-text-primary outline-none focus:border-orange transition-colors"
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
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
            />
            <Input
              label="Город"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            />
          </div>

          <Input
            label="Цена за час (сом)"
            type="number"
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

          {/* Кнопки сохранения */}
          <div className="flex gap-3 pt-2">
            <Button
              size="lg"
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
              disabled={!form.name || !form.description || !form.pricePerHour}
            >
              Сохранить изменения
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate(`/venues/${id}`)}
            >
              Отмена
            </Button>
          </div>

          {/* Удаление — отдельно */}
          <div className="pt-6 border-t border-border-subtle mt-4">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Удалить объект
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-card p-4">
                <p className="text-sm text-red-400 mb-3 font-medium">
                  Удалить объект навсегда? Это действие нельзя отменить.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate()}
                  >
                    Да, удалить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
