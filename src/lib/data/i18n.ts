export type Locale = "en" | "es";

export const LOCALES: Array<{ id: Locale; label: string; native: string }> = [
  { id: "en", label: "English", native: "English" },
  { id: "es", label: "Spanish", native: "Español" },
];

const KEY = "acmd:locale:v1";

export function readLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "es" || stored === "en") return stored;
    // First-run: detect from browser
    const nav = navigator.language?.toLowerCase() ?? "en";
    if (nav.startsWith("es")) return "es";
  } catch {}
  return "en";
}

export function writeLocale(l: Locale): void {
  try {
    localStorage.setItem(KEY, l);
  } catch {}
}

type Dict = Record<string, string>;
type Dicts = Record<Locale, Dict>;

/**
 * Light-touch dictionary — UI chrome strings + crisis short labels +
 * follow-up page chrome. Clinical assessment language stays in English;
 * the bilingual workflow is: rep uses the English instrument, optionally
 * generates a Spanish-language caller-facing handoff page.
 *
 * Add keys as needed. Missing key falls back to English then key itself.
 */
const DICTS: Dicts = {
  en: {
    // Nav
    "nav.cockpit": "Cockpit",
    "nav.preadmit": "Pre-Admit",
    "nav.payors": "Payor Engine",
    "nav.analytics": "Analytics",
    "nav.settings": "Settings",
    // Buttons
    "btn.launch_cockpit": "Launch cockpit",
    "btn.watch_demo": "Watch a live call",
    "btn.sign_in": "Sign in",
    "btn.start_call": "Start call",
    "btn.pause": "Pause",
    "btn.resume": "Resume",
    "btn.reset": "Reset",
    "btn.send": "Send",
    "btn.copy_summary": "Copy summary",
    "btn.print": "Print",
    "btn.email": "Email",
    "btn.close": "Close",
    "btn.next": "Next",
    "btn.back": "Back",
    // Follow-up page
    "fu.next_step_for": "Next step · for",
    "fu.you": "you",
    "fu.headline_1": "We've got you.",
    "fu.headline_2": "Here's what's next.",
    "fu.intro":
      "This page was made for you after our call. Save it, screenshot it, share it with whoever's helping you through this — partner, parent, friend, sponsor. None of your private health details are on this page on purpose.",
    "fu.appointment": "Your appointment",
    "fu.date": "Date",
    "fu.time": "Time",
    "fu.where": "Where",
    "fu.tbd": "TBD",
    "fu.confirm_by_phone": "We'll confirm by phone",
    "fu.contact": "Your point of contact",
    "fu.admissions_team": "Your admissions team",
    "fu.contact_blurb":
      "Call or text any time. If they're not available, leave a message — they will get back to you the same day.",
    "fu.what_to_bring": "What to bring",
    "fu.item_id": "Photo ID (driver's license or state ID)",
    "fu.item_insurance":
      "Insurance card (front and back — phone photo is fine)",
    "fu.item_meds":
      "Current medications — bottles in original packaging if possible, or a written list with name + dose + frequency",
    "fu.item_bag":
      "A small bag: clothes for 7 days, toiletries (sealed), comfortable shoes",
    "fu.item_charger": "Phone charger",
    "fu.item_contacts":
      "Names + phone numbers of people you want us to be able to talk to (parent, partner, sponsor)",
    "fu.dont_bring":
      "Don't bring: outside food, alcohol, non-prescribed substances, weapons. We'll secure valuables on arrival.",
    "fu.note": "A note for you",
    "fu.crisis_heading": "If things get hard before then",
    "fu.crisis_988":
      "988 — Suicide & Crisis Lifeline. Call or text. 24/7. Free.",
    "fu.crisis_text":
      "Text HOME to 741741 — Crisis Text Line. Useful when voice is hard.",
    "fu.crisis_911":
      "911 — only if you or someone else is in immediate physical danger.",
    "fu.crisis_blurb":
      "You don't have to white-knuckle it alone between now and your appointment. Use these. We'd rather get a call from a hotline than not see you on intake day.",
    "fu.close":
      "You did the hardest thing already — you called. The rest is logistics. We're here.",
    "fu.footer": "Powered by Northbound Treatment Network · Admissions Command",
  },
  es: {
    "nav.cockpit": "Cabina",
    "nav.preadmit": "Pre-Ingreso",
    "nav.payors": "Pagadores",
    "nav.analytics": "Analítica",
    "nav.settings": "Ajustes",
    "btn.launch_cockpit": "Abrir cabina",
    "btn.watch_demo": "Ver una llamada",
    "btn.sign_in": "Iniciar sesión",
    "btn.start_call": "Iniciar llamada",
    "btn.pause": "Pausar",
    "btn.resume": "Reanudar",
    "btn.reset": "Reiniciar",
    "btn.send": "Enviar",
    "btn.copy_summary": "Copiar resumen",
    "btn.print": "Imprimir",
    "btn.email": "Correo",
    "btn.close": "Cerrar",
    "btn.next": "Siguiente",
    "btn.back": "Atrás",
    "fu.next_step_for": "Próximo paso · para",
    "fu.you": "ti",
    "fu.headline_1": "Te tenemos.",
    "fu.headline_2": "Esto es lo que sigue.",
    "fu.intro":
      "Esta página fue hecha para ti después de nuestra llamada. Guárdala, hazle captura, compártela con quien te esté apoyando — pareja, padre/madre, amigo, padrino. Ninguno de tus detalles médicos privados aparece aquí, a propósito.",
    "fu.appointment": "Tu cita",
    "fu.date": "Fecha",
    "fu.time": "Hora",
    "fu.where": "Dónde",
    "fu.tbd": "Por confirmar",
    "fu.confirm_by_phone": "Confirmaremos por teléfono",
    "fu.contact": "Tu contacto",
    "fu.admissions_team": "Tu equipo de admisiones",
    "fu.contact_blurb":
      "Llama o envía mensaje a cualquier hora. Si no están disponibles, deja un mensaje — te devolverán la llamada el mismo día.",
    "fu.what_to_bring": "Qué traer",
    "fu.item_id":
      "Identificación con foto (licencia de conducir o ID estatal)",
    "fu.item_insurance":
      "Tarjeta del seguro (frente y reverso — una foto del celular sirve)",
    "fu.item_meds":
      "Medicamentos actuales — frascos originales si es posible, o una lista escrita con nombre + dosis + frecuencia",
    "fu.item_bag":
      "Una maleta pequeña: ropa para 7 días, artículos de aseo (sellados), zapatos cómodos",
    "fu.item_charger": "Cargador del teléfono",
    "fu.item_contacts":
      "Nombres + teléfonos de las personas con quienes quieres que podamos hablar (padre, madre, pareja, padrino)",
    "fu.dont_bring":
      "No traer: comida de afuera, alcohol, sustancias no recetadas, armas. Aseguraremos tus pertenencias al llegar.",
    "fu.note": "Una nota para ti",
    "fu.crisis_heading": "Si las cosas se ponen difíciles antes",
    "fu.crisis_988":
      "988 — Línea de Crisis y Suicidio. Llama o envía mensaje. 24/7. Gratis.",
    "fu.crisis_text":
      "Envía HOME al 741741 — Línea de Texto de Crisis. Útil cuando hablar es difícil.",
    "fu.crisis_911":
      "911 — solo si tú u otra persona está en peligro físico inmediato.",
    "fu.crisis_blurb":
      "No tienes que aguantarte solo entre ahora y tu cita. Usa estas líneas. Preferimos una llamada a una línea de ayuda antes que no verte el día de tu ingreso.",
    "fu.close":
      "Ya hiciste lo más difícil — llamaste. El resto es logística. Aquí estamos.",
    "fu.footer":
      "Impulsado por Northbound Treatment Network · Admissions Command",
  },
};

export function t(key: string, locale: Locale = "en"): string {
  return DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
}

/** Factory for use inside components — bind a locale once, call t(key) freely */
export function createT(locale: Locale): (key: string) => string {
  return (key: string) => t(key, locale);
}
