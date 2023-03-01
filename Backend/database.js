const { ObjectId, MongoClient } = require('mongodb');
const bcrypt = require("bcrypt");
let fs = require('fs');

//saltRounds refers to bcrypt, the higher the saltRounds the more secure the password
//by default bcrypt recommends 10 saltRounds using a 2gz processor that will give us roughly 10 hashs/second
//going too high on this number could cause a hash to run for multiple days, best to leave it as it is
const saltRounds = 10;
const databaseName = "main2";
const itemCollection = "items";
const orderCollection = "orders";
const userCollection = "users";
// let uri = null;
// let dbClient = null;



class DatabaseHandler {
	constructor() {
		this.dbClient = null;
		this.uri = null;

		if (this.uri != null) {
			console.error("Manual MongoDB uri detected, shutting program down. See 'secrets.example.config' for an example of how this should be input into the program.");
			process.exit();
		}

		// secrets.config should contain a line which is exactly this without quotes: "MONGO_API_KEY=mongodb+srv://xxxxxxxxxxxxxxxxxxx:xxxxxxxxxxxxxxxxxx@cluster0.xxxxxxx.mongodb.net/?retryWrites=true&w=majority"
		let secretsFilePath = "secrets.config";
		let fatalError = true;
		if (fs.existsSync(secretsFilePath)) {
			try {
				const content = fs.readFileSync(process.cwd() + "/" + secretsFilePath).toString();

				for (let line of content.split('\n')) {
					// The line for the config should be in the format 'MONGO_API_KEY=mongodb+srv://...'
					// TODO: Remove hardcoded strings here and throughout the project.
					if (line.startsWith("MONGO_API_KEY=")) {
						this.uri = line.split("MONGO_API_KEY=", 2)[1];
					}
				}

				if (this.uri != null) {
					console.log("Successfully parsed MongoDB API key from '" + secretsFilePath + "'");
				} else {
					console.log("Couldn't read valid MongoDB uri from '" + secretsFilePath + "'");
				}

				fatalError = false;
			} catch (ignored) {
			}
		}

		if (!fatalError) {
			// TODO: Initialization of the database should likely be done in database.js.
			this.dbClient = new MongoClient(this.uri);

			// Creates a connection to the database
			async function startDatabase(dbClient) {
				try {
					// await this.dbClient.connect();
					await dbClient.connect();
				} catch (e) {
					console.error(e);
				}
				// finally {
				//   await this.dbClient.close();
				// }
			}
			startDatabase(this.dbClient);
		} else {
			console.error("Could not read 'secrets.config' in the current working directory. Disabling database integration.");
		}
	}

	async main() {
		/**
		 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
		 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
		 */
		//THIS NEEDS TO BE AN SECRET AND NOT UPLOADED TO GITHUB API KEY TO MONGO ATLUS BASICALLY


		//Creates mongodb dbClient

		try {
			// Connect to the MongoDB cluster
			await this.dbClient.connect();




		} catch (e) {
			console.error(e);
		} finally {
			await this.dbClient.close();
		}
	};




	//Database functions related to users
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	async getUserData(userEmail) {
		if (userEmail != null) {
			// TODO: Add support for getting user data via either email or username
			// Will get the test database, then the users collection, then find the first entry where email is equal to the 'userEmail' parameter.
			//Currently I (keane) need to figure out bCrypt so i am passing the encrypted version of the password to get true values
			const result = await this.dbClient.db(databaseName).collection(userCollection).findOne({ email: userEmail });

			if (result) {
				console.log("User found");
				return result;
			}

			else {
				console.log("User not found");
				return null;
			}
		}
	}

	async getName(desktopID){
		const result = await this.dbClient.db(databaseName).collection(userCollection).findOne({ supplierId: new ObjectId(desktopID) });
		if (!result)
		{
			result = await this.dbClient.db(databaseName).collection(userCollection).findOne({ merchantId: new ObjectId(desktopID) });
		}

		if(result)
		{
			if (result.name)
			{
				return result.name;
			}
		}
		else{
			return null;
		}
	}



