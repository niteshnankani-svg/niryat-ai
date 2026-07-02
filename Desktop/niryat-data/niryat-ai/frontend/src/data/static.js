export const GETTING_STARTED_STEPS = [
  {
    step: 1,
    title: 'Get your IEC Code',
    status: 'done',
    description: 'Import Export Code — mandatory to export from India.',
    detail: 'Apply online at dgft.gov.in with PAN, Aadhaar, and a cancelled cheque. Fee is ₹500. Usually issued within 1-2 working days.',
  },
  {
    step: 2,
    title: 'Register on ICEGATE',
    status: 'in-progress',
    description: 'Customs portal for filing shipping bills electronically.',
    detail: 'Create an account at icegate.gov.in linked to your IEC and AD Code. Needed before your first shipment clears customs.',
  },
  {
    step: 3,
    title: 'Prepare export documents',
    status: 'not-started',
    description: 'Commercial invoice, packing list, and certificate of origin.',
    detail: 'See the Documents page for the full checklist — mandatory vs buyer-specific paperwork.',
  },
  {
    step: 4,
    title: 'Choose payment terms',
    status: 'not-started',
    description: 'Advance, Letter of Credit, DP, or DA — pick based on buyer trust.',
    detail: 'New buyers: ask for advance or LC. Established relationships: DP/DA reduce friction but carry more risk.',
  },
  {
    step: 5,
    title: 'Arrange freight & insurance',
    status: 'not-started',
    description: 'Book a forwarder, decide Incoterms, get marine cargo cover.',
    detail: 'FOB shifts freight cost/risk to the buyer; CIF means you arrange and pay for it. Insure high-value cargo.',
  },
  {
    step: 6,
    title: 'Claim export incentives',
    status: 'not-started',
    description: 'RoDTEP, Duty Drawback, and other scheme benefits.',
    detail: 'File claims through ICEGATE after shipment. See Govt Schemes for rates by product category.',
  },
]

export const DOCUMENTS = [
  { icon: '🧾', name: 'Commercial Invoice', description: 'Itemized bill of sale — value, quantity, buyer/seller details.', requirement: 'Mandatory' },
  { icon: '📦', name: 'Packing List', description: 'Contents, weight, and dimensions of each package.', requirement: 'Mandatory' },
  { icon: '🌍', name: 'Certificate of Origin', description: 'Confirms goods were manufactured in India — needed for tariff preference.', requirement: 'If buyer asks' },
  { icon: '🚢', name: 'Bill of Lading / Airway Bill', description: 'Proof of shipment issued by the carrier.', requirement: 'Mandatory' },
  { icon: '📋', name: 'Shipping Bill', description: 'Filed on ICEGATE — customs clearance for export.', requirement: 'Mandatory' },
  { icon: '✅', name: 'Quality Certificate', description: 'Inspection certificate for regulated goods (food, pharma, etc).', requirement: 'If buyer asks' },
]

export const PAYMENT_METHODS = [
  { name: 'Advance Payment (T/T)', description: 'Buyer pays before goods ship.', risk: 'Safest', speed: 'Fast', cost: 'Low (wire fee only)' },
  { name: 'Letter of Credit (LC)', description: "Bank guarantees payment on presenting compliant documents.", risk: 'Very safe', speed: 'Medium', cost: 'Medium (bank charges)' },
  { name: 'Documents against Payment (DP)', description: 'Buyer pays when documents are released by their bank.', risk: 'Medium', speed: 'Medium', cost: 'Low' },
  { name: 'Documents against Acceptance (DA)', description: 'Buyer accepts a bill of exchange, pays later.', risk: 'Risky', speed: 'Slow', cost: 'Low' },
  { name: 'Open Account', description: 'Goods ship first, payment due on agreed terms later.', risk: 'Risky', speed: 'Fast', cost: 'Low' },
]

export const COSTING_ROWS = [
  { label: 'Ex-factory price', amount: 100000 },
  { label: 'Inland transport to port', amount: 3500 },
  { label: 'Export packing', amount: 2000 },
  { label: 'Documentation & customs', amount: 1500 },
  { label: 'FOB price', amount: 107000, subtotal: true },
  { label: 'Ocean freight', amount: 8500 },
  { label: 'Marine insurance', amount: 1200 },
  { label: 'Final CIF price to buyer', amount: 116700, total: true },
]

export const GOVT_SCHEMES = [
  { icon: '💵', name: 'RoDTEP', benefit: '0.5% – 4.3% of FOB value', description: 'Remission of Duties and Taxes on Exported Products — refunds embedded taxes not covered by other schemes.' },
  { icon: '↩️', name: 'Duty Drawback', benefit: 'Up to 1.5% of FOB value', description: 'Refund of customs duty paid on imported inputs used in exported goods.' },
  { icon: '📉', name: 'Interest Equalisation Scheme', benefit: '2% – 3% rate subvention', description: 'Reduces interest cost on pre/post-shipment export credit for MSMEs and select sectors.' },
  { icon: '🛡️', name: 'ECGC Insurance', benefit: 'Covers up to 90% of loss', description: 'Export Credit Guarantee Corporation cover against buyer default or political risk.' },
  { icon: '🎯', name: 'MAI / MDA Grants', benefit: 'Up to ₹weight varies', description: 'Market Access Initiative / Market Development Assistance — subsidizes trade fair and market research costs.' },
]
