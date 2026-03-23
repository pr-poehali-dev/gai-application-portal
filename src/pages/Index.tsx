import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "submit" | "status";

interface FormData {
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

interface FormErrors {
  [key: string]: string;
}

const APPLICATION_TYPES = [
  "Постановка ТС на учёт",
  "Снятие ТС с учёта",
  "Замена водительского удостоверения",
  "Получение справки об отсутствии нарушений",
  "Обжалование штрафа",
  "Выдача дубликата документов",
  "Иное заявление",
];

const MOCK_STATUSES: Record<string, { status: string; date: string; comment: string; color: string }> = {
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

function validate(data: FormData): FormErrors {
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

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("submit");
  const [form, setForm] = useState<FormData>({
    lastName: "",
    firstName: "",
    middleName: "",
    birthDate: "",
    passportSeries: "",
    passportNumber: "",
    phone: "",
    email: "",
    vehiclePlate: "",
    vehicleVin: "",
    applicationType: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState("");

  const [statusQuery, setStatusQuery] = useState("");
  const [statusResult, setStatusResult] = useState<null | "found" | "not_found">(null);
  const [statusData, setStatusData] = useState<(typeof MOCK_STATUSES)[string] | null>(null);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const newErrors = validate({ ...form, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: newErrors[field] || "" }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validate(form);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] || "" }));
  };

