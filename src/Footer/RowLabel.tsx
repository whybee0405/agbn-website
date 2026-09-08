'use client'
import { Footer } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Footer['linkGroups']>[number]>()

  const label = data?.data?.groupTitle
    ? `Group ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.groupTitle}`
    : 'Row'

  return <div>{label}</div>
}
