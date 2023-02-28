const Database = require("./database.js");

const names = ["Caiden", "Julien", "Hunter", "Andreas", "Jordan", "Denisse", "Fatima", "Julianne", "Braden", "Reynaldo", "Evan", "Bradley", "Alonzo", "Jase", "Rylie", "Natasha", "Sherlyn", "Joshua", "Ellie", "Mareli", "Kiersten", "Zane", "Quinton", "Krista", "Talon", "Odin", "Zoie", "Emerson", "Shyann", "Amaya", "Vance", "Armani", "Willow", "Kamren", "Morgan", "Jonathan", "Melina", "Jaron", "Dominique", "Beau", "Thomas", "Anastasia", "Akira", "Roselyn", "Miracle", "Ellis", "Ruth", "Keyla", "Hudson", "Boston", "Brenna", "Lennon", "Elisabeth", "Edith", "Rachel", "Nickolas", "Layton", "Jorden", "Perla", "Ariel", "Trent", "Raiden", "Maya", "Alan", "Alexis", "Ethan", "Adriel", "Vicente", "Savannah", "Maria", "Cheyenne", "Lilia", "Dakota", "Kole", "Mckayla", "Hassan", "Alec", "Lena", "Priscilla", "Slade", "Shiloh", "Jaiden", "Hezekiah", "Dallas", "Iris", "Patrick", "Finn", "Annika", "Jaelyn", "Cole", "Conor", "Jaylene", "Vivian", "Warren", "Marlee", "Madilyn", "Katelynn", "Miranda", "April", "Samara"];

function getName() {
	return names[Math.floor(Math.random() * names.length)];
}

let database = new Database.DatabaseHandler();

const driverEmail = "driver@gmail.com";

database.createNewUser({ email: , password: "1", acctype: "driver", firstName: getName(), lastName: getName() });
database.createNewUser({ email: "merchant@gmail.com", password: "1", acctype: "merchant", name: getName(), address: "1800 Canyon Rd, Ellensburg, WA 98926" });
database.createNewUser({ email: "supplier@gmail.com", password: "1", acctype: "supplier", name: getName(), address: "1800 Canyon Rd, Ellensburg, WA 98926" });

database.

// let jsonObject = new JSON.parse();
// database.placeOrder()