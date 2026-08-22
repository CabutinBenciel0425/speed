import InputCodeCard from "../components/InputCodeCard"
import { motion } from "framer-motion"

function InputCodePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <InputCodeCard />
    </motion.div>
  )
}

export default InputCodePage
