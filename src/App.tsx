import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import WhatsappPanel from './pages/WhatsappPanel'
import NotFound from './pages/NotFound'
import Units from './pages/Units'
import Instructors from './pages/Instructors'
import Account from './pages/Account'
import ClassStatusSettings from './pages/ClassStatusSettings'
import ProfessionalReport from './pages/ProfessionalReport'
import Users from './pages/admin/Users'
import { ClassStatusProvider } from '@/contexts/ClassStatusContext'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <ClassStatusProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/whatsapp-panel" element={<WhatsappPanel />} />
            <Route path="/professionals" element={<Professionals />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/units" element={<Units />} />
            <Route path="/trainings" element={<Trainings />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/class/:id" element={<ClassDetails />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/reports" element={<Reports />} />
            <Route
              path="/reports/professional-history"
              element={<ProfessionalReport />}
            />
            <Route path="/communications" element={<Communications />} />

            {/* Admin Sub-routes */}
            <Route path="/admin/usuarios" element={<Users />} />

            {/* Settings Sub-routes */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/account" element={<Account />} />
            <Route path="/settings/status" element={<ClassStatusSettings />} />
            <Route path="/settings/audit" element={<Audit />} />
            <Route
              path="/settings/my-history"
              element={<ProfessionalHistory />}
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ClassStatusProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
