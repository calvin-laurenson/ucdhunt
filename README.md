# UCD Hunt

## Overview
This project was created for the 2021-2022 Emerson/Da Vinci 9th grade field trip to the UC Davis campus. The game was a scavenger hunt laid out on a bingo board where you could upload an image for each tile. It was scored by the amount of bingo completions of each teams board. After uploading an image it could be reviewed by an authorized person to be confirmed or rejected.

## Tech
The backend is in Python using FastAPI. It also uses SQLModel with PostgreSQL for the database. The frontend used React Native (Expo, TypeScript) with `react-navigation` for navigation and `react-query` with `axios` for data fetching. Images were stored using Cloudflare Images and uploaded using Direct Creator Upload. The whole stack was deployed on Google Cloud Platform.

## Note
This project was created in ~4 days from initially hearing about the idea to deploying it to the cloud.