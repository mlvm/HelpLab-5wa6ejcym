import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Login from './pages/Login'
import Professionals from './pages/Professionals'
import Trainings from './pages/Trainings'
import Schedule from './pages/Schedule'
import ClassDetails from './pages/ClassDetails'
import Appointments from './pages/Appointments'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Audit from './pages/Audit'
import Communications from './pages/Communications'
import ProfessionalHistory from './pages/ProfessionalHistory'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/trainings" element={<Trainings />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/class/:id" element={<ClassDetails />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/communications" element={<Communications />} />
          <Route path="/my-history" element={<ProfessionalHistory />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
