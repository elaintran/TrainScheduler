# TrainScheduler
The Train Scheduler is a schedule application that utilizes Firebase and Moment.js to store train data, manipulate time, and reflect updates real-time. Users are able to submit train information, including ending destination, arrival time, and minutes remaining. Along with that, they can go back and edit or delete their previously submitted trains from the table.

## Development Process
Firebase is set up and intialized upon the start of the application. In order to retrieve or manipulate the data stored in the database, `Firebase.database.Reference` must be utilized alongside a method. The following methods were used:
* When a train is submitted via modal, the values from the form is added into the database using a `push()` method. Afterwards, a key is set as a data attribute to the newly added row for future use in editing and deleting specific trains.
* Editing train information requires both a key inside the `ref()` to retrieve the data on a selected train and a `set()` method to update the data.
* Removing a train from the schedule also requires a key of the selected train and uses a `remove()` method to delete the train from the database.
* The `on()` method is necessary when retrieving the train data. In this case, when a new train is added, `on("child_added")` would be called. Any changes to the data would use `on("child_changed")` instead. Following both methods would be `function(snapshot)`, which pulls certain data values from the database to append onto the page.

## Demo
[View Demo Here](https://elaintran.github.io/TrainScheduler/)
