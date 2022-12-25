const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const XLSX = require('xlsx');

module.exports = {
  getPagination: (query) => ({
    skip: parseInt((query.page - 1) * query.perPage, 10) || 0,
    take: parseInt(query.perPage, 10) || 10,
  }),

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
