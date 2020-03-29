const { uglify } = require('rollup-plugin-uglify')
const path = require('path')

module.exports = {
    input: 'src/index.js',
    external: [
        'jspdf'
    ],
    output: [
        {
            file: 'dist/dom2pdf.js',
            format: 'umd',
            globals: {
                jspdf: 'jsPDF'
            }
        },
        {
            file: 'dist/dom2pdf.min.js',
            format: 'umd',
            plugins: [uglify()],
            globals: {
                jspdf: 'jsPDF'
            }
        }
    ]
}