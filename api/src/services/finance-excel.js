/** Export financiero Excel (SpreadsheetML) — tablas limpias, anchos fijos y totales. */

const invoiceStatusLabel = {
  pending: 'Pendiente',
  overdue: 'Vencido',
  paid: 'Pagado',
  cancelled: 'Anulado',
};

const paymentMethodLabel = {
  transfer: 'Transferencia',
  cash: 'Efectivo',
  card: 'Tarjeta',
  debit: 'Débito',
  credit: 'Crédito',
};

export function labelInvoiceStatus(status) {
  return invoiceStatusLabel[status] || String(status || '—');
}

export function labelPaymentMethod(method) {
  return paymentMethodLabel[method] || String(method || '—');
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cell(value, { type = 'String', style = '', mergeAcross = 0 } = {}) {
  const attrs = [
    style ? `ss:StyleID="${style}"` : '',
    mergeAcross > 0 ? `ss:MergeAcross="${mergeAcross}"` : '',
  ].filter(Boolean).join(' ');
  const data = type === 'Number' && Number.isFinite(Number(value))
    ? `<Data ss:Type="Number">${Number(value)}</Data>`
    : type === 'DateTime'
      ? `<Data ss:Type="DateTime">${esc(value)}</Data>`
      : `<Data ss:Type="String">${esc(value ?? '')}</Data>`;
  return `<Cell${attrs ? ` ${attrs}` : ''}>${data}</Cell>`;
}

function text(value, style = '') {
  const cleaned = String(value ?? '').trim();
  return cell(cleaned || '—', { style });
}

function money(value, style = 'money') {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return text('—', style === 'money' ? '' : style);
  return cell(amount, { type: 'Number', style });
}

function dateCell(value, style = 'date') {
  const raw = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return text(value || '—');
  return cell(`${raw}T00:00:00.000`, { type: 'DateTime', style });
}

function header(label) {
  return cell(label, { style: 'header' });
}

function row(cells, height) {
  const attrs = height ? ` ss:Height="${height}"` : '';
  return `<Row${attrs}>${cells.join('')}</Row>`;
}

function columns(widths) {
  return widths.map((width) => `<Column ss:AutoFitWidth="0" ss:Width="${width}"/>`).join('');
}

function emptyRow(cols = 1) {
  return row([cell('', { mergeAcross: Math.max(0, cols - 1) })]);
}

function sheet(name, { widths, rowsXml, freezeAt = 0, filterRange = '' }) {
  const freeze = freezeAt > 0
    ? `
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>${freezeAt}</SplitHorizontal>
      <TopRowBottomPane>${freezeAt}</TopRowBottomPane>
      <ActivePane>2</ActivePane>
      <ProtectObjects>False</ProtectObjects>
      <ProtectScenarios>False</ProtectScenarios>
    </WorksheetOptions>`
    : `
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <ProtectObjects>False</ProtectObjects>
      <ProtectScenarios>False</ProtectScenarios>
    </WorksheetOptions>`;
  const autoFilter = filterRange
    ? `<AutoFilter x:Range="${esc(filterRange)}" xmlns="urn:schemas-microsoft-com:office:excel"></AutoFilter>`
    : '';
  return `
  <Worksheet ss:Name="${esc(name)}">
    <Table ss:DefaultRowHeight="18">
      ${columns(widths)}
      ${rowsXml}
    </Table>
    ${autoFilter}
    ${freeze}
  </Worksheet>`;
}

function titleBlock(title, subtitle, cols) {
  return [
    row([cell(title, { style: 'title', mergeAcross: cols - 1 })], 28),
    row([cell(subtitle, { style: 'subtitle', mergeAcross: cols - 1 })], 20),
    emptyRow(cols),
  ].join('');
}

function metaRow(label, value, cols = 3) {
  return row([
    cell(label, { style: 'metaLabel' }),
    cell(String(value ?? '—'), { style: 'metaValue', mergeAcross: Math.max(0, cols - 2) }),
  ]);
}

function summarySheet({ school, year, generatedBy, totals, section }) {
  const cols = 3;
  const lines = [
    ...titleBlock(
      `Informe financiero ${year}`,
      school?.name || 'Establecimiento',
      cols,
    ),
    metaRow('RBD', school?.rbd || '—', cols),
    metaRow('RUT / razón social', [school?.companyRut, school?.companyName].filter(Boolean).join(' · ') || '—', cols),
    metaRow('Dirección', school?.address || '—', cols),
    metaRow('Alcance', section, cols),
    metaRow('Generado por', generatedBy || '—', cols),
    metaRow(
      'Fecha de emisión',
      new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago', dateStyle: 'short', timeStyle: 'short' }),
      cols,
    ),
    emptyRow(cols),
    row([header('Indicador'), header('Cantidad'), header('Monto (CLP)')], 22),
    row([text('Documentos de cobro', 'body'), money(totals.invoicesCount, 'count'), money(totals.invoiceTotal)], 20),
    row([text('Pagos recibidos', 'zebra'), money(totals.paymentsCount, 'countZebra'), money(totals.paymentTotal, 'moneyZebra')], 20),
    row([text('Gastos ejecutados', 'body'), money(totals.expensesCount, 'count'), money(totals.expenseTotal)], 20),
    row([
      cell('Saldo operativo (pagos − gastos)', { style: 'totalLabel' }),
      cell('', { style: 'total' }),
      money(totals.paymentTotal - totals.expenseTotal, 'totalMoney'),
    ], 22),
  ];
  return sheet('Resumen', {
    widths: [220, 90, 130],
    rowsXml: lines.join(''),
  });
}

function dataSheet({
  name,
  title,
  year,
  schoolName,
  headers,
  widths,
  bodyRows,
  totalCells,
}) {
  const cols = headers.length;
  const headerRowIndex = 4; // title, subtitle, blank, header
  const filterRange = `R${headerRowIndex}C1:R${headerRowIndex + Math.max(bodyRows.length, 1)}C${cols}`;
  const lines = [
    ...titleBlock(title, `${schoolName || 'Colegio'} · Año ${year}`, cols),
    row(headers.map(header), 22),
  ];

  if (!bodyRows.length) {
    lines.push(row([cell('Sin registros en este período.', { style: 'empty', mergeAcross: cols - 1 })], 22));
  } else {
    bodyRows.forEach((cells, index) => {
      const zebra = index % 2 === 1;
      lines.push(row(cells.map((item) => {
        if (item.kind === 'money') return money(item.value, zebra ? 'moneyZebra' : 'money');
        if (item.kind === 'date') return dateCell(item.value, zebra ? 'dateZebra' : 'date');
        if (item.kind === 'count') return money(item.value, zebra ? 'countZebra' : 'count');
        return text(item.value, zebra ? 'zebra' : 'body');
      }), 18));
    });
    if (totalCells?.length) {
      lines.push(row(totalCells, 22));
    }
  }

  return sheet(name, {
    widths,
    rowsXml: lines.join(''),
    freezeAt: headerRowIndex,
    filterRange: bodyRows.length ? filterRange : '',
  });
}

function invoicesSheet(rows, { year, schoolName }) {
  const total = rows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return dataSheet({
    name: 'Cobros',
    title: 'Documentos de cobro',
    year,
    schoolName,
    headers: ['Número', 'Vencimiento', 'Monto (CLP)', 'Estado', 'Estudiante', 'Proveedor'],
    widths: [110, 90, 110, 90, 180, 160],
    bodyRows: rows.map((item) => [
      { value: item.number },
      { kind: 'date', value: item.dueOn },
      { kind: 'money', value: item.amount },
      { value: labelInvoiceStatus(item.status) },
      { value: item.studentName || '—' },
      { value: item.supplierName || '—' },
    ]),
    totalCells: [
      cell('TOTAL', { style: 'totalLabel' }),
      cell('', { style: 'total' }),
      money(total, 'totalMoney'),
      cell('', { style: 'total' }),
      cell(`${rows.length} documento${rows.length === 1 ? '' : 's'}`, { style: 'total' }),
      cell('', { style: 'total' }),
    ],
  });
}

function paymentsSheet(rows, { year, schoolName }) {
  const total = rows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return dataSheet({
    name: 'Pagos',
    title: 'Pagos recibidos',
    year,
    schoolName,
    headers: ['Fecha', 'Documento', 'Monto (CLP)', 'Medio de pago'],
    widths: [90, 140, 110, 130],
    bodyRows: rows.map((item) => [
      { kind: 'date', value: item.paidAt },
      { value: item.invoiceNumber || (item.invoiceId ? `#${item.invoiceId}` : '—') },
      { kind: 'money', value: item.amount },
      { value: labelPaymentMethod(item.method) },
    ]),
    totalCells: [
      cell('TOTAL', { style: 'totalLabel' }),
      cell(`${rows.length} pago${rows.length === 1 ? '' : 's'}`, { style: 'total' }),
      money(total, 'totalMoney'),
      cell('', { style: 'total' }),
    ],
  });
}

function expensesSheet(rows, { year, schoolName }) {
  const total = rows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return dataSheet({
    name: 'Gastos',
    title: 'Gastos ejecutados',
    year,
    schoolName,
    headers: ['Fecha', 'Concepto', 'Centro de costo', 'Proveedor', 'RUT', 'Monto (CLP)'],
    widths: [90, 200, 120, 160, 100, 110],
    bodyRows: rows.map((item) => [
      { kind: 'date', value: item.spentOn },
      { value: item.concept },
      { value: item.costCenter || '—' },
      { value: item.supplierName || '—' },
      { value: item.supplierTaxId || '—' },
      { kind: 'money', value: item.amount },
    ]),
    totalCells: [
      cell('TOTAL', { style: 'totalLabel' }),
      cell(`${rows.length} gasto${rows.length === 1 ? '' : 's'}`, { style: 'total' }),
      cell('', { style: 'total' }),
      cell('', { style: 'total' }),
      cell('', { style: 'total' }),
      money(total, 'totalMoney'),
    ],
  });
}

function suppliersSheet(rows, { year, schoolName }) {
  const total = rows.reduce((sum, item) => sum + Number(item.expenseTotal || 0), 0);
  return dataSheet({
    name: 'Proveedores',
    title: 'Proveedores del período',
    year,
    schoolName,
    headers: ['Proveedor', 'RUT', 'Correo', 'N° gastos', 'Monto (CLP)'],
    widths: [200, 100, 180, 80, 110],
    bodyRows: rows.map((item) => [
      { value: item.name },
      { value: item.taxId || '—' },
      { value: item.email || '—' },
      { kind: 'count', value: item.expenseCount },
      { kind: 'money', value: item.expenseTotal },
    ]),
    totalCells: [
      cell('TOTAL', { style: 'totalLabel' }),
      cell('', { style: 'total' }),
      cell(`${rows.length} proveedor${rows.length === 1 ? '' : 'es'}`, { style: 'total' }),
      cell('', { style: 'total' }),
      money(total, 'totalMoney'),
    ],
  });
}

export function buildFinanceExcel({
  school,
  year,
  generatedBy,
  sectionLabel,
  include,
  invoices,
  payments,
  expenses,
  suppliers,
  totals,
}) {
  const ctx = { year, schoolName: school?.name || '' };
  const sheets = [
    summarySheet({
      school,
      year,
      generatedBy,
      totals,
      section: sectionLabel,
    }),
  ];
  if (include.invoices) sheets.push(invoicesSheet(invoices, ctx));
  if (include.payments) sheets.push(paymentsSheet(payments, ctx));
  if (include.expenses) sheets.push(expensesSheet(expenses, ctx));
  if (include.suppliers) sheets.push(suppliersSheet(suppliers, ctx));

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>Informe financiero ${esc(year)}</Title>
    <Author>${esc(generatedBy || 'DashCole')}</Author>
    <Company>${esc(school?.name || '')}</Company>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1F2A33"/>
    </Style>
    <Style ss:ID="title">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#0E2535"/>
    </Style>
    <Style ss:ID="subtitle">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#5B6B76"/>
    </Style>
    <Style ss:ID="metaLabel">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#5B6B76"/>
    </Style>
    <Style ss:ID="metaValue">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1F2A33"/>
    </Style>
    <Style ss:ID="header">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0E2535"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0E2535" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="body">
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E6ECF1"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1F2A33"/>
    </Style>
    <Style ss:ID="zebra">
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E6ECF1"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1F2A33"/>
      <Interior ss:Color="#F5F8FA" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="money">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E6ECF1"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1F2A33"/>
      <NumberFormat ss:Format="&quot;$&quot;#,##0"/>
    </Style>
    <Style ss:ID="moneyZebra">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E6ECF1"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1F2A33"/>
      <Interior ss:Color="#F5F8FA" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="&quot;$&quot;#,##0"/>
    </Style>
    <Style ss:ID="count">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E6ECF1"/>
      </Borders>
      <NumberFormat ss:Format="#,##0"/>
    </Style>
    <Style ss:ID="countZebra">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E6ECF1"/>
      </Borders>
      <Interior ss:Color="#F5F8FA" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0"/>
    </Style>
    <Style ss:ID="date">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E6ECF1"/>
      </Borders>
      <NumberFormat ss:Format="dd-mm-yyyy"/>
    </Style>
    <Style ss:ID="dateZebra">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E6ECF1"/>
      </Borders>
      <Interior ss:Color="#F5F8FA" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="dd-mm-yyyy"/>
    </Style>
    <Style ss:ID="total">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0E2535"/>
      <Interior ss:Color="#EEF3F6" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="totalLabel">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0E2535"/>
      <Interior ss:Color="#EEF3F6" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="totalMoney">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0E2535"/>
      <Interior ss:Color="#EEF3F6" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="&quot;$&quot;#,##0"/>
    </Style>
    <Style ss:ID="empty">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Italic="1" ss:Color="#5B6B76"/>
    </Style>
  </Styles>
  ${sheets.join('\n')}
</Workbook>`;
}
