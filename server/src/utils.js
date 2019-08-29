export function toSnakeCase(s) {
    return s.replace(/\.?([A-Z])/g, function (x,y){return "_" + y}).replace(/^_/, "").toUpperCase();
}
