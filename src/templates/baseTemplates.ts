import fs from "fs";
import path from "path";
import { BASE_PATH, logger } from "..";

export const loadBaseTemplates = () => {
    const result = new Map<string, string>();

    const dirContents = fs.readdirSync(BASE_PATH);

    if (!dirContents) {
        console.error("Error while reading the base template directory!");
        process.exit(1);
    }

    dirContents.forEach((file) => {
        const data = fs.readFileSync(path.join(BASE_PATH, file), "utf-8");
        logger.info(`Loaded base template ${file}`);
        result.set(file, data);
    });

    return result;
};
