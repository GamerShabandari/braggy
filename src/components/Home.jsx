import { useNavigate } from "react-router-dom";
import useLocalStorage from "../useLocalStorage";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { GiPlayButton } from "react-icons/gi";
import { TfiCheck, TfiClose } from "react-icons/tfi";
import { GrUserAdd, GrLogin } from "react-icons/gr";
import { MdExpandMore } from "react-icons/md";
import { Player } from '@lottiefiles/react-lottie-player';
import AnimatedNumbers from "react-animated-numbers";
import { motion, AnimatePresence } from "framer-motion";
import { fakeFixturesForNow } from "../fakeData";



export function Home() {

    const navigate = useNavigate();
    const apiKey = process.env.REACT_APP_API_KEY;
    const logoRef = useRef()

    const [showLeaderboard, setShowLeaderboard] = useState(false)
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
    const [leaderboard, setLeaderboard] = useState([])
    const [showLoginField, setShowLoginField] = useState(false)
    const [showCreateLoginField, setShowCreateLoginField] = useState(false)
    const [createdUsername, setCreatedUsername] = useState("");
    const [createdPassword, setCreatedPassword] = useState("");
    const [createUserError, setCreateUserError] = useState(false)
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showError, setShowError] = useState(false);
    const [isLoadingApiData, setIsLoadingApiData] = useState(false)
    const [resultsUiScore, setResultsUiScore] = useState(0)
    const [resultsUiAmountOfCorrectAnswers, setResultsUiAmountOfCorrectAnswers] = useState(0)
    const [guessedAllRight, setGuessedAllRight] = useState(false)
    const [hiscoreAchievment, setHiscoreAchievment] = useState(false)
    const [fixturesArrayForResultsUI, setFixturesArrayForResultsUI] = useState([])
    const [showHistory, setShowHistory] = useState(false)
    const [chosenHistoryRoundOfFixtures, setChosenHistoryRoundOfFixtures] = useState([])
    const [showHighScoreSavedUI, setShowHighScoreSavedUI] = useState(false)

    /// LOCALSTORAGE /////
    const [historyOfPlayedRounds, setHistoryOfPlayedRounds] = useLocalStorage("historyOfPlayedRounds", []);
    const [results, setResults] = useLocalStorage("results", [""]);
    const [matchdays, setMatchdays] = useLocalStorage("matchdays", [""]);
    const [upcomingFixtures, setUpcomingFixtures] = useLocalStorage("upcomingFixtures", []);
    const [latestMatchD, setLatestMatchD] = useLocalStorage("latestMatchday", 0);
    const [nextMatchD, setNextMatchD] = useLocalStorage("nextMatchday", 0);
    const [yourLastPlayedMatchDay, setYourLastPlayedMatchDay] = useLocalStorage("yourLastPlayedMatchDay", "");
    const [matchdayToPlay, setMatchdayToPlay] = useLocalStorage("matchdayToPlay", []);
    const [yourFinalPicksForThisMatchDay, setYourFinalPicksForThisMatchDay] = useLocalStorage("yourFinalPicksForThisMatchDay", []);
    const [highScore, setHighScore] = useLocalStorage("highScore", 0);
    const [showYourResultsUI, setShowYourResultsUI] = useLocalStorage("showYourResultsUI", false);
    const [userId, setUserId] = useLocalStorage("userId", "");
    const [myName, setMyName] = useLocalStorage("myName", "");
    const [loggedIn, setLoggedIn] = useLocalStorage("loggedIn", false);

    let allMatchdays = [];
    let allResultsArray = [];
    let latestMatchday = "";
    let nextMatchday = "";

    useEffect(() => {
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


                    if (username !== "" && userId !== "") {
                        postHighscoreToBackend(score)
                    }

                }

                // UI to display results and score
                setResultsUiScore(score)
                setFixturesArrayForResultsUI([...tempArrayToUpdateStateArray])
                // setShowYourResultsUI(true);
                // // clear previous play and let user play next round
                // setYourFinalPicksForThisMatchDay([]);
            }

        }

    }

    function postHighscoreToBackend(score) {

        let newScoreToPost = {
            username: myName,
            highscore: score
        }

        axios.post("https://braggy-backend.onrender.com/postHighscore/" + userId, newScoreToPost, { headers: { "content-type": "application/json" } })
            .then(response => {
                console.log(response.data);
                setShowHighScoreSavedUI(true)
                setTimeout(() => {
                    setShowHighScoreSavedUI(false)
                }, 3000)
            })
            .catch(error => {
                console.log(error);
                alert("server error")
            })

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
        // // before closing and cleaning up, we want to structure and save this round to players history in thisRoundToBeSavedToYourHistory[]
        // // structure is, index 0 = round played (yourLastPlayedMatchDay), index 1 is final score (resultsUiScore), index 2 is all fixtures fixturesArrayForResultsUI
        let historyArray = [...historyOfPlayedRounds]
        let thisRoundToBeSavedToYourHistory = [];
        thisRoundToBeSavedToYourHistory.push(yourLastPlayedMatchDay)
        thisRoundToBeSavedToYourHistory.push(resultsUiScore)
        thisRoundToBeSavedToYourHistory.push(fixturesArrayForResultsUI)
        historyArray.push(thisRoundToBeSavedToYourHistory)
        setHistoryOfPlayedRounds([...historyArray])
        setResultsUiScore(0)
        setFixturesArrayForResultsUI([])
        setShowYourResultsUI(false)
        setGuessedAllRight(false)
        setHiscoreAchievment(false)
    }

    function getLeaderboard() {

        console.log("hämtar leaderboard");
        setLoadingLeaderboard(true)
        setShowLeaderboard(true)

        axios.get("https://braggy-backend.onrender.com/leaderboard/")
            .then(response => {
                console.log("response", response);
                console.log("data", response.data);
                setLoadingLeaderboard(false)
                setLeaderboard([...response.data])
            })
    }

    // update username state-variable when creating a new user
    function handleCreatedNameInput(e) {
        setCreatedUsername(e.target.value)
        if (createUserError) {
            setCreateUserError(false)
        }
    }
    // update password state-variable when creating a new user
    function handleCreatedPasswordInput(e) {
        setCreatedPassword(e.target.value)
        if (createUserError) {
            setCreateUserError(false)
        }
    }

    function createAccount() {
        if (createdUsername.length > 5 && createdPassword.length > 5) {
            setCreateUserError(false);
            let newCreatedUser = {
                username: createdUsername,
                password: createdPassword,
            }
            axios.post("https://braggy-backend.onrender.com/createUser", newCreatedUser, { headers: { "content-type": "application/json" } })
                .then(response => {
                    console.log(response.data);
                    setCreatedUsername("");
                    setCreatedPassword("");
                    setShowLoginField(true);
                    setShowCreateLoginField(false)

                })
                .catch(error => {
                    console.log(error);
                    alert("server error")
                })
        }
        else {
            setCreateUserError(true);
        }
    }

    function handleNameInput(e) {
        setUsername(e.target.value)
        if (showError) {
            setShowError(false)
        }
    }
    // handle input state for login
    function handlePasswordInput(e) {
        setPassword(e.target.value)
        if (showError) {
            setShowError(false)
        }
    }

    // login user, if success change all relevant state-variables and save userid to localstorage, else show error 
    function login() {
        let usersLogin = {
            username: username,
            password: password
        }
        axios.post("https://braggy-backend.onrender.com/login", usersLogin, { headers: { "content-type": "application/json" } })
            .then(response => {

                if (response.data.loggedIn === true) {
                    setUserId(response.data.id);
                    setMyName(username);
                    setLoggedIn(true);
                    showCreateLoginField(false)
                    showLoginField(false)
                    setShowError(false);
                    setUsername("");
                    setPassword("");

                } else {
                    setShowError(true);
                }
            })
            .catch(error => {
                console.log(error);
                alert("server error")
            })
    }

    function logOut() {
        setUserId("");
        setMyName("");
        setLoggedIn(false);
    }


    // fixt [0] = roundNr ----- [1] = points ----- [2] = fixtures
    let historyListHtml = historyOfPlayedRounds.map((fixt, i) => {

        return (
            <motion.div className="historyListCard"
                onClick={() => { setChosenHistoryRoundOfFixtures([...fixt[2]]) }}
                key={i}
                initial={{ opacity: 0, y: "-50%", scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                    opacity: 0,
                    y: "-50%",
                    scale: 0,
                    transition: { duration: 0.1 }
                }}
                transition={{
                    ease: "easeInOut",
                    duration: 0.1,
                    delay: i * 0.1
                }}>
                <div className="historyListMatchdayTitle">Matchday: {fixt[0]}</div>
                <div>{fixt[1]}p</div>
                <div>
                    <MdExpandMore className="more"></MdExpandMore>
                </div>
            </motion.div>
        )
    })

    let historyDetailsHtml = chosenHistoryRoundOfFixtures.map((fixt, i) => {
        return (
            <motion.div className="resultListFixture"
                key={i}
                initial={{ opacity: 0, y: "-50%", scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                    opacity: 0,
                    y: "-50%",
                    scale: 0,
                    transition: { duration: 0.1 }
                }}
                transition={{
                    ease: "easeInOut",
                    duration: 0.2,
                    delay: i * 0.2
                }}
            >
                <div className="hometeamContainer">
                    <img src={"./img/" + fixt.homeTeam + ".png"} draggable={false} alt="hometeam logo" />
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
                </div>
            </motion.div>
        )
    })

    let resultListHtml = fixturesArrayForResultsUI.map((fixt, i) => {
        return (
            <motion.div className="resultListFixture" key={i}
                initial={{ opacity: 0, y: "-50%", scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                    opacity: 0,
                    y: "-50%",
                    scale: 0,
                    transition: { duration: 0.1 }
                }}
                transition={{
                    ease: "easeInOut",
                    duration: 0.2,
                    delay: i * 0.2
                }}
            >
                <div className="hometeamContainer">
                    <img src={"./img/" + fixt.homeTeam + ".png"} draggable={false} alt="hometeam logo" />
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
                </div>
            </motion.div>
        )
    })

    let leaderboardListHtml = leaderboard.map((listRow, i) => {
        return (
            <motion.div className="resultListFixture" key={i}
                initial={{ opacity: 0, y: "-50%", scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                    opacity: 0,
                    y: "-50%",
                    scale: 0,
                    transition: { duration: 0.1 }
                }}
                transition={{
                    ease: "easeInOut",
                    duration: 0.2,
                    delay: i * 0.2
                }}
            >
                <div className="leaderboardRow">
                    <div>{listRow.username}</div>
                    <div>{listRow.highscore}</div>
                </div>
            </motion.div>
        )
    })

    return (<motion.main
        key="homeMain"
        initial={{ opacity: 0, x: "-200%" }}
        animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
        exit={{
            opacity: 0,
            x: "-200%",
            transition: { duration: 0.2, ease: "easeInOut" }
        }}
    >
        <AnimatePresence>
            {showHistory &&
                <motion.div
                    initial={{ opacity: 0, y: "-50%" }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
                    exit={{
                        opacity: 0,
                        y: "-50%",
                        transition: { duration: 0.2, ease: "easeInOut" }
                    }}
                    className="historyContainer">
                    <div onClick={() => { setShowHistory(false); setChosenHistoryRoundOfFixtures([]); logoRef.current?.scrollIntoViewIfNeeded(); }}>
                        <Player
                            className="closeHistorybtn"
                            autoplay
                            loop
                            src="https://assets10.lottiefiles.com/packages/lf20_dxwu3xu0.json"
                        >
                        </Player>
                    </div>
                    <div className="historyRounds">
                        {historyListHtml}
                    </div>
                    {historyDetailsHtml.length > 0 &&
                        <motion.div
                            initial={{ opacity: 0, y: "-50%" }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
                            exit={{
                                opacity: 0,
                                y: "-50%",
                                transition: { duration: 0.2, ease: "easeInOut" }
                            }}
                            className="historyDetail"
                        >
                            {historyDetailsHtml}
                            <div onClick={() => { setShowHistory(false); setChosenHistoryRoundOfFixtures([]); logoRef.current?.scrollIntoViewIfNeeded(); }}>
                                <Player
                                    className="closeHistorybtn"
                                    autoplay
                                    loop
                                    src="https://assets10.lottiefiles.com/packages/lf20_dxwu3xu0.json"
                                >
                                </Player>
                            </div>
                        </motion.div>
                    }
                </motion.div>}
        </AnimatePresence>

        <div ref={logoRef} className="logo">
            <motion.svg className="svg animate__animated animate__fadeIn" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0)"><g id="SVGRepo_bgCarrier" strokeWidth="0">
            </g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8.5 12H13C14.3807 12 15.5 10.8807 15.5 9.5C15.5 8.11929 14.3807 7 13 7H8.5V12ZM8.5 12H14C15.3807 12 16.5 13.1193 16.5 14.5C16.5 15.8807 15.3807 17 14 17H8.5V12ZM7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="#FB2576" strokeWidth="0.72" strokeLinecap="round" strokeLinejoin="round"></path> </g>
            </motion.svg>

            <div className="logotext animate__animated animate__fadeInUp">
                braggy
            </div>
        </div>

        <AnimatePresence mode="wait">
            {!loggedIn &&
                <motion.div
                    key="loginContainer"
                    initial={{ opacity: 0, y: "-50%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                        opacity: 0,
                        y: "-50%",
                        transition: { duration: 0.1 }
                    }}
                    className="loginContainer">
                    <span>Sign in to post your highscore to leaderboard</span>

                    <div onClick={() => { setShowLoginField(!showLoginField); setShowCreateLoginField(false) }}>
                        <Player
                            className="showHistorybtn"
                            autoplay
                            loop
                            src="https://assets10.lottiefiles.com/packages/lf20_dxwu3xu0.json"
                        >
                        </Player>
                    </div>

                    <AnimatePresence mode='wait'>

                        {showLoginField &&
                            <motion.div
                                key="loginField"
                                initial={{ opacity: 0, y: "-50%" }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    y: "-50%",
                                    transition: { duration: 0.1 }
                                }}
                                className="loginField">
                                <input type="text" placeholder="username" value={username} onChange={handleNameInput} />
                                <input type="password" placeholder="password" value={password} onChange={handlePasswordInput} />
                                <AnimatePresence mode="wait">
                                    {showError &&
                                        <motion.div
                                            key="loginError"
                                            initial={{ opacity: 0, y: "-50%" }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{
                                                opacity: 0,
                                                y: "-50%",
                                                transition: { duration: 0.1 }
                                            }}
                                            className="error">
                                            Incorrect login, try again.
                                        </motion.div>}
                                </AnimatePresence>
                                <button className="secondaryBtn" onClick={login}>Sign in</button>

                                <button className="secondaryBtn" onClick={() => { setShowLoginField(false); setShowCreateLoginField(true) }}>
                                    create login
                                </button>
                            </motion.div>
                        }


                        {showCreateLoginField &&
                            <motion.div
                                key="createLoginField"
                                initial={{ opacity: 0, y: "-50%" }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    y: "-50%",
                                    transition: { duration: 0.1 }
                                }}
                                className="loginField">
                                <input type="text" placeholder="username (atleast 6 characters)" value={createdUsername} onChange={handleCreatedNameInput} />
                                <input type="password" placeholder="password (atleast 6 characters)" value={createdPassword} onChange={handleCreatedPasswordInput} />

                                <button className="secondaryBtn" onClick={() => { createAccount(); }}>save account</button>
                                <AnimatePresence mode="wait">
                                    {createUserError &&
                                        <motion.div
                                            key="createUserError"
                                            initial={{ opacity: 0, y: "-50%" }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{
                                                opacity: 0,
                                                y: "-50%",
                                                transition: { duration: 0.1 }
                                            }}
                                            className="error">
                                            Username & password must be atleast 6 characters.
                                        </motion.div>}
                                </AnimatePresence>
                            </motion.div>
                        }
                    </AnimatePresence>

                </motion.div>
            }
        </AnimatePresence>

        <AnimatePresence mode="wait">
            {loggedIn &&
                <motion.div
                    key="logedInUi"
                    initial={{ opacity: 0, y: "-50%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                        opacity: 0,
                        y: "-50%",
                        transition: { duration: 0.1 }
                    }}
                    className="loggedIn">
                    Logged in as {myName}.
                    <button onClick={logOut}>logout</button>
                </motion.div>
            }
        </AnimatePresence>

        <section>
            <div className="scoreContainer  animate__animated animate__fadeIn">
                <Player
                    className="highScoreAnimation"
                    autoplay
                    loop
                    src="https://assets4.lottiefiles.com/packages/lf20_rZQs81.json"
                >
                </Player>
                <span className="highscore">
                    High score:
                    {!isLoadingApiData && <>
                        <AnimatedNumbers
                            animateToNumber={highScore}
                            fontStyle={{ fontSize: 32, color: "#FB2576", fontWeight: "300", letterSpacing: "5px" }}
                            configs={[
                                { "mass": 1, "tension": 130, "friction": 40 }, { "mass": 2, "tension": 140, "friction": 40 }, { "mass": 3, "tension": 130, "friction": 40 }
                            ]}
                        ></AnimatedNumbers>
                    </>}
                    <button className="btn" onClick={() => { getLeaderboard();  logoRef.current?.scrollIntoViewIfNeeded(); }}>view leaderboard</button>
                    <AnimatePresence mode="wait">
                        {showHighScoreSavedUI &&
                            <motion.div
                                key="createUserError"
                                initial={{ opacity: 0, y: "-50%" }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    y: "-50%",
                                    transition: { duration: 0.1 }
                                }}
                                className="error"
                            >
                                Highscore posted to leaderboard.
                            </motion.div>

                        }
                    </AnimatePresence>
                </span>
            </div>
        </section>

        {
            historyOfPlayedRounds.length > 0 &&
            <div className="information">
                <div onClick={() => { setShowHistory(true); logoRef.current?.scrollIntoViewIfNeeded(); }}>
                    <Player
                        className="showHistorybtn"
                        autoplay
                        loop
                        src="https://assets10.lottiefiles.com/packages/lf20_dxwu3xu0.json"
                    >
                    </Player>
                </div>
                <span className="animate__animated animate__fadeIn">
                    Click to view all your finished matchdays including score & details
                </span>
            </div>
        }

        {
            isLoadingApiData &&
            <div className="loaderContainer animate__animated animate__fadeIn">
                <h3>
                    Loading
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

        <AnimatePresence>
            {showYourResultsUI &&
                <motion.section
                    initial={{ opacity: 0, y: "-50%" }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
                    exit={{
                        opacity: 0,
                        y: "-50%",
                        transition: { duration: 0.2, ease: "easeInOut" }
                    }}
                    className="resultsContainer">

                    <div className="resultsUIinformation">

                        <div className="resultsScoreDiv">
                            <strong>Results are in!</strong>
                            {resultsUiAmountOfCorrectAnswers} Correct guesses
                        </div>

                        <div className="resultsScoreDiv">Score: {resultsUiScore}p</div>
                        {hiscoreAchievment &&
                            <div className="resultsHighscoreDiv">
                                <Player
                                    className="resultsAnimations"
                                    autoplay
                                    loop
                                    src="https://assets4.lottiefiles.com/packages/lf20_rZQs81.json"
                                >
                                </Player>

                                <p>New high score!</p>

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
                                <p>Bonus! 10/10 correct</p>

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
                    <div onClick={() => { closeResultsUI(); logoRef.current?.scrollIntoViewIfNeeded(); }}>
                        <Player
                            className="closeHistorybtn"
                            autoplay
                            loop
                            src="https://assets10.lottiefiles.com/packages/lf20_dxwu3xu0.json"
                        >
                        </Player>
                    </div>
                </motion.section>
            }
        </AnimatePresence>

        {
            yourFinalPicksForThisMatchDay.length === 0 && matchdayToPlay.length !== 0 &&
            <div className="animate__animated animate__fadeIn">
                <button className="btn" onClick={() => { navigate("/game") }} aria-label="start button">
                    <GiPlayButton className='btnIcon'></GiPlayButton>
                </button>
            </div>
        }

        {
            yourFinalPicksForThisMatchDay.length !== 0 &&
            <div className="information">
                <Player
                    className="highScoreAnimation"
                    autoplay
                    loop
                    src="https://assets8.lottiefiles.com/packages/lf20_xFpiNt.json"
                >
                </Player>

                {fixturesArrayForResultsUI.length === 0 && <>
                    <span className="animate__animated animate__fadeIn">
                        We are still waiting for the results to come in from your last played round. <br /> Check back after <span className="Ddate">{yourFinalPicksForThisMatchDay[2]}</span> when the final fixture of this matchday will be played.
                    </span>
                </>}

                {fixturesArrayForResultsUI.length > 0 && <>
                    <span className="animate__animated animate__fadeIn">
                        The results are now in from your last played round.
                    </span>
                    <button onClick={() => { setYourFinalPicksForThisMatchDay([]); setShowYourResultsUI(true); }} className="btn">Check 'em out</button>
                </>}
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

        <AnimatePresence>
            {showLeaderboard &&
                <motion.div
                    className="leaderboardContainer"
                    key="leaderboard"
                    initial={{ opacity: 0, x: "+200%" }}
                    animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
                    exit={{
                        opacity: 0,
                        x: "+200%",
                        transition: { duration: 0.2, ease: "easeInOut" }
                    }}
                >
                    {loadingLeaderboard &&
                        <div>
                            <h3>Loading</h3>
                        </div>
                    }

                    {!loadingLeaderboard &&
                        <div>
                            <h1>Här är listan sen</h1>
                            {leaderboardListHtml}
                        </div>
                    }

                    <button onClick={() => { setShowLeaderboard(false) }}>Close</button>
                </motion.div>
            }
        </AnimatePresence>

        <footer>
            <a className="animate__animated animate__fadeInUp" href="https://github.com/GamerShabandari" target="_blank" rel="noreferrer" aria-label="link to Gamer Shabandari Github page">
                Gamer Shabandari ©
            </a>
        </footer>

        {/* -- development feature, test with fake results. Not for regular users -- 
        <div className="devBtnContainer">
            <button className="btn" onClick={insertFakeResult}>1: Fake</button>
            <button className="btn" onClick={() => { logoRef.current?.scrollIntoViewIfNeeded(); checkResults() }}>2: Check</button>
        </div> */}
    </motion.main >)
}