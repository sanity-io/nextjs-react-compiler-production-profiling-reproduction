import './global.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <head />
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
