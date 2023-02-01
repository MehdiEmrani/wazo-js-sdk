export default ((instance, ToClass) => {
    const args = {};
    Object.getOwnPropertyNames(instance).forEach(prop => {
        args[prop] = instance[prop];
    });
    return new ToClass(args);
});
