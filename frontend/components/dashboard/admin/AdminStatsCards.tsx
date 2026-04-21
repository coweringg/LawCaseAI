import React from 'react'
import { motion } from 'framer-motion'
import { Users, Activity, Database } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalCases: number
  newUsersThisMonth: number
}

interface AdminStatsCardsProps {
  stats: AdminStats | null
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  if (!stats) return null

  const statItems = [
    { label: 'Total Network Users', value: stats.totalUsers, icon: Users, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
    { label: 'Active Logic Streams', value: stats.activeUsers, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
    { label: 'Repository Entities', value: stats.totalCases, icon: Database, color: 'text-secondary', bg: 'bg-secondary/5', border: 'border-secondary/20' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
      {statItems.map((stat, i) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={stat.label}
          className={`premium-glass p-8 rounded-[2.5rem] border ${stat.border} ${stat.bg} shadow-2xl group flex justify-between items-center`}
        >
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
            <p className="text-5xl font-black text-white tracking-tighter">{stat.value}</p>
          </div>
          <div className={`w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white/10`}>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
