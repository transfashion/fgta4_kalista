

export function isValidNPWP(npwp) {

    var check = checkNPWP(npwp);
    var result = check;
 
    // if object of result is defined
    if (typeof check.result !== "undefined") {
        result = check.result
    }
 
    // return
    return result;
}



export function checkNPWP(input) {
 
    // numeric only
    var npwp = input.replace(/[^\d]/g, '');
     
    // make sure it's 15 number
    if (npwp.length != 15) {
        return false;
    }
     
    // default no npwp, 15 digits of 0
    if (npwp === "000000000000000") {
        return true;
    }
 
    // multiply factor
    var multiplyby = [1, 2, 1, 2, 1, 2, 1, 2];
 
    // find first 8 digits
    var serialNumber = [];
 
    for (var i = 0; i < 8; i++) {
        serialNumber.push(parseInt(npwp[i], 10));
    }
 
    // first 8 digit multiply by "multiply factor"
    var serialNumberResult = [];
 
    for (var i = 0; i < 8; i++) {
        // add 0 if less than 10, get 2 digits from right
        //var padNumber = ("0" + (serialNumber[i] * multiplyby[i])).slice(-2);
        padNumber = (serialNumber[i] * multiplyby[i]).toString().padStart(2, "0");
        serialNumberResult.push([padNumber[0], padNumber[1]]);
    }
 
    // total
    var total = 0;
 
    for (var i = 0; i < serialNumberResult.length; i++) {
        var sum = parseInt(serialNumberResult[i][0], 10) + parseInt(serialNumberResult[i][1], 10);
         
        total += sum;
    }
 
    // ceil up total to nearest 10
    var ceilUp = Math.ceil(total / 10) * 10;
 
    // validation code or number, 9th character
    var validationNumber = parseInt(npwp[8], 10);
 
    // validation number after calculation
    var validationResult = ceilUp - total;
     
    // validation of serial number
    var validationSerialNumber = (validationNumber === validationResult) ? true : false;
 
 
 
    // KPP code
    var kppCode = [
        "000", "001", "002", "003", "004", "005", "006", "007", "008", "009", 
        "010", "011", "012", "013", "014", "015", "016", "017", "018", "019", 
        "020", "021", "022", "023", "024", "025", "026", "027", "028", "029", 
        "030", "031", "032", "033", "034", "035", "036", "037", "038", "039", 
        "040", "041", "042", "043", "044", "045", "046", "047", "048", "050", 
        "051", "052", "053", "054", "055", "056", "057", "058", "059", "060", 
        "061", "062", "063", "064", "065", "066", "067", "070", "071", "072", 
        "073", "074", "075", "076", "077", "080", "081", "085", "086", "090", 
        "091", "092", "093", "100", "101", "102", "103", "104", "105", "106", 
        "107", "110", "111", "112", "113", "114", "115", "116", "117", "118", 
        "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", 
        "130", "140", "150", "160", "170", "180", "190", "200", "201", "202", 
        "203", "204", "205", "210", "211", "212", "213", "214", "215", "216", 
        "217", "218", "219", "220", "221", "222", "223", "224", "225", "230", 
        "240", "250", "260", "270", "280", "290", "300", "301", "302", "303", 
        "304", "305", "306", "307", "308", "309", "310", "311", "312", "313", 
        "314", "315", "320", "321", "322", "323", "324", "325", "326", "327", 
        "328", "330", "331", "332", "333", "334", "335", "401", "402", "403", 
        "404", "405", "406", "407", "408", "409", "411", "412", "413", "414", 
        "415", "416", "417", "418", "419", "421", "422", "423", "424", "425", 
        "426", "427", "428", "429", "431", "432", "433", "434", "435", "436", 
        "437", "438", "439", "441", "442", "443", "444", "445", "446", "447", 
        "448", "451", "452", "453", "501", "502", "503", "504", "505", "506", 
        "507", "508", "509", "511", "512", "513", "514", "515", "516", "517", 
        "518", "521", "522", "523", "524", "525", "526", "527", "528", "529", 
        "531", "532", "533", "541", "542", "543", "544", "545", "601", "602", 
        "603", "604", "605", "606", "607", "608", "609", "611", "612", "613", 
        "614", "615", "616", "617", "618", "619", "621", "622", "623", "624", 
        "625", "626", "627", "628", "629", "631", "641", "642", "643", "644", 
        "645", "646", "647", "648", "649", "651", "652", "653", "654", "655", 
        "656", "657", "701", "702", "703", "704", "705", "706", "711", "712",
        "713", "714", "721", "722", "723", "724", "725", "726", "727", "728", 
        "729", "731", "732", "733", "734", "735", "801", "802", "803", "804", 
        "805", "806", "807", "808", "809", "811", "812", "813", "814", "815", 
        "816", "821", "822", "823", "824", "825", "831", "832", "833", "834", 
        "901", "902", "903", "904", "905", "906", "907", "908", "911", "912", 
        "913", "914", "915", "921", "922", "923", "924", "925", "926", "941", 
        "942", "943", "951", "952", "953", "954", "955", "956"];
 
    var kpp = npwp.substring(9, 12);
 
    // validation KPP code
    var validationKPP = (kppCode.indexOf(kpp) >= 0) ? true : false;
     
 
    // result 
    var validationNPWP = (validationSerialNumber === validationKPP) ? true : false;
 
    var result = {
        "npwp" : npwp,
        "serialNumber" : serialNumber,
        "kpp" : kpp,
        "validationNumber" : validationNumber,
        "validationResult" : validationResult,
        "validationSerialNumber" : validationSerialNumber,
        "validationKPP" : validationKPP,
        "result" : (validationSerialNumber && validationNPWP) ? true : false
    };
 
 
    // return
    return result;
 
}