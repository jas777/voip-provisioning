import { Router } from "express";
import { DeviceTemplate } from "../templates/deviceTemplate";
import * as fs from "fs";
import * as path from "path";
import { FIRMWARE_PATH } from "..";

const router = Router();

const firmwareRoutes = (deviceTemplates: Map<string, DeviceTemplate>) => {
    router.get<{ device: string }>("/:device", (req, res) => {
        if (deviceTemplates.has(req.params.device)) {
            const deviceTemplate = deviceTemplates.get(req.params.device);

            if (!deviceTemplate?.firmware) {
                res.status(404).send("No firmware for this device");
                return;
            }

            const firmwareExists = fs.existsSync(
                path.join(FIRMWARE_PATH, deviceTemplate.firmware)
            );

            if (!firmwareExists) {
                res.status(500).send("Invalid firmware file name");
                return;
            }

            res.sendFile(path.join(FIRMWARE_PATH, deviceTemplate.firmware));
        } else {
            res.status(404).send("Unsupported device");
        }
    });

    return router;
};

export default firmwareRoutes;
