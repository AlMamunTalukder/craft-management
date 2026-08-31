import type { ReactNode } from "react"

interface ColorfulIconProps {
  children: ReactNode
  color: string
  size?: number
}

export const ColorfulIcon = ({ children, color, size = 30 }: ColorfulIconProps) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        backgroundColor: `${color}14`,
        border: `1px solid ${color}1A`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
        flexShrink: 0,
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.95 }}>
        {children}
      </div>
    </div>
  )
}
