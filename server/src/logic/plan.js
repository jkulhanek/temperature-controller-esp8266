import xlsx_template_buffer from './resources/template.xlsx'; 
import { saveAs } from 'file-saver';
import * as ExcelJS from 'ExcelJS';
let xlsx_template = new Uint8Array(xlsx_template_buffer);

export async function readExcelFile(file, filename) {
    var workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(new Uint8Array(file));
    let worksheet = workbook.getWorksheet("plan");
    if(!worksheet) throw new Error("Missing worksheet named \"plan\"");

    let plan = [];
    for(let i = 0; i < 7; ++i) {
        let row = worksheet.getRow(((i + 6) % 7) + 2);
        Array.prototype.push.apply(plan, row.values.slice(2));
    }

    return {
        name: filename.slice(null, -5),
        temperatures: plan,
    };
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

export async function downloadExcel(plan) {
    let { name, temperatures } = plan;
    var workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(xlsx_template)
    workbook.creator = 'NodeMCU';
    workbook.lastModifiedBy = 'NodeMCU';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    if(temperatures) {
        let worksheet = workbook.getWorksheet("plan");
        for(let i = 0; i < 7; ++i) {
            for(let j = 0; j < 2 * 24; ++j) {
                worksheet.getCell(((i + 6) % 7) + 2, j + 2).value = temperatures[i * 2 * 24 + j];
            }
        }
    }

    let data = await workbook.xlsx.writeBuffer();
    var blob = new Blob([data], {type: "application/octet-stream"});
    saveAs(blob, name + '.xlsx');
}
