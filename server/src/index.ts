import express from "express";
import path from "path";
import winston from "winston";
import { loadBaseTemplates } from "./templates/baseTemplates";
import { loadDeviceTemplates } from "./templates/deviceTemplate";
import * as dgram from "dgram";
import syslogParse from "./utils/syslogParse";
import provisioningRoutes from "./routes/provisioning";
import firmwareRoutes from "./routes/firmware";

export const BASE_PATH = path.join(__dirname, "..", "..", "base");
export const TEMPLATE_PATH = path.join(__dirname, "..", "..", "template");
export const FIRMWARE_PATH = path.join(__dirname, "..", "..", "firmware");
export const CLIENT_PATH = path.join(__dirname, "..", "..", "client", "dist")

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
        new winston.transports.Console({ format: winston.format.simple() }),
    ],
});

const socket = dgram.createSocket("udp4");

socket.on("listening", () => {
    const address = socket.address();
    logger.info(`Socket listening on ${address.address}:${address.port}`);
});

socket.on("message", (msg, rinfo) => {
    logger.info(syslogParse(msg.toString("utf8"), rinfo).msg);
});

const app = express();

const baseTemplates = loadBaseTemplates();
const deviceTemplates = loadDeviceTemplates();

app.use(provisioningRoutes(baseTemplates, deviceTemplates));
app.use('/firmware', firmwareRoutes(deviceTemplates));
app.use('/', express.static(CLIENT_PATH));

app.post("*", (req, res) => {
    console.log("POST", req.url, req.body);
    res.send("OK!");
});

socket.bind(6968, "0.0.0.0");
app.listen(6969);

