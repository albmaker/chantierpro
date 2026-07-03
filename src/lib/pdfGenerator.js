// G\u00e9n\u00e9rateur PDF ChantierPro - Version corrig\u00e9e
// Utilise jsPDF + jspdf-autotable

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generatePDF(doc, profile, type = 'devis') {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const orange = [255, 107, 53]
    const navy = [15, 27, 45]
    const gray = [120, 120, 120]
    const lightGray = [240, 240, 240]

    const docNumero = doc.numero || doc.id || 'DRAFT-001'
    const dateDoc = doc.date_emission || doc.date || new Date().toISOString().slice(0, 10)
    const validite = doc.date_validite || doc.validite || ''
    const lignes = Array.isArray(doc.lignes) ? doc.lignes : []
    const profil = profile || {
      company_name: 'Mon Entreprise',
      siret: '',
      adresse: '',
      email: '',
      telephone: '',
      tva: '',
      iban: '',
      banque: '',
      cgv: '',
    }

    // === HEADER ===
    pdf.setFillColor(...navy)
    pdf.rect(0, 0, 210, 38, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(22)
    pdf.text('ChantierPro', 15, 16)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text(profil.company_name || 'Mon Entreprise', 15, 23)
    if (profil.adresse) pdf.text(profil.adresse, 15, 28)
    if (profil.email || profil.telephone) {
      pdf.text(`${profil.email || ''} \u00b7 ${profil.telephone || ''}`, 15, 33)
    }

    // Titre
    pdf.setTextColor(...orange)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(24)
    pdf.text(type === 'facture' ? 'FACTURE' : 'DEVIS', 195, 16, { align: 'right' })

    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text(`N\u00b0 ${docNumero}`, 195, 22, { align: 'right' })
    pdf.text(`Date : ${dateDoc}`, 195, 27, { align: 'right' })
    if (validite) {
      pdf.text(`${type === 'facture' ? 'Ech\u00e9ance' : 'Validit\u00e9'} : ${validite}`, 195, 32, { align: 'right' })
    }

    // === BADGE FE 2026 ===
    pdf.setFillColor(255, 240, 230)
    pdf.setDrawColor(...orange)
    pdf.setLineWidth(0.3)
    pdf.roundedRect(140, 45, 55, 12, 1.5, 1.5, 'FD')
    pdf.setTextColor(...orange)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text('Compatible Factur-X 2026', 167.5, 51, { align: 'center' })
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    pdf.text('Reforme facturation electronique', 167.5, 55, { align: 'center' })

    // === CLIENT ===
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.text('DESTINATAIRE', 15, 50)

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text(doc.client_nom || doc.client || 'Client', 15, 56)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    if (doc.client_adresse) pdf.text(doc.client_adresse, 15, 61)
    if (doc.client_email) pdf.text(doc.client_email, 15, 65)
    if (doc.client_tel) pdf.text(doc.client_tel, 15, 69)

    // === LIGNES ===
    let tableData
    if (lignes.length === 0) {
      tableData = [['', 'Aucune prestation', '', '', '', '0,00 \u20ac']]
    } else {
      tableData = lignes.map(l => [
        l.ref || '-',
        l.label || '-',
        `${l.qty || 0} ${l.unit || ''}`,
        `${(Number(l.priceHT) || 0).toFixed(2)} \u20ac`,
        `TVA ${l.tva || 0}%`,
        `${((Number(l.qty) || 0) * (Number(l.priceHT) || 0) * (1 + (Number(l.tva) || 0) / 100)).toFixed(2)} \u20ac`,
      ])
    }

    autoTable(pdf, {
      startY: 80,
      head: [['R\u00e9f', 'D\u00e9signation', 'Qt\u00e9', 'P.U. HT', 'TVA', 'Total TTC']],
      body: tableData,
      headStyles: {
        fillColor: navy,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: { fillColor: lightGray },
      columnStyles: {
        0: { cellWidth: 18, fontSize: 8, textColor: gray },
        1: { cellWidth: 75 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 15, right: 15 },
      theme: 'grid',
    })

    // === TOTAUX ===
    const totalHT = lignes.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.priceHT) || 0), 0)
    const totalTVA = lignes.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.priceHT) || 0) * ((Number(l.tva) || 0) / 100), 0)
    const totalTTC = totalHT + totalTVA

    const finalY = (pdf.lastAutoTable && pdf.lastAutoTable.finalY) ? pdf.lastAutoTable.finalY + 8 : 130

    pdf.setFontSize(9)
    pdf.setTextColor(80, 80, 80)
    pdf.text('Total HT', 145, finalY, { align: 'right' })
    pdf.text(`${totalHT.toFixed(2)} \u20ac`, 195, finalY, { align: 'right' })

    pdf.text('TVA', 145, finalY + 5, { align: 'right' })
    pdf.text(`${totalTVA.toFixed(2)} \u20ac`, 195, finalY + 5, { align: 'right' })

    pdf.setFillColor(...orange)
    pdf.rect(120, finalY + 9, 75, 14, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(13)
    pdf.text('Total TTC', 128, finalY + 17)
    pdf.text(`${totalTTC.toFixed(2)} \u20ac`, 192, finalY + 17, { align: 'right' })

    // === CGV ===
    if (profil.cgv) {
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      pdf.text('CONDITIONS GENERALES DE VENTE', 15, finalY + 32)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(7)
      const splitCgv = pdf.splitTextToSize(profil.cgv, 180)
      pdf.text(splitCgv, 15, finalY + 37)
    }

    // === FOOTER ===
    const pageHeight = pdf.internal.pageSize.height
    pdf.setFillColor(...navy)
    pdf.rect(0, pageHeight - 15, 210, 15, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7)
    const footerL = `${profil.company_name} \u00b7 SIRET ${profil.siret || 'N/C'} \u00b7 TVA ${profil.tva || 'N/C'}`
    const footerR = `IBAN ${profil.iban || 'N/C'}`
    pdf.text(footerL, 15, pageHeight - 8)
    pdf.text(footerR, 195, pageHeight - 8, { align: 'right' })

    // === TELECHARGEMENT ===
    const filename = `${docNumero}.pdf`
    pdf.save(filename)
    return { success: true, filename }
  } catch (err) {
    console.error('Erreur generation PDF:', err)
    return { success: false, error: err.message }
  }
}

export function generateFactureFromDevis(devis, profile) {
  return {
    ...devis,
    id: crypto.randomUUID(),
    numero: `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    statut: 'en_attente',
    date_emission: new Date().toISOString().slice(0, 10),
    date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    devis_id: devis.id,
  }
}
