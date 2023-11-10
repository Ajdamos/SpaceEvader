import {useState, useEffect} from 'react'
import Death from './assets/Death.wav'
import Meteor from './assets/meteor.svg'
interface ICoords{
  x: number;
  y: number;
}
interface IObstacle{
  position: IPosition;
}
interface IPosition{
  x: number;
  y: number;
}
interface ISmns{
  multiplier: number;
  nextSpeedup: number;
}

export function SpaceEvader() {
  let timer: ReturnType<typeof setInterval>;
  const deathAudio = new Audio(Death)
  const [gamePlaying, setGamePlaying] = useState<boolean>(false)
  const [endScreenScore, setEndScreenScore] = useState<number>(0)
  const [clientHeight, setClientHeight] = useState<number>(document.body.clientHeight)
  const [speed, setSpeed] = useState<number>(0)
  const [nextObstacle, setNextObstacle] = useState<number>(100)
  const [coords, setCoords] = useState<ICoords>({x: 0, y: 0});
  const [speedMultiplierNextSpeedup, setSpeedMultiplierNextSpeedup] = useState<ISmns>({multiplier: 1, nextSpeedup: 1000})
  const [obstacles, setObstacles] = useState<IObstacle[]>([])

  const getNewObstacles = () => { 
    let tempArray: IObstacle[] = []
    let takenArray: number[] = []
    let objectY
    for(let i = 0; i < Math.floor(Math.random() + speedMultiplierNextSpeedup.multiplier / 2) + 1; i++){
      while (true) {
        objectY = Math.floor((clientHeight * Math.floor(Math.random() * 10) / 10) + clientHeight / 20)
        if (!takenArray.includes(objectY)) break
      }
      takenArray = [...takenArray, objectY]
      tempArray = [...tempArray, {position: {x: nextObstacle + (window.screen.width * 1.1), y: objectY}}]
    }
    return tempArray
  }

  useEffect(() => {
    setClientHeight(document.body.clientHeight) //i think its faster not sure tho
  }, [document.body.clientHeight])

  const updateMap = () => {
    if(gamePlaying){
    timer = setInterval(() => {
      setSpeed(speed => speed + (5 * speedMultiplierNextSpeedup.multiplier));
      if(speed > speedMultiplierNextSpeedup.nextSpeedup) {
        setSpeedMultiplierNextSpeedup({multiplier: speedMultiplierNextSpeedup.multiplier + 0.5, nextSpeedup: speedMultiplierNextSpeedup.nextSpeedup * 1.5})
      }
      if(speed > nextObstacle) {
        setNextObstacle(old => old + 300)
        setObstacles(old => old.concat(getNewObstacles()).filter(item => item.position.x - speed > - (clientHeight / 20)))
      }
    }, 20)}
  }
  const restartGame = () => {
    setGamePlaying(false)
    setEndScreenScore(Math.floor(speed))
    setSpeed(0)
    setSpeedMultiplierNextSpeedup({multiplier: 1, nextSpeedup: 1000})
    setObstacles([])
    setNextObstacle(100)
  }

  useEffect(() => {
    const handleWindowMouseMove = (clientX: number, clientY: number) => {
      setCoords({
        x: clientX,
        y: clientY,
      });
    }
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    })
    document.addEventListener('keydown', (e) => {
      if(e.key === "Escape") setGamePlaying(false)
    })
    window.addEventListener('mousemove', (e) => handleWindowMouseMove(e.clientX, e.clientY))
    return () => {
      window.removeEventListener('mousemove', (e) => handleWindowMouseMove(e.clientX, e.clientY)
      );
    };
  }, []);

  useEffect(() => {
    obstacles.forEach((item) => {
      if(gamePlaying){
        if(coords.x < item.position.x + (clientHeight / 20) - speed && coords.x > item.position.x - (clientHeight / 20) - speed
          && coords.y < item.position.y + (clientHeight / 20) && coords.y > item.position.y - (clientHeight / 20)){
            //deathAudio.play()
            restartGame()
       }
      }
    }) 
    updateMap()
    return () => {
      clearInterval(timer)
    }
  }, [gamePlaying, speed, obstacles, speedMultiplierNextSpeedup]);

  if(!gamePlaying) return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gradient-to-r from-[#29323c] to-[#485563] text-[#e1e1e1]">
      {endScreenScore ? <h2 className='text-3xl text-white font-mono'>Score - {endScreenScore}</h2> : null}
      <button className='text-white text-3xl font-bold border-2 rounded-xl border-white py-1 px-3 m-4 hover:bg-white hover:text-gray-800 font-mono' onClick={() => {
        setGamePlaying(true)
        }}>start</button>
    </div>
  )
  return (
    
    <div className='relative w-screen h-screen overflow-hidden bg-gradient-to-r from-[#29323c] to-[#485563] text-[#e1e1e1]'>
    
    {obstacles.map((item, index) => {
      return <div 
        className='border-4 border-white absolute flex justify-center rounded-xl' 
        style={{
          left: item.position.x - speed, 
          top: item.position.y, 
          width: clientHeight / 10, 
          height: clientHeight / 10, 
          marginLeft: -(clientHeight / 10 / 2), 
          marginTop: -(clientHeight / 10 / 2),

        }} 
          key={index}> </div>
    })}
    </div>
  )
}

