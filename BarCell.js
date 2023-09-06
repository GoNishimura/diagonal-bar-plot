class BarCell {
  constructor (
      dataObj, idx, rowId, colId, cellLength, maxDataObj, topEmptyCellNum) {
    this.dataObj = dataObj
    this.idx = idx
    this.rowId = rowId
    this.colId = colId
    this.cellLength = cellLength
    this.maxDataObj = maxDataObj
    this.topEmptyCellNum = topEmptyCellNum
    this.x = colId * cellLength + tableOrigin.x
    this.y = rowId * cellLength + tableOrigin.y
    this.cornerLength = cornerRatio * cellLength
  }
  show (drawType) {
    push()
    translate(this.x, this.y)
    // cell
    fill(0, 0)
    square(0, 0, this.cellLength)
    fill(0)
    // axis
    const sizeOfText = this.cornerLength * 0.75
    textSize(sizeOfText)
    const triangleHeight = this.cornerLength * 0.4
    const tirangleWidth = triangleHeight * 0.3
    triangle(0, 0, -tirangleWidth, triangleHeight, tirangleWidth, triangleHeight)
    triangle(
      this.cellLength, this.cellLength, 
      this.cellLength - triangleHeight, this.cellLength - tirangleWidth, 
      this.cellLength - triangleHeight, this.cellLength + tirangleWidth
    )
    // left bottom cell
    if (this.rowId + 1 === rowLabels.length && this.colId === 0) {
      textAlign(RIGHT, TOP)
      const axisTextSize = sizeOfText * 0.7
      textSize(axisTextSize)
      fill(255, 0, 0)
      text('O', 0, this.cellLength)
      const maxNum = valueType === 'percentage' ? 100 * this.maxDataObj[colName2Bar[0]] : this.maxDataObj[colName2Bar[0]]
      text(maxNum, -axisTextSize / 2, 0)
      text(maxNum, this.cellLength, this.cellLength + axisTextSize / 2)
    }
    // draw bars
    for (let index = 0; index < colName2Bar.length; index++) {
      const colName = colName2Bar[index]
      const valueRatio = this.dataObj[colName] / this.maxDataObj[colName]
      const bottomLeft = {x: 0, y: this.cellLength}
      const topRight = {
        x: this.cellLength * valueRatio, 
        y: this.cellLength * (1 - valueRatio)
      }
      stroke(0)
      // comparison line
      push()
      // // horizontal
      if (drawType !== 'Horizontal Bar') {
        stroke(horizontalColor)
        line(bottomLeft.x, topRight.y, this.cellLength, topRight.y)
      }
      // // vertical
      if (drawType !== 'Vertical Bar') {
        stroke(verticalColor)
        line(topRight.x, 0, topRight.x, bottomLeft.y)
      }
      pop()
      // bar
      if (drawType === 'Diagonal Bar') {
        fill(palette[index])
        if (valueRatio > cornerRatio) {
          beginShape()
          // // bar bottom
          vertex(bottomLeft.x + this.cornerLength, bottomLeft.y)
          vertex(bottomLeft.x, bottomLeft.y)
          vertex(bottomLeft.x, bottomLeft.y - this.cornerLength)
          // // bar top
          vertex(topRight.x - this.cornerLength, topRight.y)
          vertex(topRight.x, topRight.y)
          vertex(topRight.x, topRight.y + this.cornerLength)
          endShape(CLOSE)
        } else {
          rect(bottomLeft.x, topRight.y, topRight.x, this.cellLength - topRight.y)
        }
      } else if (drawType === 'Horizontal Bar') {
        fill(horizontalColor)
        rect(0, topRight.y, this.cellLength, this.cellLength - topRight.y)
      } else if (drawType === 'Vertical Bar') {
        fill(verticalColor)
        rect(0, 0, topRight.x, this.cellLength)
      } else if (drawType === 'Orthogonal Bars') {
        fill(horizontalColor)
        rect(0, topRight.y, this.cornerLength, this.cellLength - topRight.y)
        fill(verticalColor)
        rect(0, this.cellLength - this.cornerLength, topRight.x, this.cornerLength)
        fill(palette[index])
        rect(0, this.cellLength - this.cornerLength, this.cornerLength)
      }
      // value text
      textAlign(CENTER, CENTER)
      textSize(sizeOfText)
      push()
      fill(255)
      if (drawType === 'Horizontal Bar') {
        translate(this.cellLength / 2, (bottomLeft.y + topRight.y) / 2)
      } else if (drawType === 'Vertical Bar') {
        translate(bottomLeft.x + topRight.x / 2, this.cellLength / 2)
      } else if (drawType === 'Orthogonal Bars') {
        textAlign(LEFT, CENTER)
        translate(
          bottomLeft.x, bottomLeft.y - this.cornerLength / 2
        )
      } else {
        translate((bottomLeft.x + topRight.x) / 2, (bottomLeft.y + topRight.y) / 2)
      }
      if (drawType === 'Diagonal Bar') rotate(- PI / 4)
      strokeWeight(2)
      if (valueType === 'percentage') {
        text(parseInt(100 * this.dataObj[colName2Bar], 10), 0, 0)
      } else text(this.dataObj[colName2Bar], 0, 0)
      pop()
    }
    // text
    fill(0)
    noStroke()
    if (valueType === 'calendar') {
      if (this.colId === 5) fill(saturdayColor)
      if (this.colId === 6) fill(sundayColor)
      const date = this.idx - this.topEmptyCellNum + 1
      const padRatio = 0.05
      // // left top text
      textAlign(LEFT, TOP)
      text(date, this.cellLength * padRatio, this.cellLength * padRatio)
      // // right bottom text
      // textAlign(RIGHT, BOTTOM)
      // text(date, this.cellLength * (1 - padRatio), this.cellLength * (1 - padRatio))
    }
    pop()
  }
}