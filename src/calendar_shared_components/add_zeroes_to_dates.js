const addZeroes = (num) => {
    num = parseInt(num);
    if(num < 10) {
        num = "0" + num;
    }
    return num;
}

export default addZeroes;