	//Database call to create a new user
	//newUser is a JSON that contains at the bare minimum an email and a password field
	async createNewUser(newUser) {

		const hashedPassword = await bcrypt.hash(newUser.password, saltRounds)
		//Checks to see if the username and password already exists in the database 
		const alreadyExists = await this.dbClient.db(databaseName).collection(userCollection).findOne({ email: newUser.email });

		//This case refers to when the user already exists
		if (alreadyExists) {
			console.log("Tried to create new user but they already exist");
		}
		//This means the user does not exist and we are creating a new user
		else {
			let hashedUser = ({
				email: newUser.email,
				password: hashedPassword,
				acctype: newUser.acctype,
				profilePicture: newUser.profilePicture
			});

			if (newUser.acctype == "driver") {
				hashedUser.firstName = newUser.firstName;
				hashedUser.lastName = newUser.lastName;
			}
			else if (newUser.acctype == "merchant" || newUser.acctype == "supplier") {
				hashedUser.name = newUser.name;
				hashedUser.address = newUser.address;
			}

			const result = await this.dbClient.db(databaseName).collection(userCollection).insertOne(hashedUser);
			if (result) {
				console.log("New user created");
				return true;
			}
			else {
				console.log("Error creating user");
			}
		}

		return false;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////









	//Database functions related to orders (jobs)
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//Going to try to organize the functions in terms of the natural progression of orders
	//IE place the order, view the placed orders, then confirm order, view them, accept, view, complete, view



	//  order is a json that contains
	// NOT NEEDED values will be computed here, if you add them before calling this function they will be overwritten
	// 
	// 	merchantId (ObjectId)
	// 	supplierId (ObjectId)
	// 	status (string enum) - NOT NEEDED
	// 	items (array of Object)
	// 	startingAddress (string)
	// 	endingAddress (string)
	// 	totalCost (double) - NOT NEEDED
	// 	purchaseDate (date) - NOT NEEDED
	// 	estimatedDeliveryDate (date)
	// 	minimumDeliveryPrice (double)
	// 	maximumDeliveryPrice (double)
	async placeOrder(orderDetails) {

		orderDetails.status = "pending";

		let name = await this.getName(orderDetails.merchantId)
		if (name)
		{
			orderDetails.merchantName = name;
		}
		else
		{
			return false;
		}
		name = await this.getName(orderDetails.supplierId)
		if (name)
		{
			orderDetails.supplierName = name;
		}
		else
		{
			return false;
		}


		orderDetails.pendingDate = getDate();
		orderDetails.pendingTime = getTime();

		let total = 0;
		for (let i = 0; i < orderDetails.items.length; i++) {
			total += orderDetails.items[i].price * orderDetails.items[i].quantity;
		}
		orderDetails.totalCost = roundMoney(total);

		const result = await this.dbClient.db(databaseName).collection(orderCollection).insertOne(orderDetails);

		if (result) {
			console.log("Order placed succesfully");
			return true;
		}
		else {
			console.log("Order place failed");
		}
		return false;
	}







	//To get all orders that a specific supplier can accept
	//Must pass into the supplierId
	async getAllPendingOrdersBySupplierId(supplierID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "pending", supplierId: new ObjectId(supplierID) });

		const results = await cursor.toArray();

