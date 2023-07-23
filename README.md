# Notes

### Dependencies required

* TypeORM
* UUID generator (or maybe use crypto)

### Steps
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
    
