import fs from 'node:fs'
import path from 'node:path'
import PDFDocument from 'pdfkit'

const projectRoot = process.cwd()
const inputPath = path.join(projectRoot, 'planning-document.md')
const outputPath = path.join(projectRoot, 'planning-document.pdf')

if (!fs.existsSync(inputPath)) {
  console.error('planning-document.md not found.')
  process.exit(1)
}

const markdown = fs.readFileSync(inputPath, 'utf8')
const lines = markdown.split('\n')

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
})

const stream = fs.createWriteStream(outputPath)
doc.pipe(stream)

doc.font('Helvetica-Bold').fontSize(18).text('AI Study Partner Finder - Planning Document', {
  align: 'left',
})
doc.moveDown(0.8)

for (const rawLine of lines) {
  const line = rawLine.trimEnd()

  if (!line.trim()) {
    doc.moveDown(0.45)
    continue
  }

  if (line.startsWith('### ')) {
    doc.moveDown(0.4)
    doc.font('Helvetica-Bold').fontSize(13).text(line.replace(/^###\s+/, ''))
    doc.moveDown(0.2)
    continue
  }

  if (line.startsWith('## ')) {
    doc.moveDown(0.5)
    doc.font('Helvetica-Bold').fontSize(14).text(line.replace(/^##\s+/, ''))
    doc.moveDown(0.25)
    continue
  }

  if (line.startsWith('# ')) {
    doc.moveDown(0.6)
    doc.font('Helvetica-Bold').fontSize(16).text(line.replace(/^#\s+/, ''))
    doc.moveDown(0.35)
    continue
  }

  if (line.startsWith('- ')) {
    doc.font('Helvetica').fontSize(11).text(`• ${line.slice(2)}`, {
      indent: 12,
      lineGap: 2,
    })
    continue
  }

  doc.font('Helvetica').fontSize(11).text(line, {
    lineGap: 2,
  })
}

doc.end()

stream.on('finish', () => {
  console.log(`Generated: ${outputPath}`)
})
