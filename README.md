# Notes

## Dependencies required

* TypeORM
* UUID generator (or maybe use crypto)
* Class Validator

## Steps
* Setting up basic requirements
    * Endpoints
        * `/house` - POST
        * `/house/<ubid>` - PATCH
        * `/house/<ubid>/occupancy` - POST
        * `/house/<ubid>` - GET
    * Entity
        * id
        * ubid
        * log, lat
        * birds
        * eggs

## Task 1: Save bird house
* Generate UUID for ID
* Generate UUID for UBID
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
