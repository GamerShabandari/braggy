import { useEffect, useState } from 'react';
import TinderCard from 'react-tinder-card';
import useLocalStorage from "../useLocalStorage";
import Countdown from "react-countdown";
import { useNavigate } from "react-router-dom";
import 'animate.css';
import { HiHome, HiOutlineRefresh } from "react-icons/hi";
import { Player } from '@lottiefiles/react-lottie-player';

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
        setYourLastPlayedMatchDay(matchdayToPlay[0]);
        // setYourLastPlayedMatchDay(19); // tillfälligt hårdkodat för att testa rättning
        let picksArrayWithTimeTakenToComplete = []
        picksArrayWithTimeTakenToComplete.push(myTimeLeft)
        picksArrayWithTimeTakenToComplete.push(filteredResultsList)
        setYourFinalPicksForThisMatchDay([...picksArrayWithTimeTakenToComplete]);
        setMatchdayToPlay([])
        return
    }

    // Timer to count down round
    const renderer = ({ hours, minutes, seconds, completed }) => {

        if (completed && !isDone) {
            // Render if time is up
            setTimeIsUp(true);

        } else {
            // Render a countdown
            myTimeLeft = seconds;
            return (

                <span className='seconds'>Time left: {seconds}</span>

            );
        }
    };



    // react bug, renders state twice in dev mode so have to filter list, in production this function is unnecessary
    function filterResultsForDuplicates() {

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

        if (direction === "left") {
            console.log(i);

            let pick = {
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                myWinner: match.homeTeam
            }
            myPicks.push(pick)
        }

        if (direction === "right") {
            console.log(i);

            let pick = {
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                myWinner: match.awayTeam
            }
            myPicks.push(pick)
        }

        if (direction === "up") {
            console.log(i);

            let pick = {
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                // when draw is guessed, we save it as hometeam name + awayteam name for correct point calculation later
                myWinner: match.homeTeam + match.awayTeam
            }
            myPicks.push(pick)
        }

        // all cards swiped
        if (i === 0) {
            setIsDone(true);
            filterResultsForDuplicates();
        }
    }

    return (<main>

        {timeIsUp &&
            <section className='postGameSection'>
                <h1 className="timesUpText animate__animated animate__fadeIn">
                    Times up!
                </h1>

                <div className='timesUpBtnContainer'>
                    <button className="btn  animate__animated animate__bounceIn" onClick={() => { navigate("/") }} aria-label="button for navigating back home">
                        <HiHome className='btnIcon'></HiHome>
                    </button>
                    <button className="btn  animate__animated animate__bounceIn" onClick={() => { window.location.reload(); }} aria-label="button to restart round">
                        <HiOutlineRefresh className='btnIcon'></HiOutlineRefresh>
                    </button>
                </div>
                <Player
                    className="timesUp"
                    loop
                    autoplay
                    src="https://assets8.lottiefiles.com/packages/lf20_xFpiNt.json"
                >
                </Player>

            </section>}

        {!timeIsUp && <>

            {!isDone && setYourFinalPicksForThisMatchDay.length !== 0 &&
                <>
                    <div className='timerContainer  animate__animated animate__zoomIn'>
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
                                        <img src={"./img/" + match.homeTeam + ".png"} draggable={false} alt="hometeam logo" />
                                        <img src={"./img/" + match.awayTeam + ".png"} draggable={false} alt="awayteam logo" />
                                    </div>
                                    <h3>
                                        {match.homeTeam} - {match.awayTeam}
                                    </h3>
                                </div>
                            </TinderCard>
                        )}
                    </div>
                </>
            }

            {isDone && <>
                <section className='postGameSection'>
                    <h1 className='done animate__animated animate__fadeIn'>
                        GREAT JOB!
                    </h1>
                    <h3 className='checkBack animate__animated animate__fadeIn'>
                        CHECK BACK AFTER MATCHDAY {matchdayToPlay[0]} IS FINISHED FOR RESULTS
                    </h3>
                    <button className="btn  animate__animated animate__bounceIn" aria-label="button for navigating back home" onClick={() => { navigate("/") }}><HiHome className='btnIcon'></HiHome></button>
                    <Player
                        className="fans"
                        autoplay
                        loop
                        src="https://assets1.lottiefiles.com/packages/lf20_1AzBQK1JzD.json"
                    >
                    </Player>
                </section>
            </>}

        </>}
    </main>)
}