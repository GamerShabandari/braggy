import { useEffect, useState } from 'react';
import TinderCard from 'react-tinder-card';
import useLocalStorage from "../useLocalStorage";
import Countdown from "react-countdown";
import { useNavigate } from "react-router-dom";
import 'animate.css';
import { HiHome, HiOutlineRefresh } from "react-icons/hi";
import { LinearGradient } from 'react-text-gradients'

export function Game() {

    const navigate = useNavigate();

    let myPicks = []
    let myTimeLeft;

    const [isDone, setIsDone] = useState(false)
    const [timeIsUp, setTimeIsUp] = useState(false)
    const [yourLastPlayedMatchDay, setYourLastPlayedMatchDay] = useLocalStorage("yourLastPlayedMatchDay", "")
    const [yourFinalPicksForThisMatchDay, setYourFinalPicksForThisMatchDay] = useLocalStorage("yourFinalPicksForThisMatchDay", [])
    const [matchdayToPlay, setMatchdayToPlay] = useLocalStorage("matchdayToPlay", [])

    useEffect(() => {

        if (yourFinalPicksForThisMatchDay.length !== 0) {
            setIsDone(true)
        }

    }, [])


    // SAVE PICKS TO LOCALSTORAGE
    function saveMyPicksToLocalstorage(filteredResultsList) {
        // setYourLastPlayedMatchDay(matchdayToPlay[0]);
        setYourLastPlayedMatchDay(19); // tillfälligt hårdkodat för att testa rättning
        let picksArrayWithTimeTakenToComplete = []
        picksArrayWithTimeTakenToComplete.push(myTimeLeft)
        picksArrayWithTimeTakenToComplete.push(filteredResultsList)
        setYourFinalPicksForThisMatchDay([...picksArrayWithTimeTakenToComplete]);
        return
    }

    // Timer to count down round
    const renderer = ({ hours, minutes, seconds, completed }) => {

        if (completed && !isDone) {
            // Render if time is up
            setTimeIsUp(true);
            return <TimesUP />;
        } else {
            // Render a countdown
            myTimeLeft = seconds;
            return (
                <span>
                    <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}> Seconds left: <span className='seconds'>{seconds}</span></LinearGradient>
                </span>
            );
        }
    };

    const TimesUP = () => <span>TIMES UP!</span>;

    function filterResultsForDuplicates() {
        // check and remove duplicates from array if any

        let filteredResults = myPicks.reduce((finalArray, current) => {

            let obj = finalArray.find((match) => match.homeTeam === current.homeTeam);

            if (obj) {
                return finalArray
            }

            return finalArray.concat([current]);
        }, [])


        if (filteredResults.length === matchdayToPlay[1].length) {
            saveMyPicksToLocalstorage(filteredResults)
        }
    }

    function handleSwipes(direction, match, i) {
        console.log("här i swipes");
        //ALL CARDS SWIPED
        if (i === 0) {
            setIsDone(true);
            filterResultsForDuplicates();
        }

        if (direction === "left") {

            let pick = {
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                myWinner: match.homeTeam
            }
            myPicks.push(pick)
        }

        if (direction === "right") {

            let pick = {
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                myWinner: match.awayTeam
            }
            myPicks.push(pick)
        }

        if (direction === "up") {

            let pick = {
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                myWinner: "draw"
            }
            myPicks.push(pick)
        }
    }

    return (<main>

        {timeIsUp && <div>
            <h1>
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>TIMES UP! RETRY?</LinearGradient>
            </h1>
            <button className="btn  animate__animated animate__bounceIn" onClick={() => { navigate("/") }} aria-label="button for navigating back home">
                <HiHome className='btnIcon'></HiHome>
            </button>
            <button className="btn  animate__animated animate__bounceIn" onClick={() => { window.location.reload(); }} aria-label="button to restart round">
                <HiOutlineRefresh className='btnIcon'></HiOutlineRefresh>
            </button>
        </div>}

        {!timeIsUp && <>

            {!isDone &&
                <>
                    <div className='timerContainer  animate__animated animate__pulse animate__infinite	infinite'>
                        <Countdown date={Date.now() + 30000} renderer={renderer} className='timerContainer' />
                    </div>

                    <div className='cardContainer animate__animated animate__fadeInDown animate__faster'>
                        {matchdayToPlay[1].map((match, i) =>
                            <TinderCard key={i} preventSwipe={['down']} className='swipe' onSwipe={(dir) => handleSwipes(dir, match, i)} >
                                <div className='card'>
                                    <div className='PLcontainer'>
                                        <img src="./img/PL.png" draggable={false} alt="" />
                                    </div>
                                    <div className='logoContainer'>
                                        <img src={"./img/" + match.homeTeam + ".png"} draggable={false} alt="" />
                                        <img src={"./img/" + match.awayTeam + ".png"} draggable={false} alt="" />
                                    </div>
                                    <h3>
                                        <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}> {match.homeTeam} - {match.awayTeam}</LinearGradient>
                                    </h3>
                                </div>
                            </TinderCard>
                        )}
                    </div>
                </>
            }

            {isDone && <>
                <h1>
                    <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>GREAT JOB!</LinearGradient>
                </h1>
                <h3>
                    <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>CHECK BACK AFTER MATCHDAY IS FINISHED FOR RESULTS</LinearGradient>
                </h3>
                <button className="btn animate__animated animate__pulse animate__infinite	infinite" aria-label="button for navigating back home" onClick={() => { navigate("/") }}><HiHome className='btnIcon'></HiHome></button>
            </>}

        </>}
    </main>)
}