import EmailVerificationCard from "../components/EmailVerificationCard"
import { motion } from "framer-motion"

function EmailVerificationPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <EmailVerificationCard />
    </motion.div>
  )
}

export default EmailVerificationPage
