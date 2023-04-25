module.exports = {
    mathMulti : (num1, num2)=>{
        num1=parseFloat(num1)
        num2=parseFloat(num2)
        return num1*num2;
    },
    increment : (value) => {
        return parseInt(value)+1;
    },
    subtract:(num1, num2)=>{
        if(num1>num2){
            const result = num1-num2;
            return result;
        }
    },
    isEqual: (num1, num2) => {
        return num1 == num2;
    },
    isNotEqual: (num1, num2) => {
        return num1 !== num2;
    },
    lessEqual: (num1, num2) => {
        return num1 <= num2;
    }
}