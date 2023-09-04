/* for defaultData */
const rowLabels = ['', '', '', '', '']
const colLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const valueType = 'calendar'
const cornerRatio = 0.2
let csvFileName = 'defaultData.csv'
let title = 'Sales of Ice in August, 2012'
let topEmptyCellNum = 2

/* for defaultData2 */
// const rowLabels = ['Female', 'Male']
// const colLabels = ['1st Class', '2nd Class', '3rd Class']
// const valueType = 'percentage'
// const cornerRatio = 0.14
// let csvFileName = 'defaultData2.csv'
// let title = 'The Survival Rate of the Titanic'
// let topEmptyCellNum = 0

// modify based on your data
const canvasLength = 800
const titleTextSize = 40
const labelTextSize = 20
const tableOrigin = {
  x: labelTextSize * 4, 
  y: titleTextSize + labelTextSize * 3
}
const horizontalColor = '#ff00ff'
const verticalColor = '#00aa00'
const saturdayColor = '#0000ff'
const sundayColor = '#ff0000'
// tableau 10 palette as default
const palette = [
  '#17becf', '#bcbd22', '#7f7f7f', '#e377c2', '#8c564b', 
  '#9467bd', '#d62728', '#2ca02c', '#ff7f0e', '#1f77b4'
]
// from below, no need to modify by yourself
const colName2Bar = ['']
const backgroundAlpha = 0
let cells = []
let cellLength = 0
let maxDataObj = {}
let footerOrigin = {x: tableOrigin.x, y: tableOrigin.y}
let firstDraw = true
let barType = 'Diagonal Bar'
let csvTable
let col2SeeSelect
let emptyCellNumSelect
let barTypeSelect
let titleInput

function preload() {
  loadCsv()
}

function setup() {
  createCanvas(canvasLength, canvasLength)
  noLoop()
}

