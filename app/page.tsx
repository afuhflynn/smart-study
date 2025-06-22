import { Header } from '@/components/layout/header';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <Hero />
        <Features />
      </div>
      <Footer />
    </main>
  );
}