  const handleSubmit = () => {
    const allTouched = Object.keys(form).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<string, boolean>
    );
    setTouched(allTouched);
    const newErrors = validate(form);
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    const num = `ГАИ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    setSubmittedNumber(num);
    setSubmitted(true);
  };

  const handleStatusCheck = () => {
    const key = statusQuery.trim().toUpperCase();
    if (MOCK_STATUSES[key]) {
      setStatusData(MOCK_STATUSES[key]);
      setStatusResult("found");
    } else {
      setStatusData(null);
      setStatusResult("not_found");
    }
  };

  const getFieldClass = (field: string) => {
    const base =
      "w-full px-3 py-2.5 text-sm border bg-white outline-none transition-all duration-150 font-mono focus:border-primary";
    if (touched[field] && errors[field]) return `${base} field-error`;
    if (touched[field] && !errors[field] && form[field as keyof FormData])
      return `${base} field-valid`;
    return `${base} border-border`;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full animate-fade-in text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
              <Icon name="CheckCircle" size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Заявление подано</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Ваше заявление успешно зарегистрировано и направлено в ГАИ в виде ZIP-архива.
            </p>
            <div className="bg-white border border-border p-4 mb-6">
              <p className="text-xs text-muted-foreground mb-1">Номер вашей заявки</p>
              <p className="font-mono font-medium text-lg tracking-wider">{submittedNumber}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-8">
              Сохраните номер заявки — он понадобится для проверки статуса.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  lastName: "", firstName: "", middleName: "", birthDate: "",
                  passportSeries: "", passportNumber: "", phone: "", email: "",
                  vehiclePlate: "", vehicleVin: "", applicationType: "", description: "",
                });
                setTouched({});
                setErrors({});
              }}
              className="text-sm text-primary underline underline-offset-4"
            >
              Подать ещё одно заявление
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="border-b border-border bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex">
            {(["submit", "status"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "submit" ? (
                  <span className="flex items-center gap-2">
                    <Icon name="FilePlus" size={15} />
                    Подать заявление
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Icon name="Search" size={15} />
                    Статус заявки
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {activeTab === "submit" && (
          <div className="animate-fade-in">
            <SectionTitle
              icon="FileText"
              title="Подача заявления"
              subtitle="Заполните форму — данные будут проверены и направлены в ГАИ ZIP-архивом"
            />

            <div className="space-y-8 mt-8">
              <FormSection title="Персональные данные">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FieldWrap label="Фамилия *" error={touched.lastName ? errors.lastName : ""}>
                    <input
                      className={getFieldClass("lastName")}
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      placeholder="Иванов"
                    />
                  </FieldWrap>
                  <FieldWrap label="Имя *" error={touched.firstName ? errors.firstName : ""}>
                    <input
                      className={getFieldClass("firstName")}
                      value={form.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      onBlur={() => handleBlur("firstName")}
                      placeholder="Иван"
                    />
                  </FieldWrap>
                  <FieldWrap label="Отчество" error="">
                    <input
                      className={getFieldClass("middleName")}
                      value={form.middleName}
                      onChange={(e) => handleChange("middleName", e.target.value)}
                      placeholder="Иванович"
                    />
                  </FieldWrap>
                </div>

                <FieldWrap label="Дата рождения *" error={touched.birthDate ? errors.birthDate : ""}>
                  <input
                    type="date"
                    className={getFieldClass("birthDate")}
                    value={form.birthDate}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                    onBlur={() => handleBlur("birthDate")}
                  />
                </FieldWrap>
              </FormSection>

              <FormSection title="Документ, удостоверяющий личность">
                <div className="grid grid-cols-2 gap-4">
                  <FieldWrap label="Серия паспорта *" error={touched.passportSeries ? errors.passportSeries : ""}>
                    <input
                      className={getFieldClass("passportSeries")}
                      value={form.passportSeries}
                      onChange={(e) => handleChange("passportSeries", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      onBlur={() => handleBlur("passportSeries")}
                      placeholder="1234"
                      maxLength={4}
                    />
                  </FieldWrap>
                  <FieldWrap label="Номер паспорта *" error={touched.passportNumber ? errors.passportNumber : ""}>
                    <input
                      className={getFieldClass("passportNumber")}
                      value={form.passportNumber}
                      onChange={(e) => handleChange("passportNumber", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      onBlur={() => handleBlur("passportNumber")}
                      placeholder="567890"
                      maxLength={6}
                    />
                  </FieldWrap>
                </div>
              </FormSection>

              <FormSection title="Контактные данные">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrap label="Телефон *" error={touched.phone ? errors.phone : ""}>
                    <input
                      className={getFieldClass("phone")}
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      placeholder="+7 (900) 000-00-00"
                    />
                  </FieldWrap>
                  <FieldWrap label="Email" error={touched.email ? errors.email : ""}>
                    <input
                      type="email"
                      className={getFieldClass("email")}
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="example@mail.ru"
                    />
                  </FieldWrap>
                </div>
              </FormSection>

              <FormSection title="Транспортное средство (если применимо)">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrap label="Гос. номер ТС" error="">
                    <input
                      className={getFieldClass("vehiclePlate")}
                      value={form.vehiclePlate}
                      onChange={(e) => handleChange("vehiclePlate", e.target.value.toUpperCase())}
                      placeholder="А123ВС77"
                    />
                  </FieldWrap>
                  <FieldWrap label="VIN-код ТС" error="">
                    <input
                      className={getFieldClass("vehicleVin")}
                      value={form.vehicleVin}
                      onChange={(e) => handleChange("vehicleVin", e.target.value.toUpperCase())}
                      placeholder="WBAXXXXXXXX000000"
                      maxLength={17}
                    />
                  </FieldWrap>
                </div>
              </FormSection>

              <FormSection title="Заявление">
                <FieldWrap label="Тип заявления *" error={touched.applicationType ? errors.applicationType : ""}>
                  <select
                    className={getFieldClass("applicationType")}
                    value={form.applicationType}
                    onChange={(e) => handleChange("applicationType", e.target.value)}
                    onBlur={() => handleBlur("applicationType")}
                  >
                    <option value="">— Выберите тип —</option>
                    {APPLICATION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </FieldWrap>

                <FieldWrap label="Описание / пояснение" error="">
                  <textarea
                    className={`${getFieldClass("description")} resize-none`}
                    rows={4}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Опишите суть вашего обращения..."
                  />
                </FieldWrap>
              </FormSection>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Archive" size={14} />
                  <span>Данные будут упакованы в ZIP и направлены в ГАИ</span>
                </div>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors duration-150"
                >
                  <Icon name="Send" size={15} />
                  Подать заявление
                </button>
              </div>

              {Object.values(errors).some(Boolean) && Object.values(touched).some(Boolean) && (
                <div className="flex items-center gap-2 text-sm text-destructive animate-fade-in">
                  <Icon name="AlertCircle" size={15} />
                  Пожалуйста, исправьте ошибки в форме перед отправкой
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "status" && (
          <div className="animate-fade-in">
            <SectionTitle
              icon="Search"
              title="Проверка статуса заявки"
              subtitle="Введите номер заявки, который вы получили при подаче"
            />

            <div className="mt-8 max-w-lg">
              <FieldWrap label="Номер заявки" error="">
                <div className="flex gap-0">
                  <input
                    className="flex-1 px-3 py-2.5 text-sm border border-border bg-white outline-none font-mono focus:border-primary transition-colors"
                    value={statusQuery}
                    onChange={(e) => {
                      setStatusQuery(e.target.value);
                      setStatusResult(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleStatusCheck()}
                    placeholder="ГАИ-2024-001234"
                  />
                  <button
                    onClick={handleStatusCheck}
                    className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors border border-primary"
                  >
                    Проверить
                  </button>
                </div>
              </FieldWrap>

              {statusResult === "found" && statusData && (
                <div className="mt-6 animate-fade-in border border-border bg-white p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Номер заявки</p>
                      <p className="font-mono font-medium">{statusQuery.trim().toUpperCase()}</p>
                    </div>
                    <span className={`text-sm font-medium ${statusData.color}`}>
                      {statusData.status}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Последнее обновление</p>
                      <p>{statusData.date}</p>
                    </div>
                  </div>
                  <div className="bg-muted/40 p-3 text-sm text-muted-foreground">
                    {statusData.comment}
                  </div>
                </div>
              )}

              {statusResult === "not_found" && (
                <div className="mt-6 animate-fade-in flex items-center gap-3 p-4 border border-border bg-white text-sm text-muted-foreground">
                  <Icon name="Info" size={16} />
                  Заявка с таким номером не найдена. Проверьте правильность ввода.
                </div>
              )}

              <div className="mt-8 p-4 bg-white border border-border">
                <p className="text-xs font-medium mb-3 text-muted-foreground uppercase tracking-wider">
                  Демо-номера для проверки
                </p>
                <div className="space-y-1">
                  {Object.keys(MOCK_STATUSES).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setStatusQuery(key);
                        setStatusResult(null);
                      }}
                      className="block font-mono text-sm text-primary hover:underline underline-offset-2"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-5">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Электронный сервис подачи заявлений в ГАИ</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary flex items-center justify-center">
          <Icon name="Shield" size={16} className="text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">ГАИ</p>
          <p className="text-xs text-muted-foreground leading-tight">Электронные заявления</p>
        </div>
      </div>
    </header>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5 shrink-0">
        <Icon name={icon} size={17} className="text-primary" />
      </div>
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function FieldWrap({ label, error, children }: { label: string; error: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground/80">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <Icon name="AlertCircle" size={11} />
          {error}
        </p>
      )}
    </div>
  );
}