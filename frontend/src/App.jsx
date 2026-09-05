import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import TradeData from './pages/TradeData'
import ProductDetail from './pages/ProductDetail'
import FindBuyers from './pages/FindBuyers'
import GettingStarted from './pages/GettingStarted'
import Documents from './pages/Documents'
import Payment from './pages/Payment'
import Costing from './pages/Costing'
import GovtSchemes from './pages/GovtSchemes'
import Credits from './pages/Credits'
import ExpertInsights from './pages/ExpertInsights'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trade" element={<TradeData />} />
        <Route path="/trade/:hsCode" element={<ProductDetail />} />
        <Route path="/buyers" element={<FindBuyers />} />
        <Route path="/guide" element={<GettingStarted />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/costing" element={<Costing />} />
        <Route path="/schemes" element={<GovtSchemes />} />
        <Route path="/insights" element={<ExpertInsights />} />
        <Route path="/credits" element={<Credits />} />
      </Route>
    </Routes>
  )
}

export default App
