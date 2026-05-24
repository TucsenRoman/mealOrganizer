export type ProgressPhrase = {
  maxPct: number
  text: string
}

export const PROGRESS_PHRASES: ProgressPhrase[] = [
  { maxPct: 100,  text: "Your Progress"},
  // { maxPct: 0,   text: "Let's get going dumbasses👍" },
  // { maxPct: 0,  text: "↙️ you are here. NOTHING"},
  // { maxPct: 20,   text: "Get going dumbasses🕑" },
  // { maxPct: 50,  text: "You've done jack sh*t" },
  // { maxPct: 60,  text: "Over halfway. Don't f😘ck it up" },
  // { maxPct: 80,  text: "So close. Don't choke (like ur mom)" },
  // { maxPct: 99,  text: "ONE MORRRRRE" },
  // { maxPct: 100, text: "Holy sh😇t! good job dumbasses🎉" },
]

export function getRandomVibe(): { title: string; pct: number } {
  // 2/7 high (65–95), 5/7 low (4–40)
  const high = Math.random() < 2 / 7
  const pct = high
    ? Math.floor(Math.random() * 31) + 65
    : Math.floor(Math.random() * 37) + 4
  return { title: '✨THE GAY-RATE-INATOR🌈', pct }
}

export function getProgressPhrase(pct: number): string {
  for (const { maxPct, text } of PROGRESS_PHRASES) {
    if (pct <= maxPct) return text
  }
  return PROGRESS_PHRASES[PROGRESS_PHRASES.length - 1].text
}
