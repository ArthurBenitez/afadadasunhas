import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar as CalendarIcon, Check, Clock, CreditCard, Sparkles, Wallet } from "lucide-react";
import { DatePickerInput } from "@mantine/dates";
import { TextInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { services, availableSlots, brl, PREPAY_DISCOUNT, type Service } from "@/lib/booking/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agendamentos")({
  head: () => ({
    meta: [
      { title: "Agendamentos — Afada das Unhas" },
      { name: "description", content: "Escolha seus serviços, data e horário e finalize seu agendamento em poucos cliques." },
      { property: "og:title", content: "Agendamentos — Afada das Unhas" },
      { property: "og:url", content: "/agendamentos" },
    ],
    links: [{ rel: "canonical", href: "/agendamentos" }],
  }),
  component: AgendamentosPage,
});

type PaymentChoice = "now" | "later" | null;

function AgendamentosPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentChoice>(null);
  const [done, setDone] = useState<null | { id: string }>(null);

  const chosenServices = useMemo<Service[]>(
    () => services.filter((s) => selected[s.id]),
    [selected],
  );
  const subtotal = chosenServices.reduce((acc, s) => acc + s.price, 0);
  const totalDuration = chosenServices.reduce((acc, s) => acc + s.durationMin, 0);
  const discount = payment === "now" ? subtotal * PREPAY_DISCOUNT : 0;
  const total = subtotal - discount;

  const canNext1 = chosenServices.length > 0;
  const canNext2 = !!date && !!time;
  const canNext3 = name.trim().length >= 2 && phone.trim().length >= 8;

  const submit = () => {
    if (!payment) return;
    const id = "AF-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setDone({ id });
    notifications.show({
      title: "Agendamento confirmado",
      message: `Código ${id} enviado por mensagem.`,
      color: "marsala",
    });
  };

  if (done) {
    return (
      <Confirmation
        id={done.id}
        services={chosenServices}
        date={date!}
        time={time!}
        name={name}
        total={total}
        payment={payment!}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-14">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Agendamento</p>
        <h1 className="mt-1 font-display text-4xl text-foreground md:text-5xl">Reserve seu horário</h1>
        <p className="mt-2 text-muted-foreground">Sem cadastro. Em menos de 1 minuto.</p>
      </header>

      <Stepper step={step} />

      <div className="mt-6 rounded-3xl border border-border/70 bg-card p-5 shadow-soft md:p-7">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="font-display text-2xl text-foreground">Escolha os serviços</h2>
              <p className="text-sm text-muted-foreground">Toque para adicionar quantos quiser.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {services.map((s) => {
                  const active = !!selected[s.id];
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSelected((p) => ({ ...p, [s.id]: !p[s.id] }))}
                      className={cn(
                        "group relative rounded-2xl border bg-card p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary/5 shadow-soft"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{s.name}</h3>
                        <span className={cn(
                          "grid h-6 w-6 place-items-center rounded-full border transition-colors",
                          active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-transparent",
                        )}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{s.durationMin}min</span>
                        <span className="font-semibold text-primary">{brl(s.price)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="font-display text-2xl text-foreground">Data e horário</h2>
              <p className="text-sm text-muted-foreground">Selecione o melhor momento para você.</p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <CalendarIcon className="mr-1 inline h-3.5 w-3.5" /> Data
                  </label>
                  <DatePickerInput
                    placeholder="Escolha uma data"
                    value={date}
                    onChange={(v) => setDate(v)}
                    minDate={new Date()}
                    maxDate={dayjs().add(60, "day").toDate()}
                    size="md"
                    radius="md"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Clock className="mr-1 inline h-3.5 w-3.5" /> Horário
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={cn(
                          "h-11 rounded-lg border text-sm font-medium transition-all",
                          time === slot
                            ? "border-primary bg-primary text-primary-foreground shadow-soft"
                            : "border-border bg-card text-foreground hover:border-primary/50",
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="font-display text-2xl text-foreground">Seus dados</h2>
              <p className="text-sm text-muted-foreground">Usaremos para confirmar seu agendamento.</p>
              <div className="mt-5 space-y-4">
                <TextInput label="Nome completo" placeholder="Como podemos te chamar?" value={name} onChange={(e) => setName(e.currentTarget.value)} size="md" radius="md" required />
                <TextInput label="WhatsApp" placeholder="(11) 90000-0000" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} size="md" radius="md" required />
                <Textarea label="Observações" placeholder="Algo que precisamos saber? (opcional)" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} size="md" radius="md" minRows={3} />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="font-display text-2xl text-foreground">Pagamento</h2>
              <p className="text-sm text-muted-foreground">Escolha como prefere pagar.</p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <PaymentOption
                  active={payment === "now"}
                  onSelect={() => setPayment("now")}
                  icon={<CreditCard className="h-5 w-5" />}
                  title="Pagar agora"
                  highlight={`-10% • ${brl(subtotal * PREPAY_DISCOUNT)}`}
                  description="Cartão ou Pix. Confirmação automática."
                />
                <PaymentOption
                  active={payment === "later"}
                  onSelect={() => setPayment("later")}
                  icon={<Wallet className="h-5 w-5" />}
                  title="Pagar depois"
                  description="No estúdio, no dia do atendimento."
                />
              </div>

              <Summary
                services={chosenServices}
                date={date}
                time={time}
                subtotal={subtotal}
                discount={discount}
                total={total}
                duration={totalDuration}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            {chosenServices.length > 0 && step < 4 && (
              <p className="text-muted-foreground">
                <span className="text-foreground font-semibold">{chosenServices.length}</span> serviço(s) • <span className="font-semibold text-primary">{brl(subtotal)}</span>
                {totalDuration > 0 && <> • {totalDuration}min</>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="h-12 rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground hover:bg-accent">
                Voltar
              </button>
            )}
            {step < 4 && (
              <button
                onClick={() => setStep((s) => (s + 1) as 2 | 3 | 4)}
                disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2) || (step === 3 && !canNext3)}
                className="h-12 flex-1 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50 sm:flex-none"
              >
                Continuar
              </button>
            )}
            {step === 4 && (
              <button onClick={submit} disabled={!payment} className="h-12 flex-1 rounded-xl bg-gradient-luxe px-6 text-sm font-semibold text-primary-foreground shadow-luxury disabled:opacity-50 sm:flex-none">
                Confirmar agendamento • {brl(total)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Serviços", "Data", "Dados", "Pagamento"];
  return (
    <ol className="mt-6 flex items-center gap-2">
      {labels.map((l, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={l} className="flex flex-1 items-center gap-2">
            <span className={cn(
              "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-colors",
              done ? "bg-[var(--olive)] text-[var(--olive-foreground)]" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}>{done ? <Check className="h-3.5 w-3.5" /> : n}</span>
            <span className={cn("hidden text-xs sm:inline", active ? "font-semibold text-foreground" : "text-muted-foreground")}>{l}</span>
            {i < labels.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function PaymentOption({ active, onSelect, icon, title, description, highlight }: { active: boolean; onSelect: () => void; icon: React.ReactNode; title: string; description: string; highlight?: string; }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative rounded-2xl border p-5 text-left transition-all",
        active ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-card hover:border-primary/40",
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("grid h-10 w-10 place-items-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
          {icon}
        </span>
        {highlight && <span className="rounded-full bg-[var(--olive)]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--olive)]">{highlight}</span>}
      </div>
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </button>
  );
}

function Summary({ services, date, time, subtotal, discount, total, duration }: { services: Service[]; date: string | null; time: string | null; subtotal: number; discount: number; total: number; duration: number; }) {
  return (
    <div className="mt-6 rounded-2xl bg-[var(--sand)] p-4 text-sm">
      <p className="font-semibold text-foreground">Resumo</p>
      <ul className="mt-2 space-y-1 text-muted-foreground">
        {services.map((s) => (
          <li key={s.id} className="flex justify-between"><span>{s.name}</span><span className="text-foreground">{brl(s.price)}</span></li>
        ))}
      </ul>
      <div className="mt-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        {date && time && <p>{dayjs(date).format("DD/MM/YYYY")} às {time} • {duration} minutos</p>}
      </div>
      <div className="mt-3 space-y-1">
        <p className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{brl(subtotal)}</span></p>
        {discount > 0 && <p className="flex justify-between text-[var(--olive)]"><span>Desconto (10%)</span><span>−{brl(discount)}</span></p>}
        <p className="flex justify-between text-lg font-display"><span className="text-foreground">Total</span><span className="text-primary">{brl(total)}</span></p>
      </div>
    </div>
  );
}

function Confirmation({ id, services, date, time, name, total, payment }: { id: string; services: Service[]; date: string; time: string; name: string; total: number; payment: "now" | "later" }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-luxe text-primary-foreground shadow-luxury">
        <Sparkles className="h-9 w-9" />
      </motion.div>
      <h1 className="mt-6 font-display text-4xl text-foreground">Tudo certo, {name.split(" ")[0]}!</h1>
      <p className="mt-2 text-muted-foreground">Seu agendamento foi confirmado.</p>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-left shadow-soft">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Código</p>
        <p className="font-display text-2xl text-primary">{id}</p>
        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
          <p>{dayjs(date).format("dddd, DD [de] MMMM")} às {time}</p>
          <p>{services.map((s) => s.name).join(" • ")}</p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-sm">
          <span className="text-muted-foreground">{payment === "now" ? "Pago agora" : "Pagar no local"}</span>
          <span className="font-display text-xl text-primary">{brl(total)}</span>
        </div>
      </div>
      <Link to="/" className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft">
        Voltar para a home
      </Link>
    </div>
  );
}
