import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileBarChart, Users, XCircle, MessageSquare } from 'lucide-react'

export default function Reports() {
  const reports = [
    {
      title: 'Participação por Unidade',
      desc: 'Análise detalhada de presença agrupada por unidade de saúde.',
      icon: Users,
    },
    {
      title: 'Agendamentos via WhatsApp',
      desc: 'Relatório de conversão e presença para agendamentos via chatbot.',
      icon: MessageSquare,
    },
    {
      title: 'Faltosos por Treinamento',
      desc: 'Lista de profissionais que faltaram, agrupados por treinamento.',
      icon: XCircle,
    },
    {
      title: 'Relatório Geral de Atividades',
      desc: 'Visão consolidada de todas as operações no período.',
      icon: FileBarChart,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Relatórios e Analytics
        </h1>
        <p className="text-muted-foreground">
          Gere relatórios detalhados para tomada de decisão.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, i) => (
          <Card
            key={i}
            className="hover:shadow-lg transition-all cursor-pointer group"
          >
            <CardHeader>
              <report.icon className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription>{report.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
