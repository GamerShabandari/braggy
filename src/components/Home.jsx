import { useNavigate } from "react-router-dom";
import useLocalStorage from "../useLocalStorage";
import { useEffect } from "react";
import axios from "axios";
import { GiPlayButton } from "react-icons/gi";
import { LinearGradient } from 'react-text-gradients';
import { TypeAnimation } from 'react-type-animation';
import { Player } from '@lottiefiles/react-lottie-player';
import AnimatedNumbers from "react-animated-numbers";

export function Home() {

    // let testFacit = [
    //     {
    //         "homeTeam": "Tottenham",
    //         "awayTeam": "Arsenal",
    //         "homeTeamScore": "3",
    //         "awayTeamScore": "2"
    //     },
    //     {
    //         "homeTeam": "Newcastle United",
    //         "awayTeam": "Fulham",
    //         "homeTeamScore": "2",
    //         "awayTeamScore": "2"
    //     },
    //     {
    //         "homeTeam": "Chelsea",
    //         "awayTeam": "Crystal Palace",
    //         "homeTeamScore": "2",
    //         "awayTeamScore": "2"
    //     },
    //     {
    //         "homeTeam": "Brentford",
    //         "awayTeam": "Bournemouth",
    //         "homeTeamScore": "2",
    //         "awayTeamScore": "2"
    //     },
    //     {
    //         "homeTeam": "Brighton",
    //         "awayTeam": "Liverpool",
    //         "homeTeamScore": "2",
    //         "awayTeamScore": "2"
    //     },
    //     {
    //         "homeTeam": "Wolves",
    //         "awayTeam": "West Ham",
    //         "homeTeamScore": "2",
    //         "awayTeamScore": "2"
    //     },
    //     {
    //         "homeTeam": "Nottingham Forest",
    //         "awayTeam": "Leicester",
    //         "homeTeamScore": "2",
    //         "awayTeamScore": "2"
    //     },
    //     {
    //         "homeTeam": "Everton",
    //         "awayTeam": "Southampton",
    //         "homeTeamScore": "2",
    //         "awayTeamScore": "2"
    //     },
    //     {
    //         "homeTeam": "Manchester United",
    //         "awayTeam": "Manchester City",
    //         "homeTeamScore": "2",
    //         "awayTeamScore": "2"
    //     },
    //     {
    //         "homeTeam": "Aston Villa",
    //         "awayTeam": "Leeds",
    //         "homeTeamScore": "2",
    //         "awayTeamScore": "2"
    //     }
    // ]

    const navigate = useNavigate();

    const [isLoadingApiData, setIsLoadingApiData] = useState(false)

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
        //  console.log("matchdays från rättningen", matchdays);

        let score = 0;
        let timeLeftOnMyLastRound = 0;

        setIsLoadingApiData(false);

        if (yourFinalPicksForThisMatchDay.length === 0) {
            
            console.log("finns inget att rätta eftersom du aldrig gjort dina picks");
            return
        }

        for (let i = 0; i < matchdays.length; i++) {
            const matchday = matchdays[i];

            if (Number(matchday.replace(/\D/g, '')) === Number(yourLastPlayedMatchDay)) {

                timeLeftOnMyLastRound = yourFinalPicksForThisMatchDay[0];

                for (const fixtureGuessed of yourFinalPicksForThisMatchDay[1]) {

                    // for (const fixtureResult of testFacit) {
                    for (const fixtureResult of results[i]) {

                        if (fixtureGuessed.myWinner === fixtureResult.homeTeam || fixtureGuessed.myWinner === fixtureResult.awayTeam || fixtureGuessed.myWinner === fixtureResult.homeTeam + fixtureResult.awayTeam) {

                            if (fixtureResult.homeTeamScore === "" || fixtureResult.awayTeamScore === "") {
                                // if any of the fixtures hasnt been played yet, stop checking results
                                return
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
                            }
                            break
                        }
                    }
                }

                // If you guessed all matches correct you get an extra bonus
                if (score === yourFinalPicksForThisMatchDay[1].length) {
                    score = score * 2;
                }
                // score is number of right guesses x timeLeftOnMyLastRound.
                score = score * timeLeftOnMyLastRound * 1000;
                if (score > highScore) {
                    setHighScore(score)
                }


                setShowYourResultsUI(true);

                // VI MÅSTE VISA RESULTAT FRÅN SENASTE MATCHEN OAVSETT OM DET ÄR HIGHSCORE ELLER INTE, SEN EFTER DET SÅ RENSAR VI SENAST SPELAD INFO OCH HÄMTAR NÄSTA MATCH
                // här ska vi rätta, sätta poäng och visa vilka gissningar som var rätt och fel på något vis,
                // OBS I PICKS ARRAY ÄR INDEX 0 TIDEN SOM FANNS KVAR OCH INTEX 1 SJÄLVA VALEN
                // sen ska vi  rensa förra rondens picks setYourFinalPicksForThisMatchDay([]); och köra fetchFixtures som hämtar nästa match

                // MÅSTE OCKSÅ KOLLA ATT ÄVEN OM MATCHDAY FINNS I RESULTATEN FRÅN API ÄR DET INTE SÄKERT ATT ALLA MATCHER HUNNIT SPELAS ÄNNU, OM NÅGON MATCH SAKNAR RESULTAT SÅ MÅSTE AVBRYTA OCH VÄNTA PÅ ALLA RESULTAT 


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

            // checkResults();
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
                    //clear previous round picks
                    //setYourFinalPicksForThisMatchDay([]);
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

    return (<main>

        <div className="logo">
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
                        <AnimatedNumbers
                            animateToNumber={highScore}
                            fontStyle={{ fontSize: 32, color: "#d6ebf4d2", fontWeight: "300", textShadow: "1px 1px 5px #fff, 0px 1px 10px rgba(255, 104, 240, 0.255)", letterSpacing: "5px" }}
                            configs={[
                                { "mass": 1, "tension": 130, "friction": 40 }, { "mass": 2, "tension": 140, "friction": 40 }, { "mass": 3, "tension": 130, "friction": 40 }
                            ]}
                        ></AnimatedNumbers>
                    </span>
                </div>

            </section>
        </div>

        {isLoadingApiData &&
            <div>
                <h1>
                    <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                        LOADING ANIMATION SKA VARa HÄR
                    </LinearGradient>
                </h1>
            </div>
        }

        {showYourResultsUI &&
            <div>

                <h1>
                    <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                        HÄR SKA VI VISA ETT KORT MED DIN RÄTTNING OCH RESULTAT, NÄR DU STÄNGER DEN KAN DU SEN SPELA NÄSTA OMGÅNG
                    </LinearGradient>

                </h1>

            </div>
        }

        {yourFinalPicksForThisMatchDay.length === 0 && matchdayToPlay.length !== 0 &&
            <div className="animate__animated animate__fadeIn">
                <button className="btn animate__animated animate__pulse animate__infinite	infinite" onClick={() => { navigate("/game") }} aria-label="start button"><GiPlayButton className='btnIcon'></GiPlayButton></button>
            </div>
        }

        {yourFinalPicksForThisMatchDay.length !== 0 &&
            <div className="information">
                <span className="animate__animated animate__fadeIn">
                    <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                        We are still waiting for the results to come in from your last played round (Matchday: {yourLastPlayedMatchDay}). <br /> Check back in 24h!
                    </LinearGradient>
                </span>
            </div>
        }

        <div className="swipesContainer">
            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining swipe left mechanic for playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>swipe left for hometeam win.</LinearGradient>
                <Player className="swipeIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets1.lottiefiles.com/packages/lf20_vmzgsolp.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining swipe up mechanic for playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>swipe up for draw.</LinearGradient>
                <Player className="swipeUpIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets7.lottiefiles.com/packages/lf20_tl8tqdw9.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining swipe right mechanic for playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>swipe right for awayteam win.</LinearGradient>
                <Player className="swipeIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets7.lottiefiles.com/packages/lf20_tl8tqdw9.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining time limit when playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>Hurry! You have 30 seconds.</LinearGradient>
                <Player className="timerIcon animate__animated  animate__zoomIn animate__delay-1s"
                    autoplay
                    loop
                    src="https://assets1.lottiefiles.com/packages/lf20_4yofoa5q.json"
                >
                </Player>
            </div>

            <div className="animate__animated animate__fadeIn" aria-label="animated icon explaining score system">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>Score is based on correct guesses & total time taken.</LinearGradient>
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