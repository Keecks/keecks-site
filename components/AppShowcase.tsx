import Image from 'next/image'

export default function AppShowcase() {
  return (
    <section className="section showcase">
      <div className="container">
        <div className="showcase__phone">
          <Image
            src="/images/01.jpg"
            alt="Your client is calling — Keecks handles it"
            width={390}
            height={844}
            priority
          />
        </div>
        <p className="showcase__label">Always on</p>
        <h2 className="showcase__heading">
          The AI assistant that handles<br />your calls, 24/7.
        </h2>
      </div>
    </section>
  )
}
