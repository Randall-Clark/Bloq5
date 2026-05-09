import { useState } from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Mail, Phone, MapPin, Clock, Send, Check } from "lucide-react";

const YELLOW = "#F5A623";

const OFFICES = [
  {
    country: "Canada",
    city: "Montréal, QC",
    flag: "🇨🇦",
    phone: "(581) 668-8274",
    hours: "Lun–Ven, 9h–18h (ET)",
  },
  {
    country: "France",
    city: "Paris",
    flag: "🇫🇷",
    phone: "+33 6 87 32 18 97",
    hours: "Lun–Ven, 9h–18h (CET)",
  },
];

const SUBJECTS = [
  "Question générale",
  "Support technique",
  "Problème avec une annonce",
  "Partenariat",
  "Presse",
  "Autre",
];

export default function ContactPage() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="py-16 px-6 text-center" style={{ background: "#F8F8F8" }}>
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ background: "#FFF8EE", color: YELLOW }}>
            Contact
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: "#1A1A1A" }}>
            Une question ? Écrivez-nous
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Notre équipe est disponible du lundi au vendredi pour vous accompagner dans votre projet immobilier.
          </p>
        </div>
      </section>

      {/* Offices */}
      <section className="py-10 px-6 border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFICES.map((office) => (
            <div key={office.country} className="rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-5 items-start">
              <div className="text-3xl">{office.flag}</div>
              <div>
                <p className="font-bold text-sm mb-0.5" style={{ color: "#1A1A1A" }}>{office.country}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <MapPin className="w-3.5 h-3.5" style={{ color: YELLOW }} />
                  {office.city}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Phone className="w-3.5 h-3.5" style={{ color: YELLOW }} />
                  <a href={`tel:${office.phone}`} className="hover:underline">{office.phone}</a>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" style={{ color: YELLOW }} />
                  {office.hours}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto mt-4">
          <div className="rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF8EE" }}>
              <Mail className="w-4 h-4" style={{ color: YELLOW }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">E-mail</p>
              <a href="mailto:support@bloq5.com" className="text-sm font-semibold hover:underline" style={{ color: "#1A1A1A" }}>support@bloq5.com</a>
              <p className="text-xs text-gray-400">Réponse sous 24h ouvrées</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">

          {/* Info side */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl p-6 text-white" style={{ background: "#1A1A1A" }}>
              <h3 className="font-bold text-sm mb-2">Vous êtes propriétaire ?</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Déposez vos annonces, gérez vos locataires et suivez vos paiements depuis votre espace Pro.
              </p>
              <a href="/sign-up" className="inline-block px-4 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-85"
                style={{ background: YELLOW, color: "#1A1A1A" }}>
                Créer un espace Pro
              </a>
            </div>
            <div className="rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-sm mb-2" style={{ color: "#1A1A1A" }}>Partenariat</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Vous souhaitez collaborer avec BLOQ5 ? Nous sommes ouverts à toute proposition de partenariat stratégique.
              </p>
              <a href="mailto:support@bloq5.com?subject=Partenariat" className="text-xs font-semibold" style={{ color: YELLOW }}>
                Nous écrire →
              </a>
            </div>
          </div>

          {/* Form side */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#F0FDF4" }}>
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "#1A1A1A" }}>Message envoyé !</h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
                  </p>
                  <button onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}
                    className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
                    Envoyer un nouveau message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1A1A1A" }}>Nom complet *</label>
                      <input
                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl h-11 px-4 text-sm outline-none focus:border-yellow-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1A1A1A" }}>Adresse e-mail *</label>
                      <input
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@exemple.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl h-11 px-4 text-sm outline-none focus:border-yellow-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1A1A1A" }}>Sujet *</label>
                    <select
                      required value={subject} onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl h-11 px-4 text-sm outline-none focus:border-yellow-400 transition-colors"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1A1A1A" }}>Message *</label>
                    <textarea
                      required value={message} onChange={(e) => setMessage(e.target.value)}
                      placeholder="Décrivez votre demande en détail…"
                      rows={5}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-colors resize-none"
                    />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-85 disabled:opacity-60"
                    style={{ background: YELLOW, color: "#1A1A1A" }}>
                    <Send className="w-4 h-4" />
                    {loading ? "Envoi en cours…" : "Envoyer le message"}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    En soumettant ce formulaire, vous acceptez notre{" "}
                    <a href="#" className="underline hover:text-gray-600">politique de confidentialité</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
