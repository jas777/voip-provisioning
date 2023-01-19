import * as xml2js from "xml2js";
import { Router } from "express";
import { buildDeviceTemplate, DeviceTemplate } from "../templates/deviceTemplate";

const router = Router();

const provisioningRoutes = (baseTemplates: Map<string, string>, deviceTemplates: Map<string, DeviceTemplate>) => {
    router.get<{ device: string }>("/:device", (req, res) => {
        if (deviceTemplates.has(req.params.device)) {
            const userTemplate = deviceTemplates.get(req.params.device)!!;
            const base = userTemplate?.base || "";

            if (base === "") {
                res.send("No templates found").status(404);
                return;
            }

            const baseContent = baseTemplates.get(base);

            if (!baseContent) {
                res.send("Base template not found").status(404);
                return;
            }

            buildDeviceTemplate(userTemplate, baseContent, (result) => {
                res.contentType("text/xml").send(
                    new xml2js.Builder().buildObject(result)
                );
            });
        } else {
            res.send(`Unknown device "${req.params.device}"`).status(404);
        }
    });

    router.get<{ device: string; mac: string }>(
        "/provisioning/:device/:mac",
        (req, res) => {
            if (deviceTemplates.has(req.params.device)) {
                const userTemplate = deviceTemplates.get(req.params.device)!!;
                const base = userTemplate?.base || "";

                if (base === "") {
                    res.send("No templates found").status(404);
                    return;
                }

                const baseContent = baseTemplates.get(base);

                if (!baseContent) {
                    res.send("Base template not found").status(404);
                    return;
                }

                buildDeviceTemplate(userTemplate, baseContent, (result) => {
                    res.contentType("text/xml").send(
                        new xml2js.Builder().buildObject(result)
                    );
                });
            } else {
                res.send(`Unknown device "${req.params.device}"`).status(404);
            }
        }
    );

    return router;
};

export default provisioningRoutes;