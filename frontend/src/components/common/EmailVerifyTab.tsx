import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"

function EmailVerifyTab() {
  return (
    <NavLink to="/verify-email">
      <motion.div
        className="mb-5 w-full bg-secondary px-5 py-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <p className="text-center text-sm tracking-widest text-muted-foreground">
          Your email is not yet verified. Please click link to verify your
          email.
        </p>
      </motion.div>
    </NavLink>
  )
}

export default EmailVerifyTab
