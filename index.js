const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const token = "token"

app.post('/api/log', async (req, res) => {
	const authHeader = req.headers['authorization'];
	if (authHeader === token) {
		try {
			const response = await axios.post('http://192.168.1.13:3100/loki/api/v1/push', req.body);
			res.status(response.status).send(response.data);
			console.log(response);
		} catch (error) {
			res.status(error.response.status).send(error.response.data);
		}
	} else {
		res.status(410).send({ error: "Unauthorized" });
	}
});

app.listen(8080, () => {
	console.log('Server running on port 8080');
});
