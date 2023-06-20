import fs from "fs";
import path from "path";
import xml2js from "xml2js";
import { logger, TEMPLATE_PATH } from "..";
import findPathsToKey from "../utils/findPathsToKey";
import setObjectProperty from "../utils/setObjectProperty";

export interface DeviceTemplate {
    base: string;
    device: string;
    firmware: string;
    replace: {
        key: string;
        value: string;
        attributes: {
            [key: string]: string;
        };
    }[];
}

export const loadDeviceTemplates = () => {
    const result = new Map<string, DeviceTemplate>();

    const dirContents = fs.readdirSync(TEMPLATE_PATH);

    if (!dirContents) {
        console.error("Error while reading the base template directory!");
        process.exit(1);
    }

    dirContents.forEach((file) => {
        const data = fs.readFileSync(path.join(TEMPLATE_PATH, file), "utf-8");
        const parsedData: DeviceTemplate = JSON.parse(data);

        if (!parsedData.device || !parsedData.base) return;

        logger.info(`Loaded device template for ${parsedData.device}`);
        result.set(parsedData.device, parsedData);
    });

    return result;
};

export const buildDeviceTemplate = (
    userTemplate: DeviceTemplate,
    baseTemplate: string,
    callback: (result: any) => void
) => {
    xml2js.parseString(baseTemplate, (err, result) => {
        let modResult = result;
        userTemplate?.replace.forEach((item) => {
            const foundItems = findPathsToKey({
                obj: result,
                key: item.key,
            });

            foundItems.forEach((foundItem) => {
                const builtProperty: {
                    _: string;
                    $: { [index: string]: string };
                }[] = [
                    {
                        _: item.value,
                        $: {
                            ua: "na",
                        },
                    },
                ];

                if (item.attributes) {
                    Object.keys(item.attributes).forEach((attr) => {
                        builtProperty[0].$[attr] = item.attributes[attr];
                    });
                }

                setObjectProperty(modResult, foundItem, builtProperty);
            });
        });
        callback(modResult);
    });
};
