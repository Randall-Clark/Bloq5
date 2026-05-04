import ProLayout from "@/components/layout/pro-layout";
import { authClient } from "@/lib/auth-client";
import { useGetProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, Mail, Phone, Shield, Building2 } from "lucide-react";

const YELLOW = "#F5A623";
const DARK   = "#1A1A1A";

export default function ProProfilePage() {
  const { data: session }  = authClient.useSession();
  const { data: profile, isLoading } = useGetProfile();

  const user = session?.user;

  const roleLabel: Record<string, string> = {
    owner:   "Propriétaire",
    manager: "Gestionnaire",
    tenant:  "Locataire",
  };

  return (
    <ProLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold" style={{ color: DARK }}>Profil Pro</h1>
        <p className="text-gray-500 mt-1">Informations de votre compte propriétaire.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Identity card */}
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-bold" style={{ color: DARK }}>Identité</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {isLoading || !user ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : (
              <>
                {/* Avatar */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black"
                    style={{ background: YELLOW, color: DARK }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{user.name}</p>
                    <span
                      className="inline-block text-xs font-bold px-2 py-0.5 rounded mt-1"
                      style={{ background: "#FFF3CD", color: DARK }}
                    >
                      {roleLabel[profile?.role ?? "owner"] ?? "Propriétaire"}
                    </span>
                  </div>
                </div>

                <InfoRow icon={Mail} label="Adresse e-mail" value={user.email} />
                <InfoRow icon={Phone} label="Téléphone"      value={profile?.phone ?? "Non renseigné"} muted={!profile?.phone} />
                <InfoRow icon={Building2} label="Propriétés actives" value={String(profile?.totalProperties ?? 0)} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Pro status */}
        <Card className="rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-bold" style={{ color: DARK }}>Statut du compte Pro</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "#FFF8EE" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: YELLOW }}>
                <Shield className="h-4 w-4" style={{ color: DARK }} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Compte Pro actif</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Vous avez accès à toutes les fonctionnalités propriétaire de bloq5.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProLayout>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 ${muted ? "text-gray-400 italic" : "text-gray-900"}`}>{value}</p>
      </div>
    </div>
  );
}
