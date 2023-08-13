# Notes

## Dependencies required

* TypeORM
* MySQL2
* UUID generator (or maybe use crypto)
* Class Validator
* Class Transformer
* @nestjs/schedule
* @types/cron

## Steps
* Setting up basic requirements
    * Endpoints
        * `/house` - POST
        * `/house/bulk` - POST
        * `/house/<ubid>` - PATCH
        * `/house/<ubid>/occupancy` - POST
        * `/house/<ubid>` - GET
    * Entity
        * Birdhouse
            * ubid
            * log
            * lat
        * ResidenceHistory
            * birds
            * eggs

## Task 1: Save bird house
* Generate `UUID` for `ID`
* Generate `UUID` for `UBID`
* Store log and lat
* Trigger TypeORM function to create
* Surround typeorm create with `try` `catch` block
* Return result with the resonse dto

## Task 2: Update information for a birdhouse
* Add authentication header `X-UBID: <X-UBID>`
* Make sure UBID is a valid UUID
* Check if the object is not empty
* Check if a house exists against a given UBID
* Update the `updatedAt` date
* Update the record, surround it with try catch
* Return the updated record

## Task 3: Add to occupancy data history for a birdhouse
* Add authentication header `X-UBID: <X-UBID>`
* Make sure UBID is a valid UUID
* Check if the object is not empty
* Check if a house exists against a given UBID
* Update the `updatedAt` date
* Update the record, surround it with try catch
* Return the updated record

## Thought process

### Stage 1
#### Task 1

I have created two DTOs. One is responsible for request and the other is responsible for response. I could have used the entity for response, but then I would need to have either deleted the createdAt and updatedAt values from the object, or I need to use the `@Exclude()` annotation from TypeORM. Deleting values from an object has its own performance impact, and I do not want to use `@Exclude()` because if I want to write another API in the future that needs access to those values, I would need to do a rewrite.

#### Task 2

I am getting `ubid` from params. I need to make sure that the id is a valid UUID. I am using `isUUID()` to check it. This will help me avoid a DB call if the id is not a valid UUID.
Second thing I am checking is making sure there is at least one key value in the object. If the object is empty, then there is no point of making an update call to the DB.
Next I am checking if an entity against a given ubid exists. If it doesn't, then throw an error.
If there does exist a record, then we will need to update the `updatedAt` record. I am currently passing the dto variable `updateBirdhouseDto` to the `.update()` function. So, in other to pass the `updatedAt` variable, I am setting it inside the dto. I am also adding the annotion `@IsEmpty()` so only the backend can set the `updatedAt` value.
The `.update()` is in a `try catch` block. Making a DB query to get the updated result and returning it.

#### Task 3

Similar to Task 2.

#### Task 4

Finding a house. Only select the required fileds. If the house does not exist, throw an error. If it does, return it.

Base minimum requirements have been completed

### Stage 2

* Work on X-UBID middleware

I have created an empty global list (which serves as in in-memory db) called `soldBirdhouses`. It gets filled when the application starts, and when new house gets registered.
There is a loop hole: one can pass `x-ubid` for house A, but `ubid` in params can belong to house B.

### Stage 3

* After messaging Nick, I realized my original understanding was not correct. So, I have made some modifications:
    * We have another entity called ResidenceHistory. This will keep track of when residency in a birdhouse changed, and also keep track of history
    * Updated the create/post request to create both a birdhouse and its residence. There is a drawback to my approach: the query isn't transactional. So if the query to create residence fails, the birdhouse will still exist.
    * Updating the updateOccupancy API. My life could have been a could have been a lot easier if 'id' and 'ubid' were the same. However, I am unsure if that is against the requirements.
    * Updated the Get request as well
    * Since I noticed all end points more or less return the same object, I decided to make a function called `birdhouseResponse` which takes in two variables, one of type `Birdhouse` and the other of type `ResidenceHistory`. This will help in cut down in number of lines of code.
    * I was previously using an `if` condition to check if the incoming `ubid` was a valid `uuid`. But since, all `ubid`s have to pass through a middleware and only those that exist in our system are allowed to pass through, I decided to remove the `if` statement.
    * During testing I noticed that `longitude` and `latitude` were not being propely saved, as typeorm would cut off any number after the decimal. I made some changes to the decorator in Birdhouse entity, taking code from here: `https://github.com/typeorm/typeorm/issues/873#issuecomment-424643086`

