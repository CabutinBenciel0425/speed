import { motion, AnimatePresence } from "framer-motion"
import { FieldError } from "../ui/field"
import type { FieldStateType } from "../types/PropTypes"

function FieldStateError({ fieldState }: { fieldState: FieldStateType }) {
  return (
    <div className="relative min-h-3">
      <AnimatePresence>
        {fieldState.invalid && (
          <motion.div
            key="error-message"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute inset-0 text-xs text-red-500"
          >
            <FieldError errors={[fieldState.error]} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FieldStateError
