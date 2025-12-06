import {
  Users,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Bell,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

// Mock Data
const evolutionData = [
  { month: 'Jan', agendamentos: 120, presencas: 98, faltas: 22 },
  { month: 'Fev', agendamentos: 150, presencas: 130, faltas: 20 },
  { month: 'Mar', agendamentos: 180, presencas: 160, faltas: 20 },
  { month: 'Abr', agendamentos: 220, presencas: 180, faltas: 40 },
  { month: 'Mai', agendamentos: 250, presencas: 230, faltas: 20 },
  { month: 'Jun', agendamentos: 300, presencas: 280, faltas: 20 },
]

const rankingDemandData = [
  { name: 'Biossegurança', value: 450 },
  { name: 'Primeiros Socorros', value: 380 },
  { name: 'Coleta de Amostras', value: 320 },
  { name: 'Gestão Laboratorial', value: 210 },
  { name: 'Normas da ANVISA', value: 150 },
]

const activityFeed = [
  {
    id: 1,
    type: 'alert',
    text: 'Turma de Primeiros Socorros com baixa adesão',
    time: '2h atrás',
  },
  {
    id: 2,
    type: 'info',
    text: 'Novo profissional cadastrado: Maria Silva',
    time: '3h atrás',
  },
  {
    id: 3,
    type: 'success',
    text: 'Turma de Biossegurança lotada',
    time: '5h atrás',
  },
  {
    id: 4,
    type: 'info',
    text: 'Certificados da Turma #102 gerados',
    time: '1d atrás',
  },
]

const upcomingClasses = [
  { id: 1, name: 'Biossegurança Avançada', date: '15/10', status: 'Lotada' },
  { id: 2, name: 'Coleta Sanguínea', date: '16/10', status: 'Aberta' },
  { id: 3, name: 'Gestão de Resíduos', date: '18/10', status: 'Planejada' },
]

const chartConfig = {
  agendamentos: { label: 'Agendamentos', color: 'hsl(var(--primary))' },
  presencas: { label: 'Presenças', color: 'hsl(142, 76%, 36%)' }, // Greenish
  faltas: { label: 'Faltas', color: 'hsl(var(--destructive))' },
  demand: { label: 'Inscritos', color: 'hsl(var(--chart-2))' },
}

export default function Index() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Principal
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema e indicadores de performance.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-background p-1 rounded-lg border shadow-sm">
          <Select defaultValue="monthly">
            <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Último Mês</SelectItem>
              <SelectItem value="quarterly">Último Trimestre</SelectItem>
              <SelectItem value="yearly">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Agendamentos
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-xs text-muted-foreground mt-1">
              +20.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Presenças Confirmadas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,100</div>
            <p className="text-xs text-muted-foreground mt-1">
              88% Taxa de Presença
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faltas / No-Show
            </CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground mt-1">
              12% Taxa de Falta
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Origem WhatsApp
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-xs text-muted-foreground mt-1">
              dos agendamentos via Chatbot
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Evolução de Agendamentos</CardTitle>
            <CardDescription>
              Comparativo de Presenças vs Faltas nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart
                data={evolutionData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="fillAgendamentos"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-agendamentos)"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-agendamentos)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="agendamentos"
                  stroke="var(--color-agendamentos)"
                  fill="url(#fillAgendamentos)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="presencas"
                  stroke="var(--color-presencas)"
                  fill="none"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="faltas"
                  stroke="var(--color-faltas)"
                  fill="none"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sidebar Widgets */}
        <div className="col-span-3 space-y-4">
          {/* Upcoming Classes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Próximas Turmas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {cls.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cls.date}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-semibold',
                        cls.status === 'Lotada'
                          ? 'bg-red-100 text-red-700'
                          : cls.status === 'Aberta'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700',
                      )}
                    >
                      {cls.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-4 w-4" /> Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-0.5 h-2 w-2 rounded-full shrink-0',
                        activity.type === 'alert'
                          ? 'bg-destructive'
                          : activity.type === 'success'
                            ? 'bg-green-500'
                            : 'bg-primary',
                      )}
                    />
                    <div className="space-y-1">
                      <p className="text-sm leading-tight">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Treinamentos por Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart
                data={rankingDemandData}
                layout="vertical"
                margin={{ left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="var(--color-demand)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Índice de Cancelamentos Recentes</CardTitle>
            <CardDescription>
              Treinamentos com maior taxa de evasão esta semana
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Dados insuficientes para gerar o gráfico</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
