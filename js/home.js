const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const lettersArr = letters.split("")

const randomLetterGen = () => {
  return lettersArr[Math.floor(Math.random()*letters.length)]
  console.log('here')
}

document.getElementById("me").onmouseover = (e) => {
  const originalWords = e.target.innerText.split(' ')
    let firstHiddenLetter = -5
    const interval = setInterval( () => {
      const newWords = []
      e.target.innerText.split(' ').forEach((word, wordI) => {
      newWords.push(
        word
        .split('')
        .map((letter, letterI) => 
             {
          console.log(letterI, firstHiddenLetter)
             return letterI>firstHiddenLetter ? randomLetterGen() : originalWords[wordI][letterI]
            }
            ).join('')
      
      
      )
      })
      
      e.target.innerText = newWords.join(' ')
      if (firstHiddenLetter>8) clearInterval(interval)
      firstHiddenLetter += 0.5
    }, 50)
}