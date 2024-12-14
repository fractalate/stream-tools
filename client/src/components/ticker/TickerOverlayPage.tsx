import Ticker from './Ticker'

export default function TickerOverlayPage() {
  return <div className="flex flex-col" style={{
    color: 'white',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.95)',
    
  }}>
    <div className="flex py-2 bg-gradient-to-t from-zinc-800/80 to-white/0"></div>
    <div className="flex bg-zinc-800/80">
      <Ticker />
    </div>
    <div className="flex py-2 bg-gradient-to-b from-zinc-800/80 to-white/0"></div>
  </div>
}
