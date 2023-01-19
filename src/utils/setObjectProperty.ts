const setObjectProperty = (object: any, path: string, value: any) => {
    const parts = path.split(".");
    const limit = parts.length - 1;
    for (let i = 0; i < limit; ++i) {
        const key = parts[i];
        object = object[key] ?? (object[key] = {});
    }
    const key = parts[limit];
    object[key] = value;
};

export default setObjectProperty;
