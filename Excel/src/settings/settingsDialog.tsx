import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Input,
  Dropdown,
  Option,
  Checkbox,
  Button,
  tokens,
  Text,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerCell: {
    backgroundColor: tokens.colorNeutralBackground3,
    fontWeight: tokens.fontWeightSemibold,
  },
  cell: {
    padding: "8px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  colorCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  colorSwatch: {
    width: "20px",
    height: "20px",
    border: "1px solid #ccc",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
});

const fontStyles = ["Calibri", "Arial", "Times New Roman"];
const fontSizes = ["8", "9", "10", "11", "12"];
const fontColors = ["Calibri", "Black", "White"];
const fillColors = ["#0E2841", "#FFFFFF", "#DAE9F8"];
const borderOptions = ["None", "Top, Bottom", "All"];
const borderColors = ["None", "#000000"];
const decimalOptions = ["0", "1", "2"];

const SettingsDialog: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Text className={styles.title}>Style Settings</Text>
      <Table className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell className={styles.headerCell}>Section</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Font Style</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Font Size</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Font Color</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Bold</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Italics</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Underline</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Fill</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Borders</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Border Color</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Decimals</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {["General", "Header", "Sub Total", "Total"].map((section) => (
            <TableRow key={section}>
              <TableCell className={styles.cell}>{section}</TableCell>
              <TableCell className={styles.cell}>
                <Dropdown placeholder="Select font">
                  {fontStyles.map((font) => (
                    <Option key={font}>{font}</Option>
                  ))}
                </Dropdown>
              </TableCell>
              <TableCell className={styles.cell}>
                <Dropdown placeholder="Select size">
                  {fontSizes.map((size) => (
                    <Option key={size}>{size}</Option>
                  ))}
                </Dropdown>
              </TableCell>
              <TableCell className={styles.cell}>
                <Dropdown placeholder="Select color">
                  {fontColors.map((color) => (
                    <Option key={color}>{color}</Option>
                  ))}
                </Dropdown>
              </TableCell>
              <TableCell className={styles.cell}>
                <Checkbox />
              </TableCell>
              <TableCell className={styles.cell}>
                <Checkbox />
              </TableCell>
              <TableCell className={styles.cell}>
                <Checkbox />
              </TableCell>
              <TableCell className={styles.cell}>
                <div className={styles.colorCell}>
                  <div className={styles.colorSwatch} style={{ backgroundColor: fillColors[0] }}></div>
                  <Input value={fillColors[0]} />
                </div>
              </TableCell>
              <TableCell className={styles.cell}>
                <Dropdown placeholder="Select borders">
                  {borderOptions.map((option) => (
                    <Option key={option}>{option}</Option>
                  ))}
                </Dropdown>
              </TableCell>
              <TableCell className={styles.cell}>
                <Dropdown placeholder="Select color">
                  {borderColors.map((color) => (
                    <Option key={color}>{color}</Option>
                  ))}
                </Dropdown>
              </TableCell>
              <TableCell className={styles.cell}>
                <Dropdown placeholder="Select decimals">
                  {decimalOptions.map((option) => (
                    <Option key={option}>{option}</Option>
                  ))}
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Table className={styles.table} style={{ marginTop: "20px" }}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell className={styles.headerCell}>Section</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Hardcode</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Sheet Linking</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Workbook Linking</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Custom Codes</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className={styles.cell}>Color Code</TableCell>
            <TableCell className={styles.cell}>
              <div className={styles.colorCell}>
                <div className={styles.colorSwatch} style={{ backgroundColor: "#DAE9F8" }}></div>
                <Input value="#DAE9F8" />
              </div>
            </TableCell>
            <TableCell className={styles.cell}>
              <div className={styles.colorCell}>
                <div className={styles.colorSwatch} style={{ backgroundColor: "#DAE9F8" }}></div>
                <Input value="#DAE9F8" />
              </div>
            </TableCell>
            <TableCell className={styles.cell}>
              <div className={styles.colorCell}>
                <div className={styles.colorSwatch} style={{ backgroundColor: "#DAE9F8" }}></div>
                <Input value="#DAE9F8" />
              </div>
            </TableCell>
            <TableCell className={styles.cell}>
              <div className={styles.colorCell}>
                <div className={styles.colorSwatch} style={{ backgroundColor: "#DAE9F8" }}></div>
                <Input value="#DAE9F8" />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className={styles.buttonContainer}>
        <Button appearance="primary">Save Template</Button>
        <Button appearance="primary">Apply</Button>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("settings-dialog-container"));

Office.onReady(() => {
  root.render(
    <FluentProvider theme={webLightTheme}>
      <SettingsDialog />
    </FluentProvider>
  );
});
