import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/logging';
import authorRoutes, { route } from './routes/Author';

const router = express();

// connect mongo
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('MongoDB is connected');
        startServer();
    })
    .catch((error) => {
        Logging.error('Unable to connect to MongoDB');
        Logging.error(error);
    });

// start server if mongo connected successfully
const startServer = () => {
    router.use((req, res, next) => {
        Logging.info(`Incoming -> Method: [${req.method}] URL: [${req.url}] IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            // response log
            Logging.info(`Incoming -> Method: [${req.method}] URL: [${req.url}] IP: [${req.socket.remoteAddress}] Status: [${res.statusCode}]`);
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    // api rules
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }

        next();
    });

    // routes
    router.use('/authors', authorRoutes);

    // health check
    router.get('/ping', (req, res, text) => res.status(200).json({ message: 'pong' }));

    // error handling
    router.use((req, res, next) => {
        const error = new Error('Not found');
        Logging.error(error);

        return res.status(404).json({
            message: error.message
        });
    });

    http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));
};
