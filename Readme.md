# Fampay backend task


## To run the service follow below steps.

1. `cd backend-cron-job` and run `docker compose up` this will spin up `postgres database`.
2. `cd backend-youtube-api` and run `docker compose up` this will enable the `API's`.

**Note**: The service are running on docker if want to run service locally setup `.env` file in both the service by following `envsample` file.

## Get the youtube videos list.

    REQUEST GET http://localhost:3000/api/youtube/?publishedat=<publishedat>
    
    RESPONSE { data: [...], key: <publishedat> }
    
    publishedat has to be used for the subsequent request (key based pagination).
    
## Search the youtube videos based on title and description.

     REQUEST GET http://localhost:3000/api/search/youtube?title=<title>&description=<description>
     
     RESPONSE { titleResult: [...], descriptioResult: [...] }
     
## What can be improved?

1. cursor based indexing can be handy here.
2. unit and integration test can be written.
3. token key can used though the request is idompotent still the youtube api that is used in backend have some quota limit.
4. K8's can be used for scalabilty as now only one container is used for the service.
5. proper frontend can be implemented here for filtering, listing, searching and sorting.
6. load testing can be done.
7. currently javascript `setInterval` webapi is used to run in every interval but in real time production `aws lambda` or other serverless function can be used as a cron job.
8. the services can be deployed on `ec2` or other cloud service with better scaling with kubernetes.
