import { useNavigate } from "react-router-dom";
import useLocalStorage from "../useLocalStorage";
import { useEffect, useState } from "react";
import axios from "axios";
import { GiPlayButton } from "react-icons/gi";
import { TfiCheck, TfiClose } from "react-icons/tfi";
import { LinearGradient } from 'react-text-gradients';
import { TypeAnimation } from 'react-type-animation';
import { Player } from '@lottiefiles/react-lottie-player';
import AnimatedNumbers from "react-animated-numbers";
import { motion } from "framer-motion";




export function Home() {

    const navigate = useNavigate();

    const [isLoadingApiData, setIsLoadingApiData] = useState(false)
    const [resultsUiScore, setResultsUiScore] = useState(0)
    const [resultsUiAmountOfCorrectAnswers, setResultsUiAmountOfCorrectAnswers] = useState(0)
    const [guessedAllRight, setGuessedAllRight] = useState(false)
    const [hiscoreAchievment, setHiscoreAchievment] = useState(false)
    const [fixturesArrayForResultsUI, setFixturesArrayForResultsUI] = useState([])

    const [results, setResults] = useLocalStorage("results", [""]);
    const [matchdays, setMatchdays] = useLocalStorage("matchdays", [""]);
    const [upcomingFixtures, setUpcomingFixtures] = useLocalStorage("upcomingFixtures", []);
    const [latestMatchD, setLatestMatchD] = useLocalStorage("latestMatchday", 0);
    const [nextMatchD, setNextMatchD] = useLocalStorage("nextMatchday", 0);
    const [yourLastPlayedMatchDay, setYourLastPlayedMatchDay] = useLocalStorage("yourLastPlayedMatchDay", "");
    const [matchdayToPlay, setMatchdayToPlay] = useLocalStorage("matchdayToPlay", []);
    const [yourFinalPicksForThisMatchDay, setYourFinalPicksForThisMatchDay] = useLocalStorage("yourFinalPicksForThisMatchDay", []);
    const [timeOfLastResultsFetchFromApi, setTimeOfLastResultsFetchFromApi] = useLocalStorage("timeOfLastResultsFetchFromApi", "");
    const [highScore, setHighScore] = useLocalStorage("highScore", 0);
    const [showYourResultsUI, setShowYourResultsUI] = useLocalStorage("showYourResultsUI", false);

    const apiKey = process.env.REACT_APP_API_KEY;

    let allMatchdays = [];
    let allResultsArray = [];

    let latestMatchday = "";
    let nextMatchday = "";

    let fakeFixturesForNow = [
        {
            " Matchday 20 ": [
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F199.png",
                    "homeTeam": "Aston Villa",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F571.png",
                    "awayTeam": "Leeds",
                    "MatchDay": "Tomorrow"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F21.png",
                    "homeTeam": "Manchester United",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F209.png",
                    "awayTeam": "Manchester City",
                    "MatchDay": "14/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F670.png",
                    "homeTeam": "Brighton",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F18.png",
                    "awayTeam": "Liverpool",
                    "MatchDay": "14/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F577.png",
                    "homeTeam": "Nottingham Forest",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F572.png",
                    "awayTeam": "Leicester",
                    "MatchDay": "14/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F197.png",
                    "homeTeam": "Everton",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F615.png",
                    "awayTeam": "Southampton",
                    "MatchDay": "14/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F203.png",
                    "homeTeam": "Wolves",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F198.png",
                    "awayTeam": "West Ham",
                    "MatchDay": "14/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F671.png",
                    "homeTeam": "Brentford",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F622.png",
                    "awayTeam": "Bournemouth",
                    "MatchDay": "14/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F9.png",
                    "homeTeam": "Chelsea",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F567.png",
                    "awayTeam": "Crystal Palace",
                    "MatchDay": "15/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F207.png",
                    "homeTeam": "Newcastle United",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F211.png",
                    "awayTeam": "Fulham",
                    "MatchDay": "15/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F202.png",
                    "homeTeam": "Tottenham",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F2.png",
                    "awayTeam": "Arsenal",
                    "MatchDay": "15/01/2023"
                }
            ],
            " Matchday 21 ": [
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F18.png",
                    "homeTeam": "Liverpool",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F9.png",
                    "awayTeam": "Chelsea",
                    "MatchDay": "21/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F572.png",
                    "homeTeam": "Leicester",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F670.png",
                    "awayTeam": "Brighton",
                    "MatchDay": "21/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F615.png",
                    "homeTeam": "Southampton",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F199.png",
                    "awayTeam": "Aston Villa",
                    "MatchDay": "21/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F198.png",
                    "homeTeam": "West Ham",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F197.png",
                    "awayTeam": "Everton",
                    "MatchDay": "21/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F622.png",
                    "homeTeam": "Bournemouth",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F577.png",
                    "awayTeam": "Nottingham Forest",
                    "MatchDay": "21/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F567.png",
                    "homeTeam": "Crystal Palace",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F207.png",
                    "awayTeam": "Newcastle United",
                    "MatchDay": "21/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F571.png",
                    "homeTeam": "Leeds",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F671.png",
                    "awayTeam": "Brentford",
                    "MatchDay": "22/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F209.png",
                    "homeTeam": "Manchester City",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F203.png",
                    "awayTeam": "Wolves",
                    "MatchDay": "22/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F2.png",
                    "homeTeam": "Arsenal",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F21.png",
                    "awayTeam": "Manchester United",
                    "MatchDay": "22/01/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F211.png",
                    "homeTeam": "Fulham",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F202.png",
                    "awayTeam": "Tottenham",
                    "MatchDay": "23/01/2023"
                }
            ],
            " Matchday 22 ": [
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F9.png",
                    "homeTeam": "Chelsea",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F211.png",
                    "awayTeam": "Fulham",
                    "MatchDay": "03/02/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F197.png",
                    "homeTeam": "Everton",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F2.png",
                    "awayTeam": "Arsenal",
                    "MatchDay": "04/02/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F199.png",
                    "homeTeam": "Aston Villa",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F572.png",
                    "awayTeam": "Leicester",
                    "MatchDay": "04/02/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F671.png",
                    "homeTeam": "Brentford",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F615.png",
                    "awayTeam": "Southampton",
                    "MatchDay": "04/02/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F670.png",
                    "homeTeam": "Brighton",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F622.png",
                    "awayTeam": "Bournemouth",
                    "MatchDay": "04/02/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F21.png",
                    "homeTeam": "Manchester United",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F567.png",
                    "awayTeam": "Crystal Palace",
                    "MatchDay": "04/02/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F203.png",
                    "homeTeam": "Wolves",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F18.png",
                    "awayTeam": "Liverpool",
                    "MatchDay": "04/02/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F207.png",
                    "homeTeam": "Newcastle United",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F198.png",
                    "awayTeam": "West Ham",
                    "MatchDay": "04/02/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F577.png",
                    "homeTeam": "Nottingham Forest",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F571.png",
                    "awayTeam": "Leeds",
                    "MatchDay": "05/02/2023"
                },
                {
                    "homeLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F202.png",
                    "homeTeam": "Tottenham",
                    "awayLogo": "https://image-service.onefootball.com/transform?w=22&h=22&dpr=2&image=https%253A%252F%252Fimages.onefootball.com%252Ficons%252Fteams%252F164%252F209.png",
                    "awayTeam": "Manchester City",
                    "MatchDay": "05/02/2023"
                }
            ]
        }
    ]


    useEffect(() => {

        // only fetch from api & check results every 24h
        if (timeOfLastResultsFetchFromApi !== "") {
            console.log("inne i api timecheck ifsats ", timeOfLastResultsFetchFromApi);


            let timeSinceLastFetch = new Date().getTime() - new Date(timeOfLastResultsFetchFromApi).getTime();
            let hoursSinceLastFetch = Math.floor(timeSinceLastFetch / (1000 * 60 * 60));

            if (hoursSinceLastFetch < 24) {
                console.log("timmar sedan senaste fetch och check: ", hoursSinceLastFetch);
                return
            }
        }

        //if no previous fetch has been made or the last fetch was more than 24h ago, fetch new data and then check for results
        fetchResults()

    }, []);


    // checks if results are in from last played game and then calculates score 
    function checkResults() {

        let score = 0;
        let timeLeftOnMyLastRound = 0;

        let tempArrayToUpdateStateArray = []

        setIsLoadingApiData(false);

        if (yourFinalPicksForThisMatchDay.length === 0) {
            return
        }

        for (let i = 0; i < matchdays.length; i++) {
            const matchday = matchdays[i];

            if (Number(matchday.replace(/\D/g, '')) === Number(yourLastPlayedMatchDay)) {

                timeLeftOnMyLastRound = yourFinalPicksForThisMatchDay[0];

                for (const fixtureGuessed of yourFinalPicksForThisMatchDay[1]) {

                    for (const fixtureResult of results[i]) {

                        if (fixtureGuessed.myWinner === fixtureResult.homeTeam || fixtureGuessed.myWinner === fixtureResult.awayTeam || fixtureGuessed.myWinner === fixtureResult.homeTeam + fixtureResult.awayTeam) {

                            if (fixtureResult.homeTeamScore === "" || fixtureResult.awayTeamScore === "") {
                                // if any of the fixtures hasnt been played yet, stop checking results
                                return
                            }

                            let fixtureResultForUi = {
                                homeTeam: fixtureResult.homeTeam,
                                awayTeam: fixtureResult.awayTeam,
                                score: fixtureResult.homeTeamScore + " : " + fixtureResult.awayTeamScore,
                                yourGuess: "wrong"
                            }

                            let winner = fixtureResult.homeTeam

                            if (Number(fixtureResult.awayTeamScore) > Number(fixtureResult.homeTeamScore)) {
                                winner = fixtureResult.awayTeam
                            }
                            if (Number(fixtureResult.awayTeamScore) === Number(fixtureResult.homeTeamScore)) {
                                winner = fixtureResult.homeTeam + fixtureResult.awayTeam
                            }
                            if (fixtureGuessed.myWinner === winner) {
                                score += 1
                                fixtureResultForUi.yourGuess = "correct";

                            }
                            tempArrayToUpdateStateArray.push(fixtureResultForUi)
                            break
                        }
                    }
                }

                setResultsUiAmountOfCorrectAnswers(score)

                // If you guessed all matches correct you get an extra bonus
                if (score === yourFinalPicksForThisMatchDay[1].length) {
                    score = score * 2;
                    setGuessedAllRight(true)
                }

                // score is number of right guesses x timeLeftOnMyLastRound * 100.
                score = score * timeLeftOnMyLastRound * 100;
                if (score > highScore) {
                    setHighScore(score)
                    setHiscoreAchievment(true)
                }

                // UI to display results and score
                setResultsUiScore(score)
                setFixturesArrayForResultsUI([...tempArrayToUpdateStateArray])
                setShowYourResultsUI(true);
                // clear previous play and let user play next round
                setYourFinalPicksForThisMatchDay([]);
            }

        }

    }

    function fetchResults() {

        setIsLoadingApiData(true);

        const options = {
            method: 'GET',
            url: 'https://football98.p.rapidapi.com/premierleague/results',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'football98.p.rapidapi.com'
            }
        };

        axios.request(options).then(function (response) {

            let findingLatestMatchday = 0

            for (let prop in response.data[0]) {

                if (Number(prop.replace(/\D/g, '')) > findingLatestMatchday) {

                    findingLatestMatchday = Number(prop.replace(/\D/g, ''));
                }

                allMatchdays.push(prop);
                allResultsArray.push(response.data[0][prop]);
            }

            latestMatchday = findingLatestMatchday;
            nextMatchday = findingLatestMatchday + 1;

            setResults(allResultsArray)
            setMatchdays(allMatchdays)
            setLatestMatchD(latestMatchday)
            setNextMatchD(nextMatchday)

            let setThisTimeAsLastFetchFromApi = new Date();
            setTimeOfLastResultsFetchFromApi(setThisTimeAsLastFetchFromApi);

            fetchFixtures();

        }).catch(function (error) {
            console.error(error);
        });

    }


    function fetchFixtures() {

        let fixturesArray = []

        const options = {
            method: 'GET',
            url: 'https://football98.p.rapidapi.com/premierleague/fixtures',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'football98.p.rapidapi.com'
            }
        };

        axios.request(options).then(function (response) {
            setUpcomingFixtures([...response.data]);

            for (let prop in response.data[0]) {

                if (Number(prop.replace(/\D/g, '')) === Number(nextMatchday)) {

                    //let fixturesArray = []
                    //first index is the number of the matchday
                    fixturesArray.push(Number(nextMatchday))
                    //second index is array of fixtures to play
                    fixturesArray.push(response.data[0][prop]);
                    setMatchdayToPlay(fixturesArray);
                }
            }

            // API problems during development, suddenly not giving proper data response 23-01-13. In these cases we supply dummy data.
            if (fixturesArray.length === 0) {
                console.log("something wrong with API, not giving proper data for next round... here is some dummy data.");

                for (let prop in fakeFixturesForNow[0]) {

                    if (Number(prop.replace(/\D/g, '')) === Number(nextMatchday)) {

                        // let fixturesArray = []
                        //first index is the number of the matchday
                        fixturesArray.push(Number(nextMatchday))
                        //second index is array of fixtures to play
                        fixturesArray.push(fakeFixturesForNow[0][prop]);
                        setMatchdayToPlay(fixturesArray);
                    }
                }

            }

            checkResults();

        }).catch(function (error) {
            console.error(error);
        });

    }

    // used to fake result to test app
    function insertFakeResult() {

        let matchdayKey = " Matchday " + yourLastPlayedMatchDay + " ";
        let fakeMatchday = {}
        let tempArray = []

        // loop through yourFinalPicks array from last played game and generate a fake result for this round        
        for (const match of yourFinalPicksForThisMatchDay[1]) {
            delete match.myWinner;
            Object.assign(match, { homeTeamScore: "1", awayTeamScore: "2" });
            tempArray.push(match)
        }

        // insert fake result round into results array and simulate that new results are in to check and score for user
        Object.assign(fakeMatchday, { [matchdayKey]: [...tempArray] });
        for (let prop in fakeMatchday) {
            setResults([...results, fakeMatchday[prop]])
            setMatchdays([...matchdays, prop])
        }

        window.location.reload();
    }

    function closeResultsUI() {

        setResultsUiScore(0)
        setFixturesArrayForResultsUI([])
        setShowYourResultsUI(false)
        setGuessedAllRight(false)
        setHiscoreAchievment(false)
    }


    let resultListHtml = fixturesArrayForResultsUI.map((fixt, i) => {
        return (
            <motion.div className="resultListFixture" key={i}
                initial={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ ease: "easeInOut", duration: 0.2, delay: i * 0.2 }}
            >
                <div className="hometeamContainer">
                    <img src={"./img/" + fixt.homeTeam + ".png"} draggable={false} alt="hometeam logo" />
                    {/* <span>{fixt.homeTeam}</span> */}
                </div>

                <div className="resultsScoreContainer">
                    <div>{fixt.score}</div>
                    {fixt.yourGuess === "correct" && <div className="correct">
                        <TfiCheck></TfiCheck>
                    </div>}

                    {fixt.yourGuess === "wrong" && <div className="wrong">
                        <TfiClose></TfiClose>
                    </div>}

                </div>


                <div className="awayteamContainer">
                    <img src={"./img/" + fixt.awayTeam + ".png"} draggable={false} alt="awayteam logo" />
                    {/* <span>{fixt.awayTeam}</span> */}
                </div>

            </motion.div>
        )
    })

    return (<main>

        <div className="logo">

            <button onClick={insertFakeResult}>Fake results</button>
            <button onClick={checkResults}>check results</button>

{/* 
            <span className="braggy animate__animated animate__zoomIn animate__fast">
                B
            </span> */}

            <img className="braggy animate__animated animate__zoomIn animate__fast" src = "./img/B.svg" alt="B logo"/>



            {/* <LinearGradient gradient={['to left', '#ffde68 ,#17acff']}>
                <TypeAnimation
                    sequence={[
                        'Beat your friends!',
                        2000,
                        'Beat your family!',
                        2000,
                        'Beat your coworkers!',
                        2000,
                        'Beat your boss!',
                        2000,
                        'Beat your spouse!',
                        2000,
                        'Beat your nemesis!',
                        2000,
                        'Beat & brag about it!',
                        2000,
                    ]}
                    wrapper="div"
                    cursor={false}
                    repeat={Infinity}
                    style={{ fontSize: '1rem', letterSpacing: "2px", fontWeight: "300" }}
                />
            </LinearGradient> */}

            <section>
                <div className="scoreContainer  animate__animated animate__fadeIn">
                    <span className="highscore">
                        {/* <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}> */}
                        Your Highscore:
                        {/* </LinearGradient> */}
                        {!isLoadingApiData && <>
                            <AnimatedNumbers
                                animateToNumber={highScore}
                                fontStyle={{ fontSize: 32, color: "#FB2576", fontWeight: "300", letterSpacing: "5px" }}
                                configs={[
                                    { "mass": 1, "tension": 130, "friction": 40 }, { "mass": 2, "tension": 140, "friction": 40 }, { "mass": 3, "tension": 130, "friction": 40 }
                                ]}
                            ></AnimatedNumbers>
                        </>}
                    </span>
                </div>

            </section>
        </div>

        {isLoadingApiData &&
            <div className="loaderContainer animate__animated animate__fadeIn">
                <h3>
                    LOADING
                    <Player
                        className="loader"
                        autoplay
                        loop
                        src="https://assets3.lottiefiles.com/packages/lf20_0omj4rn0.json"
                    >
                    </Player>
                </h3>
            </div>
        }

        {showYourResultsUI &&
            <section className="resultsContainer animate__animated animate__fadeIn">

                <div className="resultsUIinformation">

                    <div className="resultsScoreDiv">
                        {resultsUiAmountOfCorrectAnswers} CORRECT GUESSES
                    </div>

                    <div className="resultsScoreDiv">SCORE: {resultsUiScore}p</div>
                    {hiscoreAchievment &&
                        <div className="resultsHighscoreDiv">
                            <Player
                                className="resultsAnimations"
                                autoplay
                                loop
                                src="https://assets4.lottiefiles.com/packages/lf20_rZQs81.json"
                            >
                            </Player>

                            <p>NEW HIGH SCORE!</p>

                            <Player
                                className="resultsAnimations"
                                autoplay
                                loop
                                src="https://assets4.lottiefiles.com/packages/lf20_rZQs81.json"
                            >
                            </Player>
                        </div>}
                    {guessedAllRight &&
                        <div className="resultsBonusDiv">
                            <Player
                                className="resultsAnimations"
                                autoplay
                                loop
                                src="https://assets5.lottiefiles.com/packages/lf20_CbT8Hi.json"
                            >
                            </Player>
                            <p>BONUS! 10/10 CORRECT</p>

                            <Player
                                className="resultsAnimations"
                                autoplay
                                loop
                                src="https://assets5.lottiefiles.com/packages/lf20_CbT8Hi.json"
                            >
                            </Player>
                        </div>}

                    <div className="listOfGamesUI">
                        {resultListHtml}
                    </div>
                </div>


                <button onClick={closeResultsUI} className="closeBtn"><TfiClose className='closebtnIcon'></TfiClose></button>

            </section>
        }

        {yourFinalPicksForThisMatchDay.length === 0 && matchdayToPlay.length !== 0 &&
            <div className="animate__animated animate__fadeIn">
                <button className="btn" onClick={() => { navigate("/game") }} aria-label="start button"><GiPlayButton className='btnIcon'></GiPlayButton></button>
            </div>
        }

        {yourFinalPicksForThisMatchDay.length !== 0 &&
            <div className="information">
                <span className="animate__animated animate__fadeIn">
                    We are still waiting for the results to come in from your last played round. <br /> Check back in 24h!
                </span>
            </div>
        }

        <div className="swipesContainer">
            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining swipe left mechanic for playing Braggy">
                Hometeam win
                <Player className="swipeIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets1.lottiefiles.com/packages/lf20_vmzgsolp.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining swipe right mechanic for playing Braggy">
                Awayteam win
                <Player className="swipeIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets7.lottiefiles.com/packages/lf20_tl8tqdw9.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining swipe up mechanic for playing Braggy">
                Draw
                <Player className="swipeUpIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets7.lottiefiles.com/packages/lf20_tl8tqdw9.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining time limit when playing Braggy">
                30 seconds
                <Player className="timerIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets1.lottiefiles.com/packages/lf20_4yofoa5q.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining score system">
                Play fast to score more
                <Player className="scoreIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets4.lottiefiles.com/packages/lf20_bcjfw1k6.json"
                >
                </Player>
            </div>
        </div>

        <footer>
            <a className="animate__animated animate__fadeInUp" href="https://github.com/GamerShabandari" target="_blank" rel="noreferrer" aria-label="link to Gamer Shabandari Github page">
                Gamer Shabandari ©
            </a>
        </footer>
    </main>)
}