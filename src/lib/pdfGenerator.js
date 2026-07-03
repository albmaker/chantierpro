import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generatePDF(doc, profile, type = 'devis') {
  const isDevis = type === 'devis'
  const docNumero = doc.id
  const dateDoc = isDevis ? doc.date : doc.date
  const validite = isDevis ? doc.validite : doc.echeance

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Couleurs
  const orange = [255, 107, 53]
  const navy = [15, 27, 45]
  const gray = [120, 120, 120]

  // Header
  pdf.setFillColor(...navy)
  pdf.rect(0, 0, 210, 35, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(24)
  pdf.text('ChantierPro', 15, 18)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text(profile.nom, 15, 25)
  pdf.text(profile.adresse, 15, 30)
  pdf.text(`${profile.email} · ${profile.tel}`, 15, 34)

  // Titre du document
  pdf.setTextColor(...orange)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)
  pdf.text(isDevis ? 'DEVIS' : 'FACTURE', 195, 20, { align: 'right' })

  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text(`N° ${docNumero}`, 195, 26, { align: 'right' })
  pdf.text(`Date : ${dateDoc}`, 195, 30, { align: 'right' })
  if (validite) {
    pdf.text(`${isDevis ? 'Validité' : 'Échéance'} : ${validite}`, 195, 34, { align: 'right' })
  }

  // Bloc client
  pdf.setTextColor(0, 0, 0)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('DESTINATAIRE', 15, 50)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.text(doc.client, 15, 56)
  pdf.setFontSize(9)
  pdf.text(doc.clientAdresse, 15, 61)
  if (doc.clientEmail) pdf.text(doc.clientEmail, 15, 65)
  if (doc.clientTel) pdf.text(doc.clientTel, 15, 69)

  // Mention FE 2026
  pdf.setFillColor(255, 240, 230)
  pdf.setDrawColor(...orange)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(140, 45, 55, 12, 1, 1, 'FD')
  pdf.setTextColor(...orange)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('Compatible Factur-X 2026', 167.5, 51, { align: 'center' })
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.text('Réforme facturation électronique', 167.5, 55, { align: 'center' })

  // Tableau des lignes
  const tableData = doc.lignes.map(l => [
    l.ref,
    l.label,
    `${l.qty} ${l.unit}`,
    `${l.priceHT.toFixed(2)} €`,
    `TVA ${l.tva}%`,
    `${(l.qty * l.priceHT * (1 + l.tva/100)).toFixed(2)} €`,
  ])

  autoTable(pdf, {
    startY: 80,
    head: [['Réf', 'Désignation', 'Qté', 'P.U. HT', 'TVA', 'Total TTC']],
    body: tableData,
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { cellWidth: 20, fontSize: 8, textColor: gray },
      1: { cellWidth: 75 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 15, right: 15 },
  })

  // Totaux
  const totalHT = doc.lignes.reduce((s, l) => s + l.qty * l.priceHT, 0)
  const totalTVA = doc.lignes.reduce((s, l) => s + l.qty * l.priceHT * (l.tva / 100), 0)
  const totalTTC = totalHT + totalTVA

  const finalY = pdf.lastAutoTable.finalY + 8

  pdf.setFontSize(9)
  pdf.setTextColor(80, 80, 80)
  pdf.text('Total HT', 145, finalY, { align: 'right' })
  pdf.text(`${totalHT.toFixed(2)} €`, 195, finalY, { align: 'right' })

  pdf.text('TVA', 145, finalY + 5, { align: 'right' })
  pdf.text(`${totalTVA.toFixed(2)} €`, 195, finalY + 5, { align: 'right' })

  pdf.setFillColor(...orange)
  pdf.rect(125, finalY + 9, 70, 12, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text('Total TTC', 130, finalY + 16)
  pdf.text(`${totalTTC.toFixed(2)} €`, 192, finalY + 16, { align: 'right' })

  // CGV
  if (profile.cgv) {
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text('CONDITIONS GÉNÉRALES DE VENTE', 15, finalY + 30)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    const splitCgv = pdf.splitTextToSize(profile.cgv, 180)
    pdf.text(splitCgv, 15, finalY + 35)
  }

  // Footer
  const pageHeight = pdf.internal.pageSize.height
  pdf.setFillColor(...navy)
  pdf.rect(0, pageHeight - 15, 210, 15, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.text(
    `${profile.nom} · SIRET ${profile.siret} · TVA ${profile.tva}`,
    15,
    pageHeight - 8
  )
  pdf.text(
    `IBAN ${profile.iban}`,
    195,
    pageHeight - 8,
    { align: 'right' }
  )

  // Téléchargement
  pdf.save(`${docNumero}.pdf`)
}
