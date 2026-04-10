import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import ComoFunciona from '@/components/sections/ComoFunciona'
import AreasDesenvolvimento from '@/components/sections/AreasDesenvolvimento'
import QuestionarioEstilo from '@/components/sections/QuestionarioEstilo'
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
      <AreasDesenvolvimento />
      <QuestionarioEstilo />
      <PreviewAtividade />
      <PortalEducativo />
      <Especialistas />
      <Planos />
      <CTA />
      <Footer />
    </main>
  )
}
