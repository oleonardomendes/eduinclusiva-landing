import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import ComoFunciona from '@/components/sections/ComoFunciona'
import PreviewAtividade from '@/components/sections/PreviewAtividade'
import PortalEducativo from '@/components/sections/PortalEducativo'
import Especialistas from '@/components/sections/Especialistas'
import Planos from '@/components/sections/Planos'
import CTA from '@/components/sections/CTA'

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Header />
      <Hero />
      <ComoFunciona />
      <PreviewAtividade />
      <PortalEducativo />
      <Especialistas />
      <Planos />
      <CTA />
      <Footer />
    </main>
  )
}
