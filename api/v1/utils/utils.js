const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const XLSX = require('xlsx');
const { JSDOM } = require('jsdom');

module.exports = {
  getPagination: ({ page = 1, perPage = 10 }) => ({
    skip: parseInt((page - 1) * perPage, 10) || 0,
    take: parseInt(perPage, 10) || 10,
  }),

  // NOTE: ceil 1 - 200 words to 1 minute
  getAverageReadingSpeed: (text) => {
    const html = `<div id="editor">${text}</div>`;
    const dom = new JSDOM(html);
    const editorContent = dom.window.document.getElementById('editor').innerHTML;

    const words = editorContent.split(' ').length;
    const minutes = words / 200;

    return Math.ceil(minutes);
  },

  monthDayYearFormat: (d) => {
    if (!d) return 'N/A';

    const date = new Date(d);
    const format = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return format;
  },

  getCSV: (data, fields) => {
    const csvStringifier = createCsvWriter({ header: fields });

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);
  },

  getXLSX: (data, fields, name) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, [fields]);
    XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(workbook, worksheet, name || 'Sheet1');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  },
};
