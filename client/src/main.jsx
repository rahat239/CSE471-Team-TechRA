import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap'
import '../public/assets/css/main.css'
import '../public/assets/css/animate.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-loading-skeleton/dist/skeleton.css'
import App from './App.jsx'
import '../public/assets/css/admin-dashboard.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
          <App />
  </React.StrictMode>
)
