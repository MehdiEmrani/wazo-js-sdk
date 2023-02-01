export const lastIndexOf = (array, method) => {
    const start = array.length - 1;
    for (let i = start; i >= 0; i--) {
        if (method(array[i])) {
            return i;
        }
    }
    return -1;
};