function draw() {
  /* setup */
  print('csvTable:', csvTable)
  // initiate selects
  col2SeeSelect = createSelect()
  emptyCellNumSelect = createSelect()
  barTypeSelect = createSelect()
  // +1 to ensure space for footer
  cellLength = floor(
    (canvasLength - tableOrigin.y) / max(rowLabels.length + 1, colLabels.length)
  )
  print('cellLength:', cellLength)
  // for handling data
  for (let index = 0; index < csvTable.columns.length; index++) {
    const colName = csvTable.columns[index]
    const colArray = csvTable.getColumn(colName)
    if (Number(colArray[0])) {
      if (valueType === 'percentage') maxDataObj[colName] = 1
      else maxDataObj[colName] = max(colArray.map(strValue => Number(strValue)))
      col2SeeSelect.option(colName)
    }
  }
  // print(maxDataObj)

  // initiate cells
  for (let index = 0; index < csvTable.getRowCount() + topEmptyCellNum; index++) {
    const rowId = floor(index / colLabels.length)
    const colId = index % colLabels.length
    let dataObj = {}
    if (index >= topEmptyCellNum) {
      dataObj = csvTable.getRow(index - topEmptyCellNum).obj
    }
    cells.push(new BarCell(
      dataObj, index, rowId, colId, cellLength, maxDataObj, topEmptyCellNum
    ))
  }
  footerOrigin.y += cellLength * (cells[cells.length-1].rowId + 1)

  // userIO
  const userIOTextSize = labelTextSize * 0.8
  textSize(userIOTextSize)
  textAlign(LEFT, CENTER)
  const rowHeight = userIOTextSize * 2
  const firstColX = footerOrigin.x
  const firstRowY = footerOrigin.y + rowHeight + labelTextSize * 1.5
  // // load csv
  const csvInputCoord = {x: firstColX, y: firstRowY}
  text('Select calendar CSV:', csvInputCoord.x, csvInputCoord.y)
  const csvInput = createFileInput((file) => {
    print('loaded file:', file)
    if (file.type === 'text') {
      csvTable = loadTable(file.name, file.subtype, 'header', () => {
        firstDraw = true
        csvFileName = file.name
        title = csvFileName.split('.')[0]
        reset()
      })
    }
  })
  csvInput.position(
    csvInputCoord.x + userIOTextSize * 11, 
    csvInputCoord.y - userIOTextSize * 0.8
  )
  // // bar type
  const barTypeSelectCoord = {x: firstColX + userIOTextSize * 27, y: firstRowY}
  text('Bar type:', barTypeSelectCoord.x, barTypeSelectCoord.y)
  barTypeSelect.position(
    barTypeSelectCoord.x + userIOTextSize * 5, 
    barTypeSelectCoord.y - userIOTextSize * 0.5
  )
  barTypeSelect.option('Diagonal Bar')
  barTypeSelect.option('Horizontal Bar')
  barTypeSelect.option('Vertical Bar')
  barTypeSelect.selected(barType)
  barTypeSelect.changed(() => {
    barType = barTypeSelect.value()
    reset()
  })
  // // col name to see
  const col2SeeSelectCoord = {x: firstColX, y: firstRowY + rowHeight}
  text('Column to plot:', col2SeeSelectCoord.x, col2SeeSelectCoord.y)
  col2SeeSelect.position(
    col2SeeSelectCoord.x + userIOTextSize * 8, 
    col2SeeSelectCoord.y - userIOTextSize * 0.5
  )
  col2SeeSelect.changed(() => {
    colName2Bar[0] = col2SeeSelect.value()
    reset()
  })
  if (firstDraw) {
    colName2Bar[0] = col2SeeSelect.selected()
    firstDraw = false
  } else {
    col2SeeSelect.selected(colName2Bar[0])
  }
  // // empty cell num
  const emptyCellNumSelectCoord = {
    x: firstColX + userIOTextSize * 15, y: firstRowY + rowHeight
  }
  text(
    'Num of head empty cells:', 
    emptyCellNumSelectCoord.x, emptyCellNumSelectCoord.y
  )
  emptyCellNumSelect.position(
    emptyCellNumSelectCoord.x + userIOTextSize * 13, 
    emptyCellNumSelectCoord.y - userIOTextSize * 0.5
  )
  for (let index = 0; index < 7; index++) {
    emptyCellNumSelect.option(index)
  }
  emptyCellNumSelect.selected(topEmptyCellNum)
  emptyCellNumSelect.changed(() => {
    const value2Go = parseInt(emptyCellNumSelect.value(), 10)
    topEmptyCellNum = value2Go
    reset()
  })
  // // title input
  const titleInputCoord = {x: firstColX, y: firstRowY + rowHeight * 2}
  text('Title:', titleInputCoord.x, titleInputCoord.y)
  titleInput = createInput(title)
  titleInput.position(
    titleInputCoord.x + userIOTextSize * 3, 
    titleInputCoord.y - userIOTextSize * 0.5
  )
  titleInput.input(() => title = titleInput.value())
  changeTitleButton = createButton('Change title')
  changeTitleButton.position(
    titleInputCoord.x + userIOTextSize * 15, 
    titleInputCoord.y - userIOTextSize * 0.5
  )
  changeTitleButton.mousePressed(() => reset())
  // // save img
  saveButton = createButton('Save Image')
  saveButton.position(firstColX, firstRowY + rowHeight * 3)
  saveButton.mousePressed(() => saveCanvas('plot of ' + csvFileName.split('.')[0]))


  /* draw */
  background(0, backgroundAlpha)
  fill(0)
  // title
  textAlign(CENTER, BOTTOM)
  textSize(titleTextSize)
  text(title, canvasLength / 2, tableOrigin.y / 2)
  // labels
  textAlign(CENTER, CENTER)
  textSize(labelTextSize)
  for (let index = 0; index < rowLabels.length; index++) {
    text(
      rowLabels[index], 
      tableOrigin.x / 2, 
      tableOrigin.y + cellLength * (index + 0.5)
    )
  }
  for (let index = 0; index < colLabels.length; index++) {
    if (index === 5) fill(saturdayColor) // saturday
    if (index === 6) fill(sundayColor) // sunday
    text(
      colLabels[index], 
      tableOrigin.x + (index + 0.5) * cellLength, 
      tableOrigin.y - labelTextSize
    )
    fill(0)
  }
  // cells and bars
  for (let index = 0; index < cells.length; index++) {
    if (index < topEmptyCellNum) continue
    cells[index].show(barType)
  }
}

function loadCsv(fileName=csvFileName, extension='csv') {
  csvTable = loadTable(fileName, extension, 'header')
}

function reset() {
  cells = []
  cellLength = 0
  maxDataObj = {}
  footerOrigin = {x: tableOrigin.x, y: tableOrigin.y}
  removeElements()
  clear()
  redraw()
}