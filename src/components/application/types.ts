export type Tab = "submit" | "status";

export interface FormData {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  passportSeries: string;
  passportNumber: string;
  phone: string;
  email: string;
  vehiclePlate: string;
  vehicleVin: string;
  applicationType: string;
  description: string;
}

export interface FormErrors {
  [key: string]: string;
}

export const APPLICATION_TYPES = [
  "Постановка ТС на учёт",
  "Снятие ТС с учёта",
  "Замена водительского удостоверения",
  "Получение справки об отсутствии нарушений",
  "Обжалование штрафа",
  "Выдача дубликата документов",
  "Иное заявление",
];

export const MOCK_STATUSES: Record<string, { status: string; date: string; comment: string; color: string }> = {
  "ГАИ-2024-001234": {
    status: "Принято в обработку",
    date: "18.03.2026",
    comment: "Заявление зарегистрировано, ожидайте ответа в течение 5 рабочих дней.",
    color: "text-blue-600",
  },
  "ГАИ-2024-005678": {
    status: "Рассматривается",
    date: "20.03.2026",
    comment: "Заявление передано в соответствующий отдел для рассмотрения.",
    color: "text-amber-600",
  },
  "ГАИ-2024-009999": {
    status: "Выполнено",
    date: "22.03.2026",
    comment: "Ваше заявление рассмотрено. Результат направлен на указанный email.",
    color: "text-green-600",
  },
};

export function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.lastName.trim()) errors.lastName = "Обязательное поле";
  else if (!/^[А-ЯЁа-яёA-Za-z-]+$/.test(data.lastName.trim()))
    errors.lastName = "Только буквы";

  if (!data.firstName.trim()) errors.firstName = "Обязательное поле";
  else if (!/^[А-ЯЁа-яёA-Za-z-]+$/.test(data.firstName.trim()))
    errors.firstName = "Только буквы";

  if (!data.birthDate) errors.birthDate = "Обязательное поле";

  if (!data.passportSeries.trim()) errors.passportSeries = "Обязательное поле";
  else if (!/^\d{4}$/.test(data.passportSeries.trim()))
    errors.passportSeries = "4 цифры";

  if (!data.passportNumber.trim()) errors.passportNumber = "Обязательное поле";
  else if (!/^\d{6}$/.test(data.passportNumber.trim()))
    errors.passportNumber = "6 цифр";

  if (!data.phone.trim()) errors.phone = "Обязательное поле";
  else if (!/^[\d+\-()\s]{7,15}$/.test(data.phone.trim()))
    errors.phone = "Некорректный номер";

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    errors.email = "Некорректный email";

  if (!data.applicationType) errors.applicationType = "Выберите тип заявления";

  return errors;
}
