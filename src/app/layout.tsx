import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Darnix',
    default: 'Darnix',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @keyframes typing {
            from { width: 0 }
            to { width: 100% }
          }
          @keyframes blink-caret {
            from, to { border-color: transparent }
            50% { border-color: #e0aaff }
          }
          .typing-title {
            overflow: hidden;
            white-space: nowrap;
            animation: 
              typing 3.5s steps(40, end),
              blink-caret .75s step-end infinite;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
