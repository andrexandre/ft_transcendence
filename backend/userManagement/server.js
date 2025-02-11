import fastify from "fastify";

// Creation of the app  instance
const app = fastify({logger: true});


app.get('/', (req, res) => {

	res.header('content-type', 'application/json');
	res.send({message: " Now we are working"});
});


app.listen({port: process.env.PORT}, () => {
	console.log(`Server is running on port: ${process.env.PORT}`);
});