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

    let testFacit = [
        {
            "homeTeam": "Tottenham",
            "awayTeam": "Arsenal",
            "homeTeamScore": "2",
            "awayTeamScore": "1"
        },
        {
            "homeTeam": "Newcastle United",
            "awayTeam": "Fulham",
            "homeTeamScore": "2",
            "awayTeamScore": "1"
        },
        {
            "homeTeam": "Chelsea",
            "awayTeam": "Crystal Palace",
            "homeTeamScore": "2",
            "awayTeamScore": "1"
        },
        {
            "homeTeam": "Brentford",
            "awayTeam": "Bournemouth",
            "homeTeamScore": "2",
            "awayTeamScore": "1"
        },
        {
            "homeTeam": "Brighton",
            "awayTeam": "Liverpool",
            "homeTeamScore": "2",
            "awayTeamScore": "1"
        },
        {
            "homeTeam": "Wolves",
            "awayTeam": "West Ham",
            "homeTeamScore": "2",
            "awayTeamScore": "1"
        },
        {
            "homeTeam": "Nottingham Forest",
            "awayTeam": "Leicester",
            "homeTeamScore": "2",
            "awayTeamScore": "1"
        },
        {
            "homeTeam": "Everton",
            "awayTeam": "Southampton",
            "homeTeamScore": "2",
            "awayTeamScore": "1"
        },
        {
            "homeTeam": "Manchester United",
            "awayTeam": "Manchester City",
            "homeTeamScore": "2",
            "awayTeamScore": "1"
        },
        {
            "homeTeam": "Aston Villa",
            "awayTeam": "Leeds",
            "homeTeamScore": "2",
            "awayTeamScore": "1"
        }
    ]

    const navigate = useNavigate();

    const [results, setResults] = useLocalStorage("results", [""])
    const [matchdays, setMatchdays] = useLocalStorage("matchdays", [""])
    const [upcomingFixtures, setUpcomingFixtures] = useLocalStorage("upcomingFixtures", [])
    const [latestMatchD, setLatestMatchD] = useLocalStorage("latestMatchday", 0)
    const [nextMatchD, setNextMatchD] = useLocalStorage("nextMatchday", 0)
    const [yourLastPlayedMatchDay, setYourLastPlayedMatchDay] = useLocalStorage("yourLastPlayedMatchDay", "")
    const [matchdayToPlay, setMatchdayToPlay] = useLocalStorage("matchdayToPlay", [])
    const [yourFinalPicksForThisMatchDay, setYourFinalPicksForThisMatchDay] = useLocalStorage("yourFinalPicksForThisMatchDay", [])
    const [timeOfLastResultsFetchFromApi, setTimeOfLastResultsFetchFromApi] = useLocalStorage("timeOfLastResultsFetchFromApi", "")
    const [highScore, setHighScore] = useLocalStorage("highScore", 0)

    const apiKey = process.env.REACT_APP_API_KEY;

    let allMatchdays = [];
    let allResultsArray = [];

    let latestMatchday = "";
    let nextMatchday = "";

    let justCheckedResults = false;

    useEffect(() => {

        // only fetch results from api every 24h
        if (timeOfLastResultsFetchFromApi !== "") {
            console.log("inne i api timecheck ifsats ", timeOfLastResultsFetchFromApi);


            let timeSinceLastFetch = new Date().getTime() - new Date(timeOfLastResultsFetchFromApi).getTime();
            let hoursSinceLastFetch = Math.floor(timeSinceLastFetch / (1000 * 60 * 60));

            if (hoursSinceLastFetch < 24) {
                console.log("timmar sedan: ", hoursSinceLastFetch);
                checkResults();
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

        if (yourFinalPicksForThisMatchDay.length === 0) {
            //alert("finns inget att rätta")
            console.log("finns inget att rätta eftersom du aldrig gjort dina picks");
           alert("fixa det här, du har inte spelat innan så vi kan inte rätta något");
            return
        }

        console.log("finns något att rätta eftersom du åtminstånde gjort dina picks tidigare");
        for (let i = 0; i < matchdays.length; i++) {
            const matchday = matchdays[i];
            //  console.log("i loop inne i checkresults, matchday: ", matchday);

            if (Number(matchday.replace(/\D/g, '')) === Number(yourLastPlayedMatchDay)) {
                // console.log("vi har resultat för matchday: ", matchday + " och du har spelat denna rond säger du: " + yourLastPlayedMatchDay);
                //  console.log("oj oj oj vi har en match på index: ", i);
                // console.log("det här är vad vi ska jämföra mot, det är facit", results[i]);
                //   console.log("här är valen du gjorde", yourFinalPicksForThisMatchDay[1]);
                //  console.log("och hur många sekunder du hade över", yourFinalPicksForThisMatchDay[0]);

                timeLeftOnMyLastRound = yourFinalPicksForThisMatchDay[0];

                for (const fixtureGuessed of yourFinalPicksForThisMatchDay[1]) {

                    for (const fixtureResult of testFacit) {
                        //  console.log("gissning: " + fixtureGuessed + " resultat: " +fixtureResult);
                        if (fixtureGuessed.myWinner === fixtureResult.homeTeam || fixtureGuessed.myWinner === fixtureResult.awayTeam || fixtureGuessed.myWinner === fixtureResult.homeTeam + fixtureResult.awayTeam) {

                            if (fixtureResult.homeTeamScore === "" || fixtureResult.awayTeamScore === "") {
                                // if any of the fixtures hasnt been played yet, stop checking results
                                alert("någon match saknar fortfarande resultat!")
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
                    alert("alla rätt! bonus!")
                }
                console.log(score);
                // score is number of right guesses x timeLeftOnMyLastRound.
                score = score * timeLeftOnMyLastRound * 1000;
                //  console.log(score);
                console.log(score);

                if (score > highScore) {
                    setHighScore(score)
                }


                // här ska vi rätta, sätta poäng och visa vilka gissningar som var rätt och fel på något vis,
                // OBS I PICKS ARRAY ÄR INDEX 0 TIDEN SOM FANNS KVAR OCH INTEX 1 SJÄLVA VALEN
                // sen ska vi  rensa förra rondens picks setYourFinalPicksForThisMatchDay([]); och köra fetchFixtures som hämtar nästa match


                // MÅSTE OCKSÅ KOLLA ATT ÄVEN OM MATCHDAY FINNS I RESULTATEN FRÅN API ÄR DET INTE SÄKERT ATT ALLA MATCHER HUNNIT SPELAS ÄNNU, OM NÅGON MATCH SAKNAR RESULTAT SÅ MÅSTE AVBRYTA OCH VÄNTA PÅ ALLA RESULTAT 

            }

        }

    }

    function fetchResults() {


        console.log("hämtar resultat från api");

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

            checkResults();
            fetchFixtures();

        }).catch(function (error) {
            console.error(error);
        });

    }


    function fetchFixtures() {

        console.log("hämtar matcher från api");

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

            if (yourLastPlayedMatchDay < nextMatchD) {
                alert("finns nytt att spela")
            }

        }).catch(function (error) {
            console.error(error);
        });

    }

    return (<main>

        {/* <button onClick={fetchResults}>fetch results</button>
        <button onClick={fetchFixtures}>fetch fixtures</button> */}

        <div className="logo">
            <LinearGradient className="braggy animate__animated animate__zoomIn animate__fast" gradient={['to left', '#17acff ,#ff68f0']}>
                <span>BRAGGY</span>
                {/* <TypeAnimation
                    sequence={[
                        'BRAGGY',
                        2000,
                    ]}
                    wrapper="div"
                    cursor={false}
                    repeat={Infinity}
                    style={{ fontSize: '4rem', letterSpacing: "5px", fontWeight: "300" }}
                /> */}
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
                            fontStyle={{ fontSize: 32, color: "#caeaf8d2", fontWeight: "300", textShadow: "1px 1px 5px #fff, 0px 1px 10px rgba(255, 104, 240, 0.255)", letterSpacing: "5px" }}
                            configs={[
                                { "mass": 1, "tension": 130, "friction": 40 }, { "mass": 2, "tension": 140, "friction": 40 }, { "mass": 3, "tension": 130, "friction": 40 }
                            ]}
                        ></AnimatedNumbers>
                    </span>
                </div>

            </section>
        </div>

        {yourLastPlayedMatchDay !== nextMatchD &&
            <div className="animate__animated animate__fadeIn">
                <button className="btn animate__animated animate__pulse animate__infinite	infinite" onClick={() => { navigate("/game") }} aria-label="start button"><GiPlayButton className='btnIcon'></GiPlayButton></button>
            </div>
        }

        {yourLastPlayedMatchDay === nextMatchD &&
            <div>
                <span className="information animate__animated animate__fadeIn">We are still waiting for the results to come in from your last played round (Matchday: {yourLastPlayedMatchDay}).
                    Check back again soon!
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