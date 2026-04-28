import ProLayout from "@/components/layout/pro-layout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Eye, MessageSquare, TrendingUp, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ProDashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStats();

  const mockTrendData = [
    { name: 'Lun', views: 400, requests: 24 },
    { name: 'Mar', views: 300, requests: 13 },
    { name: 'Mer', views: 550, requests: 38 },
    { name: 'Jeu', views: 450, requests: 29 },
    { name: 'Ven', views: 600, requests: 48 },
    { name: 'Sam', views: 700, requests: 38 },
    { name: 'Dim', views: 850, requests: 43 },
  ];

  const mockStatusData = [
    { name: 'En attente', value: stats?.activeRequests || 0 },
    { name: 'Approuvées', value: stats?.approvedRequests || 0 },
    { name: 'Refusées', value: (stats?.totalRequests || 0) - (stats?.activeRequests || 0) - (stats?.approvedRequests || 0) },
  ];

  const kpis = [
    { title: "Propriétés totales", value: stats?.totalProperties || 0, icon: Building2, color: "text-[#1a237e]" },
    { title: "Vues totales", value: stats?.totalViews || 0, icon: Eye, color: "text-blue-500" },
    { title: "Demandes actives", value: stats?.activeRequests || 0, icon: MessageSquare, color: "text-[#f57c00]" },
    { title: "Revenu estimé", value: `${stats?.estimatedRevenue || 0}€`, icon: TrendingUp, color: "text-green-500" },
    { title: "Taux d'occupation", value: `${stats?.occupancyRate || 0}%`, icon: CheckCircle, color: "text-purple-500" },
  ];

  return (
    <ProLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a237e] dark:text-white">Dashboard</h1>
        <p className="text-gray-500">Aperçu des performances de votre portefeuille.</p>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {kpis.map((kpi, i) => (
              <Card key={i} className="rounded-none border-gray-200 dark:border-gray-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gray-50 dark:bg-gray-900 rounded-sm ${kpi.color}`}>
                      <kpi.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{kpi.title}</h3>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{kpi.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-none border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#1a237e] dark:text-white">Trafic et demandes (7 derniers jours)</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: 0, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 600 }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="views" name="Vues" stroke="#1a237e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="requests" name="Demandes" stroke="#f57c00" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-none border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#1a237e] dark:text-white">Répartition des demandes</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStatusData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ borderRadius: 0, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 600, color: '#f57c00' }}
                    />
                    <Bar dataKey="value" name="Nombre" fill="#f57c00" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </ProLayout>
  );
}