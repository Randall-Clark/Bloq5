import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Save, Check, AlertTriangle } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
async function adminFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

type Setting = { key: string; value: any; label: string; description: string; updated_at: string };

const COLOR_OPTIONS = ["#F5A623","#22c55e","#3b82f6","#ef4444","#a855f7","#1A1A1A"];

function useSettingsMap(settings: Setting[] | undefined) {
  const map: Record<string, any> = {};
  (settings ?? []).forEach(s => { map[s.key] = s.value; });
  return map;
}

export default function AdminSettingsPage() {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ["admin", "settings"],
    queryFn: () => adminFetch("/api/admin/settings"),
  });

  const settingsMap = useSettingsMap(settings);

  const [saved, setSaved] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (settings) {
      const init: Record<string, any> = {};
      settings.forEach(s => { init[s.key] = s.value; });
      setLocalValues(init);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      adminFetch(`/api/admin/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) }),
    onSuccess: (_, { key }) => {
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });

  function handleSave(key: string) {
    mutation.mutate({ key, value: localValues[key] });
  }

  function Field({ settingKey, type = "text" }: { settingKey: string; type?: string }) {
    const setting = settings?.find(s => s.key === settingKey);
    if (!setting) return null;
    const val = localValues[settingKey];

    return (
      <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{setting.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
          <div className="mt-2">
            {type === "boolean" ? (
              <button
                onClick={() => {
                  const newVal = !val;
                  setLocalValues(p => ({ ...p, [settingKey]: newVal }));
                  mutation.mutate({ key: settingKey, value: newVal });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${val ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${val ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            ) : type === "color" ? (
              <div className="flex items-center gap-2 mt-1">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={() => setLocalValues(p => ({ ...p, [settingKey]: color }))}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ background: color, borderColor: val === color ? "#1A1A1A" : "transparent" }}
                  />
                ))}
                <button
                  onClick={() => handleSave(settingKey)}
                  disabled={mutation.isPending}
                  className="ml-2 text-xs px-3 py-1.5 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {saved === settingKey ? <Check className="h-3 w-3" /> : "Sauver"}
                </button>
              </div>
            ) : type === "textarea" ? (
              <div className="flex gap-2 items-start">
                <textarea
                  rows={3}
                  value={val ?? ""}
                  onChange={e => setLocalValues(p => ({ ...p, [settingKey]: e.target.value }))}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-gray-400 resize-none"
                  placeholder="Texte…"
                />
                <button onClick={() => handleSave(settingKey)} disabled={mutation.isPending}
                  className="shrink-0 flex items-center gap-1 text-xs px-3 py-2 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50">
                  {saved === settingKey ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                  Sauver
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <input
                  type={type}
                  value={val ?? ""}
                  onChange={e => setLocalValues(p => ({ ...p, [settingKey]: e.target.value }))}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 h-9 bg-white focus:outline-none focus:border-gray-400"
                  placeholder={setting.label + "…"}
                />
                <button onClick={() => handleSave(settingKey)} disabled={mutation.isPending}
                  className="shrink-0 flex items-center gap-1 text-xs px-3 py-2 h-9 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50">
                  {saved === settingKey ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                  Sauver
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </AdminLayout>
    );
  }

  const maintenanceOn = localValues["maintenance_mode"] === true;

  return (
<>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <Settings className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Paramètres du site</h1>
          <p className="text-gray-500 text-sm">Configuration globale de la plateforme BLOQ5</p>
        </div>
      </div>

      {/* Maintenance alert */}
      {maintenanceOn && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-800 font-medium">Le mode maintenance est actuellement <strong>activé</strong>. Le site affiche un message de maintenance aux visiteurs.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Maintenance & Bannière */}
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-gray-900">Maintenance & Bannière</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <Field settingKey="maintenance_mode"     type="boolean" />
            <Field settingKey="announcement_visible" type="boolean" />
            <Field settingKey="announcement_text"    type="textarea" />
            <Field settingKey="announcement_color"   type="color" />
          </CardContent>
        </Card>

        {/* Contenu */}
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-gray-900">Contenu page d'accueil</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <Field settingKey="hero_title"    type="text" />
            <Field settingKey="hero_subtitle" type="textarea" />
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-gray-900">Coordonnées support</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <Field settingKey="support_email" type="email" />
            <Field settingKey="support_phone" type="tel" />
          </CardContent>
        </Card>

      </div>
</>
  );
}
