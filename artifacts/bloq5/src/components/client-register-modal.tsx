import { useState } from "react";
import { X, UserPlus, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { authClient } from "@/lib/auth-client";

const YELLOW = "#F5A623";

const inputClass =
  "w-full border border-[#E0E0E0] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F5A623] transition-colors bg-white";
const labelClass =
  "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide";

export function ClientRegisterModal({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setError("");
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { firstName, lastName, email, phone, password, confirm } = form;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError("");
    setLoading(true);

    const result = await authClient.signUp.email({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (result.error) {
      const msg = result.error.message ?? "";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exist")) {
        setError("Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.");
      } else {
        setError(msg || "Une erreur est survenue. Réessayez.");
      }
      return;
    }

    if (phone.trim()) {
      try {
        await fetch("/api/profile", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phone.trim() }),
        });
      } catch {
      }
    }

    setStep("success");
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden bg-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="p-8">
          {step === "form" && (
            <>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: YELLOW + "22" }}
              >
                <UserPlus className="w-6 h-6" style={{ color: YELLOW }} />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#1A1A1A" }}>
                Créer votre compte client
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Accédez à la vue locataire pour rechercher des biens, poser des candidatures et suivre vos demandes.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Prénom *</label>
                    <input
                      className={inputClass}
                      placeholder="Jean"
                      value={form.firstName}
                      onChange={set("firstName")}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nom *</label>
                    <input
                      className={inputClass}
                      placeholder="Tremblay"
                      value={form.lastName}
                      onChange={set("lastName")}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Adresse e-mail *</label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="jean@exemple.ca"
                    value={form.email}
                    onChange={set("email")}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Téléphone <span className="normal-case font-normal">(optionnel)</span>
                  </label>
                  <div className="flex items-center border border-[#E0E0E0] rounded-xl overflow-hidden focus-within:border-[#F5A623] bg-white">
                    <span className="px-4 py-3.5 text-sm text-gray-600 border-r border-[#E0E0E0] bg-gray-50 flex-shrink-0 font-medium">
                      🇨🇦 +1
                    </span>
                    <input
                      className="flex-1 px-3 py-3.5 text-sm focus:outline-none"
                      placeholder="514 000 0000"
                      value={form.phone}
                      onChange={set("phone")}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      className={inputClass + " pr-12"}
                      placeholder="Minimum 8 caractères"
                      value={form.password}
                      onChange={set("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirmer le mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className={inputClass + " pr-12"}
                      placeholder="Répétez votre mot de passe"
                      value={form.confirm}
                      onChange={set("confirm")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 mt-1"
                  style={{ background: YELLOW, color: "#1A1A1A" }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Création du compte…" : "Créer mon compte client →"}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-400">
                Déjà un compte client ?{" "}
                <a
                  href="/sign-in"
                  className="font-semibold underline"
                  style={{ color: YELLOW }}
                >
                  Se connecter
                </a>
              </p>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "#E8F5E9" }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: "#2E7D32" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>
                Compte créé avec succès !
              </h2>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Votre compte client est prêt. Vous pouvez maintenant rechercher des biens et déposer vos candidatures.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate("/profile");
                }}
                className="mx-auto flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90"
                style={{ background: YELLOW, color: "#1A1A1A" }}
              >
                Accéder à mon espace client →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
