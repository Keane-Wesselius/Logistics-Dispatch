const { MongoClient } = require('mongodb');

//for more information this is the tutorial i used for this demo
//https://www.mongodb.com/developer/languages/javascript/node-crud-tutorial/

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    //THIS NEEDS TO BE AN SECRET AND NOT UPLOADED TO GITHUB API KEY TO MONGO ATLUS BASICALLY
    const uri = "APIKEY HERE";

    //Creates mongodb client
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // // Call the database and pull info from it
        // await  listDatabases(client);

        //Every mongodb needs and _id field
        //if you do not specifically create one, mongo will make one for you
        // await createListing(client,
        //     {
        //         name: "Infinite Views",
        //         summary: "Tell me boy",
        //         bedrooms: 1,
        //         bathrooms: 1
        //     }
        // );

        // await findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
        //     minimumNumberOfBedrooms: 4,
        //     minimumNumberOfBathrooms: 2,
        //     maximumNumberOfResults: 5
        // });
        //await updateListingByName(client, "Infinite Views", { summary: "I was updated" });

        // await findOneListingByName(client, "Infinite Views");

        //await upsertListingByName(client, "Cozy Cotage", { name: "Cozy Cotage", bedrooms: 2, bathrooms: 1 });

        //await updateAllListingsToHavePropertyType(client);

        //await deleteListingByName(client, "Cozy Cottage");

        //deleteMany() call
        //await deleteListingsScrapedBeforeDate(client, new Date("2019-02-15"));
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
};

main().catch(console.error);


//Just displays all the databases currently in the cluster
async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

//Creates a new document in the "sample_airbnb" database in the collection "listingAndReviews"
async function createListing(client, newListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}

//creates multiple listings at once
async function createMultipleListings(client, newListings){
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertMany for the insertMany() docs
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);

    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds);
}

//finds the first listing that matches the name given
async function findOneListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({ name: nameOfListing });

    if (result) {
        console.log(`Found a listing in the collection with the name '${nameOfListing}':`);
        console.log(result);
    } else {
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}

//finds all the listing that matches the minimum number of bed and bathrooms
async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {
    //cursor is like an iterator, find returns a cursor
    const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find(
                            {
                                //gte is greated than or equal, selects listings with at least as many bedrooms and bathrooms
                                //specified when calling the function
                                bedrooms: { $gte: minimumNumberOfBedrooms },
                                bathrooms: { $gte: minimumNumberOfBathrooms }
                            }
                            //Sorts the results by newest
                            ).sort({ last_review: -1 })
                            //limits the number of results retrieved
                            .limit(maximumNumberOfResults);
    //converts the cursor(iterator) into an array
    const results = await cursor.toArray();

    //loops through the array we created and prints the results
    if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();

            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}

//Updates information about a listing, we are picking the listing by name
async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        //similar to findOne(), updateOne() grabs the first listing that matches
                        .updateOne({ name: nameOfListing }, 
                            { $set: updatedListing },);

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

//Same as update but using upsert instead
//PLEASE CHECK LATER
//FOR WHATEVER REASON UPSERT MAKES IT SO THE _ID IS UNDEFINED AND THATS NOT OKAY
//FOR THE TIME BEING DO NOT USE UPSERT
//OKAY DONT KNOW WHAT TO DO ABOUT IT BUT USING UPSERT MAKES the _id: OBJECTID("123324897329487") 
//INSTEAD OF _id: "12398482496289371837"
async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        .updateOne({ name: nameOfListing }, 
                                   { $set: updatedListing }, 
                                    
                                   { upsert: true },);
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);

    if (result.upsertedCount > 0) {
        console.log(`One document was inserted with the id ${result.upsertedId._id}`);
    } else {
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
        console.log(`Id of the updated document is ${result._id}`)
    }
}

//This call takes all the listings and checks if the document contains a property_type
//If if does not exist it updates to have the field and sets it as unknown
async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        .updateMany({ property_type: { $exists: false } }, 
                                    { $set: { property_type: "Unknown" } });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

//As with all the "One()" functions (insert, update, delete) mongodb will find the first listing that matches the parameters you give it
//Mongodb matches the first one by natural order, which might as well be random and you cant trust the database to pick what you want
//without being really specific
async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
            .deleteOne({ name: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

//this function that deletes all listing 
async function deleteListingsScrapedBeforeDate(client, date) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
        .deleteMany({ "last_scraped": { $lt: date } });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}