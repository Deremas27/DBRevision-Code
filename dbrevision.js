// Importing necessary third-party modules
const express = require("express");
const mysql = require("mysql2");

/* Initialize the Express application. The 'app' variable will be used to configure and run the web server. */
const app = express();

// Middleware to parse incoming JSON data from requests
app.use(express.json());

// Middleware to parse incoming URL-encoded data from requests.
// Setting 'extended: true' allows parsing(or getting) nested objects and arrays in the request body (req.body).
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Define a basic route for the root URL ("/")
// Logs the request URL and sends a simple response: "Server is working"
app.get("/", (req, res) => {
  console.log(req.url);
  res.end("Server is working");
});

// Note on CreatePOOL()
// Create a connection pool for managing database connections. // The connection pool allows multiple connections to be handled efficiently, // reducing the overhead of creating and closing connections repeatedly. const DBConnection = mysql.createPool({ host: 'localhost', // Database server hostname user: 'root', // Database username password: 'password123', // Database password database: 'my_database', // Name of the database connectionLimit: 10 // Maximum number of connections in the pool });

// Creatig mysql connection with database credentials
const DBConnection = mysql.createConnection({
  user: "dbforus", // MySQL username
  host: "localhost", // MySQL host
  password: "dbforus", // MySQL password
  database: "dbforus", // MySQL database name
  //   socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock", //path to mysql sock in MAMP
  // Uncomment the above line for MAMP on MacOS
});

// Connect to the MySQL database and log the connection status
DBConnection.connect((err) => {
  if (err) console.log(err);
  else console.log("mysql2 is connected successfully");
});

// Route: /create-table
// Creates necessary tables in the database if they don't already exist
app.get("/create-table", (req, res) => {
  // SQL query to create the Products table
  let products = `CREATE TABLE IF NOT EXISTS Products (
    product_id INT AUTO_INCREMENT,
    product_url VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (product_id)
  )`;

  // SQL query to create the ProductDescription table
  let productDescription = `CREATE TABLE IF NOT EXISTS ProductDescription (
    description_id INT AUTO_INCREMENT,
    product_id INT NOT NULL,
    product_brief_description VARCHAR(255) NOT NULL,
    product_description VARCHAR(510) NOT NULL,
    product_img VARCHAR(255) NOT NULL,
    product_link VARCHAR(255) NOT NULL,
    PRIMARY KEY (description_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
  )`;

  // SQL query to create the ProductPrice table
  let productPrice = `CREATE TABLE IF NOT EXISTS ProductPrice (
    price_id INT AUTO_INCREMENT,
    product_id INT NOT NULL,
    starting_price VARCHAR(255) NOT NULL,
    price_range VARCHAR(255) NOT NULL,
    PRIMARY KEY (price_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
  )`;

  // SQL query to create the Users table
  let users = `CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
  )`;

  // SQL query to create the Orders table
  //   Two(2) foreign keys are available in "Orders" table that refers "Products" and "Users" Table
  let orders = `CREATE TABLE IF NOT EXISTS Orders (
    order_id INT AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (order_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
  )`;

  // Execute each query and log whether the table was created successfully
  DBConnection.query(products, (err, results) => {
    if (err) console.log("Products Table not created");
    else console.log("Products Table created");
  });

  DBConnection.query(productDescription, (err, results, fields) => {
    if (err) console.log("Product description Table not created");
    else console.log("Product description Table created");
  });

  DBConnection.query(productPrice, (err, results, fields) => {
    if (err) console.log("Product Price Table not created");
    else console.log("Product Price Table created");
  });

  DBConnection.query(users, (err, results, fields) => {
    if (err) console.log("Users Table not created");
    else console.log("Users Table created");
  });

  DBConnection.query(orders, (err, results, fields) => {
    if (err) console.log("Orders Table not created");
    else console.log("Orders Table created");
  });

  res.end("Tables Created");
  console.log("Tables Created");
});


// Route: /add-product
// Adds product, product description, pricing, user details, and orders data(information) to the database tables
app.post("/add-product", (req, res) => {
  console.table(req.body);
  console.log(req.body);

  // Extract data from the request body
  const {
    product_url,
    product_name,
    product_brief_description,
    product_description,
    product_img,
    product_link,
    starting_price,
    price_range,
    user_name,
    user_password,
  } = req.body;

  // SQL query to insert data into the Products table
  let insertProducts =
    "INSERT INTO products (product_url, product_name) VALUES(?, ?)";

  // SQL query to insert data into the ProductDescription table
  let insertProductDescription =
    "INSERT INTO ProductDescription (product_id, product_brief_description, product_description, product_img, product_link) VALUES(?, ?, ?, ?, ?)";

  // SQL query to insert data into the ProductPrice table
  let insertProductPrice =
    "INSERT INTO ProductPrice (product_id, starting_price, price_range) VALUES(?, ?, ?)";

  // SQL query to insert data into the Users table
  let insertUsers = "INSERT INTO Users (user_name, user_password) VALUES(?, ?)";

  // SQL query to insert data into the Orders table
  let insertOrders = "INSERT INTO Orders (product_id, user_id) VALUES(?, ?)";

  // Insert data into the Products table and use the generated product ID to the other tables that are defined as a forign key
  DBConnection.query(
    insertProducts,
    [product_url, product_name],
    (err, results) => {
      if (err) console.log(`Error found: ${err}`);
      console.log(results);
      console.table(results);

      const id = results.insertId; // Get the generated product ID and save on variable named "id"
      console.log(
        `id from Products table to be used as a foreign key in other tables >> ${id}`
      );

      // Insert related data into other tables using the product ID that generated from Products table. we use it as a foreign key for tables that need it.
      DBConnection.query(
        insertProductDescription,
        [
          id,
          product_brief_description,
          product_description,
          product_img,
          product_link,
        ],
        (err, results, fields) => {
          if (err) console.log(`Error found: ${err}`);
          console.log(results);
          console.table(results);
        }
      );

      DBConnection.query(
        insertProductPrice,
        [id, starting_price, price_range],
        (err, results, fields) => {
          if (err) console.log(`Error found: ${err}`);
          console.log(results);
          console.table(results);
        }
      );

      DBConnection.query(
        insertUsers,
        [user_name, user_password],
        (err, results, fields) => {
          if (err) console.log(`Error found: ${err}`);
          console.log(results);
          console.table(results);

          const userId = results.insertId; // Get the generated user ID and save on variable "userId". we use it as a foreign key for "Orders" table
          console.log(`Inserted User id got from User table: ${userId}`);

          DBConnection.query(
            insertOrders,
            [id, userId],
            (err, results, fields) => {
              if (err) console.log(`Error found: ${err}`);
              console.log(results);
              console.table(results);
            }
          );
        }
      );
      res.send("Data entered successfully");
    }
  );
});

// Start the server on the specified port to listen actively any request and give the right and epecific response to that request.
let PORT = 9639;
app.listen(PORT, () => {
  console.log("Listening to port 9639");
});
