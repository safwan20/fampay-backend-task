# Fampay backend task


## To run the service follow below steps.

1. `cd backend-cron-job` and run `docker compose up` this will spin up `postgres database`.
2. `cd backend-youtube-api` and run `docker compose up` this will enable the `API's`.

**Note**: The service are running on docker if want to run service locally setup `.env` file in both the service by following `envsample` file.

## Get the youtube videos list.

    REQUEST GET http://localhost:3000/api/youtube/?publishedat=<publishedat>
    
## Search the youtube videos based on title and description.

     REQUEST GET http://localhost:3000/api/search/youtube?title=<title>&description=<description>
     
     
 
