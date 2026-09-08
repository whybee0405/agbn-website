import React from 'react'
import {
  Pickaxe,
  HeartPulse,
  HardHat,
  Cpu,
  Leaf,
  Zap,
  Truck,
  Landmark,
  Briefcase,
  Factory,
  CircleDot,
} from 'lucide-react'

const ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  pickaxe: Pickaxe,
  'heart-pulse': HeartPulse,
  'hard-hat': HardHat,
  cpu: Cpu,
  leaf: Leaf,
  zap: Zap,
  truck: Truck,
  landmark: Landmark,
  briefcase: Briefcase,
  factory: Factory,
}

export const SectorIcon: React.FC<{ name?: string | null; className?: string; size?: number }> = ({
  name,
  className,
  size,
}) => {
  const Icon = (name && ICONS[name]) || CircleDot
  return <Icon className={className} size={size} />
}
