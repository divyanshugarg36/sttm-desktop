// joining all the classes passed to an array.
const joinClasses = (classNames: unknown[]) => classNames.filter((cn) => !!cn).join(' ');

export default joinClasses;
