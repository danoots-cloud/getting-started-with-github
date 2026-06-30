import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface TemperatureChartProps {
  temperatures: { month: string; high: number; low: number }[]
  accentColor: string
  secondaryColor: string
}

export function TemperatureChart({
  temperatures,
  accentColor,
  secondaryColor,
}: TemperatureChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-48 animate-pulse rounded-lg bg-slate-200/60" />
  }

  const data = {
    labels: temperatures.map((t) => t.month),
    datasets: [
      {
        label: 'High °F',
        data: temperatures.map((t) => t.high),
        borderColor: accentColor,
        backgroundColor: accentColor + '30',
        fill: '+1',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Low °F',
        data: temperatures.map((t) => t.low),
        borderColor: secondaryColor,
        backgroundColor: secondaryColor + '30',
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#475569',
          font: { size: 11, family: 'DM Sans' },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E8F0',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            return `${context.dataset.label}: ${context.parsed.y}°F`
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748B', font: { size: 10 } },
        grid: { color: '#0f172a14' },
      },
      y: {
        ticks: {
          color: '#64748B',
          font: { size: 10 },
          callback: (value: string | number) => `${value}°`,
        },
        grid: { color: '#0f172a14' },
      },
    },
  }

  return (
    <div className="h-48">
      <Line data={data} options={options} />
    </div>
  )
}
