let doc = new dom2pdf(document.getElementById('my-pdf-container'));

function savePDF() {
    doc.render();
    doc.save();
}