import { useNavigate } from "react-router-dom";
import useLocalStorage from "../useLocalStorage";
import { useEffect, useCallBack } from "react";
import axios from "axios";
import { GiPlayButton } from "react-icons/gi";
import { FaGithubSquare } from "react-icons/fa";
import { LinearGradient } from 'react-text-gradients';
import { TypeAnimation } from 'react-type-animation';
import { Player } from '@lottiefiles/react-lottie-player';

export function Home() {

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

    const apiKey = process.env.REACT_APP_API_KEY;

    let allMatchdays = [];
    let allResultsArray = [];

    let latestMatchday = "";
    let nextMatchday = "";

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

    }, [checkResults, fetchResults, timeOfLastResultsFetchFromApi]);


    function checkResults() {


        console.log("checkresults");
        console.log("matchdays från rättningen", matchdays);

        if (yourFinalPicksForThisMatchDay.length === 0) {
            //alert("finns inget att rätta")
            console.log("finns inget att rätta eftersom du aldrig gjort dina picks");
            return
        }

        console.log("finns något att rätta eftersom du åtminstånde gjort dina picks tidigare");
        for (let i = 0; i < matchdays.length; i++) {
            const matchday = matchdays[i];
            console.log("i loop inne i checkresults, matchday: ", matchday);

            if (Number(matchday.replace(/\D/g, '')) === Number(yourLastPlayedMatchDay)) {
                console.log("vi har resultat för matchday: ", matchday + " och du har spelat denna rond säger du: " + yourLastPlayedMatchDay);
                console.log("oj oj oj vi har en match på index: ", i);
                console.log("det här är vad vi ska jämföra mot, det är facit", results[i]);
                console.log("här är valen du gjorde", yourFinalPicksForThisMatchDay[1]);
                console.log("och hur många sekunder du hade över", yourFinalPicksForThisMatchDay[0]);

                // vi ska jämföra results[i] med yourFinalPicksForThisMatchDay[1]

                //yourFinalPicksForThisMatchDay[0] är tiden som var kvar när man spelade som ska multipliceras för rätt poäng

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
            <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                <TypeAnimation
                    sequence={[
                        'BRAGGY',
                        2000,
                    ]}
                    wrapper="div"
                    cursor={false}
                    repeat={Infinity}
                    style={{ fontSize: '4rem', letterSpacing: "5px", fontWeight: "300" }}
                />
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
                    style={{ fontSize: '1rem', letterSpacing: "2px", fontWeight: "300" }}
                />
            </LinearGradient>
        </div>

        {yourLastPlayedMatchDay !== nextMatchD &&
            <button className="btn animate__animated animate__pulse animate__infinite	infinite" onClick={() => { navigate("/game") }}  aria-label="start button"><GiPlayButton className='btnIcon'></GiPlayButton></button>
        }

        {yourLastPlayedMatchDay === nextMatchD &&
            <div>
                <span className="information animate__animated animate__fadeIn">We are still waiting for the results to come in from your last played round (Matchday: {yourLastPlayedMatchDay}).
                    Check back again soon!
                </span>
            </div>
        }

        <div className="swipesContainer">
            <div  aria-label="animated icon explaining swipe left mechanic for playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>swipe left for hometeam win</LinearGradient>
                <Player className="swipeIcon"
                    autoplay
                    loop
                    src="https://assets1.lottiefiles.com/packages/lf20_vmzgsolp.json"
                >
                </Player>
            </div>

            <div  aria-label="animated icon explaining swipe up mechanic for playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>swipe up for draw</LinearGradient>
                <Player className="swipeUpIcon"
                    autoplay
                    loop
                    src="https://assets7.lottiefiles.com/packages/lf20_tl8tqdw9.json"
                >
                </Player>
            </div>

            <div  aria-label="animated icon explaining swipe right mechanic for playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>swipe right for awayteam win</LinearGradient>
                <Player className="swipeIcon"
                    autoplay
                    loop
                    src="https://assets7.lottiefiles.com/packages/lf20_tl8tqdw9.json"
                >

                </Player>
            </div>

            <div  aria-label="animated icon explaining time limit when playing Braggy">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>Hurry! You have 30 seconds</LinearGradient>
                <Player className="timerIcon"
                    autoplay
                    loop
                    src="https://assets1.lottiefiles.com/packages/lf20_4yofoa5q.json"
                >

                </Player>
            </div>
        </div>

        <footer>
            <a href="https://github.com/GamerShabandari" target="_blank" rel="noreferrer" aria-label="link to Gamer Shabandari Github page">
                <LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                    Gamer Shabandari ©
                </LinearGradient>
            </a>
        </footer>
    </main>)
}