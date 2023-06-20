const findVal = (object: any, key: string): any => {
    let value;
    Object.keys(object).some((k) => {
        if (k === key) {
            value = object[k];
            return true;
        }
        if (object[k] && typeof object[k] === "object") {
            value = findVal(object[k], key);
            return value !== undefined;
        }
    });
    return value;
};

export default findVal;