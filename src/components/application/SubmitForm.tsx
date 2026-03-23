import React from "react";
import Icon from "@/components/ui/icon";
import { FormData, FormErrors, APPLICATION_TYPES } from "./types";

interface SubmitFormProps {
  form: FormData;
  errors: FormErrors;
  touched: Record<string, boolean>;
  submitted: boolean;
  submittedNumber: string;
  onReset: () => void;
  onChange: (field: keyof FormData, value: string) => void;
  onBlur: (field: keyof FormData) => void;
  onSubmit: () => void;
  getFieldClass: (field: string) => string;
}

export default function SubmitForm({
  form,
  errors,
  touched,
  submitted,
  submittedNumber,
  onReset,
  onChange,
  onBlur,
  onSubmit,
  getFieldClass,
}: SubmitFormProps) {
  if (submitted) {
    return (
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
            onClick={onReset}
            className="text-sm text-primary underline underline-offset-4"
          >
            Подать ещё одно заявление
          </button>
        </div>
      </main>
    );
  }

  return (
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
                onChange={(e) => onChange("lastName", e.target.value)}
                onBlur={() => onBlur("lastName")}
                placeholder="Иванов"
              />
            </FieldWrap>
            <FieldWrap label="Имя *" error={touched.firstName ? errors.firstName : ""}>
              <input
                className={getFieldClass("firstName")}
                value={form.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                onBlur={() => onBlur("firstName")}
                placeholder="Иван"
              />
            </FieldWrap>
            <FieldWrap label="Отчество" error="">
              <input
                className={getFieldClass("middleName")}
                value={form.middleName}
                onChange={(e) => onChange("middleName", e.target.value)}
                placeholder="Иванович"
              />
            </FieldWrap>
          </div>

          <FieldWrap label="Дата рождения *" error={touched.birthDate ? errors.birthDate : ""}>
            <input
              type="date"
              className={getFieldClass("birthDate")}
              value={form.birthDate}
              onChange={(e) => onChange("birthDate", e.target.value)}
              onBlur={() => onBlur("birthDate")}
            />
          </FieldWrap>
        </FormSection>

        <FormSection title="Документ, удостоверяющий личность">
          <div className="grid grid-cols-2 gap-4">
            <FieldWrap label="Серия паспорта *" error={touched.passportSeries ? errors.passportSeries : ""}>
              <input
                className={getFieldClass("passportSeries")}
                value={form.passportSeries}
                onChange={(e) => onChange("passportSeries", e.target.value.replace(/\D/g, "").slice(0, 4))}
                onBlur={() => onBlur("passportSeries")}
                placeholder="1234"
                maxLength={4}
              />
            </FieldWrap>
            <FieldWrap label="Номер паспорта *" error={touched.passportNumber ? errors.passportNumber : ""}>
              <input
                className={getFieldClass("passportNumber")}
                value={form.passportNumber}
                onChange={(e) => onChange("passportNumber", e.target.value.replace(/\D/g, "").slice(0, 6))}
                onBlur={() => onBlur("passportNumber")}
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
                onChange={(e) => onChange("phone", e.target.value)}
                onBlur={() => onBlur("phone")}
                placeholder="+7 (900) 000-00-00"
              />
            </FieldWrap>
            <FieldWrap label="Email" error={touched.email ? errors.email : ""}>
              <input
                type="email"
                className={getFieldClass("email")}
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                onBlur={() => onBlur("email")}
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
                onChange={(e) => onChange("vehiclePlate", e.target.value.toUpperCase())}
                placeholder="А123ВС77"
              />
            </FieldWrap>
            <FieldWrap label="VIN-код ТС" error="">
              <input
                className={getFieldClass("vehicleVin")}
                value={form.vehicleVin}
                onChange={(e) => onChange("vehicleVin", e.target.value.toUpperCase())}
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
              onChange={(e) => onChange("applicationType", e.target.value)}
              onBlur={() => onBlur("applicationType")}
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
              onChange={(e) => onChange("description", e.target.value)}
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
            onClick={onSubmit}
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
