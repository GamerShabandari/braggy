import { useEffect, useState } from 'react';
import TinderCard from 'react-tinder-card';
import useLocalStorage from "../useLocalStorage";
import Countdown from "react-countdown";
import { useNavigate } from "react-router-dom";
import 'animate.css';
import { HiHome, HiOutlineRefresh } from "react-icons/hi";
import { Player } from '@lottiefiles/react-lottie-player';
import { motion, AnimatePresence } from "framer-motion";

export function Game() {

    const navigate = useNavigate();

    const [isDone, setIsDone] = useState(false)
    const [timeIsUp, setTimeIsUp] = useState(false)

    /// LOCALSTORAGE /////
    const [yourLastPlayedMatchDay, setYourLastPlayedMatchDay] = useLocalStorage("yourLastPlayedMatchDay", "")
    const [yourFinalPicksForThisMatchDay, setYourFinalPicksForThisMatchDay] = useLocalStorage("yourFinalPicksForThisMatchDay", [])
    const [matchdayToPlay, setMatchdayToPlay] = useLocalStorage("matchdayToPlay", [])

    let myPicks = []
    let myTimeLeft;
    // let dateOfLastFixtureInThisMatchday = ""

    useEffect(() => {

        if (yourFinalPicksForThisMatchDay.length !== 0) {
            setIsDone(true)
        }

    }, [])

    // SAVE PICKS TO LOCALSTORAGE, index 0 is time left on round, index 1 is array of all fixtures, index 2 is date of last fixture to be played
    function saveMyPicksToLocalstorage(listToSave) {

        let datesArray = [];
        for (const fixture of matchdayToPlay[1]) {
            let day = {
                date: fixture.MatchDay
            }
            datesArray.push(day)
        }
        let result = datesArray.reduce((r, { date }) => {
            if (!r) return { min: date, max: date };
            if (r.min > date) r.min = date;
            if (r.max < date) r.max = date;
            return r;
        }, undefined);

        let dateOfLastFixtureInThisMatchday = result.max;

        setYourLastPlayedMatchDay(matchdayToPlay[0]);
        let picksArrayWithTimeTakenToComplete = []
        picksArrayWithTimeTakenToComplete.push(myTimeLeft)
        picksArrayWithTimeTakenToComplete.push(listToSave)
        picksArrayWithTimeTakenToComplete.push(dateOfLastFixtureInThisMatchday)
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
                <span>Time left: {seconds}</span>
            );
        }
    };

    // // react bug/feature, renders state twice in dev mode so have to filter list, in production this function is unnecessary
    // function filterResultsForDuplicates() {

    //     let filteredResults = myPicks.reduce((finalArray, current) => {

    //         let obj = finalArray.find((match) => match.homeTeam === current.homeTeam);

    //         if (obj) {
    //             return finalArray
    //         }

    //         return finalArray.concat([current]);
    //     }, [])

    //     if (filteredResults.length === matchdayToPlay[1].length) {
    //         saveMyPicksToLocalstorage(filteredResults)
    //     }
    // }

    function handleSwipes(direction, match, i) {

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
                // when draw is guessed, we save it as hometeam name + awayteam name for correct point calculation later
                myWinner: match.homeTeam + match.awayTeam
            }
            myPicks.push(pick)
        }

        // all cards swiped
        if (i === 0) {
            setIsDone(true);
            // filterResultsForDuplicates();
            saveMyPicksToLocalstorage(myPicks)
        }
    }

    return (<main>
        <AnimatePresence mode='wait'>
            {timeIsUp &&
                <motion.section
                    key="gameTimesUp"
                    initial={{ opacity: 0, x: "-200%" }}
                    animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
                    exit={{
                        opacity: 0,
                        x: "-200%",
                        transition: { duration: 0.2, ease: "easeInOut" }
                    }}
                    className='postGameSection'>
                    <h1 className="timesUpText animate__animated animate__fadeIn">
                        Times up!
                    </h1>

                    <div className='timesUpBtnContainer'>
                        <button className="btn  animate__animated animate__bounceIn" onClick={() => { navigate("/") }} aria-label="button for navigating back home">
                            <HiHome className='btnIcon'></HiHome>
                        </button>
                        <button className="btn  animate__animated animate__bounceIn" onClick={() => { setTimeIsUp(false) }} aria-label="button to restart round">
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
                </motion.section>
            }

            {!timeIsUp && <>
                <AnimatePresence mode='wait'>
                    {!isDone && setYourFinalPicksForThisMatchDay.length !== 0 &&
                        <motion.div
                            key="gameCards"
                            initial={{ opacity: 0, x: "+200%" }}
                            animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
                            exit={{
                                opacity: 0,
                                x: "+200%",
                                transition: { duration: 0.2, ease: "easeInOut" }
                            }}
                        >
                            <div className='timerContainer'>
                                <Countdown date={Date.now() + 30000} renderer={renderer} />
                            </div>

                            <div className='cardContainer'>
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
                        </motion.div>
                    }

                    {isDone && <>
                        <motion.section
                            key="gameDone"
                            initial={{ opacity: 0, x: "-200%" }}
                            animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
                            exit={{
                                opacity: 0,
                                x: "+200%",
                                transition: { duration: 0.2, ease: "easeInOut" }
                            }}
                            className='postGameSection'>
                            <h1 className='done animate__animated animate__fadeIn'>
                                Great job!
                            </h1>
                            <h3 className='checkBack animate__animated animate__fadeIn'>
                                Check back after <span className="Ddate">{yourFinalPicksForThisMatchDay[2]}</span> when the final fixture of this matchday will be played.
                            </h3>
                            <button className="btn  animate__animated animate__bounceIn" aria-label="button for navigating back home" onClick={() => { navigate("/") }}><HiHome className='btnIcon'></HiHome></button>
                            <Player
                                className="fans"
                                autoplay
                                loop
                                src="https://assets1.lottiefiles.com/packages/lf20_1AzBQK1JzD.json"
                            >
                            </Player>
                        </motion.section>
                    </>}
                </AnimatePresence>

            </>}
        </AnimatePresence>
    </main>)
}