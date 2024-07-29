import Profiler from './Profiler'
import './global.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <head />
      <body>
        <div id="root">
          <Profiler>{children}</Profiler>
        </div>
      </body>
    </html>
  )
}
