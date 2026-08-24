import { AnimatePresence, motion } from "framer-motion"
import { Heart } from "lucide-react"
import { useState } from "react"
import type { LikeButtonProps } from "../types/PropTypes"

const PARTICLE_COUNT = 8

const particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
  const angle = (360 / PARTICLE_COUNT) * index
  const radians = (angle * Math.PI) / 180

  return {
    id: index,
    x: Math.cos(radians) * 32,
    y: Math.sin(radians) * 32,
  }
})

function LikeButton({
  isFavorite,
  setIsFavorite,
  size = "7",
}: LikeButtonProps) {
  const [burstKey, setBurstKey] = useState(0)

  const handleLike = () => {
    if (isFavorite) {
      setIsFavorite(false)
      return
    }

    setIsFavorite(true)

    setBurstKey((prev) => prev + 1)
  }

  return (
    <motion.button
      type="button"
      onClick={handleLike}
      aria-label={isFavorite ? "Unlike" : "Like"}
      className="relative flex cursor-pointer items-center gap-2 transition-all duration-200 active:scale-95"
    >
      <span className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {isFavorite && (
            <span key={burstKey}>
              {particles.map((particle) => (
                <motion.span
                  key={`${burstKey}-${particle.id}`}
                  className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full bg-[#FF6B00]"
                  initial={{
                    x: "-50%",
                    y: "-50%",
                    scale: 1,
                    opacity: 1,
                  }}
                  animate={{
                    x: `calc(-50% + ${particle.x}px)`,
                    y: `calc(-50% + ${particle.y}px)`,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                />
              ))}
            </span>
          )}
        </AnimatePresence>
      </span>

      <motion.span
        animate={
          isFavorite
            ? {
                scale: [1, 1.35, 1],
              }
            : {
                scale: 1,
              }
        }
        transition={{
          duration: 0.45,
          type: "spring",
          stiffness: 500,
          damping: 15,
        }}
      >
        <Heart
          className={`h-${size} w-${size}`}
          fill={isFavorite ? "#FF6B00" : "none"}
          stroke={isFavorite ? "#FF6B00" : "currentColor"}
        />
      </motion.span>
    </motion.button>
  )
}

export default LikeButton
