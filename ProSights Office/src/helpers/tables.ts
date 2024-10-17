import { ExtractedTable } from "./extractImage";

/**
 * Creates a new sheet and populates it with table data from markdown strings.
 * @param headerRowMd Markdown string for the header row
 * @param mainTableMd Markdown string for the main table data
 */
export async function createTableFromMarkdown(extractedTable: ExtractedTable, originalImage: File): Promise<void> {
  await Excel.run(async (context) => {
    // Add a new worksheet
    const sheet = context.workbook.worksheets.add();

    // Process header row
    const headerCells = extractedTable.header_row_md.split("|").map((cell) => cell.trim());
    const headerRange = sheet.getRange("A1").getResizedRange(0, headerCells.length - 1);
    headerRange.values = [headerCells];
    headerRange.format.font.bold = true;

    console.log("Header cells:", headerCells);

    // Process main table data
    const rows = extractedTable.main_table_md.split("\n");
    const tableData = rows.map((row) => row.split("|").map((cell) => cell.trim()));

    if (tableData.length > 0) {
      const dataRange = sheet.getRange("A2").getResizedRange(tableData.length - 1, tableData[0].length - 1);
      dataRange.values = tableData;
    }

    console.log("Table data:", tableData);

    // Auto-fit columns
    sheet.getUsedRange().format.autofitColumns();

    await context.sync();
  });
}
