


function logs(f) {
  return function(...args) {
    const result = f(...args);
    console.log(args, result);
    return result;
  };
};

@logs
function add(a, b) {
  return a + b;
}


console.log(add(3,5))
// const addAndLog = logs(add);
//
// console.log(addAndLog(3, 4))
