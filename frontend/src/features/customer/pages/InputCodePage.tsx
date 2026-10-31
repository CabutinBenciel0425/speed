import { useLocation } from "react-router-dom"
import InputCodeCard from "../components/InputCodeCard"
import { motion } from "framer-motion"

function InputCodePage() {
  const { state } = useLocation()
  const { email } = state

  console.log(email)
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
