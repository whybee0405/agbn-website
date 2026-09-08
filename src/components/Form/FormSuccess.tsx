import React from 'react'
import { CheckCircle2 } from 'lucide-react'

type Props = {
  title: string
  message: string
}

export const FormSuccess: React.FC<Props> = ({ title, message }) => (
  /* role="status" so the confirmation is announced when it replaces the form,
     rather than the submitter being left wondering whether anything happened. */
  <div
    role="status"
    className="rounded-lg border border-savanna/40 bg-savanna/10 p-7 text-center"
  >
    <CheckCircle2 className="mx-auto mb-4 text-savanna" size={32} aria-hidden="true" />
    <h3 className="text-display-s text-on-surface">{title}</h3>
    <p className="mx-auto mt-2 measure text-body-s text-on-surface-muted">{message}</p>
  </div>
)
