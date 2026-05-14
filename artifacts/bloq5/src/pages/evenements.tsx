import { useState } from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { CalendarX, Bell, ArrowRight } from "lucide-react";

const YELLOW = "#F5A623";

export default function EvenementsPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setSent(true);
  }

  return (
    <div className="min-h-screen bg-white font-sans" style={{ color: "#1A1A1A" }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="py-16 px-6 text-center" style={{ background: "#F8F8F8" }}>
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ background: "#FFF8EE", color: YELLOW }}>
            Événements
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-4" style={{ color: "#1A1A1A" }}>
            Les événements <span style={{ color: YELLOW }}>BLOQ5</span>
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Conférences, webinaires, ateliers et rencontres — restez informé de toutes nos prochaines initiatives autour de l'immobilier locatif au Canada et en France.
          </p>
        </div>
      </section>

      {/* Empty state */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "#FFF8EE" }}>
            <CalendarX className="w-10 h-10" style={{ color: YELLOW }} />
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
            Aucun événement programmé pour le moment
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Notre équipe prépare de nouveaux événements — webinaires, rencontres professionnelles et ateliers pratiques autour de la gestion immobilière. Laissez-nous votre adresse e-mail pour être parmi les premiers informés.
          </p>

          {/* Notification signup */}
          {sent ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold" style={{ background: "#F0FDF4", color: "#15803D" }}>
              <Bell className="w-4 h-4" />
              Merci ! Vous serez notifié en avant-première.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#F5A623] transition-colors"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-85 whitespace-nowrap"
                style={{ background: YELLOW, color: "#1A1A1A" }}
              >
                Me notifier <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* What to expect */}
      <section className="py-16 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-10" style={{ color: "#1A1A1A" }}>
            Le type d'événements que nous organisons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                emoji: "🎙️",
                title: "Webinaires",
                desc: "Décryptages du marché immobilier, nouveautés réglementaires, tendances locatives — en direct et en replay.",
              },
              {
                emoji: "🤝",
                title: "Rencontres Pro",
                desc: "Événements de networking pour propriétaires et gestionnaires immobiliers à Montréal, Toronto et Paris.",
              },
              {
                emoji: "📚",
                title: "Ateliers pratiques",
                desc: "Sessions interactives sur la gestion locative, la fiscalité immobilière ou la rédaction de baux commerciaux.",
              },
            ].map(item => (
              <div key={item.title} className="text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="font-bold text-sm mb-2" style={{ color: "#1A1A1A" }}>{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
