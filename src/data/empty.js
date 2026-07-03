// Données vides - l'app démarre SANS fausses données
// L'user ajoute ses propres devis, factures, clients au fil de l'eau
export const EMPTY_DEVIS = []
export const EMPTY_FACTURES = []
export const EMPTY_CLIENTS = []

// Bibliothèque d'ouvrages BTP (40 ouvrages) - utile pour la création de devis
export const OUVRAGES_BTP = {
  plomberie: [
    { ref: 'PLO-001', label: 'Pose WC suspendu', unit: 'forfait', priceHT: 450, tva: 10 },
    { ref: 'PLO-002', label: 'Remplacement chauffe-eau 200L', unit: 'forfait', priceHT: 380, tva: 10 },
    { ref: 'PLO-003', label: 'Pose robinetterie mitigeur', unit: 'u', priceHT: 85, tva: 10 },
    { ref: 'PLO-004', label: 'Débouchage canalisation', unit: 'forfait', priceHT: 120, tva: 10 },
    { ref: 'PLO-005', label: 'Pose lavabo sur colonne', unit: 'u', priceHT: 220, tva: 10 },
    { ref: 'PLO-006', label: 'Installation douchette italienne', unit: 'forfait', priceHT: 780, tva: 10 },
    { ref: 'PLO-007', label: 'Raccordement machine à laver', unit: 'u', priceHT: 95, tva: 10 },
    { ref: 'PLO-008', label: 'Tuyauterie PER (au ml)', unit: 'ml', priceHT: 35, tva: 10 },
    { ref: 'PLO-009', label: 'Pose baignoire acrylique', unit: 'u', priceHT: 340, tva: 10 },
    { ref: 'PLO-010', label: 'Fuite simple réparation', unit: 'forfait', priceHT: 95, tva: 10 },
  ],
  electricite: [
    { ref: 'ELE-001', label: 'Prise électrique 16A', unit: 'u', priceHT: 65, tva: 10 },
    { ref: 'ELE-002', label: 'Point lumineux complet', unit: 'u', priceHT: 85, tva: 10 },
    { ref: 'ELE-003', label: 'Tableau électrique 2 rangées', unit: 'u', priceHT: 420, tva: 10 },
    { ref: 'ELE-004', label: 'Mise aux normes NF C15-100', unit: 'forfait', priceHT: 1450, tva: 10 },
    { ref: 'ELE-005', label: 'Pose VMC simple flux', unit: 'u', priceHT: 380, tva: 10 },
    { ref: 'ELE-006', label: 'Interrupteur va-et-vient', unit: 'u', priceHT: 55, tva: 10 },
    { ref: 'ELE-007', label: 'Prise RJ45 catégorie 6', unit: 'u', priceHT: 75, tva: 10 },
    { ref: 'ELE-008', label: 'Pose radiateur électrique 1500W', unit: 'u', priceHT: 180, tva: 10 },
    { ref: 'ELE-009', label: 'Diagnostic électrique', unit: 'forfait', priceHT: 95, tva: 10 },
    { ref: 'ELE-010', label: 'Câblage prise TV/antenne', unit: 'u', priceHT: 90, tva: 10 },
  ],
  peinture: [
    { ref: 'PEI-001', label: 'Peinture mur intérieur (au m²)', unit: 'm²', priceHT: 22, tva: 10 },
    { ref: 'PEI-002', label: 'Peinture plafond (au m²)', unit: 'm²', priceHT: 26, tva: 10 },
    { ref: 'PEI-003', label: 'Préparation support (enduit)', unit: 'm²', priceHT: 14, tva: 10 },
    { ref: 'PEI-004', label: 'Peinture boiseries (au ml)', unit: 'ml', priceHT: 18, tva: 10 },
    { ref: 'PEI-005', label: 'Pose papier peint (au m²)', unit: 'm²', priceHT: 28, tva: 10 },
    { ref: 'PEI-006', label: 'Peinture façade (au m²)', unit: 'm²', priceHT: 32, tva: 20 },
    { ref: 'PEI-007', label: 'Lasure bois extérieur (au m²)', unit: 'm²', priceHT: 24, tva: 20 },
    { ref: 'PEI-008', label: 'Pièce complète mur+plafond', unit: 'm²', priceHT: 38, tva: 10 },
    { ref: 'PEI-009', label: 'Dépose ancien revêtement', unit: 'm²', priceHT: 8, tva: 10 },
    { ref: 'PEI-010', label: 'Peinture radiateur', unit: 'u', priceHT: 65, tva: 10 },
  ],
  maconnerie: [
    { ref: 'MAC-001', label: 'Cloison placoplatre (au m²)', unit: 'm²', priceHT: 45, tva: 10 },
    { ref: 'MAC-002', label: 'Doublage isolant (au m²)', unit: 'm²', priceHT: 38, tva: 10 },
    { ref: 'MAC-003', label: 'Carrelage sol (au m²)', unit: 'm²', priceHT: 55, tva: 10 },
    { ref: 'MAC-004', label: 'Faïence murale (au m²)', unit: 'm²', priceHT: 65, tva: 10 },
    { ref: 'MAC-005', label: 'Pose parquet flottant (au m²)', unit: 'm²', priceHT: 32, tva: 10 },
    { ref: 'MAC-006', label: 'Démolition cloison', unit: 'm²', priceHT: 28, tva: 10 },
    { ref: 'MAC-007', label: 'Ouverture mur porteur', unit: 'forfait', priceHT: 1850, tva: 10 },
    { ref: 'MAC-008', label: 'Pose fenêtre PVC double vitrage', unit: 'u', priceHT: 480, tva: 10 },
    { ref: 'MAC-009', label: 'Enduit extérieur (au m²)', unit: 'm²', priceHT: 42, tva: 20 },
    { ref: 'MAC-010', label: 'Terrassement manuel', unit: 'm³', priceHT: 65, tva: 20 },
  ],
}
