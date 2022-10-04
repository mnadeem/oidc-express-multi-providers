
export const stringToArray  = (csv, delimiter = ',') => {
    return csv.split(delimiter).map(e => e.trim());
}