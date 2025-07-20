How to run the app
Mongo DB
docker run --name mongodb -d -p 27017:27017 mongodb/mongodb-community-server:latest
(if need to run local)
How to run backend
npm run server

How to run full app
npm run dev



# Example .env file
MONGODB_URI={{connection string to your MongoDB instance}}
MONGODB_URI=mongodb+srv://user:password@string