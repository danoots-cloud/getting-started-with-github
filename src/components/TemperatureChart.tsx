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
  precipitation?: number[]
  accentColor: string
  secondaryColor: string
}

const PRECIP_COLOR = '#2563EB'

export function TemperatureChart({
  temperatures,
  precipitation,
  accentColor,
  secondaryColor,
}: TemperatureChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-56 animate-pulse rounded-lg bg-slate-200/60" />
  }

  // Compact single-letter labels when we have all 12 months, otherwise keep originals.
  const labels =
    temperatures.length === 12
      ? temperatures.map((t) => t.month.charAt(0))
      : temperatures.map((t) => t.month)

  const datasets: any[] = [
    {
      label: 'High °F',
      data: temperatures.map((t) => t.high),
      borderColor: accentColor,
      backgroundColor: accentColor + '30',
      fill: '+1',
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
      yAxisID: 'y',
    },
    {
      label: 'Low °F',
      data: temperatures.map((t) => t.low),
      borderColor: secondaryColor,
      backgroundColor: secondaryColor + '30',
      fill: false,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
      yAxisID: 'y',
    },
  ]

  if (precipitation && precipitation.length) {
    datasets.push({
      label: 'Precipitation (mm)',
      data: precipitation,
      borderColor: PRECIP_COLOR,
      backgroundColor: PRECIP_COLOR + '20',
      borderDash: [4, 4],
      fill: false,
      tension: 0.35,
      pointRadius: 2,
      pointHoverRadius: 5,
      yAxisID: 'y1',
    })
  }

  const data = { labels, datasets }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        labels: {
          color: '#475569',
          font: { size: 11, family: 'DM Sans' },
          boxWidth: 14,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E8F0',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          title: (items: { dataIndex: number }[]) =>
            items.length ? temperatures[items[0].dataIndex]?.month ?? '' : '',
          label: (context: {
            dataset: { label?: string; yAxisID?: string }
            parsed: { y: number | null }
          }) => {
            const v = context.parsed.y
            if (v == null) return ''
            const unit = context.dataset.yAxisID === 'y1' ? 'mm' : '°F'
            return `${context.dataset.label}: ${v}${unit === '°F' ? '°F' : ' mm'}`
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
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temp °F',
          color: '#64748B',
          font: { size: 10, family: 'DM Sans' },
        },
        ticks: {
          color: '#64748B',
          font: { size: 10 },
          callback: (value: string | number) => `${value}°`,
        },
        grid: { color: '#0f172a14' },
      },
      y1: {
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Rain mm',
          color: PRECIP_COLOR,
          font: { size: 10, family: 'DM Sans' },
        },
        ticks: {
          color: PRECIP_COLOR,
          font: { size: 10 },
          callback: (value: string | number) => `${value}`,
        },
        grid: { drawOnChartArea: false },
      },
    },
  }

  return (
    <div className="h-56">
      <Line data={data} options={options} />
    </div>
  )
}
