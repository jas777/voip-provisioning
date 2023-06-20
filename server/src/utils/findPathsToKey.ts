const findPathsToKey = (options: {
    obj: any;
    key: string;
    pathToKey?: string;
}) => {
    let results = [];

    (function findKey({ key, obj, pathToKey }) {
        const oldPath = `${pathToKey ? pathToKey + "." : ""}`;
        if (obj.hasOwnProperty(key)) {
            results.push(`${oldPath}${key}`);
            return;
        }

        if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
            for (const k in obj) {
                if (obj.hasOwnProperty(k)) {
                    if (Array.isArray(obj[k])) {
                        for (let j = 0; j < obj[k].length; j++) {
                            findKey({
                                obj: obj[k][j],
                                key,
                                pathToKey: `${oldPath}${k}[${j}]`,
                            });
                        }
                    }

                    if (obj[k] !== null && typeof obj[k] === "object") {
                        findKey({
                            obj: obj[k],
                            key,
                            pathToKey: `${oldPath}${k}`,
                        });
                    }
                }
            }
        }
    })(options);

    return results;
};

export default findPathsToKey;