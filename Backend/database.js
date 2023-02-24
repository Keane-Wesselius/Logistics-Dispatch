const { ObjectId, MongoClient } = require('mongodb');
const bcrypt = require("bcrypt");
let fs = require('fs');

//saltRounds refers to bcrypt, the higher the saltRounds the more secure the password
//by default bcrypt recommends 10 saltRounds using a 2gz processor that will give us roughly 10 hashs/second
//going too high on this number could cause a hash to run for multiple days, best to leave it as it is
const saltRounds = 10;

// let uri = null;
// let dbClient = null;

//Still need to be able to cancel orders of all types (merchant, driver)
//delete items for supplier
//totals not being calculated yet
//NOTHING HAS BEEN TESTED AT ALL

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
			const result = await this.dbClient.db("main").collection("users").findOne({ email: userEmail });

			if (result) {
				console.log("User found");
				return result;
			}

			else {
				console.log("User not found");
			}
		}
	}



	//Database call to create a new user
	//newUser is a JSON that contains at the bare minimum an email and a password field
	async createNewUser(newUser) {

		const hashedPassword = await bcrypt.hash(newUser.password, saltRounds)
		//Checks to see if the username and password already exists in the database 
		const alreadyExists = await this.dbClient.db("main").collection("users").findOne({ email: newUser.email });

		//This case refers to when the user already exists
		if (alreadyExists) {
			console.log("Tried to create new user but they already exist");
		}
		//This means the user does not exist and we are creating a new user
		else {
			let hashedUser = ({
				email: newUser.email,
				password: hashedPassword,
				type: newUser.type,
				profilePicture: newUser.profilePicture
			});

			if (newUser.type == "driver") {
				hashedUser.firstName = newUser.firstName;
				hashedUser.lastName = newUser.lastName;
			}
			else if (newUser.type == "merchant" || newUser.type == "supplier") {
				hashedUser.name = newUser.name;
				hashedUser.address = newUser.address;
			}

			const result = await this.dbClient.db("main").collection("users").insertOne(hashedUser);
			if (result) {
				console.log("New user created");
			}
			else {
				console.log("Error creating user");
			}

		}
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


		orderDetails.pendingDate = getDate();
		orderDetails.pendingTime = getTime();

		let total = 0;
		for (let i = 0; i < orderDetails.items.length; i++) {
			total += orderDetails.items[i].price * orderDetails.items[i].quantity;
		}
		orderDetails.totalCost = roundMoney(total);

		const result = await this.dbClient.db("main").collection("orders").insertOne(orderDetails);

		if (result) {
			console.log("Order placed succesfully");
		}
		else {
			console.log("Order place failed");
		}
	}







	//To get all orders that a specific supplier can accept
	//Must pass into the supplierId
	async getAllPendingOrdersBySupplierId(supplierID) {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "pending", supplierId: ObjectId(supplierID) });

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
	}


	//Find and return all the pending orders related to a specific merchant
	async getAllPendingOrdersByMerchantId(merchantID) {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "pending", merchantId: ObjectId(merchantID) });

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
	}




	//This is what happens when a supplier confirms an order
	async confirmOrder(orderID) {
		let result = await this.dbClient.db("main").collection("orders").findOne({ "_id": ObjectId(orderID) });

		if (result.status == "pending") {
			updated = result;
			updated.status = "confirmed";

			updated.confirmed_date = getDate();
			updated.confirmed_time = getTime();

			let updatedResult = await this.dbClient.db("main").collection("orders").updateOne({ "_id": ObjectId(orderID) }, { $set: updated });

			if (updatedResult.modifiedCount > 0) {
				console.log("Item quantity updated");
			}
			else {
				console.log("Item quantity not updated");
			}

		}

		else {
			console.log("Can only confirm a pending order");
		}
	}





	async getAllConfirmedOrdersBySupplier(supplierID) {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "confirmed", supplierId: ObjectId(supplierID) });

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

	}

	async getAllConfirmedOrdersByMerchant(merchantID) {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "confirmed", merchantId: ObjectId(merchantID) });

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
	}




	//To find orders that drivers can accept
	async getAllConfirmedOrdersForDriver() {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "confirmed" });

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

	}





	//This is what happens when a driver accepts an order 
	async acceptOrder(orderID, driverID) {
		let result = await this.dbClient.db("main").collection("orders").findOne({ "_id": ObjectId(orderID) });

		if (result) {
			if (result.status == "confirmed") {
				updated = result;
				updated.status = "accepted";
				updated.driverId = ObjectId(driverID);


				updated.accepted_date = getDate();
				updated.accepted_time = getTime();


				const updatedResult = await this.dbClient.db("main").collection("orders").updateOne({ "_id": ObjectId(orderID) }, { $set: updated });
				if (updatedResult.modifiedCount > 0) {
					console.log("Item quantity updated");
				}
				else {
					console.log("Item quantity not updated");
				}
			}


		}

		else {
			console.log("Failed to accept order");
		}
	}




	async getAllAcceptedOrdersBySupplier(supplierID) {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "accepted", supplierId: ObjectId(supplierID) });

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
	}

	async getAllAcceptedOrdersByMerchant(merchantID) {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "accepted", merchantId: ObjectId(merchantID) });

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
	}

	//To find orders that drivers have accepted
	async getAllAcceptedOrdersByDriver(driverID) {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "accepted", driverId: ObjectId(driverID) });

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

	}





	async completeOrder(orderID) {
		// let result = await this.dbClient.db("main").collection("orders").findOne({ "_id": ObjectId(orderID) });
		let result = await this.dbClient.db("main").collection("orders").findOne({ "_id": ObjectId(orderID) });

		if (result) {

			if (result.status == "accepted") {
				updated = result;
				updated.status = "completed";


				updated.completed_date = getDate();
				updated.completed_time = getTime();

				const updatedResult = await this.dbClient.db("main").collection("orders").updateOne({ "_id": ObjectId(orderID) }, { $set: updated });

				if (updatedResult.modifiedCount > 0) {
					console.log("Item quantity updated");
				}
				else {
					console.log("Item quantity not updated");
				}
			}


		}

		else {
			console.log("Failed to complete order");
		}
	}








	async getAllCompletedOrdersByDriver(driverID) {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "completed", driverId: ObjectId(driverID) });

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
	}

	async getAllCompletedOrdersByMerchant(merchantID) {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "completed", merchantId: ObjectId(merchantID) });

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
	}

	async getAllCompletedOrdersBySupplier(supplierID) {
		const cursor = await this.dbClient.db("main").collection("orders").find({ status: "completed", supplierId: ObjectId(supplierID) });

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
	}

	async cancelOrder(orderID) {
		const result = await this.dbClient.db("main").collection("orders").deleteOne({ "_id": ObjectId(orderID), status: "pending" });
		if (result.deletedCount > 0) {
			console.log("Order was succesfully canceled");
		}
		else {
			console.log("Order was unable to be canceled");
		}
	}



	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


















	//Database functions related to items
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// TODO: Implement Mutex or something to prevent backend database validation from being effecting by a race-condition.

	//This function takes in an _id and the number of items the merchant is trying to order
	//Checks the database for the existance of the item then makes sure there is enough of the item to order
	//Then updates the database to reflect that items have been sold
	async updateItemQuantity(itemId, quantity) {
		const result = await this.dbClient.db("main").collection("items").findOne({ "_id": ObjectId(itemId) });

		if (result) {
			console.log("found result");
			if (result.quantity >= quantity) {
				console.log("items available");
				updated = result;
				updated.quantity = result.quantity - quantity;
				const updatedResult = await this.dbClient.db("main").collection("items").updateOne({ "_id": ObjectId(itemId) }, { $set: updated });

				if (updatedResult.modifiedCount > 0) {
					console.log("Item quantity updated");
				}
				else {
					console.log("Item quantity not updated");
				}
			}

		}

		else {
			console.log("Unable to find item");
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
		const result = await this.dbClient.db("main").collection("items").insertOne(itemInfo);


	}

	async getItemsBySupplier(supplierID) {
		const cursor = await this.dbClient.db("main").collection("items").find({ supplierId: ObjectId(supplierID) });


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
		}
	}

	async updateItem(itemInfo) {
		let result = await this.dbClient.db("main").collection("items").updateOne({ "_id": itemInfo._id }, { $set: itemInfo });

		if (result.modifiedCount > 0) {
			console.log("Item was updated");
		}
		else {
			console.log("Item was not updated");
		}
	}

	async removeItem(itemID) {
		const result = await this.dbClient.db("main").collection("items").deleteOne({ "_id": ObjectId(itemID) });
		if (result.deletedCount > 0) {
			console.log("Item was succesfully removed");
		}
		else {
			console.log("Item was unable to be removed");
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