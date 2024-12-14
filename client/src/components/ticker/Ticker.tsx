import { useCallback, useEffect, useMemo, useState } from 'react'
import Marquee from 'react-fast-marquee'

// Proposed content:
//
// * What's going on?
// * Shoutouts!
// * Info about commands.

export default function Ticker() {
  const messages = useMemo(() => {
    return [
      'Got a math or programming problem? Checkout The Elements !discord server.                                              ',
      'We\'re looking at the Trees of Seattle                                        ',
      'Happy Saturday!                                                  ',
      'Stay hydrated! What\'s your drink of choice today?                                           ',
    ]
  }, [])

  const [showMessageNumber, setShowMessageNumber] = useState(0)
  const setShowNextMessage = useCallback(() => {
    const nextMessageNumber = (showMessageNumber + 1) % messages.length
    setShowMessageNumber(nextMessageNumber)
  }, [messages, showMessageNumber])

  useEffect(() => {
    const interval_id = setInterval(() => {
      //setShowNextMessage()
    }, 20*1000)
    return () => {
      clearInterval(interval_id)
    }
  }, [setShowNextMessage])

  // There was a weird scroll bar because of the font size, so this overflowY: 'hidden' prevents the scroll from showing.
  return <Marquee style={{ overflowY: 'hidden' }} onCycleComplete={() => setShowNextMessage()}>
    <span className="text-3xl" style={{whiteSpace: "pre"}}>{messages[showMessageNumber]}</span>
  </Marquee>
}