### Stage 4

* Adding logs. I think this will be a simple task, hence I am doing it before the CRON job task, and the authentication task. 
* I am using NestJS's built in Logger. But there has to be a better way.
* There is a better way: Winston. Maybe I will use it next time on a larger application.
* Also created an API which returns residence history.

* I do not fully understand "Each birdhouse has a registration number, only real registration numbers can talk with these endpoints. Registration numbers/birdhouses can be added in bulk to the API. (very simple authentication)"

### Stage 5

* Need to add cron job to prune birdhouses that have not received an update in a year. I haven't implemented a cron job before this, so it will be a good learning experience for me.
* Following `https://docs.nestjs.com/techniques/task-scheduling`. Installing `npm install --save @nestjs/schedule` and `npm install --save-dev @types/cron`
* Added a cron job function called `pruneOutdatedBirdhouses`. It runs once everyday at midnight.
* I am getting a list of all birdhouses, grabbing their `id` and `updatedAt`.
* Then I am calculating if difference between `updatedAt` and current date is more than 1 year (or 365 * 24 * 60 * 60 * 1000 milliseconds). If it is, then I add its `id` to a list. Then I go through `residenceHistory` table, find all entities that relate to the list of `id`s in list. Data is ordered by `createdAt` variable. Then I check the first entity and check again if the difference between `createdAt` and current date is more than 1 year, if so then I start purging data.
* First I remove all entries from `residenceHistory`, then I delete from the `birdhouse` table.
* I thought adding a cron job would be difficult, but it was simple and straight forward

### Stage 6

* I forgot about bulk add. 
* I created a new api end point, added to list of excluded routes
* It is using the implemted create service in a `for` loop
* Since the incoming data is an array, the existing decorator will not work. I can pass an `@IsArray` decorator and then pass it some object validation, but for not I have added a few `if` conditions in my service to handle it.
* Pushing all results in an array and returning it

### Stage 7

* Instead of directly injecting both birdhouse repository and residence history repository into the birdhouse service, I have made them into two different repository classes. This will allow me to write a query once and call it multiple times. And will help to decrease the lines of code in the birdhouse service. I have then injected those classes into my birdhouse service. I first learned this pattern in Spring Boot, and I have seen this approach being used in a handful of NestJS code bases (not most of them).
* I have added two functions into my service called `createBirdhouseObj` and `createResidenceHistoryObj`. So I can used test these functions instead of unit testing functions with TypeORM calls. Unit testing those functions would be pointless as unit testing won't make the DB calls
* Creating these two functions has also helped me further reduce repetition

### Stage 8

* Writing test cases. It has been a confusing journey. Especially when it comes to making DB calls. I asked a friend about writing tests, and he told me that in unit tests, you don't make DB calls, but instead test other parts of your code to see if they are returning the result you expect it to return. For DB calls, you have to write integration tests or end-to-end tests.
* Struggling to find a proper guide that could help me catch up to writing test cases, I turned to ChatGPT to help me write test cases. Do I understand how the tests are written? Somewhat. But I still need to do a proper course/crash course to better understand how to write unit tests, integration tests, and end-to-end tests. And when to use which testing strategy
* Test cases in `service.spec.ts` mostly focus on functions without DB calls
* Test cases in `controller.spec.ts` covers all function. But I am not sure how useful those test cases are, and if they will truly help in catching bugs