import type { ActionResult } from '@/app/(frontend)/actions'

/** Keep entered values and expose a useful recovery path after transport failures. */
export async function runFormAction(action: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await action()
  } catch {
    return { success: false, message: 'We couldn’t confirm your submission. Your details are still here. Check your connection and try again.' }
  }
}
