const path = require('path')

const fs = jest.genMockFromModule('fs')

let mockFiles = Object.create(null)

fs.setMockFiles = newMockFiles => {
  mockFiles = Object.create(null)
  Object.keys(newMockFiles).forEach(file => {
    const dir = path.dirname(file)

    if (!mockFiles[dir]) {
      mockFiles[dir] = []
    }
    mockFiles[dir].push(path.basename(file))
  })
}

fs.readdirSync = directoryPath => mockFiles[directoryPath] || []

module.exports = fs
