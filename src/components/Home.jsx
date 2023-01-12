import { useNavigate } from "react-router-dom";
import useLocalStorage from "../useLocalStorage";
import { useEffect, useState } from "react";
import axios from "axios";
import { GiPlayButton } from "react-icons/gi";
import { LinearGradient } from 'react-text-gradients';
import { TypeAnimation } from 'react-type-animation';
import { Player } from '@lottiefiles/react-lottie-player';
import AnimatedNumbers from "react-animated-numbers";
import { motion } from "framer-motion";

export function Home() {

    const navigate = useNavigate();

    const [isLoadingApiData, setIsLoadingApiData] = useState(false)
    const [resultsUiScore, setResultsUiScore] = useState(0)
    const [resultsUiTimeLeft, setResultsUiTimeLeft] = useState(0)
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



    useEffect(() => {

        // only fetch from api & check results every 24h
        if (timeOfLastResultsFetchFromApi !== "") {
            console.log("inne i api timecheck ifsats ", timeOfLastResultsFetchFromApi);


            let timeSinceLastFetch = new Date().getTime() - new Date(timeOfLastResultsFetchFromApi).getTime();
            let hoursSinceLastFetch = Math.floor(timeSinceLastFetch / (1000 * 60 * 60));

            if (hoursSinceLastFetch < 24) {
                console.log("timmar sedan senaste fetch och check: ", hoursSinceLastFetch);
                //  checkResults();
                return
            }
        }

        //if no previous fetch has been made or the last fetch was more than 24h ago, fetch new data
        fetchResults()

    }, []);

    function checkResults() {

        console.log("checkresults");

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
                console.log("en match har hittats! du sa din senast spelade match var: " + yourLastPlayedMatchDay + " och vi hittade detta i resultatarray: " + matchday + " på plats " + i + "i matchdayarray");
                console.log("denna borde vara listan som hör till din gissade matchdag " + results[i] + "annars kommer det inte stämma");

                for (const fixtureGuessed of yourFinalPicksForThisMatchDay[1]) {
                    console.log("i loop 1");


                    // for (const fixtureResult of testFacit) {
                    for (const fixtureResult of results[i]) {
                        //  console.log("i loop 2");
                        //console.log("fixtureResult inne i loop: " + fixtureResult);
                        //  console.log("min gissad vinnare " + fixtureGuessed.myWinner + " borde vara någon av dem här två lagen: " + fixtureResult.homeTeam + " - " + fixtureResult.awayTeam);

                        if (fixtureGuessed.myWinner === fixtureResult.homeTeam || fixtureGuessed.myWinner === fixtureResult.awayTeam || fixtureGuessed.myWinner === fixtureResult.homeTeam + fixtureResult.awayTeam) {
                            //  console.log("match vinnare " + fixtureGuessed.myWinner + " är  någon av dem här två lagen: " + fixtureResult.homeTeam + " - " + fixtureResult.awayTeam);

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
                                console.log(score);
                                fixtureResultForUi.yourGuess = "correct";
                                //  Object.assign(match, { homeTeamScore: "1", awayTeamScore: "2" });
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

                // score is number of right guesses x timeLeftOnMyLastRound.
                score = score * timeLeftOnMyLastRound * 1000;
                if (score > highScore) {
                    setHighScore(score)
                    setHiscoreAchievment(true)
                }

                setResultsUiScore(score)
                setResultsUiTimeLeft(timeLeftOnMyLastRound)

                setFixturesArrayForResultsUI([...tempArrayToUpdateStateArray])

                setShowYourResultsUI(true);

                // clear previous play and let user play next round
                setYourFinalPicksForThisMatchDay([]);
                console.log(fixturesArrayForResultsUI);
                console.table(fixturesArrayForResultsUI);
                console.log("längst ner i results check");
                console.log("här är alla matcher: ", tempArrayToUpdateStateArray);
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

                    let fixturesArray = []
                    //first index is the number of the matchday
                    fixturesArray.push(Number(nextMatchday))
                    //second index is array of fixtures to play
                    fixturesArray.push(response.data[0][prop]);
                    setMatchdayToPlay(fixturesArray);
                }
            }

            checkResults();

            // if (yourLastPlayedMatchDay < nextMatchday) {
            //     alert("finns nytt att spela")
            // }

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


    let resultListHtml = fixturesArrayForResultsUI.map((fixt, i) => {
        return (
            <motion.div className="resultListFixture" key={i}
                initial={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ ease: "easeInOut", duration: 0.2, delay: i * 0.2 }}
            >
                <div className="hometeamContainer">
                    <img src={"./img/" + fixt.homeTeam + ".png"} draggable={false} alt="hometeam logo" />
                    <span>{fixt.homeTeam}</span>
                </div>

                <div className="resultsScoreContainer">
                    {fixt.score}
                </div>

                <div className="awayteamContainer">
                    <img src={"./img/" + fixt.awayTeam + ".png"} draggable={false} alt="awayteam logo" />
                    <span>{fixt.awayTeam}</span>
                </div>
                {fixt.yourGuess === "correct" && <div className="correct">
                    CORRECT GUESS
                </div>}

                {fixt.yourGuess === "wrong" && <div className="wrong">
                    WRONG GUESS
                </div>}
            </motion.div>
        )
    })

    return (<main>

        <div className="logo">

            <button onClick={insertFakeResult}>Fake results</button>
            <button onClick={checkResults}>check results</button>

            <LinearGradient className="braggy animate__animated animate__zoomIn animate__fast" gradient={['to left', '#17acff ,#ff68f0']}>
                <span>BRAGGY</span>
            </LinearGradient>


            <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
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
                    style={{ fontSize: '1rem', letterSpacing: "2px", fontWeight: "200" }}
                />
            </LinearGradient>

            <section>
                <div className="scoreContainer  animate__animated animate__fadeIn">
                    <span className="highscore">
                        <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                            Your Highscore:
                        </LinearGradient>
                        {!isLoadingApiData && <>
                            <AnimatedNumbers
                                animateToNumber={highScore}
                                fontStyle={{ fontSize: 32, color: "#d6ebf4d2", fontWeight: "300", textShadow: "1px 1px 5px #fff, 0px 1px 10px rgba(255, 104, 240, 0.255)", letterSpacing: "5px" }}
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
                    <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                        LOADING
                    </LinearGradient>
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


                <button className="closeBtn">close</button>

                <div className="resultsUIinformation">
                    <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                        <span>Score: {resultsUiScore}</span>
                        {hiscoreAchievment && <span>NEW HIGH SCORE!</span>}
                        {guessedAllRight && <span>Great job! You got a 2x bonus since you guessed all the matches correctly</span>}
                    </LinearGradient>
                </div>

                {/* <h1>
                    <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                        Results:
                        <br />
                        Score: {resultsUiScore}
                        <br />
                        Time left on clock: {resultsUiTimeLeft}
                        <br />
                        {resultsUiAmountOfCorrectAnswers} of 10 guesses were correct
                        <br />
                        {guessedAllRight && <span>Great job! You got a 2x bonus since you guessed all the matches correctly</span>}
                        <br />
                        {hiscoreAchievment && <span>NEW HIGH SCORE!</span>}

                        <div>
                            {resultListHtml}
                        </div>

                    

                </h1> */}

                <div>
                    {resultListHtml}
                </div>



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
                    <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                        We are still waiting for the results to come in from your last played round. <br /> Check back in 24h!
                    </LinearGradient>
                </span>
            </div>
        }

        <div className="swipesContainer">
            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining swipe left mechanic for playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>Hometeam win.</LinearGradient>
                <Player className="swipeIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets1.lottiefiles.com/packages/lf20_vmzgsolp.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining swipe right mechanic for playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>Awayteam win.</LinearGradient>
                <Player className="swipeIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets7.lottiefiles.com/packages/lf20_tl8tqdw9.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining swipe up mechanic for playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>Draw.</LinearGradient>
                <Player className="swipeUpIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets7.lottiefiles.com/packages/lf20_tl8tqdw9.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining time limit when playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>30 seconds.</LinearGradient>
                <Player className="timerIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets1.lottiefiles.com/packages/lf20_4yofoa5q.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining score system">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>Play fast to score more.</LinearGradient>
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
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                    Gamer Shabandari ©
                </LinearGradient>
            </a>
        </footer>
    </main>)
}