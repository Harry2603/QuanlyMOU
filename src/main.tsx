// import { createRoot } from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'

// createRoot(document.getElementById('root')!).render(<App />)
import { createRoot } from 'react-dom/client'
import { App as AntdApp } from 'antd'   //import App của antd
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <AntdApp>   {/* bọc toàn bộ app */}
    <App />
  </AntdApp>
)
