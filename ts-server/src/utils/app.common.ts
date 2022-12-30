import { logError } from '../provides/log.provide'
/**
 * array to object with key by column in item array
 *
 * @param arr Array [{col1: val1, col2: val2}]
 * @param col string
 * @returns object json {col1: {item1}, col2: {item2}}
 */
export function keyByColum(arr, col) {
    const result = {};
    arr.forEach((item) => {
        result[item[col]] = item;
    });
    return result;
}

/**
 * format number
 *
 * @param x number
 * @returns 
 */
export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * string to json object data
 *
 * @param data string
 * @returns 
 */
export function stringToJson(data) {
  if (!data) {
    return {};
  }
  if (typeof data === 'object') {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    logError(err);
    return {};
  }
}

/**
 * get attrs - values of object
 *
 * @param obj object {a: 1, b: 2, c: 3}
 * @param attrs array [a, b]
 * @returns  => {a:1, b:2}
 */
export function getAttrsOfObj(obj, attrs) {
  const result = {};
  attrs.forEach(function(item) {
    if (obj[item]) {
      result[item] = obj[item];
    }
  });
  return result;
}