		if (results.length > 0) {
			//////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			/////

			return results;
		}
		else {
			console.log("No orders found");
			return null;
		}
	}


	//Find and return all the pending orders related to a specific merchant
	async getAllPendingOrdersByMerchantId(merchantID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "pending", merchantId: new ObjectId(merchantID) });

		const results = await cursor.toArray();

		if (results.length > 0) {
			//////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			/////

			return results;
		}
		else {
			console.log("No orders found");
			return null;
		}
	}




	//This is what happens when a supplier confirms an order
	async confirmOrder(orderID) {
		let result = await this.dbClient.db(databaseName).collection(orderCollection).findOne({ "_id": new ObjectId(orderID) });

		if (result.status == "pending") {
			updated = result;
			updated.status = "confirmed";

			// TODO: Camelcase
			updated.confirmed_date = getDate();
			updated.confirmed_time = getTime();

			let updatedResult = await this.dbClient.db(databaseName).collection(orderCollection).updateOne({ "_id": new ObjectId(orderID) }, { $set: updated });

			if (updatedResult.modifiedCount > 0) {
				console.log("Item quantity updated");
				return true;
			}
			else {
				console.log("Item quantity not updated");
			}

		}

		else {
			console.log("Can only confirm a pending order");
		}
		return false;
	}





	async getAllConfirmedOrdersBySupplier(supplierID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "confirmed", supplierId: new ObjectId(supplierID) });

		const results = await cursor.toArray();


		if (results.length > 0) {
			// //////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			// /////
			console.log("Returning confirmed orders");
			return results;
		}
		else {
			console.log("No confirmed orders");
		}
		return null;

	}

	async getAllConfirmedOrdersByMerchant(merchantID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "confirmed", merchantId: new ObjectId(merchantID) });

		const results = await cursor.toArray();


		if (results.length > 0) {
			// //////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			// /////
			console.log("Returning confirmed orders");
			return results;
		}
		else {
			console.log("No confirmed orders");
		}
		return null;
	}




	//To find orders that drivers can accept
	async getAllConfirmedOrdersForDriver() {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "confirmed" });

		const results = await cursor.toArray();

		if (results.length > 0) {
			// //////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			// /////

			return results;
		}
		else {
			console.log("No orders found");
		}

		return null;
	}





	//This is what happens when a driver accepts an order 
	async acceptOrder(orderID, driverID) {
		let result = await this.dbClient.db(databaseName).collection(orderCollection).findOne({ "_id": new ObjectId(orderID) });

		if (result) {
			if (result.status == "confirmed") {
				updated = result;
				updated.status = "accepted";
				updated.driverId = ObjectId(driverID);


				updated.accepted_date = getDate();
				updated.accepted_time = getTime();


				const updatedResult = await this.dbClient.db(databaseName).collection(orderCollection).updateOne({ "_id": new ObjectId(orderID) }, { $set: updated });
				if (updatedResult.modifiedCount > 0) {
					console.log("Item quantity updated");
					return true;
				}
				else {
					console.log("Item quantity not updated");
				}
			}


		}

		else {
			console.log("Failed to accept order");
		}

		return false;
	}




	async getAllAcceptedOrdersBySupplier(supplierID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "accepted", supplierId: new ObjectId(supplierID) });

		const results = await cursor.toArray();


		if (results.length > 0) {
			// //////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			// /////

			return results;
		}
		else {
			console.log("No orders found");
		}
		return null;
	}

	async getAllAcceptedOrdersByMerchant(merchantID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "accepted", merchantId: new ObjectId(merchantID) });

		const results = await cursor.toArray();


		if (results.length > 0) {
			// //////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			// /////

			return results;
		}
		else {
			console.log("No orders found");
		}
		return null;
	}

	//To find orders that drivers have accepted
	async getAllAcceptedOrdersByDriver(driverID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "accepted", driverId: new ObjectId(driverID) });

		const results = await cursor.toArray();

		if (results.length > 0) {
			// //////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			// /////

			return results;
		}
		else {
			console.log("No orders found");
		}
		return null;
	}





	async completeOrder(orderID) {
		// let result = await this.dbClient.db("main").collection("orders").findOne({ "_id": ObjectId(orderID) });
		let result = await this.dbClient.db(databaseName).collection(orderCollection).findOne({ "_id": new ObjectId(orderID) });

		if (result) {

			if (result.status == "accepted") {
				updated = result;
				updated.status = "completed";


				updated.completed_date = getDate();
				updated.completed_time = getTime();

				const updatedResult = await this.dbClient.db(databaseName).collection(orderCollection).updateOne({ "_id": new ObjectId(orderID) }, { $set: updated });

				if (updatedResult.modifiedCount > 0) {
					console.log("Item quantity updated");
					return true;
				}
				else {
					console.log("Item quantity not updated");
					return false;
				}
			}


		}

		else {
			console.log("Failed to complete order");
		}
		return false;;
	}








	async getAllCompletedOrdersByDriver(driverID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "completed", driverId: new ObjectId(driverID) });

		const results = await cursor.toArray();


		if (results.length > 0) {
			//////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			/////

			return results;
		}
		else {
			console.log("No orders found");
		}
		return null;
	}

	async getAllCompletedOrdersByMerchant(merchantID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "completed", merchantId: new ObjectId(merchantID) });

		const results = await cursor.toArray();


		if (results.length > 0) {
			//////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			/////

			return results;
		}
		else {
			console.log("No orders found");
		}
		return null;
	}

	async getAllCompletedOrdersBySupplier(supplierID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ status: "completed", supplierId: new ObjectId(supplierID) });

		const results = await cursor.toArray();


		if (results.length > 0) {
			//////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			/////


			return results;
		}
		else {
			console.log("No orders found");
		}
		return null;
	}

	async getAllOrdersBySupplier(supplierID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ supplierId: new ObjectId(supplierID) });
		const results = await cursor.toArray();
		if (results.length > 0) {
			//////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			/////
			return results;
		}
		else {
			console.log("No orders found");
			return null;
		}
	}

	async getAllOrdersByMerchant(merchantID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ merchantId: new ObjectId(merchantID) });
		const results = await cursor.toArray();
		if (results.length > 0) {
			//////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			/////
			return results;
		}
		else {
			console.log("No orders found");
			return null;
		}
	}

	async getAllOrdersByDriver(driverID) {
		const cursor = await this.dbClient.db(databaseName).collection(orderCollection).find({ driverId: new ObjectId(driverID) });
		const results = await cursor.toArray();
		if (results.length > 0) {
			//////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			/////
			return results;
		}
		else {
			console.log("No orders found");
			return null;
		}
	}

	async cancelOrder(orderID) {
		const result = await this.dbClient.db(databaseName).collection(orderCollection).deleteOne({ "_id": new ObjectId(orderID), status: "pending" });
		if (result.deletedCount > 0) {
			console.log("Order was succesfully canceled");
			return true;
		}
		else {
			console.log("Order was unable to be canceled");
		}
		return false;
	}



	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


















	//Database functions related to items
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// TODO: Implement Mutex or something to prevent backend database validation from being effecting by a race-condition.

	//This function takes in an _id and the number of items the merchant is trying to order
	//Checks the database for the existance of the item then makes sure there is enough of the item to order
	//Then updates the database to reflect that items have been sold
	async updateItemQuantity(itemId, quantity) {
		const result = await this.dbClient.db(databaseName).collection(itemCollection).findOne({ "_id": new ObjectId(itemId) });

		if (result) {
			console.log("found result");
			if (result.quantity >= quantity) {
				console.log("items available");
				updated = result;
				updated.quantity = result.quantity - quantity;
				const updatedResult = await this.dbClient.db(databaseName).collection(itemCollection).updateOne({ "_id": new ObjectId(itemId) }, { $set: updated });

				if (updatedResult.modifiedCount > 0) {
					console.log("Item quantity updated");
					return true;
				}
				else {
					console.log("Item quantity not updated");
					return false;
				}
			}

		}

		else {
			console.log("Unable to find item");
			return false;
		}
	}

	async getAllItems() {
		const cursor = await this.dbClient.db(databaseName).collection(itemCollection).find();

		const results = await cursor.toArray();

		if (results.length > 0) {
			//////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			/////
			return results;
		}
		else {
			console.log("No items found");
			return null;
		}
	}

	// itemInfo is a JSON //////////////////
	// _id will be generated by database
	// name: string
	// description: string
	// quantity: int
	// price: double
	// supplierId: ObjectId()
	// weight: double
	// postedDate: date
	//////////////////////////////////
	//Function will insert a new item into the database, used for the supplier to add items to the database
	async insertNewItem(itemInfo) {
		itemInfo.postedDate = getDate();
		const result = await this.dbClient.db(databaseName).collection(itemCollection).insertOne(itemInfo);

		if (result.insertedCount > 0)
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	async getItemsBySupplier(supplierID) {
		const cursor = await this.dbClient.db(databaseName).collection(itemCollection).find({ supplierId: new ObjectId(supplierID) });


		const results = await cursor.toArray();


		if (results.length > 0) {
			//////
			// results.forEach((result) => {
			// 	console.log(result);
			// });
			/////

			return results;
		}
		else {
			console.log("No items found");
			return null;
		}
	}

	async updateItem(itemInfo) {
		let result = await this.dbClient.db(databaseName).collection(itemCollection).updateOne({ "_id": itemInfo._id }, { $set: itemInfo });

		if (result.modifiedCount > 0) {
			console.log("Item was updated");
			return true;
		}
		else {
			console.log("Item was not updated");
			return false;
		}
	}

	async removeItem(itemID) {
		const result = await this.dbClient.db(databaseName).collection(itemCollection).deleteOne({ "_id": new ObjectId(itemID) });
		if (result.deletedCount > 0) {
			console.log("Item was succesfully removed");
			return true;
		}
		else {
			console.log("Item was unable to be removed");
			return false;
		}
	}
}






//used to round floats to 2 decimal places correctly without errors
function roundMoney(num, decimalPlaces = 2) {
	var p = Math.pow(10, decimalPlaces);
	var n = (num * p) * (1 + Number.EPSILON);
	return Math.round(n) / p;
}

function getDate() {
	let d = new Date();
	return d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2);
}

function getTime() {
	let d = new Date();
	return ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
}

module.exports.DatabaseHandler = DatabaseHandler;