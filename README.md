#Update March 2023
Backend no longer persistent do to cost, created users/logins and posted highscores will not persist over time.

# Braggy
This mobile game was made for my thesis assignment at Medieinstitutet. Its a game where you guess the results of all the fixtures in the upcoming round of the Premier League.

- You swipe the card to the side you think will win the fixture, and swipe up if you think it will be a draw.
- You have 30 seconds to guess all the fixtures, hurry up and try to guess them all right and chase a highscore to brag about to your friends!

I wanted to focus on the frontend part during this assignment so all the data storage is handled via LocalStorage clientside.

# Dependencies/packages
- react-lottie-player
- animate.css
- axios
- dotenv
- framer-motion
- react-animate-numbers
- react-countdown
- react-icons
- react-tinder-card
- react-type-animation

# API
https://rapidapi.com/GiulianoCrescimbeni/api/football98/

# Installation
To run localy, clone repo, in root directory start a console and type "npm i" to install all dependencies and then type "npm start" to start.
application will run at localhost:3000

# Good to know
- Since the game is dependent of Premier League matchdays to be played before the player can se the results & history of played game/games I have implemented functions for faking a result for demonstration purposes.
To test a fake result there are two buttons at the bottom of the page(commented out in the code for now).
- first the player needs to play a round, then when back at main page click the "1: Fake" button.
- then click the "2: Check" button to simulate UI/UX when results are in.

- The API used has had some issues during development where some fixtures and results where lost and caused issues with app-logic. To address this there is a function that supplies fake data if the API is having problems. 
